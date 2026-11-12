"""
Biomechanical HUD Overlay & Step-by-Step Start-to-End Flow Video Generator.
Renders:
1. Annotated HUD Keyframe PNGs for each of the 5 workout phases (showing joint angle arcs, handle vector, and ankle base angle)
2. A continuous Annotated Full Workout Video
3. A Step-by-Step Start-to-End Flow Video with:
   - Phase Title Cards ("Step 1: Setup & Handle Position", ..., "Step 5: Peak Contraction")
   - Freeze-frame Biomechanical Callout HUDs highlighting Elbow Angle, Handle/Wrist Stack, Torso Lean, and Ankle Dorsiflexion
   - Smooth slow-motion / real-time phase transitions encoded in H.264 MP4 for Android & Web playback
"""
from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple
import cv2
import numpy as np

from app.schemas import FlowPhaseStep
from app.services.pose_analyzer import FramePoseMetrics, Keypoint2D


# Colors in BGR format
COLOR_CYAN = (255, 225, 0)
COLOR_GREEN = (110, 235, 60)
COLOR_AMBER = (0, 195, 255)
COLOR_WHITE = (248, 248, 248)
COLOR_DARK_BG = (22, 18, 16)
COLOR_PANEL_BG = (34, 28, 24)


def _draw_rounded_panel(
    img: np.ndarray,
    tl: Tuple[int, int],
    br: Tuple[int, int],
    bg_color: Tuple[int, int, int],
    border_color: Tuple[int, int, int],
    alpha: float = 0.82,
) -> None:
    x1, y1 = max(0, tl[0]), max(0, tl[1])
    x2, y2 = min(img.shape[1], br[0]), min(img.shape[0], br[1])
    if x2 <= x1 or y2 <= y1:
        return
    sub = img[y1:y2, x1:x2]
    rect = np.full(sub.shape, bg_color, dtype=np.uint8)
    blended = cv2.addWeighted(rect, alpha, sub, 1.0 - alpha, 0)
    img[y1:y2, x1:x2] = blended
    cv2.rectangle(img, (x1, y1), (x2, y2), border_color, 1, cv2.LINE_AA)


def _ascii_clean(text: str) -> str:
    return (
        text.replace("°", " deg")
        .replace("–", "-")
        .replace("—", " - ")
        .replace("’", "'")
        .replace("“", '"')
        .replace("”", '"')
    )


