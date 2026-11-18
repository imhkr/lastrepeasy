"""Rubric-driven form judging.

The old coach hardcoded one exercise's thresholds in Python and again in TypeScript, so every
rule change was a two-place edit that could silently drift, and every measurement was a 2D
pixel angle regardless of where the camera stood. Here the rules live in JSON (one canonical
copy, shared by both tiers through `rubric_codegen`), and the numbers come from `kinematics`,
which forces every measurement to declare the space it is computed in and the frame it is
expressed against.

Three behaviours are the whole point and are tested directly:

* Refuse rather than guess. A camera in the wrong place produces no verdicts at all, because
  judging a correct rep wrong is worse than saying nothing.
* A measurement the tracker was not sure about never becomes good/almost/fix. It stays
  `unsure`, so the caller can say "I could not see you" instead of inventing a fault.
* One cue at a time. `worst_cue` returns the single most important failure, so the user is
  never read three sentences while pressing a dumbbell.
"""
from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple, Union

from app.services.kinematics import (
    Measurement,
    MeasurementSpec,
    detect_view,
    gate_view,
    gravity_axis,
    measure,
    plausible,
    torso_axis,
)

RUBRIC_DIR = Path(__file__).resolve().parents[1] / "rubrics"

# Capture mode -> the space the number must be computed in. An in-plane motion is a real
# image angle; out-of-plane is MediaPipe's learned depth lift, which is an estimate by nature
# and is labelled as such downstream so the caller can widen its trust.
CAPTURE_SPACE = {"in_plane": "image2d", "out_of_plane": "world3d"}

JARGON = ("flexion", "extension", "abduction", "scapula", "torque", "rom")
MAX_WORDS = 14

# A rubric describes what good looks like; it does not contain a sentence for "I cannot see
# you". Those lines belong to the engine, which is also the only place that knows a check
# came back unsure. Kept here so they are plain-language checked like every other cue.
UNSURE_CUE: Dict[str, Tuple[str, str]] = {
    "depth": ("I could not see your elbows. Put the phone at your side.",
              "Mujhe aapki kohni nahi dikhi. Phone side mein rakho."),
    "lockout": ("I could not see your arms up top. Put the phone at your side.",
                "Mujhe upar aapke haath nahi dikhe. Phone side mein rakho."),
    "elbow_path": ("I could not see your hands. Put the phone at your side.",
                   "Mujhe aapke haath nahi dikhe. Phone side mein rakho."),
    "tempo": ("I lost you during the rep. Put the phone at your side.",
              "Rep ke beech aap dikhe nahi. Phone side mein rakho."),
    "symmetry": ("I could not see both arms. Put the phone at your side.",
                 "Dono haath nahi dikhe. Phone side mein rakho."),
    "bench_angle": ("I cannot see your body. Step back so I can see you.",
                    "Aapka shareer nahi dikh raha. Thoda peeche hato."),
}
GENERIC_UNSURE = ("I could not see you clearly. Move the phone back.",
                  "Aap saaf nahi dikhe. Phone thoda peeche rakho.")


# ---------------------------------------------------------------- plain language

def assert_plain(text: str) -> None:
    """A one-week beginner must get a cue on first read, in either language.

    Degrees and joint jargon are banned outright: the number behind the verdict is already in
    the readout, and "flexion" means nothing to someone learning to press. The word ceiling
    exists because a cue is spoken aloud mid-rep, not read on a results screen.
    """
    if not text or not text.strip():
        raise AssertionError("cue text is empty")
    if re.search(r"\d+\s*deg", text, re.I):
        raise AssertionError(f"cue mentions degrees: {text!r}")
    for word in JARGON:
        if re.search(rf"\b{word}\b", text, re.I):
            raise AssertionError(f"cue uses jargon {word!r}: {text!r}")
    if len(text.split()) > MAX_WORDS:
        raise AssertionError(f"cue is longer than {MAX_WORDS} words: {text!r}")


# ---------------------------------------------------------------- rubric loading

@dataclass(frozen=True)
class Rubric:
    id: str
    family: str
    # One view, or a tuple of views the rubric judges reliably from. A press reads equally well
    # face-on and at 45 degrees; demanding one exact value refused clips that were measurable.
    view: Union[str, Tuple[str, ...]]
    phases: Tuple[str, ...]
    setup: Tuple[Dict, ...]
    checks: Tuple[Dict, ...]
    # Which geometry defines a rep: a press counts wrist-off-shoulder with the elbow extending, a
    # squat counts hip-above-foot with the knee extending. None means the press default.
    track: Optional[Dict] = None

VIEWS = ("front", "side", "45", "any")


