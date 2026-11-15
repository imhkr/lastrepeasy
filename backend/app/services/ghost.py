"""
Ghost-arm coaching overlay.

Draws where the user's arms SHOULD be as a translucent green "shadow" on top of their own video.
Built only from the user's real tracked joints: the shoulder stays where it is, segment lengths are
the user's own, and the ghost forearm is stacked straight along the pressing line while the ghost
elbow angle follows the rep (about 90 deg at the bottom, about 170 deg at lockout).

Supported: pressing movements (incline press). Other exercises return None and keep the plain HUD.
"""
from __future__ import annotations

import os
import subprocess
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np

from app.services.pose_analyzer import FramePoseMetrics

# profile_id -> (elbow angle at the bottom, at lockout). Only profiles listed here get a ghost.
GHOST_PROFILES: Dict[str, Tuple[float, float]] = {
    "incline_press_nippard": (90.0, 170.0),
}

STACK_TOLERANCE_DEG = 12.0  # forearm vs the pressing line
DEPTH_TOLERANCE_DEG = 20.0  # elbow angle above the ghost at the bottom
MIN_VIS = 0.5

GREEN = (110, 235, 60)
WHITE = (250, 250, 250)
RED = (70, 70, 245)
AMBER = (0, 195, 255)


@dataclass
class ArmTrack:
    side: str
    t: np.ndarray  # (N,)
    sh: np.ndarray  # (N,2) pixels, user
    el: np.ndarray
    wr: np.ndarray
    ghost_el: np.ndarray
    ghost_wr: np.ndarray
    elbow_deg: np.ndarray  # user's elbow angle
    ghost_deg: np.ndarray
    off_deg: np.ndarray  # forearm vs pressing line
    progress: np.ndarray  # 0 bottom .. 1 top


@dataclass
class GhostTrack:
    width: int
    height: int
    up: np.ndarray  # unit vector, image coords, pointing "up" the pressing line
    arms: List[ArmTrack] = field(default_factory=list)
    stats: Dict[str, float] = field(default_factory=dict)


def _smooth(a: np.ndarray, k: int = 5) -> np.ndarray:
    """Median then mean filter along time, to calm landmark jitter."""
    if len(a) < 3:
        return a
    pad = k // 2
    p = np.pad(a, ((pad, pad),) + ((0, 0),) * (a.ndim - 1), mode="edge")
    med = np.stack([np.median(p[i : i + k], axis=0) for i in range(len(a))])
    p2 = np.pad(med, ((1, 1),) + ((0, 0),) * (a.ndim - 1), mode="edge")
    return (p2[:-2] + p2[1:-1] + p2[2:]) / 3.0


def _unit(v: np.ndarray) -> np.ndarray:
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-9)


