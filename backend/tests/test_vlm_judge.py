"""Tests for the vision judge. No network: keypool._post_json is monkeypatched."""

import json

import pytest

from app.services import keypool, vlm_judge
from app.services.keypool import KeyPool
from app.services.vlm_judge import (
    ADJUDICATE_SCHEMA,
    MAX_TOKENS_ADJUDICATE,
    MAX_TOKENS_IDENTIFY,
    Adjudication,
    VLMError,
    adjudicate,
    identify_exercise,
    landmark_summary,
    log_adjudication,
)

BASE = "https://coarena.example/api/v1"
KEYS = ["coa_aaaaaaaaaaaaaaaaaaaaaaaaaaaa1111", "coa_bbbbbbbbbbbbbbbbbbbbbbbbbbbb2222"]
MODELS = ["model-a", "model-b"]
CANDIDATES = ["low_incline_db_press", "back_squat", "db_shoulder_press"]
B64_A = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAg=="
B64_B = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgABBB=="


def chat_body(content_text):
    """A valid chat-completions body whose message content is `content_text`."""
    return json.dumps({"choices": [{"message": {"content": content_text}}]})


class Recorder:
    """Stands in for keypool._post_json: records payloads, replies with one body."""

    def __init__(self, content=None, status=200):
        self.content = content
        self.status = status
        self.payloads = []

    def __call__(self, url, headers, payload, timeout):
        self.payloads.append(payload)
        if self.status != 200:
            return self.status, "{}"
        text = self.content if isinstance(self.content, str) else json.dumps(self.content)
        return 200, chat_body(text)

    @property
    def last(self):
        return self.payloads[-1]

    def images(self, i=-1):
        parts = self.payloads[i]["messages"][-1]["content"]
        return [p for p in parts if p.get("type") == "image_url"]

    def prompt(self, i=-1):
        return self.payloads[i]["messages"][-1]["content"][0]["text"]


@pytest.fixture
def rec(monkeypatch):
    def install(content=None, status=200):
        r = Recorder(content, status)
        monkeypatch.setattr(keypool, "_post_json", r)
        monkeypatch.setenv("COARENA_VISION_MODEL", "gemini-3-8-flash")
        return r

    return install


@pytest.fixture
def pool():
    return KeyPool(BASE, KEYS, MODELS)


def identify_payload(**over):
    base = {"exercise_id": "back_squat", "view": "side", "confidence": 0.77, "alternatives": ["low_incline_db_press"]}
    base.update(over)
    return base


# ---------------------------------------------------------------- A. identify

def test_identify_returns_a_candidate_id(rec, pool):
    r = rec(identify_payload())
    out = identify_exercise([B64_A, B64_B], CANDIDATES, pool=pool)
    assert out.exercise_id == "back_squat"
    assert out.view == "side"
    assert 0.0 <= out.confidence <= 1.0
    assert out.alternatives == ["low_incline_db_press"]
    assert len(r.images()) == 2


def test_identify_rejects_id_outside_candidates(rec, pool):
    rec(identify_payload(exercise_id="bench_press_that_was_never_offered"))
    with pytest.raises(VLMError) as err:
        identify_exercise([B64_A], CANDIDATES, pool=pool)
    assert "candidates" in str(err.value)


def test_identify_rejects_bad_view(rec, pool):
    rec(identify_payload(view="upside_down"))
    with pytest.raises(VLMError):
        identify_exercise([B64_A], CANDIDATES, pool=pool)


def test_identify_needs_candidates_and_frames(rec, pool):
    rec(identify_payload())
    with pytest.raises(VLMError):
        identify_exercise([B64_A], [], pool=pool)
    with pytest.raises(VLMError):
        identify_exercise([], CANDIDATES, pool=pool)


