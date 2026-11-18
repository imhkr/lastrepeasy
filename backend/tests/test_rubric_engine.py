"""Rubric engine tests.

The engine's whole value is in three refusals, so they get the first tests: it must not judge
from the wrong camera position, must not turn a shaky measurement into a verdict, and must
say one thing at a time. The last group drives synthetic reps through the real rubric so a
correct rep scores clean and a single fault is attributed to a single check.
"""
from __future__ import annotations

import math

import pytest

from app.services.rubric_codegen import load_all
from app.services.rubric_engine import (
    GENERIC_UNSURE,
    UNSURE_CUE,
    CheckResult,
    RepSpan,
    RepVerdict,
    assert_plain,
    evaluate,
    load_rubric,
    worst_cue,
)

FPS = 15


class KP:
    """Minimal stand-in for app.services.pose_analyzer.Keypoint2D."""

    __slots__ = ("x", "y", "visibility", "wx", "wy", "wz")

    def __init__(self, x, y, visibility=1.0, wx=0.0, wy=0.0, wz=0.0):
        self.x, self.y, self.visibility = x, y, visibility
        self.wx, self.wy, self.wz = wx, wy, wz


class Frame:
    __slots__ = ("keypoints", "time_sec", "dominant_side")

    def __init__(self, keypoints, time_sec=0.0, dominant_side="right"):
        self.keypoints = keypoints
        self.time_sec = time_sec
        self.dominant_side = dominant_side


WH = (1000.0, 1000.0)  # square, so normalized synthetic geometry maps to angles unchanged


def _arm(side, shoulder, elbow_deg, vis):
    """Upper arm placed so the *interior* elbow angle is exactly `elbow_deg`, forearm straight up.

    The wrist is put directly over the elbow because that is what a correct press looks like,
    so the hands-stack check stays clean and only the fault under test can fail. The upper arm
    direction is chosen to make `elbow_deg` the angle at the elbow, not the tilt of the bone.
    """
    a = math.radians(elbow_deg)
    elbow = (shoulder[0] - 0.20 * math.sin(a), shoulder[1] + 0.20 * math.cos(a))
    wrist = (elbow[0], elbow[1] - 0.20)
    kp = {}
    for name, (x, y) in (("shoulder", shoulder), ("elbow", elbow), ("wrist", wrist)):
        # world y is flipped relative to image y; a reflection preserves the interior angle
        kp[f"{side}_{name}"] = KP(x, y, vis, x, -y, 0.0)
    return kp


def _frame(angle, t, vis, shoulder_gap, torso_incline):
    sh_mid = (0.5, 0.4)
    kp = {}
    kp.update(_arm("right", (sh_mid[0] + shoulder_gap / 2, 0.4), angle, vis))
    kp.update(_arm("left", (sh_mid[0] - shoulder_gap / 2, 0.4), angle, vis))
    inc = math.radians(torso_incline)
    hip_mid = (sh_mid[0] - 0.35 * math.cos(inc), sh_mid[1] + 0.35 * math.sin(inc))
    for side, dx in (("left", -0.04), ("right", 0.04)):
        kp[f"{side}_hip"] = KP(hip_mid[0] + dx, hip_mid[1], vis)
    return Frame(kp, t)


def press_timeline(bottom=88.0, top=170.0, down_s=2.0, up_s=1.5, vis=1.0,
                   torso_incline=30.0, shoulder_gap=0.11):
    """One rep: hold at the top, lower over `down_s`, pause, press back up, hold."""
    angles = [top] * int(0.8 * FPS)
    angles += list(_lin(top, bottom, max(2, int(down_s * FPS))))
    angles += [bottom] * int(0.3 * FPS)
    angles += list(_lin(bottom, top, max(2, int(up_s * FPS))))
    angles += [top] * int(0.8 * FPS)

    frames = [_frame(a, i / FPS, vis, shoulder_gap, torso_incline) for i, a in enumerate(angles)]
    start = int(0.8 * FPS)
    bottom_idx = min(range(start, len(angles)), key=lambda i: angles[i])
    end = len(angles) - int(0.8 * FPS) - 1
    return frames, RepSpan(start, bottom_idx, end)


def _lin(a, b, n):
    return [a + (b - a) * i / (n - 1) for i in range(n)]


# ------------------------------------------------------------------ rubric loading

def test_rubric_loads_with_the_checks_the_press_needs():
    r = load_rubric("low_incline_db_press")
    # A press reads equally well face-on and at 45 degrees, so the rubric accepts both rather than
    # demanding one exact camera position and refusing measurable clips.
    assert r.view == ("front", "45")
    assert [c["id"] for c in r.checks] == ["depth", "lockout", "elbow_path", "tempo", "symmetry"]
    assert [c["id"] for c in r.setup] == ["bench_angle"]


def test_load_is_cached():
    assert load_rubric("low_incline_db_press") is load_rubric("low_incline_db_press")


def test_unknown_id_raises_with_the_known_list():
    with pytest.raises(KeyError, match="low_incline_db_press"):
        load_rubric("no_such_exercise")


# ------------------------------------------------------------------ refusing to judge