def _angle3(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> np.ndarray:
    """Angle ABC in degrees for arrays of points (N,d)."""
    return np.degrees(np.arccos(np.clip((_unit(a - b) * _unit(c - b)).sum(-1), -1, 1)))


def build_ghost_track(profile_id: str, timeline: List[FramePoseMetrics], width: int, height: int) -> Optional[GhostTrack]:
    """Ghost built in 3D from MediaPipe world landmarks, then projected back onto the image the same way
    the real arm is projected, so foreshortening from an oblique camera matches."""
    if profile_id not in GHOST_PROFILES or len(timeline) < 8:
        return None
    bottom_deg, top_deg = GHOST_PROFILES[profile_id]
    t = np.array([m.time_sec for m in timeline], dtype=float)
    wh = np.array([width, height], dtype=float)

    def img(side: str, part: str) -> np.ndarray:
        return _smooth(np.array([[m.keypoints[f"{side}_{part}"].x, m.keypoints[f"{side}_{part}"].y] for m in timeline]) * wh)

    def wld(side: str, part: str) -> np.ndarray:
        return _smooth(np.array([[m.keypoints[f"{side}_{part}"].wx, m.keypoints[f"{side}_{part}"].wy, m.keypoints[f"{side}_{part}"].wz] for m in timeline]))

    raw = {}
    for side in ("left", "right"):
        try:
            vis = np.array([min(m.keypoints[f"{side}_{p}"].visibility for p in ("shoulder", "elbow", "wrist")) for m in timeline])
        except KeyError:
            continue
        if np.median(vis) < MIN_VIS:
            continue
        parts = ("shoulder", "elbow", "wrist", "hip")
        raw[side] = {"i": {p: img(side, p) for p in parts}, "w": {p: wld(side, p) for p in parts}}
    if not raw or not any(np.abs(d["w"]["wrist"]).sum() > 0 for d in raw.values()):
        return None

    # Pressing line (3D): main direction the wrists travel relative to the shoulders; up = toward lockout.
    rel = np.mean([d["w"]["wrist"] - d["w"]["shoulder"] for d in raw.values()], axis=0)
    centred = rel - rel.mean(0)
    axis = np.linalg.svd(centred, full_matrices=False)[2][0]
    reach = np.linalg.norm(rel, axis=1)
    up = axis if axis @ (rel[int(reach.argmax())] - rel[int(reach.argmin())]) >= 0 else -axis
    if np.ptp(centred @ up) < 0.15:  # under 15 cm of wrist travel: not a pressing rep we can coach
        return None

    # Pixels per metre per frame, least squares over the visible bones (image xy vs world xy).
    num = np.zeros(len(t)); den = np.zeros(len(t))
    for d in raw.values():
        for a_, b_ in (("shoulder", "elbow"), ("elbow", "wrist"), ("shoulder", "hip")):
            bi = d["i"][b_] - d["i"][a_]
            bw = (d["w"][b_] - d["w"][a_])[:, :2]
            num += (bi * bw).sum(1); den += (bw * bw).sum(1)
    scale = _smooth(num / np.maximum(den, 1e-9))
    if np.median(scale) <= 0:
        return None

    track = GhostTrack(width=width, height=height, up=up)
    for side, d in raw.items():
        Si, Sw = d["i"]["shoulder"], d["w"]["shoulder"]
        Ew, Ww = d["w"]["elbow"], d["w"]["wrist"]
        l1 = float(np.percentile(np.linalg.norm(Ew - Sw, axis=1), 70))
        l2 = float(np.percentile(np.linalg.norm(Ww - Ew, axis=1), 70))
        s_along = (Ww - Sw) @ up
        lo, hi = np.percentile(s_along, 5), np.percentile(s_along, 95)
        prog = np.clip((s_along - lo) / max(hi - lo, 1e-6), 0, 1)
        target = bottom_deg + (top_deg - bottom_deg) * prog

        upper = Sw - Ew  # elbow -> shoulder, as the user actually holds it
        perp = upper - (upper @ up)[:, None] * up
        perp_u = _unit(perp)  # keeps the user's own elbow direction (flare) untouched
        th = np.radians(target)[:, None]
        gdir = np.cos(th) * up + np.sin(th) * perp_u  # ghost elbow -> shoulder
        gel_w = Sw - gdir * l1
        gwr_w = gel_w + up * l2
        gel = Si + scale[:, None] * (gel_w - Sw)[:, :2]
        gwr = Si + scale[:, None] * (gwr_w - Sw)[:, :2]

        off = np.degrees(np.arccos(np.clip((_unit(Ww - Ew) @ up), -1, 1)))
        track.arms.append(ArmTrack(side, t, Si, d["i"]["elbow"], d["i"]["wrist"], gel, gwr, _angle3(Sw, Ew, Ww), target, off, prog))

    arms = track.arms
    off_all = np.mean([a.off_deg for a in arms], axis=0)
    prog_all = np.mean([a.progress for a in arms], axis=0)
    deg_all = np.mean([a.elbow_deg for a in arms], axis=0)
    low = prog_all < 0.2
    track.stats = {
        "avg_off_deg": float(np.mean(off_all)),
        "bottom_elbow_deg": float(np.mean(deg_all[low])) if low.any() else float("nan"),
        "bottom_target_deg": bottom_deg,
        "top_elbow_deg": float(np.max(deg_all)),
        "stack_ok_pct": float(np.mean(off_all <= STACK_TOLERANCE_DEG) * 100),
    }
    return track


def _at(track: GhostTrack, arm: ArmTrack, time_sec: float) -> Dict[str, np.ndarray]:
    def ip(a: np.ndarray) -> np.ndarray:
        return np.array([np.interp(time_sec, arm.t, a[:, 0]), np.interp(time_sec, arm.t, a[:, 1])])

    return {
        "sh": ip(arm.sh), "el": ip(arm.el), "wr": ip(arm.wr), "gel": ip(arm.ghost_el), "gwr": ip(arm.ghost_wr),
        "off": float(np.interp(time_sec, arm.t, arm.off_deg)),
        "deg": float(np.interp(time_sec, arm.t, arm.elbow_deg)),
        "gdeg": float(np.interp(time_sec, arm.t, arm.ghost_deg)),
        "p": float(np.interp(time_sec, arm.t, arm.progress)),
    }


def _pt(v: np.ndarray, sc: float) -> Tuple[int, int]:
    return int(round(v[0] * sc)), int(round(v[1] * sc))


def _arrow(img: np.ndarray, a: np.ndarray, b: np.ndarray, sc: float, col, th: int) -> None:
    cv2.arrowedLine(img, _pt(a, sc), _pt(b, sc), col, th, cv2.LINE_AA, tipLength=0.25)


def _caption(frame: np.ndarray, text: str, col) -> None:
    h, w = frame.shape[:2]
    bar = max(60, int(h * 0.075))
    sub = frame[h - bar : h]
    frame[h - bar : h] = cv2.addWeighted(np.full_like(sub, (22, 18, 16)), 0.82, sub, 0.18, 0)
    cv2.rectangle(frame, (0, h - bar), (w, h - bar + 4), col, -1)
    scale = w / 900.0
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, scale, 2)
    cv2.putText(frame, text, (max(12, (w - tw) // 2), h - bar // 2 + th // 2), cv2.FONT_HERSHEY_SIMPLEX, scale, WHITE, 2, cv2.LINE_AA)


def draw_ghost(frame: np.ndarray, track: GhostTrack, time_sec: float, sc: float) -> np.ndarray:
    """frame is already scaled by sc relative to the tracked pixel space."""
    out = frame.copy()
    shadow = np.zeros_like(out)
    pos = {a.side: _at(track, a, time_sec) for a in track.arms}
    thick = max(10, int(out.shape[1] * 0.032))

    for q in pos.values():
        cv2.line(shadow, _pt(q["sh"], sc), _pt(q["gel"], sc), GREEN, thick, cv2.LINE_AA)
        cv2.line(shadow, _pt(q["gel"], sc), _pt(q["gwr"], sc), GREEN, thick, cv2.LINE_AA)
        for k in ("gel", "gwr"):
            cv2.circle(shadow, _pt(q[k], sc), int(thick * 0.85), GREEN, -1, cv2.LINE_AA)
    mask = shadow.any(axis=2)
    out[mask] = cv2.addWeighted(out, 0.45, shadow, 0.55, 0)[mask]

    worst_off, worst_gap = 0.0, 0.0
    for q in pos.values():
        ok = q["off"] <= STACK_TOLERANCE_DEG
        col = WHITE if ok else RED
        for a, b in (("sh", "el"), ("el", "wr")):
            cv2.line(out, _pt(q[a], sc), _pt(q[b], sc), col, max(3, thick // 4), cv2.LINE_AA)
        for k in ("sh", "el", "wr"):
            cv2.circle(out, _pt(q[k], sc), max(5, thick // 3), col, -1, cv2.LINE_AA)
        if not ok:
            _arrow(out, q["wr"], q["gwr"], sc, AMBER, max(3, thick // 4))
        worst_off = max(worst_off, q["off"])
        if q["p"] < 0.2:
            worst_gap = max(worst_gap, q["deg"] - q["gdeg"])

    if worst_off > STACK_TOLERANCE_DEG:
        _caption(out, "Hands drifting - stack wrists over elbows", RED)
    elif worst_gap > DEPTH_TOLERANCE_DEG:
        _caption(out, "Lower - bring elbows to the green arm", AMBER)
    else:
        _caption(out, "Good - match the green arm", GREEN)
    cv2.putText(out, "GREEN = where your arms should be", (12, 34), cv2.FONT_HERSHEY_SIMPLEX, out.shape[1] / 1000.0, GREEN, 2, cv2.LINE_AA)
    return out


def render_ghost_video(source_video_path: str, track: GhostTrack, out_path: str, max_side: int = 960) -> str:
    cap = cv2.VideoCapture(source_video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    sc = min(1.0, max_side / max(track.width, track.height))
    ow, oh = int(track.width * sc) // 2 * 2, int(track.height * sc) // 2 * 2
    raw = out_path + ".raw.mp4"
    wr = cv2.VideoWriter(raw, cv2.VideoWriter_fourcc(*"mp4v"), fps, (ow, oh))
    i = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frame = cv2.resize(frame, (ow, oh))
        wr.write(draw_ghost(frame, track, i / fps, ow / track.width))
        i += 1
    cap.release()
    wr.release()
    subprocess.run(
        ["ffmpeg", "-y", "-i", raw, "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out_path],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False,
    )
    if os.path.exists(raw):
        os.remove(raw)
    if not os.path.exists(out_path):
        raise RuntimeError("ghost video encode failed")
    return out_path


def coaching_lines(track: GhostTrack) -> List[str]:
    """Plain-language fixes from the whole rep, for the results list."""
    s = track.stats
    lines: List[str] = []
    if s["avg_off_deg"] > STACK_TOLERANCE_DEG:
        lines.append(
            f"Wrists drift: forearms were about {s['avg_off_deg']:.0f} degrees off straight up. Keep each wrist right over its elbow, like the green arm."
        )
    b = s["bottom_elbow_deg"]
    if b == b and b - s["bottom_target_deg"] > DEPTH_TOLERANCE_DEG:
        lines.append(f"Go lower: elbows only bent to {b:.0f} degrees at the bottom. Aim for about {s['bottom_target_deg']:.0f}, the green arm.")
    if not lines:
        lines.append("Arms matched the green target through the whole rep.")
    return lines


def ghost_score(track: GhostTrack) -> int:
    """0-100: share of the rep with forearms stacked (85 pts) plus reaching the target bottom depth (15 pts)."""
    s = track.stats
    b = s["bottom_elbow_deg"]
    depth_ok = not (b == b and b - s["bottom_target_deg"] > DEPTH_TOLERANCE_DEG)
    return int(round(0.85 * s["stack_ok_pct"] + (15 if depth_ok else 0)))
