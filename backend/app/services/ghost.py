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
MIN_VIS = 0.6  # median landmark visibility an arm needs before we trust it
MIN_PRESS_CORR = 0.5  # elbow extension must line up with the wrist moving up the press line

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
    elbow_deg: np.ndarray  # user's elbow angle in the image (2D, steadier than the depth axis)
    vis: np.ndarray  # landmark confidence 0-1 (lowest of shoulder, elbow, wrist)
    lean_deg: np.ndarray  # forearm lean from straight up: + toward the head, - toward the feet
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
            gate = np.array([min(m.keypoints[f"{side}_{p}"].visibility for p in ("shoulder", "elbow")) for m in timeline])  # a dumbbell often hides the wrist
        except KeyError:
            continue
        if np.median(gate) < MIN_VIS:
            continue
        parts = ("shoulder", "elbow", "wrist", "hip")
        cand = {"i": {p: img(side, p) for p in parts}, "w": {p: wld(side, p) for p in parts}, "vis": _smooth(vis)}
        fore = np.linalg.norm(cand["w"]["wrist"] - cand["w"]["elbow"], axis=1)
        if np.std(fore) / (np.mean(fore) + 1e-9) > 0.4:  # forearm length jumping around = hand lost behind a dumbbell
            continue
        raw[side] = cand
    if not raw or not any(np.abs(d["w"]["wrist"]).sum() > 0 for d in raw.values()):
        return None

    # Per arm: "up" = the way the forearm points at lockout (top 20% of elbow extension), where a lifter holds the
    # weight stacked over the elbow. It also absorbs any camera tilt. The arm must then behave like a press: the
    # wrist rises along "up" as the elbow extends. An arm that does not is dropped, never guessed.
    ups: Dict[str, np.ndarray] = {}
    for side in list(raw):
        d = raw[side]
        ext = _angle3(d["w"]["shoulder"], d["w"]["elbow"], d["w"]["wrist"])
        top = ext >= np.percentile(ext, 80)
        fdir = _unit(_unit(d["w"]["wrist"] - d["w"]["elbow"])[top].mean(0))
        rise = (d["w"]["wrist"] - d["w"]["shoulder"]) @ fdir  # wrist height along "up"
        corr = float(np.corrcoef(ext, rise)[0, 1]) if np.std(ext) > 1e-6 and np.std(rise) > 1e-6 else 0.0
        if np.ptp(rise) < 0.10 or not np.isfinite(corr) or corr < MIN_PRESS_CORR:
            del raw[side]  # under 10 cm of travel, or elbow and wrist do not move together like a press
            continue
        ups[side] = fdir
    if not raw:
        return None
    up = _unit(np.mean(list(ups.values()), axis=0))

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
        arm_up = ups[side]
        s_along = (Ww - Sw) @ arm_up
        lo, hi = np.percentile(s_along, 5), np.percentile(s_along, 95)
        prog = np.clip((s_along - lo) / max(hi - lo, 1e-6), 0, 1)
        target = bottom_deg + (top_deg - bottom_deg) * prog

        upper = Sw - Ew  # elbow -> shoulder, as the user actually holds it
        perp = upper - (upper @ arm_up)[:, None] * arm_up
        perp_u = _unit(perp)  # keeps the user's own elbow direction (flare) untouched
        th = np.radians(target)[:, None]
        gdir = np.cos(th) * arm_up + np.sin(th) * perp_u  # ghost elbow -> shoulder
        gel_w = Sw - gdir * l1
        gwr_w = gel_w + arm_up * l2
        gel = Si + scale[:, None] * (gel_w - Sw)[:, :2]
        gwr = Si + scale[:, None] * (gwr_w - Sw)[:, :2]

        fdir_t = _unit(Ww - Ew)
        off = np.degrees(np.arccos(np.clip(fdir_t @ arm_up, -1, 1)))
        head = _unit(Sw - d["w"]["hip"])  # hip -> shoulder points toward the head
        head_perp = head - (head @ arm_up)[:, None] * arm_up
        f_perp = fdir_t - (fdir_t @ arm_up)[:, None] * arm_up
        lean = off * np.where((f_perp * head_perp).sum(1) >= 0, 1.0, -1.0)
        ei = d["i"]
        elbow2d = _angle3(ei["shoulder"], ei["elbow"], ei["wrist"])
        track.arms.append(ArmTrack(side, t, Si, ei["elbow"], ei["wrist"], gel, gwr, elbow2d, d["vis"], lean, target, off, prog))

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


