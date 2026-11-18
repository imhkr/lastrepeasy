"""The live adjudication endpoint.

The phone's on-device verdict is what the lifter hears mid-set, so this endpoint is a second
opinion and must never be able to fail the set. The tests here pin that property: a bad key, a
dead network or an unknown exercise must all produce a usable response, not a 500 that leaves the
coach page broken while someone is holding a dumbbell.
"""
from __future__ import annotations

import base64

from fastapi.testclient import TestClient

from app.main import app
from app.services import vlm_judge

client = TestClient(app)

# A 1x1 JPEG is enough: the endpoint's contract is about routing and refusal, not pixels. The
# model is never reached in these tests, so nothing decodes this.
TINY_JPEG = base64.b64encode(
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9"
).decode()


def _payload(exercise_id="low_incline_db_press", keyframes=None, checks=None):
    return {
        "exercise_id": exercise_id,
        "rep_index": 1,
        "view": "front",
        "checks": checks if checks is not None else [
            {"id": "depth", "status": "good"},
            {"id": "lockout", "status": "almost"},
        ],
        "keyframes": keyframes if keyframes is not None else [TINY_JPEG],
        "landmarks": [],
    }


def test_endpoint_is_registered():
    paths = {r.path for r in app.routes}
    assert "/api/live/adjudicate" in paths


def test_rejects_a_request_with_no_frames():
    r = client.post("/api/live/adjudicate", json=_payload(keyframes=[]))
    assert r.status_code == 400
    assert "keyframe" in r.json()["detail"]


def test_rejects_more_frames_than_the_model_takes():
    # More images cost latency and money without buying accuracy, so the cap is enforced here
    # rather than trusted to the caller.
    r = client.post("/api/live/adjudicate", json=_payload(keyframes=[TINY_JPEG] * (vlm_judge.MAX_IMAGES + 1)))
    assert r.status_code == 400
    assert str(vlm_judge.MAX_IMAGES) in r.json()["detail"]


def test_unknown_exercise_is_a_404_not_a_guessed_rubric():
    r = client.post("/api/live/adjudicate", json=_payload(exercise_id="barbell_back_squat"))
    assert r.status_code == 404
    assert "barbell_back_squat" in r.json()["detail"]


def test_a_dead_remote_does_not_fail_the_set(monkeypatch):
    """The whole point. If the second opinion cannot be obtained the on-device verdict stands and
    the response says the remote was unavailable, so the coach keeps working."""

    def boom(*_a, **_kw):
        raise vlm_judge.VLMError("no healthy routes")

    monkeypatch.setattr(vlm_judge, "adjudicate", boom)
    r = client.post("/api/live/adjudicate", json=_payload())
    assert r.status_code == 200, r.text
    body = r.json()
    # The local verdicts come back untouched, in the same order.
    assert [c["id"] for c in body["checks"]] == ["depth", "lockout"]
    assert [c["status"] for c in body["checks"]] == ["good", "almost"]
    assert body["agrees_with_local"] is True
    assert any("remote_unavailable" in d for d in body["disagreements"])


def test_a_remote_verdict_is_returned_and_logged(monkeypatch):
    """A successful adjudication returns the remote checks and writes the accuracy log. The log is
    the metric the whole tier exists to produce, so it is asserted here, not just the response."""
    logged = {}

    def fake_adjudicate(evidence, rubric, local, pool=None):
        assert rubric["id"] == "low_incline_db_press"
        assert local == {"depth": "good", "lockout": "almost"}
        return vlm_judge.Adjudication(
            checks=[
                {"id": "depth", "status": "fix", "reason": "hips rose"},
                {"id": "lockout", "status": "almost", "reason": ""},
            ],
            overall="Depth was short.",
            confidence=0.8,
            agrees_with_local=False,
            disagreements=["depth: local=good, remote=fix"],
        )

    def fake_log(evidence_id, local, remote, day=None):
        logged["id"] = evidence_id
        logged["local"] = local
        logged["remote_checks"] = remote.checks
        return None

    monkeypatch.setattr(vlm_judge, "adjudicate", fake_adjudicate)
    monkeypatch.setattr(vlm_judge, "log_adjudication", fake_log)

    r = client.post("/api/live/adjudicate", json=_payload())
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["agrees_with_local"] is False
    assert body["disagreements"] == ["depth: local=good, remote=fix"]
    assert body["checks"][0]["status"] == "fix"
    assert logged["id"] == "low_incline_db_press/1"
    assert logged["remote_checks"][0]["id"] == "depth"


def test_a_logging_failure_does_not_lose_the_verdict(monkeypatch):
    """Writing the accuracy log is bookkeeping; the verdict is the product."""

    def fake_adjudicate(evidence, rubric, local, pool=None):
        return vlm_judge.Adjudication(
            checks=[{"id": "depth", "status": "fix", "reason": ""}],
            overall="", confidence=0.5, agrees_with_local=False,
            disagreements=["depth: local=good, remote=fix"],
        )

    def bad_log(*_a, **_kw):
        raise OSError("disk full")

    monkeypatch.setattr(vlm_judge, "adjudicate", fake_adjudicate)
    monkeypatch.setattr(vlm_judge, "log_adjudication", bad_log)

    r = client.post("/api/live/adjudicate", json=_payload())
    assert r.status_code == 200, r.text
    assert r.json()["checks"][0]["status"] == "fix"


def test_the_squat_family_is_served_too():
    """A second family reaching the endpoint proves the rubric lookup is family-agnostic."""
    def boom(*_a, **_kw):
        raise vlm_judge.VLMError("offline in test")

    import pytest
    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(vlm_judge, "adjudicate", boom)
        r = client.post("/api/live/adjudicate", json=_payload(exercise_id="hack-squat", checks=[
            {"id": "depth", "status": "almost"},
        ]))
    assert r.status_code == 200, r.text
    assert r.json()["checks"][0]["id"] == "depth"