def test_identify_payload_caps_images_and_tokens(rec, pool):
    r = rec(identify_payload())
    identify_exercise([B64_A, B64_B, B64_A + "zzz"], CANDIDATES, pool=pool)
    assert len(r.images()) == 2  # a third image is latency, not accuracy
    assert r.last["max_tokens"] == MAX_TOKENS_IDENTIFY
    assert r.last["max_tokens"] <= 800  # capped: a verbose answer is the latency killer
    assert r.last["response_format"] == {"type": "json_schema", "json_schema": vlm_judge.IDENTIFY_SCHEMA}
    assert r.last["model"] == "gemini-3-8-flash"


# ---------------------------------------------------------------- B. adjudicate

def adjudication_payload(**over):
    base = {
        "checks": [
            {"id": "depth", "status": "good", "reason": "upper arms level with torso"},
            {"id": "elbow_path", "status": "unsure", "reason": "hands cropped out of frame"},
        ],
        "overall": "1 of 2 checks clear",
        "confidence": 0.66,
    }
    base.update(over)
    return base


RUBRIC = {
    "id": "low_incline_db_press",
    "checks": [
        {"id": "depth", "measure": "elbow_flexion", "good": [70, 95], "almost": [95, 110]},
        {"id": "elbow_path", "measure": "wrist_vs_elbow_stack", "good": [0, 12]},
    ],
}
LOCAL = {"checks": [{"id": "depth", "status": "good"}, {"id": "elbow_path", "status": "good"}]}


def test_adjudicate_marks_disagreement(rec, pool):
    rec(adjudication_payload())
    out = adjudicate({"keyframes": [B64_A, B64_B], "landmarks": []}, RUBRIC, LOCAL, pool=pool)
    assert out.agrees_with_local is False
    assert out.disagreements == ["elbow_path: local=good, remote=unsure"]


def test_adjudicate_agreement_has_no_disagreements(rec, pool):
    rec(adjudication_payload(checks=[{"id": "depth", "status": "good", "reason": "ok"}]))
    out = adjudicate({"keyframes": [B64_A]}, RUBRIC, LOCAL, pool=pool)
    assert out.agrees_with_local is True
    assert out.disagreements == []


def test_unsure_is_preserved_never_coerced(rec, pool):
    rec(adjudication_payload(checks=[{"id": "depth", "status": "unsure", "reason": "elbows hidden"}]))
    out = adjudicate({"keyframes": [B64_A]}, RUBRIC, {"checks": [{"id": "depth", "status": "fix"}]}, pool=pool)
    assert out.checks[0]["status"] == "unsure"
    assert out.disagreements == ["depth: local=fix, remote=unsure"]


def test_adjudicate_rejects_unknown_status(rec, pool):
    rec(adjudication_payload(checks=[{"id": "depth", "status": "great"}]))
    with pytest.raises(VLMError) as err:
        adjudicate({"keyframes": [B64_A]}, RUBRIC, LOCAL, pool=pool)
    assert "great" in str(err.value)


def test_adjudicate_needs_a_keyframe_and_a_rubric(rec, pool):
    rec(adjudication_payload())
    with pytest.raises(VLMError):
        adjudicate({"keyframes": []}, RUBRIC, LOCAL, pool=pool)
    with pytest.raises(VLMError):
        adjudicate({"keyframes": [B64_A]}, {}, LOCAL, pool=pool)


def test_adjudicate_payload_is_compact_and_capped(rec, pool):
    r = rec(adjudication_payload())
    frames = [{"t": i, "keypoints": {}} for i in range(30)]
    adjudicate(
        {"exercise": "low_incline_db_press", "rep": 4, "keyframes": [B64_A, B64_B], "landmarks": frames},
        RUBRIC,
        LOCAL,
        pool=pool,
    )
    assert len(r.images()) == 2
    assert r.last["max_tokens"] == MAX_TOKENS_ADJUDICATE
    assert r.last["max_tokens"] <= 2000
    assert r.last["response_format"]["json_schema"] == ADJUDICATE_SCHEMA
    prompt = r.prompt()
    assert "elbow_path" in prompt  # the rubric travels with the request
    assert "landmark_summary_deg" in prompt
    assert '"local_verdict"' in prompt or "local_verdict" in prompt


