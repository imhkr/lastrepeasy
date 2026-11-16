"""Kinematics tests.

The first group is the regression that motivated the module: a real incline-press clip
measured 13.5 degrees at the elbow in 2D, which is anatomically impossible, while the same
frames in world space gave 52 degrees. A judging pipeline that accepts 13 degrees accuses a
correct lifter of a fault they did not commit.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import pytest

from app.services.kinematics import (
    MeasurementSpec,
    aggregate,
    angle_at,
    detect_view,
    gate_view,
    measure,
    measure_joint,
    plausible,
    torso_axis,
    world_landmarks_present,
)

import numpy as np

FIXTURE = Path(__file__).parent / "fixtures" / "press_clip_landmarks.json"


class KP:
    """Minimal stand-in for app.services.pose_analyzer.Keypoint2D."""

    __slots__ = ("x", "y", "visibility", "wx", "wy", "wz")

    def __init__(self, x, y, visibility=1.0, wx=0.0, wy=0.0, wz=0.0):
        self.x, self.y, self.visibility = x, y, visibility
        self.wx, self.wy, self.wz = wx, wy, wz


class Frame:
    __slots__ = ("keypoints", "time_sec")

    def __init__(self, keypoints, time_sec=0.0):
        self.keypoints = keypoints
        self.time_sec = time_sec


def make_frame(side="right", elbow_deg=90.0, vis=1.0, with_world=True, wx_offset=0.0, mirrored=False):
    """Build one arm with a known interior elbow angle, in both image and world space.

    Both sides are emitted by default: torso_axis and detect_view need left and right, and a
    frame with one side only would make those silently return None instead of exercising the
    code under test.
    """
    th = math.radians(elbow_deg)
    shoulder = (0.5, 0.4)
    up_len, fore_len = 0.20, 0.20
    elbow = (shoulder[0], shoulder[1] + up_len)
    # forearm leaves the elbow at th measured from the upper arm
    fore_dir = (math.sin(th), -math.cos(th))
    wrist = (elbow[0] + fore_len * fore_dir[0], elbow[1] + fore_len * fore_dir[1])

    def arm(s, dx):
        sh = (shoulder[0] + dx, shoulder[1])
        el = (elbow[0] + dx, elbow[1])
        wr = (wrist[0] + dx, wrist[1])
        if with_world:
            k = {
                f"{s}_shoulder": KP(*sh, vis, wx_offset + dx, 0.0, 0.0),
                f"{s}_elbow": KP(*el, vis, wx_offset + dx, -up_len, 0.0),
                f"{s}_wrist": KP(*wr, vis, wx_offset + dx + fore_len * fore_dir[0], -fore_len * fore_dir[1], 0.0),
                f"{s}_hip": KP(0.5 + dx, 0.75, vis, wx_offset + dx, 0.45, 0.0),
                f"{s}_knee": KP(0.5 + dx, 0.9, vis, wx_offset + dx, 0.85, 0.0),
                f"{s}_ankle": KP(0.5 + dx, 0.97, vis, wx_offset + dx, 1.05, 0.0),
                f"{s}_foot_index": KP(0.55 + dx, 0.98, vis, wx_offset + dx + 0.1, 1.08, 0.0),
            }
        else:
            k = {
                f"{s}_shoulder": KP(*sh, vis), f"{s}_elbow": KP(*el, vis), f"{s}_wrist": KP(*wr, vis),
                f"{s}_hip": KP(0.5 + dx, 0.75, vis), f"{s}_knee": KP(0.5 + dx, 0.9, vis),
                f"{s}_ankle": KP(0.5 + dx, 0.97, vis), f"{s}_foot_index": KP(0.55 + dx, 0.98, vis),
            }
        return k

    kp = arm(side, 0.0)
    other = "left" if side == "right" else "right"
    kp.update(arm(other, -0.08))  # the far side, slightly offset like a 3/4 view
    return Frame(kp)


WH = (1280.0, 720.0)
# Synthetic geometry is specified in normalized coordinates, which only map to angles
# faithfully on a square frame. Real frames are handled by _p2 scaling; tests that assert
# an exact angle use a square frame to isolate the maths from aspect ratio.
WH_SQ = (1000.0, 1000.0)


# ------------------------------------------------------------------ angle math

def test_angle_at_right_angle_is_90():
    a, b, c = np.array([0.0, -1.0]), np.array([0.0, 0.0]), np.array([1.0, 0.0])
    assert angle_at(a, b, c) == pytest.approx(90.0, abs=1e-6)


def test_angle_at_straight_is_180():
    a, b, c = np.array([0.0, -1.0]), np.array([0.0, 0.0]), np.array([0.0, 1.0])
    assert angle_at(a, b, c) == pytest.approx(180.0, abs=1e-6)


def test_angle_at_degenerate_is_nan():
    p = np.array([0.0, 0.0])
    assert math.isnan(angle_at(p, p, np.array([1.0, 0.0])))


def test_measured_elbow_roundtrips_through_2d():
    """A synthetic 90-degree arm must read back as 90, not 90-something-else."""
    f = make_frame(elbow_deg=90.0)
    m = measure_joint(MeasurementSpec("elbow", space="image2d"), "right", "elbow", [f], WH_SQ)
    assert m.ok and m.confidence == "measured"
    assert m.value == pytest.approx(90.0, abs=0.5)


# ------------------------------------------------------------------ plausibility guard

def test_plausible_rejects_impossible_elbow():
    # This exact situation came from the real clip: 13.5 degrees at the elbow of a press.
    assert plausible("elbow", 13.5) is False
    assert plausible("elbow", 90.0) is True


def test_plausible_joint_limits():
    assert plausible("knee", 38.6) is True
    assert plausible("knee", 10.0) is False
    assert plausible("ankle", 122.0) is True  # the press clip's mid-frame ankle
    assert plausible("elbow", float("nan")) is False


def test_implausible_measurement_is_unsure_not_a_verdict():
    """The guard's whole purpose: refuse to judge rather than accuse."""
    # 22 degrees is below the elbow floor of 20 only after aggregation if the raw geometry
    # really is that folded, so drive the value directly through a hand-built frame where the
    # forearm folds back onto the upper arm.
    f = make_frame(elbow_deg=8.0)
    m = measure_joint(MeasurementSpec("elbow", space="image2d"), "right", "elbow", [f], WH_SQ)
    assert m.confidence == "unsure"
    assert m.reason.startswith("implausible:elbow")


