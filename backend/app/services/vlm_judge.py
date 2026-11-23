"""Vision-model judge for the live form coach (Tier 1 of the three-tier design).

Two jobs, both one HTTP call through the rotating key pool:

1. `identify_exercise` -- which of the ~90 plan exercises is this, and from which camera
   view? The phone cannot know, and judging a squat as a press is the bug that must not
   recur: a correct squat was told to "straighten your arms".

2. `adjudicate` -- judge the rep against the same rubric JSON the phone used, with two
   keyframes and a compact landmark summary. The local verdict is supplied so the model
   can agree or disagree; disagreements are logged, because that log is the accuracy
   metric -- it shows which local rules are systematically wrong.

Latency is the binding constraint (7-9 s measured with three images and a verbose answer),
so: at most two small keyframes, a hard `max_tokens` cap, and a `json_schema` response
format. Text-only models are fast but blind, so vision calls name the vision model.

Nothing here reimplements HTTP or key rotation; `keypool.py` owns that.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import numpy as np

from app.services.keypool import KeyPool
from app.services.kinematics import JOINT_TRIPLES, angle_at

MAX_IMAGES = 2  # third image bought latency, not accuracy
# Hard caps. Verbose answers are the latency killer, not the images: a one-line answer per
# check is the whole response, so 300/800 tokens is already generous headroom.
MAX_TOKENS_IDENTIFY = 300
MAX_TOKENS_ADJUDICATE = 800

CHECK_STATUSES = ("good", "almost", "fix", "unsure")
VIEWS = ("front", "side", "45")

IDENTIFY_SCHEMA = {
    "name": "exercise_identification",
    "schema": {
        "type": "object",
        "properties": {
            "exercise_id": {"type": "string"},
            "view": {"type": "string", "enum": list(VIEWS)},
            "confidence": {"type": "number"},
            "alternatives": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["exercise_id", "view", "confidence"],
        "additionalProperties": False,
    },
}

ADJUDICATE_SCHEMA = {
    "name": "form_adjudication",
    "schema": {
        "type": "object",
        "properties": {
            "checks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "status": {"type": "string", "enum": list(CHECK_STATUSES)},
                        "reason": {"type": "string"},
                    },
                    "required": ["id", "status"],
                    "additionalProperties": False,
                },
            },
            "overall": {"type": "string"},
            "confidence": {"type": "number"},
            "agrees_with_local": {"type": "boolean"},
            "disagreements": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["checks", "overall", "confidence"],
        "additionalProperties": False,
    },
}

IDENTIFY_SYSTEM = (
    "You are a strength coach looking at frames from a training video. Say which exercise "
    "from the candidate list is being performed, using only an id from that list, and the "
    "camera view: 'front' (facing the camera), 'side' (seen in profile) or '45' (in between). "
    "Lower the confidence when the frames are blurry or the pose is mid-transition. Answer "
    "with JSON only."
)

ADJUDICATE_SYSTEM = (
    "You are a strength coach judging one rep against the supplied rubric. Judge ONLY the "
    "checks in the rubric -- never invent a check, never judge a different exercise. Each "
    "check is good, almost, fix, or unsure. If the image does not clearly show the joint a "
    "check measures, answer 'unsure': a false correction on a correct rep is the worst "
    "possible outcome, so never guess. Keep each reason to one short line. JSON only."
)


class VLMError(RuntimeError):
    """The model answered, but with something unusable (bad JSON, bad enum, unknown id)."""


@dataclass
class IdentifyResult:
    exercise_id: str
    view: str
    confidence: float
    alternatives: List[str] = field(default_factory=list)
    raw: Dict[str, Any] = field(default_factory=dict, repr=False)


@dataclass
class Adjudication:
    checks: List[Dict[str, str]]
    overall: str
    confidence: float
    agrees_with_local: bool
    disagreements: List[str] = field(default_factory=list)
    raw: Dict[str, Any] = field(default_factory=dict, repr=False)


_pool_singleton: Optional[KeyPool] = None


def _pool() -> KeyPool:
    global _pool_singleton
    if _pool_singleton is None:
        _pool_singleton = KeyPool.from_env()
    return _pool_singleton


def _vision_model() -> Optional[str]:
    """Vision needs the vision model; the fast text model cannot see the keyframes."""
    name = os.getenv("COARENA_VISION_MODEL", "").strip()
    return name or None


def _clamp01(x: Any) -> float:
    try:
        v = float(x)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, min(1.0, v))


def _image_part(b64: str) -> Dict[str, Any]:
    data = b64 if b64.startswith("data:") else f"data:image/jpeg;base64,{b64}"
    return {"type": "image_url", "image_url": {"url": data}}


def _content_text(body: Dict[str, Any]) -> str:
    try:
        content = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise VLMError("model response has no choices[0].message.content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):  # some gateways return content parts
        return "".join(p.get("text", "") for p in content if isinstance(p, dict))
    raise VLMError(f"model content is {type(content).__name__}, expected text")


def _extract_json(body: Dict[str, Any]) -> Dict[str, Any]:
    """Parse the JSON body the model returned, or fail loudly.

    A model that answers prose instead of JSON is a routing/prompt problem. Returning an
    empty dict here would silently turn every check into "no verdict", which is exactly the
    kind of quiet failure this guard exists to stop.

    Models in practice wrap the object in a fence, prefix it with "Here is the JSON", or add a
    trailing sentence, even when asked for JSON only (observed against coarena.ai). So the
    object is located by brace matching rather than assuming the whole reply is JSON; the
    loud failure still applies when no object is present at all.
    """
    text = _content_text(body).strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1] if "\n" in text else text.strip("`")
        text = text.rstrip("`").strip()
        if text.startswith("json"):
            text = text[4:].strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = _first_json_object(text)
        if parsed is None:
            raise VLMError(f"model did not return JSON: {text[:160]!r}")
    if not isinstance(parsed, dict):
        raise VLMError(f"model JSON is {type(parsed).__name__}, expected an object")
    return parsed


def _first_json_object(text: str) -> Optional[Dict[str, Any]]:
    """Scan for the first balanced {...} and decode it. Returns None when there is none.

    Brace matching rather than a regex so nested rubric-shaped objects survive, and string
    literals are skipped so a brace inside a reason string cannot truncate the object.
    """
    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    in_str = False
    escape = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    obj = json.loads(text[start : i + 1])
                except json.JSONDecodeError:
                    return None
                return obj if isinstance(obj, dict) else None
    return None


# ---------------------------------------------------------------- landmark compaction

def _kp_name(index: int) -> str:
    return _INDEX_NAMES[index] if index < len(_INDEX_NAMES) else f"kp_{index}"


_INDEX_NAMES = (
    "nose left_eye_inner left_eye left_eye_outer right_eye_inner right_eye right_eye_outer "
    "left_ear right_ear mouth_left mouth_right left_shoulder right_shoulder left_elbow "
    "right_elbow left_wrist right_wrist left_pinky right_pinky left_index right_index "
    "left_thumb right_thumb left_hip right_hip left_knee right_knee left_ankle right_ankle "
    "left_heel right_heel left_foot_index right_foot_index"
).split()


def _frame_points(frame: Any) -> Dict[str, Any]:
    """Accept a model object, a dict with 'keypoints', or a bare 33-slot sequence."""
    kps = getattr(frame, "keypoints", None)
    if kps is None and isinstance(frame, dict):
        kps = frame.get("keypoints", frame)
    if kps is None:
        return {}
    if isinstance(kps, dict):
        return kps
    try:
        seq = list(kps)
    except TypeError:
        return {}
    return {_kp_name(i): p for i, p in enumerate(seq)}


def _coords(p: Any) -> Optional[Tuple[float, float, float]]:
    try:
        if isinstance(p, dict):
            rx = p["wx"] if p.get("wx") is not None else p.get("x")
            ry = p["wy"] if p.get("wy") is not None else p.get("y")
            rz = p["wz"] if p.get("wz") is not None else p.get("z", 0.0)
            x, y, z = float(rx), float(ry), float(rz if rz is not None else 0.0)
        else:
            x = float(getattr(p, "wx", getattr(p, "x", None)))
            y = float(getattr(p, "wy", getattr(p, "y", None)))
            z = float(getattr(p, "wz", getattr(p, "z", 0.0)))
    except (TypeError, ValueError):
        return None
    if abs(x) + abs(y) + abs(z) < 1e-9:  # all-zero world block: not a landmark
        return None
    return x, y, z


def _arr(v: Tuple[float, float, float]) -> np.ndarray:
    return np.array(v, dtype=float)


def landmark_summary(frames: Sequence[Any]) -> Dict[str, Dict[str, float]]:
    """Per-joint min/median/max angle across the rep, by side.

    30 frames x 33 keypoints raw is thousands of tokens for no extra signal; the model
    judges bands, and a band only needs the range the joint actually travelled through.
    """
    values: Dict[str, List[float]] = {}
    for frame in frames or []:
        pts = _frame_points(frame)
        if not pts:
            continue
        for side in ("left", "right"):
            for joint, (a, b, c) in JOINT_TRIPLES.items():
                try:
                    pa, pb, pc = pts[f"{side}_{a}"], pts[f"{side}_{b}"], pts[f"{side}_{c}"]
                except KeyError:
                    continue
                ca, cb, cc = _coords(pa), _coords(pb), _coords(pc)
                if ca is None or cb is None or cc is None:
                    continue
                ang = angle_at(_arr(ca), _arr(cb), _arr(cc))
                if ang == ang:  # not NaN
                    values.setdefault(f"{side}_{joint}", []).append(ang)

    out: Dict[str, Dict[str, float]] = {}
    for name, vals in values.items():
        vals.sort()
        n = len(vals)
        out[name] = {
            "min": round(vals[0], 1),
            "median": round(vals[n // 2], 1),
            "max": round(vals[-1], 1),
            "n": float(n),
        }
    return out


# ---------------------------------------------------------------- A. identify

def identify_exercise(
    keyframes_b64: Sequence[str],
    candidates: Sequence[str],
    pool: Optional[KeyPool] = None,
) -> IdentifyResult:
    """Which candidate exercise is on screen, and from which view."""
    cands = [c for c in candidates if c]
    if not cands:
        raise VLMError("identify_exercise needs at least one candidate exercise id")
    frames = [k for k in (keyframes_b64 or []) if k][:MAX_IMAGES]
    if not frames:
        raise VLMError("identify_exercise needs at least one keyframe")

    content: List[Dict[str, Any]] = [
        {"type": "text", "text": "Candidate exercise ids:\n" + "\n".join(f"- {c}" for c in cands)}
    ]
    content.extend(_image_part(f) for f in frames)
    messages = [
        {"role": "system", "content": IDENTIFY_SYSTEM},
        {"role": "user", "content": content},
    ]

    body = (pool or _pool()).chat(
        messages,
        model=_vision_model(),
        max_tokens=MAX_TOKENS_IDENTIFY,
        json_schema=IDENTIFY_SCHEMA,
    )
    data = _extract_json(body)

    # Models drift to short keys ('id') even when the schema says 'exercise_id'. Accept the
    # obvious aliases rather than failing a correct identification over a field name.
    ex = data.get("exercise_id") or data.get("id") or data.get("exercise")
    if not isinstance(ex, str) or ex not in cands:
        raise VLMError(f"model identified {ex!r}, which is not one of the {len(cands)} candidates")

    view = data.get("view")
    if view not in VIEWS:
        raise VLMError(f"model returned view {view!r}, expected one of {list(VIEWS)}")

    alt = data.get("alternatives") or []
    if not isinstance(alt, list):
        raise VLMError("model 'alternatives' is not a list")

    return IdentifyResult(
        exercise_id=ex,
        view=view,
        confidence=_clamp01(data.get("confidence")),
        alternatives=[a for a in alt if isinstance(a, str) and a in cands and a != ex],
        raw=data,
    )


# ---------------------------------------------------------------- B. adjudicate

def _local_checks(local_verdict: Any) -> Dict[str, str]:
    """Map check id -> local status from whatever tier 0 sent (dict, dataclass, or list)."""
    if isinstance(local_verdict, dict):
        checks = local_verdict.get("checks")
        if checks is None and "id" in local_verdict:
            checks = [local_verdict]
        elif checks is None:
            return {
                str(k): str(v or "")
                for k, v in local_verdict.items()
                if isinstance(k, str) and k and isinstance(v, str)
            }
    else:
        checks = getattr(local_verdict, "checks", local_verdict)
    out: Dict[str, str] = {}
    for c in checks or []:
        cid = c.get("id") if isinstance(c, dict) else getattr(c, "id", getattr(c, "key", None))
        status = c.get("status") if isinstance(c, dict) else getattr(c, "status", "")
        if isinstance(cid, str) and cid:
            out[cid] = str(status or "")
    return out


def adjudicate(
    evidence: Dict[str, Any],
    rubric: Dict[str, Any],
    local_verdict: Any,
    pool: Optional[KeyPool] = None,
) -> Adjudication:
    """Ask the vision model to judge this rep against the same rubric the phone used."""
    frames = [k for k in (evidence or {}).get("keyframes") or [] if k][:MAX_IMAGES]
    if not frames:
        raise VLMError("adjudicate needs at least one keyframe")
    if not isinstance(rubric, dict) or not rubric:
        raise VLMError("adjudicate needs a rubric object")

    local = _local_checks(local_verdict)
    summary = landmark_summary(evidence.get("landmarks") or [])
    brief = {
        "exercise": evidence.get("exercise"),
        "rep": evidence.get("rep"),
        "view": evidence.get("view"),
        "landmark_summary_deg": summary,
        "local_verdict": local,
    }

    content: List[Dict[str, Any]] = [
        {
            "type": "text",
            "text": (
                "Rubric (judge only these checks):\n"
                + json.dumps(rubric, separators=(",", ":"), ensure_ascii=False)
                + "\n\nRep evidence:\n"
                + json.dumps(brief, separators=(",", ":"), ensure_ascii=False)
            ),
        }
    ]
    content.extend(_image_part(f) for f in frames)
    messages = [
        {"role": "system", "content": ADJUDICATE_SYSTEM},
        {"role": "user", "content": content},
    ]

    body = (pool or _pool()).chat(
        messages,
        model=_vision_model(),
        max_tokens=MAX_TOKENS_ADJUDICATE,
        json_schema=ADJUDICATE_SCHEMA,
    )
    data = _extract_json(body)

    raw_checks = data.get("checks")
    if not isinstance(raw_checks, list) or not raw_checks:
        raise VLMError("model returned no checks")

    valid_ids = {c.get("id") for c in (rubric.get("checks") or []) if isinstance(c, dict) and c.get("id")}
    checks: List[Dict[str, str]] = []
    disagreements: List[str] = []
    for c in raw_checks:
        if not isinstance(c, dict):
            raise VLMError(f"model check is {type(c).__name__}, expected an object")
        cid, status = c.get("id"), c.get("status")
        if not isinstance(cid, str) or not cid:
            raise VLMError("model check is missing an id")
        if valid_ids and cid not in valid_ids:
            continue
        if status not in CHECK_STATUSES:
            raise VLMError(f"check {cid!r}: status {status!r} is not one of {list(CHECK_STATUSES)}")
        reason = c.get("reason")
        checks.append({"id": cid, "status": status, "reason": reason if isinstance(reason, str) else ""})
        if cid in local and local[cid] != status:
            disagreements.append(f"{cid}: local={local[cid]}, remote={status}")

    if not checks:
        raise VLMError("model returned no valid rubric checks")

    return Adjudication(
        checks=checks,
        overall=str(data.get("overall", ""))[:200],
        confidence=_clamp01(data.get("confidence")),
        agrees_with_local=not disagreements,
        disagreements=disagreements,
        raw=data,
    )


# ---------------------------------------------------------------- C. accuracy log

def _log_path(day: Optional[str] = None) -> Path:
    override = os.getenv("VLM_ADJUDICATION_DIR", "").strip()
    root = Path(override) if override else Path(__file__).resolve().parents[2] / "storage" / "adjudications"
    root.mkdir(parents=True, exist_ok=True)
    stamp = day or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return root / f"{stamp}.jsonl"


def _safe_checks(v: Any) -> List[Dict[str, str]]:
    """Whitelist id/status/reason only, so no payload can smuggle an image or a key out."""
    if isinstance(v, Adjudication):
        items = v.checks
    elif isinstance(v, dict):
        items = v.get("checks") or []
    else:
        items = getattr(v, "checks", v) or []
    out: List[Dict[str, str]] = []
    for c in items:
        if isinstance(c, dict):
            cid, status, reason = c.get("id", ""), c.get("status", ""), c.get("reason", "")
        else:
            cid = getattr(c, "id", getattr(c, "key", ""))
            status, reason = getattr(c, "status", ""), getattr(c, "reason", "")
        out.append({"id": str(cid)[:80], "status": str(status)[:20], "reason": str(reason)[:200]})
    return out


def log_adjudication(evidence_id: str, local: Any, remote: Any, day: Optional[str] = None) -> Path:
    """Append one JSON line: the verdicts and the disagreement summary only.

    This file is the accuracy metric. It is also the one place where a careless change
    would write user photos or an API key to disk, so the record is built field by field
    from an allowlist rather than dumped from the inputs.
    """
    remote_checks = _safe_checks(remote)
    if isinstance(remote, Adjudication):
        disagreements = list(remote.disagreements)
        agrees = remote.agrees_with_local
        overall, conf = remote.overall, remote.confidence
    elif isinstance(remote, dict):
        disagreements = [str(d)[:200] for d in (remote.get("disagreements") or [])][:20]
        agrees = bool(remote.get("agrees_with_local", not disagreements))
        overall = str(remote.get("overall", ""))[:200]
        conf = _clamp01(remote.get("confidence"))
    else:
        disagreements, agrees, overall, conf = [], True, "", 0.0

    record = {
        "t": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "evidence_id": str(evidence_id)[:120],
        "local": _safe_checks(local),
        "remote": remote_checks,
        "agrees_with_local": agrees,
        "disagreements": disagreements,
        "overall": overall,
        "confidence": conf,
    }
    path = _log_path(day)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, separators=(",", ":"), ensure_ascii=False) + "\n")
    return path
