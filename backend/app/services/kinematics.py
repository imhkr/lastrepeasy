"""Joint kinematics for the live form coach.

Every measurement declares two things before it can run: the *space* its points live in
(image pixels, or MediaPipe world metres) and the *frame* a direction is expressed in
(the image, the lifter's torso, or gravity). The point of the declaration is that a
measurement can never silently use the wrong one. That is the bug this module exists to
prevent: the old coach fed 2D pixel angles into every check, so a 3/4 camera view
produced a 13-degree elbow in a press.

A note on what a frame does and does not fix. An angle ABC is invariant under rigid
rotation, so tilting the phone does not change it -- what corrupts an angle is *projection*
(2D vs 3D), not orientation. Frames therefore only matter for directional measurements
("the forearm leans 12 degrees toward the head"), which are meaningless without a
reference axis. Both are handled here; the distinction is documented so callers do not
reach for `frame` expecting it to rescue a bad projection.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np

SPACES = ("image2d", "world3d")
FRAMES = ("image", "torso", "gravity")
ROBUST = ("median", "min_of_3", "p10", "p90", "max")

# Physiological range for a flexion/extension angle. Outside this, the tracker is wrong --
# a bad camera angle, occlusion, or a lost pose. Judging such a number produces a false
# correction on a correct rep, which is worse than saying nothing.
JOINT_LIMITS: Dict[str, Tuple[float, float]] = {
    "elbow": (20.0, 180.0),
    "knee": (20.0, 180.0),
    "shoulder": (0.0, 195.0),
    "hip": (20.0, 200.0),
    "ankle": (30.0, 160.0),
    "torso": (0.0, 130.0),
}

# (proximal, pivot, distal) per joint, without the side prefix.
JOINT_TRIPLES: Dict[str, Tuple[str, str, str]] = {
    "elbow": ("shoulder", "elbow", "wrist"),
    "knee": ("hip", "knee", "ankle"),
    "shoulder": ("hip", "shoulder", "elbow"),
    "hip": ("shoulder", "hip", "knee"),
    "ankle": ("knee", "ankle", "foot_index"),
}

VIEW_FRONT_RATIO = 0.55  # shoulder width / torso length at or above this reads as a front view
VIEW_SIDE_RATIO = 0.25  # at or below this the shoulders overlap, so the lifter is side-on
EPS = 1e-9


@dataclass(frozen=True)
class MeasurementSpec:
    """What a rubric asks for, and how it must be computed."""

    id: str
    space: str = "world3d"
    frame: str = "torso"
    robust: str = "median"
    min_visibility: float = 0.6

    def __post_init__(self) -> None:
        if self.space not in SPACES:
            raise ValueError(f"{self.id}: space must be one of {SPACES}, got {self.space!r}")
        if self.frame not in FRAMES:
            raise ValueError(f"{self.id}: frame must be one of {FRAMES}, got {self.frame!r}")
        if self.robust not in ROBUST:
            raise ValueError(f"{self.id}: robust must be one of {ROBUST}, got {self.robust!r}")
        if not 0.0 <= self.min_visibility <= 1.0:
            raise ValueError(f"{self.id}: min_visibility must be within 0..1")


@dataclass
class Measurement:
    """The number behind a verdict, plus how much to trust it."""

    id: str
    joint: str
    value: float  # degrees; NaN when it could not be measured
    confidence: str  # measured | estimate | unsure
    reason: str = ""  # why it is 'unsure', for the log and for tuning
    visibility: float = 0.0
    samples: int = 0

    @property
    def ok(self) -> bool:
        return self.confidence != "unsure" and math.isfinite(self.value)


# ---------------------------------------------------------------- landmark access

def _kp(frame, name: str):
    return frame.keypoints[name]


def _p2(kp, frame_wh: Tuple[float, float]) -> np.ndarray:
    """Image point in pixels. Angles measured on normalized coords are skewed by a
    non-square frame, so every 2D measurement goes through here."""
    return np.array([kp.x * frame_wh[0], kp.y * frame_wh[1]], dtype=float)


def _p3(kp) -> np.ndarray:
    return np.array([kp.wx, kp.wy, kp.wz], dtype=float)


def _vis(kp) -> float:
    return float(getattr(kp, "visibility", 0.9))


def world_landmarks_present(frames: Sequence) -> bool:
    """MediaPipe can return an all-zero world block when the model falls back. Detect it
    once instead of dividing by empty vectors everywhere."""
    for f in frames:
        for kp in f.keypoints.values():
            if abs(kp.wx) + abs(kp.wy) + abs(kp.wz) > 1e-6:
                return True
    return False


# ---------------------------------------------------------------- angles

def angle_at(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """Interior angle ABC at pivot b, in degrees. Works in any dimension."""
    ba = a - b
    bc = c - b
    na = float(np.linalg.norm(ba))
    nc = float(np.linalg.norm(bc))
    if na < EPS or nc < EPS:
        return float("nan")
    cos = float(np.dot(ba, bc) / (na * nc))
    return math.degrees(math.acos(max(-1.0, min(1.0, cos))))


def joint_points(frame, side: str, joint: str) -> Optional[Tuple]:
    triple = JOINT_TRIPLES.get(joint)
    if triple is None:
        return None
    try:
        return tuple(_kp(frame, f"{side}_{part}") for part in triple)
    except KeyError:
        return None


# ---------------------------------------------------------------- plausibility

def plausible(joint: str, deg: float) -> bool:
    """False when a measured angle is anatomically impossible for that joint."""
    if not math.isfinite(deg):
        return False
    limits = JOINT_LIMITS.get(joint)
    if limits is None:
        return True
    return limits[0] <= deg <= limits[1]


# ---------------------------------------------------------------- frames

def torso_axis(frames: Sequence, frame_wh: Tuple[float, float]) -> Optional[np.ndarray]:
    """Unit vector from the hip midpoint up to the shoulder midpoint, in image space.
    Averaged over the window, so one noisy frame cannot tilt the reference."""
    ups: List[np.ndarray] = []
    for f in frames:
        try:
            sh = (_p2(_kp(f, "left_shoulder"), frame_wh) + _p2(_kp(f, "right_shoulder"), frame_wh)) / 2
            hp = (_p2(_kp(f, "left_hip"), frame_wh) + _p2(_kp(f, "right_hip"), frame_wh)) / 2
        except KeyError:
            continue
        v = sh - hp
        n = float(np.linalg.norm(v))
        if n > EPS:
            ups.append(v / n)
    if not ups:
        return None
    mean = np.mean(ups, axis=0)
    n = float(np.linalg.norm(mean))
    return mean / n if n > EPS else None


def gravity_axis(space: str) -> np.ndarray:
    """'Down' in the measurement space. Image y grows downward. MediaPipe world landmarks
    follow the image convention (y down, hip-centred); that is an assumption, so anything
    measured against it is reported as an estimate rather than a measurement."""
    return np.array([0.0, 1.0]) if space == "image2d" else np.array([0.0, 1.0, 0.0])


# ---------------------------------------------------------------- view gating

def detect_view(frames: Sequence, frame_wh: Tuple[float, float]) -> Tuple[str, float]:
    """Classify the camera as 'front', 'side' or '45' from how wide the shoulders project
    relative to torso length. Returns (view, confidence 0..1).

    The shoulder/torso ratio is used rather than a 3D facing vector because it survives
    MediaPipe's depth noise: at a front view the two shoulders are clearly separated, and
    side-on they collapse onto each other.

    Distances are taken in normalized coordinates, not pixels. Comparing a horizontal pixel
    distance with a vertical one on a 16:9 frame inflates the ratio by the aspect ratio and
    would read a true side view as '45'.
    """
    ratios: List[float] = []
    for f in frames:
        try:
            ls, rs = _kp(f, "left_shoulder"), _kp(f, "right_shoulder")
            lh, rh = _kp(f, "left_hip"), _kp(f, "right_hip")
        except KeyError:
            continue
        vis = min(_vis(ls), _vis(rs))
        if vis < 0.5:
            continue
        gap = math.hypot(ls.x - rs.x, ls.y - rs.y)
        mid_sh = ((ls.x + rs.x) / 2, (ls.y + rs.y) / 2)
        mid_hp = ((lh.x + rh.x) / 2, (lh.y + rh.y) / 2)
        torso_len = math.hypot(mid_sh[0] - mid_hp[0], mid_sh[1] - mid_hp[1])
        if torso_len < EPS:
            continue
        ratios.append(gap / torso_len)
    if not ratios:
        return "unknown", 0.0
    r = float(np.median(ratios))
    if r >= VIEW_FRONT_RATIO:
        view, conf = "front", min(1.0, (r - VIEW_FRONT_RATIO) / 0.35 + 0.5)
    elif r <= VIEW_SIDE_RATIO:
        view, conf = "side", min(1.0, (VIEW_SIDE_RATIO - r) / 0.20 + 0.5)
    else:
        view, conf = "45", 1.0 - abs(r - (VIEW_FRONT_RATIO + VIEW_SIDE_RATIO) / 2) / 0.30
    return view, max(0.0, min(1.0, conf))


def gate_view(observed: str, required: str) -> Tuple[bool, str]:
    """Should the rubric judge at all from this camera position?"""
    if required in ("any", "", None):
        return True, ""
    if observed == "unknown":
        return False, "view_unknown"
    if observed == required:
        return True, ""
    return False, f"view_mismatch:{observed}_not_{required}"


# ---------------------------------------------------------------- aggregation

def aggregate(values: Sequence[float], how: str) -> float:
    """Collapse a window of per-frame numbers into the one number a check judges."""
    arr = np.array([v for v in values if math.isfinite(v)], dtype=float)
    if arr.size == 0:
        return float("nan")
    if how == "median":
        return float(np.median(arr))
    if how == "min_of_3":
        return float(np.median(np.sort(arr)[:3]))
    if how == "p10":
        return float(np.percentile(arr, 10))
    if how == "p90":
        return float(np.percentile(arr, 90))
    if how == "max":
        return float(np.max(arr))
    return float(np.median(arr))


# ---------------------------------------------------------------- measurement

def measure_joint(
    spec: MeasurementSpec,
    side: str,
    joint: str,
    frames: Sequence,
    frame_wh: Tuple[float, float],
) -> Measurement:
    """Measure a flexion angle across a window of frames."""
    if joint not in JOINT_TRIPLES:
        return Measurement(spec.id, joint, float("nan"), "unsure", f"unknown_joint:{joint}")

    if spec.space == "world3d" and not world_landmarks_present(frames):
        return Measurement(spec.id, joint, float("nan"), "unsure", "world_landmarks_absent")

    vals: List[float] = []
    vis: List[float] = []
    for f in frames:
        pts = joint_points(f, side, joint)
        if pts is None:
            continue
        a, b, c = pts
        v = min(_vis(a), _vis(b), _vis(c))
        if v < spec.min_visibility:
            continue  # a hidden joint is not a measurement, it is a guess
        if spec.space == "image2d":
            val = angle_at(_p2(a, frame_wh), _p2(b, frame_wh), _p2(c, frame_wh))
        else:
            val = angle_at(_p3(a), _p3(b), _p3(c))
        if math.isfinite(val):
            vals.append(val)
            vis.append(v)

    if not vals:
        return Measurement(spec.id, joint, float("nan"), "unsure", "below_visibility_floor")

    value = aggregate(vals, spec.robust)
    if not plausible(joint, value):
        return Measurement(
            spec.id, joint, value, "unsure",
            f"implausible:{joint}={value:.1f}deg", float(np.mean(vis)), len(vals),
        )
    confidence = "estimate" if spec.space == "world3d" else "measured"
    return Measurement(spec.id, joint, value, confidence, "", float(np.mean(vis)), len(vals))


def measure_direction(
    spec: MeasurementSpec,
    side: str,
    segment: Tuple[str, str],
    frames: Sequence,
    frame_wh: Tuple[float, float],
) -> Measurement:
    """Angle between a body segment and the spec's reference frame, in degrees.

    Used for checks like 'the forearm leans toward the head'. Unlike an interior joint
    angle this *does* depend on the frame, which is why the frame is part of the spec.
    """
    name = f"{segment[0]}_to_{segment[1]}"
    ref: Optional[np.ndarray]
    if spec.frame == "torso":
        ref = torso_axis(frames, frame_wh)
        if spec.space == "world3d":
            return Measurement(spec.id, name, float("nan"), "unsure", "torso_frame_needs_image_space")
    elif spec.frame == "gravity":
        ref = gravity_axis(spec.space)
    else:
        return Measurement(spec.id, name, float("nan"), "unsure", "no_reference_frame")
    if ref is None:
        return Measurement(spec.id, name, float("nan"), "unsure", "reference_frame_lost")

    vals: List[float] = []
    vis: List[float] = []
    for f in frames:
        try:
            a = _kp(f, f"{side}_{segment[0]}")
            b = _kp(f, f"{side}_{segment[1]}")
        except KeyError:
            continue
        v = min(_vis(a), _vis(b))
        if v < spec.min_visibility:
            continue
        seg = (_p2(b, frame_wh) - _p2(a, frame_wh)) if spec.space == "image2d" else (_p3(b) - _p3(a))
        n = float(np.linalg.norm(seg))
        if n < EPS:
            continue
        seg = seg / n
        if ref.shape != seg.shape:
            return Measurement(spec.id, name, float("nan"), "unsure", "space_frame_dimension_mismatch")
        vals.append(math.degrees(math.acos(max(-1.0, min(1.0, float(np.dot(seg, ref)))))))
        vis.append(v)

    if not vals:
        return Measurement(spec.id, name, float("nan"), "unsure", "below_visibility_floor")
    confidence = "estimate" if (spec.space == "world3d" or spec.frame == "gravity") else "measured"
    return Measurement(spec.id, name, aggregate(vals, spec.robust), confidence, "", float(np.mean(vis)), len(vals))


def measure(
    spec: MeasurementSpec,
    side: str,
    frames: Sequence,
    frame_wh: Tuple[float, float],
    joint: Optional[str] = None,
    segment: Optional[Tuple[str, str]] = None,
) -> Measurement:
    """Dispatch a spec to the joint-angle or segment-direction path."""
    if joint:
        return measure_joint(spec, side, joint, frames, frame_wh)
    if segment:
        return measure_direction(spec, side, segment, frames, frame_wh)
    raise ValueError(f"{spec.id}: a spec needs either a joint or a segment")