# ------------------------------------------------------------------ visibility

def test_hidden_joint_is_unsure_never_guessed():
    f = make_frame(elbow_deg=90.0, vis=0.2)
    m = measure_joint(MeasurementSpec("elbow", space="image2d", min_visibility=0.6), "right", "elbow", [f], WH)
    assert m.confidence == "unsure"
    assert m.reason == "below_visibility_floor"


def test_world_space_without_world_landmarks_is_unsure():
    f = make_frame(elbow_deg=90.0, with_world=False)
    assert world_landmarks_present([f]) is False
    m = measure_joint(MeasurementSpec("elbow", space="world3d"), "right", "elbow", [f], WH)
    assert m.confidence == "unsure"
    assert m.reason == "world_landmarks_absent"


def test_world_space_is_labelled_estimate():
    """World landmarks are MediaPipe's learned depth lift, not a measurement. The verdict
    must say so, so a rubric can widen its band."""
    f = make_frame(elbow_deg=95.0)
    m = measure_joint(MeasurementSpec("elbow", space="world3d"), "right", "elbow", [f], WH)
    assert m.confidence == "estimate"


# ------------------------------------------------------------------ aggregation

def test_aggregate_modes():
    vals = [10.0, 20.0, 30.0, 40.0, 50.0]
    assert aggregate(vals, "median") == 30.0
    assert aggregate(vals, "max") == 50.0
    assert aggregate(vals, "min_of_3") == 20.0  # three lowest: 10,20,30
    assert aggregate([], "median") != aggregate([], "median")  # NaN
    assert aggregate([float("nan"), 5.0], "median") == 5.0