def _parse_view(raw) -> Union[str, Tuple[str, ...]]:
    """A rubric may name one acceptable view or a set of them."""
    if isinstance(raw, str):
        if raw not in VIEWS:
            raise ValueError(f"view must be one of {VIEWS}, got {raw!r}")
        return raw
    if isinstance(raw, (list, tuple)) and raw:
        bad = [v for v in raw if v not in VIEWS]
        if bad:
            raise ValueError(f"view list has unknown entries {bad}; allowed {VIEWS}")
        return tuple(raw)
    raise ValueError(f"view must be a string or a non-empty list, got {raw!r}")


_CACHE: Dict[str, Rubric] = {}


def _parse(path: Path) -> Rubric:
    data = json.loads(path.read_text())
    for key in ("id", "family", "view", "checks"):
        if not data.get(key):
            raise ValueError(f"{path.name}: rubric is missing {key!r}")
    view = _parse_view(data["view"])
    for group in ("checks", "setup"):
        for spec in data.get(group) or ():
            if not spec.get("id"):
                raise ValueError(f"{path.name}: {group} entry has no id")
            for band in ("good", "almost"):
                if not (isinstance(spec.get(band), list) and len(spec[band]) == 2):
                    raise ValueError(f"{path.name}: {spec['id']} needs a two-value {band} band")
            cue = spec.get("cue") or {}
            for status in ("good", "almost", "fix"):
                if not (cue.get(status) or {}).get("en"):
                    raise ValueError(f"{path.name}: {spec['id']} has no {status} cue")
    return Rubric(
        id=data["id"],
        family=data["family"],
        view=view,
        phases=tuple(data.get("phases") or ()),
        setup=tuple(data.get("setup") or ()),
        checks=tuple(data["checks"]),
        track=data.get("track"),
    )


def normalize_id(exercise_id: str) -> str:
    """Plan ids are hyphenated (`low-incline-db-press`), rubric files are underscored.

    The two sets of ids come from different places -- plans.json was written by hand and the
    rubrics follow the Python module name -- so without this a tap on an exercise card asks for a
    rubric that exists and is told it does not. Only the FORMAT is unified here; a genuinely
    unknown id still raises.
    """
    return exercise_id.replace("-", "_").strip().lower()


def load_rubric(exercise_id: str) -> Rubric:
    """Find the rubric by the `id` inside the file, not by filename.

    A copy-pasted rubric keeps its old id; keying on the filename would then judge one
    exercise with another's bands. Parsed rubrics are cached because the phone asks for the
    same rubric every rep.
    """
    wanted = normalize_id(exercise_id)
    if wanted in _CACHE:
        return _CACHE[wanted]
    known: List[str] = []
    for path in sorted(RUBRIC_DIR.glob("*.json")):
        rubric = _parse(path)
        _CACHE[normalize_id(rubric.id)] = rubric
        known.append(rubric.id)
    if wanted in _CACHE:
        return _CACHE[wanted]
    raise KeyError(f"unknown rubric {exercise_id!r}; known rubrics: {sorted(known)}")


# ---------------------------------------------------------------- results

@dataclass
class CheckResult:
    id: str
    label: str
    phase: str
    status: str  # good | almost | fix | unsure
    message_en: str
    message_hi: str
    value: float = float("nan")
    confidence: str = "measured"  # measured | estimate | unsure
    reason: str = ""


@dataclass
class RepVerdict:
    index: int
    start_sec: float
    bottom_sec: float
    end_sec: float
    checks: List[CheckResult] = field(default_factory=list)
    order: Tuple[str, ...] = ()  # rubric check ids, first listed = highest priority

    @property
    def statuses(self) -> Dict[str, str]:
        return {c.id: c.status for c in self.checks}


@dataclass
class RubricResult:
    reps: List[RepVerdict]
    setup_issues: List[CheckResult]
    view: str
    judged: bool
    refusal_reason: str = ""


@dataclass(frozen=True)
class RepSpan:
    """Indexes into the timeline: where the rep starts, bottoms out, and finishes."""

    start: int
    bottom: int
    end: int


def worst_cue(rep: RepVerdict) -> Optional[CheckResult]:
    """The one thing to say. Fixes beat almosts, then the rubric's own priority order."""
    rank = {check_id: i for i, check_id in enumerate(rep.order)}
    bad = [c for c in rep.checks if c.status in ("fix", "almost")]
    if not bad:
        return None
    bad.sort(key=lambda c: (c.status != "fix", rank.get(c.id, len(rank))))
    return bad[0]


# ---------------------------------------------------------------- measuring