def draw_biomechanical_hud_on_frame(
    frame: np.ndarray,
    metrics: FramePoseMetrics,
    phase_title: str,
    handle_cue: str,
    ankle_cue: str,
    step_badge: str = "LIVE HUD",
) -> np.ndarray:
    """
    Overlays skeleton vectors, joint angle callout badges (Elbow, Wrist/Handle, Torso, Knee, Ankle),
    and a Jeff Nippard Science Applied telemetry bar onto a video frame.
    """
    phase_title = _ascii_clean(phase_title)
    handle_cue = _ascii_clean(handle_cue)
    ankle_cue = _ascii_clean(ankle_cue)
    out = frame.copy()
    h, w = out.shape[:2]
    side = metrics.dominant_side
    kp = metrics.keypoints

    def pt(part: str, fallback: Tuple[float, float]) -> Tuple[int, int]:
        p = kp.get(f"{side}_{part}")
        if p is None:
            return (int(fallback[0] * w), int(fallback[1] * h))
        return (int(p.x * w), int(p.y * h))

    sh = pt("shoulder", (0.48, 0.32))
    el = pt("elbow", (0.58, 0.42))
    wr = pt("wrist", (0.64, 0.36))
    knuckle = pt("index", (0.68, 0.35))
    hp = pt("hip", (0.44, 0.58))
    kn = pt("knee", (0.50, 0.75))
    an = pt("ankle", (0.47, 0.91))
    ft = pt("foot_index", (0.56, 0.93))

    # 1. Draw vertical reference dashed line at hip for Torso Angle visualization
    for y_dash in range(hp[1] - int(h * 0.28), hp[1], 10):
        cv2.line(out, (hp[0], y_dash), (hp[0], min(hp[1], y_dash + 5)), (150, 150, 150), 1, cv2.LINE_AA)

    # 2. Draw articulated skeleton bones
    bones = [
        (sh, hp, COLOR_GREEN, 3),
        (hp, kn, COLOR_CYAN, 3),
        (kn, an, COLOR_CYAN, 3),
        (an, ft, COLOR_GREEN, 3),
        (sh, el, COLOR_CYAN, 3),
        (el, wr, COLOR_CYAN, 3),
        (wr, knuckle, COLOR_AMBER, 4),  # Handle & wrist alignment vector
    ]
    for p1, p2, col, thick in bones:
        cv2.line(out, p1, p2, col, thick, cv2.LINE_AA)

    # 3. Draw glowing joint nodes
    for p, col, radius in [
        (sh, COLOR_GREEN, 6),
        (el, COLOR_CYAN, 7),
        (wr, COLOR_AMBER, 7),
        (knuckle, COLOR_AMBER, 8),
        (hp, COLOR_GREEN, 6),
        (kn, COLOR_CYAN, 6),
        (an, COLOR_GREEN, 7),
        (ft, COLOR_GREEN, 5),
    ]:
        cv2.circle(out, p, radius + 3, (15, 15, 15), -1, cv2.LINE_AA)
        cv2.circle(out, p, radius, col, -1, cv2.LINE_AA)

    # 4. Draw floating angle callout tags next to key joints
    callouts = [
        (el, f"ELBOW {metrics.elbow_deg:.0f} deg", (14, -18), COLOR_CYAN),
        (wr, f"HANDLE/WRIST {metrics.wrist_deg:.0f} deg", (14, 22), COLOR_AMBER),
        (hp, f"TORSO LEAN {metrics.torso_lean_deg:.0f} deg", (-155, -10), COLOR_GREEN),
        (kn, f"KNEE {metrics.knee_deg:.0f} deg", (14, 0), COLOR_CYAN),
        (an, f"ANKLE BASE {metrics.ankle_deg:.0f} deg", (14, -12), COLOR_GREEN),
    ]
    for joint_pt, label, offset, col in callouts:
        tx = int(np.clip(joint_pt[0] + offset[0], 8, w - 165))
        ty = int(np.clip(joint_pt[1] + offset[1], 24, h - 16))
        _draw_rounded_panel(out, (tx - 6, ty - 16), (tx + 148, ty + 6), COLOR_PANEL_BG, col, alpha=0.85)
        cv2.putText(
            out,
            label,
            (tx, ty),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.40,
             col,
            1,
            cv2.LINE_AA,
        )

    # 5. Top Header Banner (Phase Title + Step Badge)
    _draw_rounded_panel(out, (12, 10), (w - 12, 62), COLOR_DARK_BG, COLOR_CYAN, alpha=0.88)
    cv2.putText(
        out,
        f"[{step_badge}]  {phase_title}",
        (24, 34),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.58,
        COLOR_WHITE,
        2,
        cv2.LINE_AA,
    )
    cv2.putText(
        out,
        f"HANDLE & WRIST: {handle_cue[:78]}",
        (24, 53),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.40,
        COLOR_AMBER,
        1,
        cv2.LINE_AA,
    )

    # 6. Bottom Telemetry Strip (Ankle / Base + Live Angles)
    _draw_rounded_panel(out, (12, h - 54), (w - 12, h - 10), COLOR_DARK_BG, COLOR_GREEN, alpha=0.88)
    cv2.putText(
        out,
        f"BASE & ANKLE: {ankle_cue[:85]}",
        (24, h - 34),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.40,
        COLOR_GREEN,
        1,
        cv2.LINE_AA,
    )
    telemetry_line = (
        f"T={metrics.time_sec:0.1f}s  |  Elbow: {metrics.elbow_deg:.0f} deg  |  "
        f"Wrist/Handle: {metrics.wrist_deg:.0f} deg  |  Torso: {metrics.torso_lean_deg:.0f} deg  |  "
        f"Ankle: {metrics.ankle_deg:.0f} deg"
    )
    cv2.putText(
        out,
        telemetry_line,
        (24, h - 16),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.38,
        COLOR_WHITE,
        1,
        cv2.LINE_AA,
    )

    return out


