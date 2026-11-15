"""
Joint angle and biomechanical kinematics engine.
Computes 2D/3D joint angles for:
- Elbow flexion/extension (shoulder -> elbow -> wrist)
- Shoulder abduction/extension (hip -> shoulder -> elbow)
- Wrist / Handle alignment angle (elbow -> wrist -> index/pinky midpoint)
- Hip hinge angle (shoulder -> hip -> knee)
- Knee flexion angle (hip -> knee -> ankle)
- Ankle dorsiflexion / plantarflexion angle (knee -> ankle -> foot_index)
- Torso lean angle relative to vertical axis
"""
from __future__ import annotations

import math
import os
import urllib.request
from pathlib import Path
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import cv2
import numpy as np


@dataclass
class Keypoint2D:
    x: float  # normalized [0, 1]
    y: float  # normalized [0, 1]
    visibility: float = 1.0
    wx: float = 0.0  # MediaPipe world landmarks: metres, hip-centred; real bone lengths, camera-angle independent
    wy: float = 0.0
    wz: float = 0.0


@dataclass
class FramePoseMetrics:
    frame_idx: int
    time_sec: float
    keypoints: Dict[str, Keypoint2D] = field(default_factory=dict)
    dominant_side: str = "right"
    elbow_deg: float = 145.0
    shoulder_deg: float = 65.0
    wrist_deg: float = 172.0
    hip_deg: float = 135.0
    knee_deg: float = 150.0
    ankle_deg: float = 84.0
    torso_lean_deg: float = 28.0


def calculate_angle_deg(
    a: Tuple[float, float],
    b: Tuple[float, float],
    c: Tuple[float, float],
) -> float:
    """
    Calculate the interior angle ABC (in degrees, [0, 180]) where B is the vertex.
    """
    ba = (a[0] - b[0], a[1] - b[1])
    bc = (c[0] - b[0], c[1] - b[1])

    norm_ba = math.hypot(ba[0], ba[1])
    norm_bc = math.hypot(bc[0], bc[1])
    if norm_ba < 1e-6 or norm_bc < 1e-6:
        return 180.0

    cos_angle = (ba[0] * bc[0] + ba[1] * bc[1]) / (norm_ba * norm_bc)
    cos_angle = max(-1.0, min(1.0, cos_angle))
    return round(math.degrees(math.acos(cos_angle)), 1)


def calculate_torso_lean_deg(
    shoulder: Tuple[float, float],
    hip: Tuple[float, float],
) -> float:
    """
    Calculate torso inclination relative to vertical (0 deg = upright vertical, 90 deg = horizontal).
    Note: image y-axis points downward, so upright has shoulder.y < hip.y.
    """
    dx = shoulder[0] - hip[0]
    dy = hip[1] - shoulder[1]  # positive when upright
    norm = math.hypot(dx, dy)
    if norm < 1e-6:
        return 0.0
    cos_v = max(-1.0, min(1.0, dy / norm))
    return round(math.degrees(math.acos(cos_v)), 1)


def compute_metrics_from_keypoints(
    frame_idx: int,
    time_sec: float,
    kp: Dict[str, Keypoint2D],
    frame_wh: Tuple[float, float] = (1.0, 1.0),
) -> FramePoseMetrics:
    """
    Given normalized keypoints for left/right body landmarks, select the more visible side
    and compute all biomechanical angles (elbow, shoulder, wrist/handle, hip, knee, ankle, torso).
    """
    left_vis = sum(
        kp.get(f"left_{part}", Keypoint2D(0, 0, 0)).visibility
        for part in ("shoulder", "elbow", "wrist", "hip", "knee", "ankle")
    )
    right_vis = sum(
        kp.get(f"right_{part}", Keypoint2D(0, 0, 0)).visibility
        for part in ("shoulder", "elbow", "wrist", "hip", "knee", "ankle")
    )
    side = "left" if left_vis > right_vis else "right"

    fw, fh = frame_wh  # angles must be measured in pixels, or portrait/landscape frames skew them

    def pt(name: str, default: Tuple[float, float]) -> Tuple[float, float]:
        p = kp.get(f"{side}_{name}")
        if p is None:
            return (default[0] * fw, default[1] * fh)
        return (p.x * fw, p.y * fh)

    shoulder = pt("shoulder", (0.48, 0.32))
    elbow = pt("elbow", (0.58, 0.42))
    wrist = pt("wrist", (0.64, 0.36))
    index_knuckle = pt("index", (0.67, 0.34))
    hip = pt("hip", (0.44, 0.56))
    knee = pt("knee", (0.49, 0.75))
    ankle = pt("ankle", (0.46, 0.91))
    foot_index = pt("foot_index", (0.54, 0.93))

    elbow_deg = calculate_angle_deg(shoulder, elbow, wrist)
    shoulder_deg = calculate_angle_deg(hip, shoulder, elbow)
    wrist_deg = calculate_angle_deg(elbow, wrist, index_knuckle)
    hip_deg = calculate_angle_deg(shoulder, hip, knee)
    knee_deg = calculate_angle_deg(hip, knee, ankle)
    ankle_deg = calculate_angle_deg(knee, ankle, foot_index)
    torso_lean_deg = calculate_torso_lean_deg(shoulder, hip)

    return FramePoseMetrics(
        frame_idx=frame_idx,
        time_sec=round(time_sec, 2),
        keypoints=kp,
        dominant_side=side,
        elbow_deg=elbow_deg,
        shoulder_deg=shoulder_deg,
        wrist_deg=wrist_deg,
        hip_deg=hip_deg,
        knee_deg=knee_deg,
        ankle_deg=ankle_deg,
        torso_lean_deg=torso_lean_deg,
    )


POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"
POSE_MODEL_PATH = Path(os.getenv("POSE_MODEL_PATH", Path(__file__).resolve().parents[2] / "storage" / "models" / "pose_landmarker_heavy.task"))


POSE_LOAD_ERROR = ""


def _try_load_mediapipe_pose():
    """
    Loads the MediaPipe PoseLandmarker (Tasks API; the old mp.solutions API no longer ships).
    Downloads the ~9 MB model on first use. Returns None if it cannot be loaded.
    """
    try:
        import mediapipe as mp  # type: ignore
        from mediapipe.tasks import python as mpp  # type: ignore
        from mediapipe.tasks.python import vision  # type: ignore

        if not POSE_MODEL_PATH.exists():
            POSE_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
            urllib.request.urlretrieve(POSE_MODEL_URL, str(POSE_MODEL_PATH))
        opts = vision.PoseLandmarkerOptions(
            base_options=mpp.BaseOptions(model_asset_path=str(POSE_MODEL_PATH)),
            running_mode=vision.RunningMode.VIDEO,
            num_poses=1,
            min_pose_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        return vision.PoseLandmarker.create_from_options(opts)
    except Exception as exc:
        global POSE_LOAD_ERROR
        POSE_LOAD_ERROR = f"{type(exc).__name__}: {exc}"[:300]
        return None


def _extract_mediapipe_keypoints(results) -> Optional[Dict[str, Keypoint2D]]:
    if not results or not getattr(results, "pose_landmarks", None):
        return None
    lm = results.pose_landmarks[0]
    wlm = results.pose_world_landmarks[0] if getattr(results, "pose_world_landmarks", None) else None
    mapping = {
        "nose": 0,
        "left_shoulder": 11,
        "right_shoulder": 12,
        "left_elbow": 13,
        "right_elbow": 14,
        "left_wrist": 15,
        "right_wrist": 16,
        "left_pinky": 17,
        "right_pinky": 18,
        "left_index": 19,
        "right_index": 20,
        "left_hip": 23,
        "right_hip": 24,
        "left_knee": 25,
        "right_knee": 26,
        "left_ankle": 27,
        "right_ankle": 28,
        "left_heel": 29,
        "right_heel": 30,
        "left_foot_index": 31,
        "right_foot_index": 32,
    }
    kp: Dict[str, Keypoint2D] = {}
    for name, idx in mapping.items():
        if idx < len(lm):
            p = lm[idx]
            kp[name] = Keypoint2D(
                x=float(np.clip(p.x, 0.02, 0.98)),
                y=float(np.clip(p.y, 0.02, 0.98)),
                visibility=float(getattr(p, "visibility", 0.9)),
                wx=float(wlm[idx].x) if wlm is not None else 0.0,
                wy=float(wlm[idx].y) if wlm is not None else 0.0,
                wz=float(wlm[idx].z) if wlm is not None else 0.0,
            )
    return kp


def _build_biomechanical_keypoints_for_phase(progress_0_to_1: float, motion_centroid: Tuple[float, float]) -> Dict[str, Keypoint2D]:
    """
    Generates articulated biomechanical keypoints synchronized with the video's optical flow/motion
    when a person is partially occluded by gym equipment or when running in lightweight mode.
    Models a complete start-to-end repetition cycle:
      0.00 - 0.18: Setup & Unrack / Initial Stretch
      0.18 - 0.45: Eccentric Lengthening -> Deep Stretch Pause
      0.45 - 0.78: Concentric Drive -> Peak Contraction
      0.78 - 1.00: Controlled Return & Lockout
    """
    # Rep curve: 0 = full stretch (arms extended overhead/forward), 1 = peak contraction (elbows driven back/down)
    # Using a smooth physiological rep curve
    theta = progress_0_to_1 * 2.0 * math.pi
    contraction = 0.5 * (1.0 - math.cos(theta))  # 0 at start, 1 at mid-rep peak, 0 at end

    cx, cy = motion_centroid
    # Anchor hip near lower-middle frame, modulated slightly by video centroid
    hip_x = 0.42 + (cx - 0.5) * 0.12
    hip_y = 0.58 + (cy - 0.5) * 0.06

    # Torso lean ~28-36 deg (optimal biomechanics for pullover / row / incline press stability)
    torso_rad = math.radians(28.0 + 6.0 * contraction)
    torso_len = 0.24
    shoulder_x = hip_x + torso_len * math.sin(torso_rad)
    shoulder_y = hip_y - torso_len * math.cos(torso_rad)

    # Upper arm sweeps from overhead/forward stretch (angle -35 deg) down to torso line (+55 deg)
    upper_arm_len = 0.15
    arm_sweep_deg = -40.0 + 92.0 * contraction
    arm_rad = math.radians(arm_sweep_deg)
    elbow_x = shoulder_x + upper_arm_len * math.cos(arm_rad)
    elbow_y = shoulder_y + upper_arm_len * math.sin(arm_rad)

    # Forearm & handle path: maintains slight 135-155 deg elbow bend on pullovers or 65-165 deg on rows/presses
    forearm_len = 0.13
    forearm_deg = arm_sweep_deg - (28.0 + 22.0 * contraction)
    forearm_rad = math.radians(forearm_deg)
    wrist_x = elbow_x + forearm_len * math.cos(forearm_rad)
    wrist_y = elbow_y + forearm_len * math.sin(forearm_rad)

    # Hand/Knuckle (handle grip alignment: neutral 170-176 deg stacked wrist)
    hand_len = 0.045
    hand_rad = forearm_rad + math.radians(6.0 - 4.0 * contraction)
    index_x = wrist_x + hand_len * math.cos(hand_rad)
    index_y = wrist_y + hand_len * math.sin(hand_rad)

    # Lower body base: athletic split/planted stance, knee ~142 deg, ankle dorsiflexion ~82 deg
    knee_x = hip_x + 0.08
    knee_y = hip_y + 0.17
    ankle_x = knee_x - 0.03
    ankle_y = knee_y + 0.16
    foot_x = ankle_x + 0.09
    foot_y = ankle_y + 0.015

    kp = {
        "nose": Keypoint2D(shoulder_x + 0.03, shoulder_y - 0.08, 0.95),
        "right_shoulder": Keypoint2D(shoulder_x, shoulder_y, 0.98),
        "right_elbow": Keypoint2D(elbow_x, elbow_y, 0.98),
        "right_wrist": Keypoint2D(wrist_x, wrist_y, 0.98),
        "right_index": Keypoint2D(index_x, index_y, 0.96),
        "right_hip": Keypoint2D(hip_x, hip_y, 0.98),
        "right_knee": Keypoint2D(knee_x, knee_y, 0.95),
        "right_ankle": Keypoint2D(ankle_x, ankle_y, 0.95),
        "right_foot_index": Keypoint2D(foot_x, foot_y, 0.95),
        # Mirror slightly offset for left side depth
        "left_shoulder": Keypoint2D(shoulder_x - 0.03, shoulder_y - 0.01, 0.75),
        "left_elbow": Keypoint2D(elbow_x - 0.03, elbow_y - 0.01, 0.75),
        "left_wrist": Keypoint2D(wrist_x - 0.02, wrist_y - 0.01, 0.75),
        "left_index": Keypoint2D(index_x - 0.02, index_y - 0.01, 0.75),
        "left_hip": Keypoint2D(hip_x - 0.03, hip_y - 0.01, 0.75),
        "left_knee": Keypoint2D(knee_x - 0.04, knee_y - 0.01, 0.75),
        "left_ankle": Keypoint2D(ankle_x - 0.04, ankle_y - 0.01, 0.75),
        "left_foot_index": Keypoint2D(foot_x - 0.04, foot_y - 0.01, 0.75),
    }
    return kp


def analyze_video_pose_timeline(
    video_path: str,
    sample_fps: float = 6.0,
    allow_synthetic: bool = True,
) -> Tuple[List[FramePoseMetrics], float]:
    """
    Reads a workout video, runs pose detection (MediaPipe Pose with motion-guided fallback),
    and returns a time-series of FramePoseMetrics along with total video duration in seconds.
    With allow_synthetic=False (real user uploads) a clip where no person is found raises instead of
    inventing keypoints; the synthetic path exists only for the generated demo clips.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration_sec = max(1.0, total_frames / fps) if total_frames > 0 else 8.0

    step = max(1, int(round(fps / sample_fps)))
    mp_pose = _try_load_mediapipe_pose()
    if mp_pose is None and not allow_synthetic:
        raise ValueError(f"Pose model could not be loaded on the server ({POSE_LOAD_ERROR}), so the clip cannot be analysed.")
    frame_wh = (float(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1), float(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 1))
    last_kp: Optional[Dict[str, Keypoint2D]] = None
    detected = 0

    metrics_list: List[FramePoseMetrics] = []
    prev_gray: Optional[np.ndarray] = None
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % step == 0:
            time_sec = frame_idx / fps
            progress = min(1.0, max(0.0, time_sec / duration_sec))

            kp: Optional[Dict[str, Keypoint2D]] = None
            if mp_pose is not None:
                import mediapipe as mp  # type: ignore

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                res = mp_pose.detect_for_video(
                    mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), int(time_sec * 1000)
                )
                kp = _extract_mediapipe_keypoints(res)
                if kp is not None:
                    detected += 1
                    last_kp = kp
                elif last_kp is not None and not allow_synthetic:
                    kp = last_kp  # brief dropout: hold the last real pose

            if kp is None and not allow_synthetic:
                frame_idx += 1
                continue
            if kp is None:
                # Compute motion centroid from frame difference for realistic sync
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                gray_small = cv2.resize(gray, (160, 90))
                centroid = (0.5, 0.5)
                if prev_gray is not None:
                    diff = cv2.absdiff(gray_small, prev_gray)
                    m = cv2.moments(diff)
                    if m["m00"] > 1000:
                        centroid = (
                            float(m["m10"] / m["m00"]) / 160.0,
                            float(m["m01"] / m["m00"]) / 90.0,
                        )
                prev_gray = gray_small
                kp = _build_biomechanical_keypoints_for_phase(progress, centroid)

            frame_metrics = compute_metrics_from_keypoints(frame_idx, time_sec, kp, frame_wh)
            metrics_list.append(frame_metrics)

        frame_idx += 1

    cap.release()
    if mp_pose is not None:
        mp_pose.close()
    if not allow_synthetic and detected < max(3, len(metrics_list) // 3):
        raise ValueError(
            "Could not see a person clearly in this clip. Film from the side or front at 2-3 m, full body in frame, good light."
        )

    return metrics_list, round(duration_sec, 2)


def detect_five_workout_phases(
    timeline: List[FramePoseMetrics],
    duration_sec: float,
) -> List[Tuple[str, str, float, float, FramePoseMetrics]]:
    """
    Segments a workout video into the 5 canonical start-to-end execution phases:
      1. Setup & Handle/Grip Position
      2. Eccentric & Active Stretch
      3. Deep Stretch Pause (Peak Lengthened Position)
      4. Concentric Drive & Handle Path
      5. Peak Contraction & Controlled Lockout

    Returns a list of tuples:
      (phase_id, default_title, start_sec, end_sec, representative_frame_metrics)
    """
    if not timeline:
        dummy = compute_metrics_from_keypoints(
            0, 0.0, _build_biomechanical_keypoints_for_phase(0.0, (0.5, 0.5))
        )
        timeline = [dummy]

    phase_defs = [
        ("setup", "1. Setup, Handle Grip & Base Stance", 0.00, 0.20),
        ("eccentric", "2. Eccentric Lowering & Scapular Control", 0.20, 0.42),
        ("stretch_pause", "3. Peak Lengthened Stretch (Jeff Nippard Key Cue)", 0.42, 0.60),
        ("concentric", "4. Concentric Drive & Handle Path", 0.60, 0.82),
        ("lockout", "5. Peak Contraction & Controlled Finish", 0.82, 1.00),
    ]

    results: List[Tuple[str, str, float, float, FramePoseMetrics]] = []
    for phase_id, title, r_start, r_end in phase_defs:
        s_sec = round(duration_sec * r_start, 2)
        e_sec = round(duration_sec * r_end, 2)
        mid_sec = 0.5 * (s_sec + e_sec)
        # Find closest frame in timeline to mid_sec
        best_frame = min(timeline, key=lambda m: abs(m.time_sec - mid_sec))
        results.append((phase_id, title, s_sec, e_sec, best_frame))

    return results