def _window(span: RepSpan, at: str, n: int) -> List[int]:
    pad = 2  # a verdict is a window, not a single frame: one noisy frame must not decide a rep
    if at == "bottom":
        lo, hi = span.bottom - pad, span.bottom + pad
    elif at == "lockout":
        lo, hi = span.end - pad, span.end + pad
    elif at == "concentric":
        lo, hi = span.bottom, span.end
    elif at == "setup":
        lo, hi = 0, 9
    else:  # eccentric and anything unrecognised
        lo, hi = span.start, span.bottom
    lo = max(0, min(lo, n - 1))
    hi = max(lo, min(hi, n - 1))
    return list(range(lo, hi + 1))


def _space(spec: Dict) -> str:
    return CAPTURE_SPACE.get(spec.get("capture", "in_plane"), "image2d")


def _spec(spec: Dict, space: str, frame: str = "torso") -> MeasurementSpec:
    return MeasurementSpec(
        spec["id"],
        space=space,
        frame=frame,
        robust=spec.get("robust", "median"),
        min_visibility=float(spec.get("min_visibility", 0.6)),
    )


def _side(frames: Sequence) -> str:
    for f in frames:
        side = getattr(f, "dominant_side", "") or ""
        if side:
            return side
    return "right"


def _torso_incline(frames: Sequence, frame_wh: Tuple[float, float]) -> Measurement:
    """How far the bench is tilted, from the torso axis against horizontal.

    A seated or standing torso is vertical (90 degrees of incline); lying flat it points along
    the bench (0); a low incline sits between. Measured in the image on purpose: a torso angle
    is in-plane, so a 2D reading is a real measurement rather than a depth guess.
    """
    axis = torso_axis(frames, frame_wh)
    if axis is None:
        return Measurement("torso_incline", "torso", float("nan"), "unsure", "torso_axis_lost")
    up = -gravity_axis("image2d")  # image y grows downward
    dot = float(axis[0] * up[0] + axis[1] * up[1])
    incline = 90.0 - math.degrees(math.acos(max(-1.0, min(1.0, dot))))
    if not plausible("torso", incline):
        return Measurement("torso_incline", "torso", incline, "unsure", "implausible:torso_incline")
    return Measurement("torso_incline", "torso", incline, "measured")


def _torso_lean(frames: Sequence, frame_wh: Tuple[float, float]) -> Measurement:
    """How far the torso is from upright, in degrees. 0 is standing, 90 is lying flat.

    The hinge measure: a squat leans a little, an RDL leans a lot, a curl barely at all, so one
    number expresses three different faults depending on the rubric. Image space on purpose --
    torso angle is in-plane from every view the rubrics accept, so 2D is a real measurement.
    """
    leans: List[float] = []
    axis = torso_axis(frames, frame_wh)
    if axis is None:
        return Measurement("torso_lean", "torso", float("nan"), "unsure", "torso_axis_lost")
    # torso_axis is a unit vector hip -> shoulder already averaged over the window in pixel space.
    # Image y grows downward, so "up" is (0, -1) and a vertical torso gives dot = 1, lean = 0.
    dot = float(-axis[1])
    lean = math.degrees(math.acos(max(-1.0, min(1.0, dot))))
    if not plausible("torso", lean):
        return Measurement("torso_lean", "torso", lean, "unsure", "implausible:torso_lean")
    return Measurement("torso_lean", "torso", lean, "measured")


def _measure_check(spec: Dict, frames: Sequence, idx: List[int], frame_wh) -> Measurement:
    # Any joint the kinematics table knows is a plain joint-angle check. This used to default to
    # elbow only, so a check written with `"joint": "knee"` fell through to unknown_measure and was
    # silently reported as unsure -- an entire movement family (squat, lunge, leg curl) could not be
    # expressed at all.
    kind = spec.get("measure") or "joint_angle"
    space = _space(spec)
    window = [frames[i] for i in idx]
    side = _side(window)

    if kind == "torso_incline":
        return _torso_incline(window, frame_wh)
    if kind == "torso_lean":
        return _torso_lean(window, frame_wh)
    if kind == "joint_angle":
        return measure(_spec(spec, space), side, window, frame_wh, joint=spec.get("joint", "elbow"))
    if kind == "wrist_vs_elbow_stack":
        # Drift toward the head and drift toward the feet are the same fault, so the angle
        # against gravity is folded into 0..90. Without the fold a hands-above-elbows stack
        # (forearm pointing up, 180 degrees from "down") would read as the worst possible
        # score on a perfect rep.
        m = measure(_spec(spec, space, frame="gravity"), side, window, frame_wh,
                    segment=("elbow", "wrist"))
        if not m.ok:
            return m
        # kinematics marks every gravity-framed reading as an estimate because world y is an
        # assumption. In image space "down" is not an assumption, it is the frame, so this
        # stays a real measurement.
        conf = m.confidence if space == "world3d" else "measured"
        return Measurement(m.id, m.joint, min(m.value, 180.0 - m.value), conf,
                           m.reason, m.visibility, m.samples)
    if kind in ("arm_difference", "side_difference"):
        # Left-vs-right on whichever joint the check names. The press compares elbows, a squat
        # compares knees, but the fault is identical: one side doing less work than the other.
        joint = spec.get("joint", "elbow")
        left = measure(_spec(spec, space), "left", window, frame_wh, joint=joint)
        right = measure(_spec(spec, space), "right", window, frame_wh, joint=joint)
        if not (left.ok and right.ok):
            why = left.reason or right.reason or "one_side_not_measured"
            return Measurement(spec["id"], joint, float("nan"), "unsure", why)
        conf = "measured" if left.confidence == right.confidence == "measured" else "estimate"
        return Measurement(spec["id"], joint, abs(left.value - right.value), conf)
    if kind == "eccentric_seconds":
        times = [frames[i].time_sec for i in idx]
        if len(times) < 2:
            return Measurement(spec["id"], "time", float("nan"), "unsure", "window_too_short")
        return Measurement(spec["id"], "time", float(max(times) - min(times)), "measured")
    return Measurement(spec["id"], spec.get("joint", "unknown"), float("nan"), "unsure",
                       f"unknown_measure:{kind}")