def test_view_mismatch_emits_no_verdicts():
    """From a side-on camera every angle is distorted in the same direction, so silence is the only
    honest answer -- not a confident, wrong cue.

    This used a face-on clip, which the press rubric now judges on purpose: a press is perfectly
    readable from the front. The view the rubric actually refuses is a profile, where the shoulders
    collapse and the arm hides the torso.
    """
    frames, span = press_timeline(shoulder_gap=0.02)  # shoulders on top of each other: side-on
    result = evaluate(load_rubric("low_incline_db_press"), frames, [span], WH)
    assert result.judged is False
    assert result.view == "side"
    assert result.refusal_reason.startswith("view_mismatch")
    assert result.reps == [] and result.setup_issues == []


def test_empty_timeline_is_refused():
    result = evaluate(load_rubric("low_incline_db_press"), [], [], WH)
    assert result.judged is False and result.refusal_reason == "no_frames"


def test_unsure_measurement_never_becomes_a_verdict():
    # Shoulders stay visible so the view gate passes, but too faint to measure an arm.
    frames, span = press_timeline(vis=0.52)
    result = evaluate(load_rubric("low_incline_db_press"), frames, [span], WH)
    assert result.judged is True
    statuses = result.reps[0].statuses
    for check_id in ("depth", "lockout", "elbow_path", "symmetry"):
        assert statuses[check_id] == "unsure", statuses
    assert {c.confidence for c in result.reps[0].checks} == {"unsure", "measured"}
    assert all(c.message_en for c in result.reps[0].checks), "an unsure check still speaks"


# ------------------------------------------------------------------ one cue at a time

def _check(check_id, status):
    return CheckResult(check_id, check_id, "bottom", status, "x", "y")


def test_worst_cue_prefers_fix_over_almost():
    rep = RepVerdict(1, 0.0, 0.0, 0.0, [_check("depth", "almost"), _check("lockout", "fix")],
                     ("depth", "lockout"))
    assert worst_cue(rep).id == "lockout"


def test_worst_cue_respects_rubric_order_for_equal_status():
    rep = RepVerdict(1, 0.0, 0.0, 0.0, [_check("tempo", "fix"), _check("depth", "fix")],
                     ("depth", "lockout", "elbow_path", "tempo"))
    assert worst_cue(rep).id == "depth"


def test_worst_cue_is_none_on_a_clean_rep():
    rep = RepVerdict(1, 0.0, 0.0, 0.0, [_check("depth", "good")], ("depth",))
    assert worst_cue(rep) is None


# ------------------------------------------------------------------ plain language

def test_assert_plain_rejects_degrees_jargon_and_length():
    assert_plain("Go a little lower.")
    for bad in ("Set the bench to 30 deg.", "Fix your elbow flexion.",
                "Keep your wrists stacked straight over your elbows during every single rep of the set today"):
        with pytest.raises(AssertionError):
            assert_plain(bad)


def test_every_cue_in_every_rubric_is_plain():
    for rid, data in load_all().items():
        for group in ("checks", "setup"):
            for spec in data.get(group) or ():
                for status, twin in (spec.get("cue") or {}).items():
                    text = twin["en"] if isinstance(twin, dict) else twin
                    assert_plain(text)
                    if isinstance(twin, dict):
                        assert_plain(twin["hi"])
                        assert twin["hi"] != twin["en"], f"{rid}/{spec['id']}/{status} missing Hinglish"


def test_engine_unsure_cues_are_plain():
    for en, hi in list(UNSURE_CUE.values()) + [GENERIC_UNSURE]:
        assert_plain(en)
        assert_plain(hi)


# ------------------------------------------------------------------ whole reps

def test_good_rep_scores_all_good():
    frames, span = press_timeline(bottom=88.0)
    result = evaluate(load_rubric("low_incline_db_press"), frames, [span], WH)
    assert result.judged is True
    rep = result.reps[0]
    assert rep.statuses == {"depth": "good", "lockout": "good", "elbow_path": "good",
                            "tempo": "good", "symmetry": "good"}
    assert worst_cue(rep) is None
    assert result.setup_issues == [], [i.id for i in result.setup_issues]
    assert rep.end_sec > rep.bottom_sec > rep.start_sec
    # Every check on this exercise is graded in image space now. Measured on the reference clip,
    # the world-landmark lift reports 52 degrees of depth and 131 of lockout where the image
    # reading gives 22 and 179 -- the image numbers are the ones that match a rep a lifter called
    # clean, so `measure` is the honest label for all of them.
    by_id = {c.id: c for c in rep.checks}
    assert by_id["depth"].confidence == "measured"
    assert by_id["elbow_path"].confidence == "measured"
    assert by_id["tempo"].confidence == "measured"


def test_shallow_rep_flags_depth_only():
    frames, span = press_timeline(bottom=125.0)
    result = evaluate(load_rubric("low_incline_db_press"), frames, [span], WH)
    rep = result.reps[0]
    assert rep.statuses["depth"] == "fix"
    others = {k: v for k, v in rep.statuses.items() if k != "depth"}
    assert set(others.values()) == {"good"}, others
    assert worst_cue(rep).id == "depth"


def test_setup_reports_a_bench_that_is_too_upright():
    frames, span = press_timeline(torso_incline=60.0)
    result = evaluate(load_rubric("low_incline_db_press"), frames, [span], WH)
    assert [c.id for c in result.setup_issues] == ["bench_angle"]
    assert result.setup_issues[0].status == "fix"


def test_bare_index_triples_are_accepted_as_rep_spans():
    frames, span = press_timeline()
    result = evaluate(load_rubric("low_incline_db_press"), frames,
                      [(span.start, span.bottom, span.end)], WH)
    assert result.judged is True
    assert len(result.reps) == 1