def test_malformed_json_raises_clear_error(rec, pool):
    rec("{this is not json at all")
    with pytest.raises(VLMError) as err:
        adjudicate({"keyframes": [B64_A]}, RUBRIC, LOCAL, pool=pool)
    assert "did not return JSON" in str(err.value)


def test_non_object_json_raises(rec, pool):
    rec("[1, 2, 3]")
    with pytest.raises(VLMError):
        adjudicate({"keyframes": [B64_A]}, RUBRIC, LOCAL, pool=pool)


def test_fenced_json_is_accepted(rec, pool):
    body = {"checks": [{"id": "depth", "status": "good"}], "overall": "ok", "confidence": 0.9}
    rec("```json\n" + json.dumps(body) + "\n```")
    out = adjudicate({"keyframes": [B64_A]}, RUBRIC, {"checks": [{"id": "depth", "status": "good"}]}, pool=pool)
    assert out.overall == "ok"


# ---------------------------------------------------------------- landmark summary

def test_landmark_summary_is_per_joint_min_median_max():
    def kp(x, y, z=0.0):
        return {"wx": x, "wy": y, "wz": z}

    def frame(bend):
        # shoulder/elbow/wrist for both sides, elbow angle driven by `bend`
        return {
            "keypoints": {
                "left_shoulder": kp(0.1, 0.3),
                "left_elbow": kp(0.1, 0.4),
                "left_wrist": kp(0.1 + bend, 0.4 + bend),
                "right_shoulder": kp(0.1, 0.3),
                "right_elbow": kp(0.1, 0.4),
                "right_wrist": kp(0.1 + bend, 0.4 + bend),
            }
        }

    out = landmark_summary([frame(0.2), frame(0.05), frame(0.3)])
    assert "left_elbow" in out and "right_elbow" in out
    for stats in out.values():
        assert stats["min"] <= stats["median"] <= stats["max"]
    # three frames summarised into four numbers, not 3 x 33 raw points
    assert len(out["left_elbow"]) == 4


# ---------------------------------------------------------------- C. accuracy log

def test_log_writes_one_line_without_images_or_keys(rec, tmp_path, monkeypatch):
    monkeypatch.setenv("VLM_ADJUDICATION_DIR", str(tmp_path))
    rec(adjudication_payload())
    out = adjudicate({"keyframes": [B64_A, B64_B]}, RUBRIC, LOCAL, pool=KeyPool(BASE, KEYS, MODELS))
    path = log_adjudication(
        "ev-42",
        {"checks": [{"id": "depth", "status": "good", "image": B64_A}]},
        out,
        day="2026-11-16",
    )
    lines = path.read_text().splitlines()
    assert len(lines) == 1
    record = json.loads(lines[0])
    assert record["evidence_id"] == "ev-42"
    assert record["disagreements"] == ["elbow_path: local=good, remote=unsure"]
    assert record["agrees_with_local"] is False
    assert "base64" not in lines[0]
    assert B64_A not in lines[0]
    assert "coa_" not in lines[0]
    for k in KEYS:
        assert k not in lines[0]
    assert set(record["local"][0]) == {"id", "status", "reason"}  # image field dropped
    assert path.name == "2026-11-16.jsonl"


def test_log_appends_and_accepts_dict_remote(tmp_path, monkeypatch):
    monkeypatch.setenv("VLM_ADJUDICATION_DIR", str(tmp_path))
    for i in range(2):
        path = log_adjudication(
            f"ev-{i}", [], {"checks": [{"id": "depth", "status": "fix"}], "confidence": 0.4}, day="2026-11-16"
        )
    assert len(path.read_text().splitlines()) == 2


def test_log_serialises_adjudication_object(tmp_path, monkeypatch):
    monkeypatch.setenv("VLM_ADJUDICATION_DIR", str(tmp_path))
    adj = Adjudication(
        checks=[{"id": "depth", "status": "unsure", "reason": "hidden"}],
        overall="?",
        confidence=0.2,
        agrees_with_local=True,
    )
    path = log_adjudication("ev-9", [], adj, day="2026-11-16")
    record = json.loads(path.read_text())
    assert record["remote"][0]["status"] == "unsure"