def _in(value: float, band: Optional[Sequence[float]]) -> bool:
    if not band:
        return False
    return band[0] <= value <= band[1]


def _verdict_value(spec: Dict, value: float) -> str:
    if _in(value, spec.get("good")):
        return "good"
    if _in(value, spec.get("almost")):
        return "almost"
    return "fix"


def _result(spec: Dict, phase: str, m: Measurement) -> CheckResult:
    """Turn a measurement into a verdict, or into silence when the tracker was unsure."""
    cues = spec.get("cue") or {}
    if not m.ok:
        en, hi = UNSURE_CUE.get(spec["id"], GENERIC_UNSURE)
        return CheckResult(spec["id"], spec.get("label", spec["id"]), phase, "unsure",
                           en, hi, m.value, "unsure", m.reason)
    status = _verdict_value(spec, m.value)
    cue = cues.get(status) or cues.get("fix") or {}
    return CheckResult(spec["id"], spec.get("label", spec["id"]), phase, status,
                       cue.get("en", ""), cue.get("hi", ""), m.value, m.confidence, m.reason)


# ---------------------------------------------------------------- evaluate

def _coerce(span) -> RepSpan:
    if isinstance(span, RepSpan):
        return span
    start, bottom, end = span
    return RepSpan(int(start), int(bottom), int(end))


def evaluate(rubric: Rubric, timeline: Sequence, tips: Sequence[RepSpan],
             frame_wh: Tuple[float, float]) -> RubricResult:
    """Judge every rep in the timeline, or refuse because the camera is in the wrong place.

    `tips` is one `RepSpan` (or start/bottom/end index triple) per rep, as detected by the rep
    counter. The view gate runs before anything else: from a wrong camera position every
    number is distorted in the same direction, so a verdict produced there would be a
    confident lie rather than a slightly-off reading.
    """
    frames = list(timeline)
    if not frames:
        return RubricResult([], [], "unknown", False, "no_frames")
    if tips and all(isinstance(i, int) for i in tips):
        tips = [tips]  # a single bare (start, bottom, end) triple means one rep

    observed, _conf = detect_view(frames, frame_wh)
    ok, reason = gate_view(observed, rubric.view)
    if not ok:
        return RubricResult([], [], observed, False, reason)

    n = len(frames)
    setup_all = [_result(spec, "setup", _measure_check(spec, frames, _window(RepSpan(0, 0, n - 1), "setup", n), frame_wh))
                 for spec in rubric.setup]
    setup_issues = [c for c in setup_all if c.status != "good"]

    reps: List[RepVerdict] = []
    for i, raw in enumerate(tips):
        span = _coerce(raw)
        span = RepSpan(max(0, min(span.start, n - 1)),
                       max(0, min(span.bottom, n - 1)),
                       max(0, min(span.end, n - 1)))
        checks = []
        for spec in rubric.checks:
            phase = spec.get("at", "eccentric")
            idx = _window(span, phase, n)
            checks.append(_result(spec, phase, _measure_check(spec, frames, idx, frame_wh)))
        reps.append(RepVerdict(
            index=i + 1,
            start_sec=float(frames[span.start].time_sec),
            bottom_sec=float(frames[span.bottom].time_sec),
            end_sec=float(frames[span.end].time_sec),
            checks=checks,
            order=tuple(spec["id"] for spec in rubric.checks),
        ))
    return RubricResult(reps, setup_issues, observed, True, "")