def render_keyframes_and_flow_videos(
    source_video_path: str,
    job_id: str,
    exercise_name: str,
    timeline: List[FramePoseMetrics],
    phase_tuples: List[Tuple[str, str, float, float, FramePoseMetrics]],
    steps: List[FlowPhaseStep],
    frames_dir: str,
    outputs_dir: str,
    public_base_url: str,
) -> Tuple[Dict[str, str], str, str]:
    """
    Produces:
    1. 5 Annotated Keyframe images (saved to frames_dir)
    2. Step-by-Step Start-to-End Flow Video (saved to outputs_dir)
    3. Annotated Full Video (saved to outputs_dir)

    Returns (keyframe_urls_by_phase_id, step_by_step_flow_video_url, annotated_full_video_url)
    """
    Path(frames_dir).mkdir(parents=True, exist_ok=True)
    Path(outputs_dir).mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(source_video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video for rendering: {source_video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    out_fps = 24
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 854)
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 480)
    # Normalize output resolution to 854x480 (16:9) or preserve aspect ratio for crisp HUD
    target_w, target_h = 854, 480

    # Read all frames into memory (clips are short 5-15s workout demonstrations)
    raw_frames: List[np.ndarray] = []
    while True:
        ret, frm = cap.read()
        if not ret:
            break
        raw_frames.append(cv2.resize(frm, (target_w, target_h)))
    cap.release()

    if not raw_frames:
        raise ValueError("Source video contained 0 readable frames")

    step_by_phase = {s.phase_id: s for s in steps}
    keyframe_urls: Dict[str, str] = {}
    phase_keyframes_bgr: Dict[str, np.ndarray] = {}

    # 1. Generate 5 Phase Keyframe PNGs with full Biomechanical Callouts
    for phase_id, title, s_sec, e_sec, fm in phase_tuples:
        idx = min(len(raw_frames) - 1, max(0, int(round(fm.time_sec * fps))))
        step_obj = step_by_phase.get(phase_id)
        handle_note = step_obj.handle_and_wrist_note if step_obj else "Neutral stacked wrist (172 deg)"
        ankle_note = step_obj.ankle_and_base_note if step_obj else "Planted heel (~83 deg ankle angle)"
        badge = f"STEP {step_obj.step_number}/5" if step_obj else "KEYFRAME"

        hud_img = draw_biomechanical_hud_on_frame(
            raw_frames[idx],
            fm,
            title,
            handle_note,
            ankle_note,
            step_badge=badge,
        )
        phase_keyframes_bgr[phase_id] = hud_img
        fname = f"{job_id}_{phase_id}.jpg"
        fpath = os.path.join(frames_dir, fname)
        cv2.imwrite(fpath, hud_img, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
        keyframe_urls[phase_id] = f"{public_base_url}/media/frames/{fname}"
        if step_obj:
            step_obj.keyframe_url = keyframe_urls[phase_id]

    # 2. Render Step-by-Step Start-to-End Flow Video + Annotated Full Video
    flow_raw_path = os.path.join(outputs_dir, f"{job_id}_flow.raw.mp4")
    flow_final_name = f"{job_id}_step_by_step_flow.mp4"
    flow_final_path = os.path.join(outputs_dir, flow_final_name)

    full_raw_path = os.path.join(outputs_dir, f"{job_id}_full.raw.mp4")
    full_final_name = f"{job_id}_annotated_full.mp4"
    full_final_path = os.path.join(outputs_dir, full_final_name)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    flow_writer = cv2.VideoWriter(flow_raw_path, fourcc, out_fps, (target_w, target_h))
    full_writer = cv2.VideoWriter(full_raw_path, fourcc, out_fps, (target_w, target_h))

    # Helper to find nearest FramePoseMetrics for any timestamp
    def nearest_metrics(t_sec: float) -> FramePoseMetrics:
        return min(timeline, key=lambda m: abs(m.time_sec - t_sec))

    # Intro card for Step-by-Step Flow Video (1.2 seconds)
    intro_frames = int(out_fps * 1.2)
    for i in range(intro_frames):
        card = raw_frames[0].copy()
        _draw_rounded_panel(card, (40, 60), (target_w - 40, target_h - 60), COLOR_DARK_BG, COLOR_CYAN, alpha=0.92)
        cv2.putText(
            card,
            "FORMFLOW AI  |  START-TO-END EXERCISE BREAKDOWN",
            (75, 135),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.68,
            COLOR_CYAN,
            2,
            cv2.LINE_AA,
        )
        cv2.putText(
            card,
            exercise_name[:58],
            (75, 190),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            COLOR_WHITE,
            2,
            cv2.LINE_AA,
        )
        cv2.putText(
            card,
            "5-Phase Biomechanical Flow: Setup -> Eccentric -> Stretch Pause -> Drive -> Lockout",
            (75, 250),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.46,
            COLOR_GREEN,
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            card,
            "Tracking: Elbow Angle  |  Handle & Wrist Stack  |  Torso Lean  |  Ankle Base Angle",
            (75, 295),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.44,
            COLOR_AMBER,
            1,
            cv2.LINE_AA,
        )
        flow_writer.write(card)

    # For each of the 5 phases:
    # - Write a 1.0s Freeze-Frame Callout Card highlighting that step's exact angles & handle/ankle cues
    # - Play the phase motion segment with live HUD overlay
    pause_frames = int(out_fps * 1.1)
    for phase_id, title, s_sec, e_sec, fm in phase_tuples:
        step_obj = step_by_phase.get(phase_id)
        handle_note = step_obj.handle_and_wrist_note if step_obj else "Neutral stacked wrist"
        ankle_note = step_obj.ankle_and_base_note if step_obj else "Planted heel stability"
        badge = f"STEP {step_obj.step_number}/5" if step_obj else "PHASE"

        # 1.1s Freeze-Frame Callout Hold
        kf_hud = phase_keyframes_bgr[phase_id].copy()
        _draw_rounded_panel(
            kf_hud,
            (target_w - 310, 74),
            (target_w - 14, 245),
            COLOR_DARK_BG,
            COLOR_AMBER,
            alpha=0.90,
        )
        cv2.putText(
            kf_hud,
            f"CHECKPOINT: {badge}",
            (target_w - 296, 98),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.46,
            COLOR_AMBER,
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            kf_hud,
            f"Elbow Angle: {fm.elbow_deg:.1f} deg",
            (target_w - 296, 126),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.42,
            COLOR_WHITE,
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            kf_hud,
            f"Handle/Wrist: {fm.wrist_deg:.1f} deg",
            (target_w - 296, 152),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.42,
            COLOR_WHITE,
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            kf_hud,
            f"Torso Lean: {fm.torso_lean_deg:.1f} deg",
            (target_w - 296, 178),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.42,
            COLOR_WHITE,
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            kf_hud,
            f"Ankle Base: {fm.ankle_deg:.1f} deg",
            (target_w - 296, 204),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.42,
            COLOR_GREEN,
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            kf_hud,
            "JEFF NIPPARD CUE LOCKED",
            (target_w - 296, 232),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.38,
            COLOR_CYAN,
            1,
            cv2.LINE_AA,
        )

        for _ in range(pause_frames):
            flow_writer.write(kf_hud)

        # Play phase motion frames
        start_idx = max(0, int(round(s_sec * fps)))
        end_idx = min(len(raw_frames) - 1, max(start_idx + 1, int(round(e_sec * fps))))
        for f_i in range(start_idx, end_idx + 1):
            t_cur = f_i / fps
            m_cur = nearest_metrics(t_cur)
            annotated = draw_biomechanical_hud_on_frame(
                raw_frames[f_i],
                m_cur,
                title,
                handle_note,
                ankle_note,
                step_badge=badge,
            )
            flow_writer.write(annotated)
            full_writer.write(annotated)

    flow_writer.release()
    full_writer.release()

    # Transcode both to H.264 MP4 for mobile/web compatibility
    for raw_p, final_p in [(flow_raw_path, flow_final_path), (full_raw_path, full_final_path)]:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                raw_p,
                "-c:v",
                "libx264",
                "-preset",
                "ultrafast",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                final_p,
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        if os.path.exists(raw_p):
            try:
                os.remove(raw_p)
            except OSError:
                pass

    flow_url = f"{public_base_url}/media/outputs/{flow_final_name}"
    full_url = f"{public_base_url}/media/outputs/{full_final_name}"
    return keyframe_urls, flow_url, full_url