# ------------------------------------------------------------------ frames and view

def test_torso_axis_points_up_in_image_space():
    f = make_frame()
    axis = torso_axis([f], WH)
    assert axis is not None
    assert axis[1] < 0  # image y grows downward, so "up the torso" is negative y


def test_detect_view_front_side_and_45():
    """Shoulder separation relative to torso length decides the view."""
    def frame_with_shoulder_gap(gap_norm):
        kp = {
            "left_shoulder": KP(0.5 - gap_norm / 2, 0.4),
            "right_shoulder": KP(0.5 + gap_norm / 2, 0.4),
            "left_hip": KP(0.46, 0.75),
            "right_hip": KP(0.54, 0.75),
        }
        return Frame(kp)

    assert detect_view([frame_with_shoulder_gap(0.24)], WH)[0] == "front"
    assert detect_view([frame_with_shoulder_gap(0.02)], WH)[0] == "side"
    assert detect_view([frame_with_shoulder_gap(0.11)], WH)[0] == "45"


def test_detect_view_without_landmarks_is_unknown():
    assert detect_view([Frame({})], WH)[0] == "unknown"


def test_gate_view_refuses_on_mismatch():
    assert gate_view("45", "45") == (True, "")
    assert gate_view("front", "side")[0] is False
    assert "view_mismatch" in gate_view("front", "side")[1]
    assert gate_view("unknown", "side") == (False, "view_unknown")
    assert gate_view("anything", "any")[0] is True


# ------------------------------------------------------------------ spec validation

def test_spec_rejects_bad_space_and_frame():
    with pytest.raises(ValueError, match="space"):
        MeasurementSpec("x", space="pixels")
    with pytest.raises(ValueError, match="frame"):
        MeasurementSpec("x", frame="shoulder")
    with pytest.raises(ValueError, match="robust"):
        MeasurementSpec("x", robust="average")


def test_measure_requires_joint_or_segment():
    with pytest.raises(ValueError, match="joint or a segment"):
        measure(MeasurementSpec("x"), "right", [make_frame()], WH)


# ------------------------------------------------------------------ real clip regression

@pytest.mark.skipif(not FIXTURE.exists(), reason="recorded landmark fixture absent")
def test_real_clip_2d_vs_world_divergence():
    """On the real incline-press clip, 2D produces an impossible elbow angle at the bottom
    while world space stays in human range. This is the evidence the module was built on,
    kept as a test so a future refactor cannot quietly reintroduce 2D-only judgement.

    The clip's right arm is the well-tracked one (left elbow sits at 0.38 median visibility,
    under the 0.6 floor, so measuring it would correctly return 'unsure' -- that guard has
    its own test above).
    """
    data = json.loads(FIXTURE.read_text())
    frames = []
    for f in data["frames"]:
        kps = {k: KP(*v) for k, v in f["kp"].items()}
        frames.append(Frame(kps, f["t"]))
    wh = (float(data["width"]), float(data["height"]))

    side = "right"
    m3d = measure_joint(MeasurementSpec("elbow", space="world3d", min_visibility=0.55), side, "elbow", frames, wh)
    assert math.isfinite(m3d.value), m3d.reason

    per_frame_2d = []
    for f in frames:
        a, b, c = (f.keypoints[f"{side}_{p}"] for p in ("shoulder", "elbow", "wrist"))
        per_frame_2d.append(angle_at(np.array([a.x * wh[0], a.y * wh[1]]),
                                    np.array([b.x * wh[0], b.y * wh[1]]),
                                    np.array([c.x * wh[0], c.y * wh[1]])))
    # 2D collapses to an anatomically impossible reading somewhere in the clip.
    assert min(per_frame_2d) < 20.0, "2D elbow should reach an impossible angle on this clip"
    # ...while the world-space measurement stays inside human range throughout the window.
    assert min(per_frame_2d) < m3d.value
