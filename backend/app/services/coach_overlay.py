"""Draws the beginner coaching overlay (checklist, target arm, one plain sentence, end-of-set card) on the user's clip."""
from __future__ import annotations

import os
import subprocess
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np

from app.services.ghost import AMBER, GREEN, RED, WHITE, GhostTrack, _arrow, _at, _pt
from app.services.press_coach import LABELS, PRIORITY, Check, RepReport, set_lines

GRAY = (150, 150, 150)
AMBER_OK = (0, 175, 255)


def _icon(img: np.ndarray, c: Tuple[int, int], r: int, status: Optional[str]) -> None:
    """good = green check, almost = amber !, fix = red x, unsure = gray ?, None = waiting ring."""
    col = {"good": GREEN, "almost": AMBER_OK, "fix": RED, "unsure": GRAY}.get(status or "", None)
    if col is None:
        cv2.circle(img, c, r, GRAY, 2, cv2.LINE_AA)
        return
    cv2.circle(img, c, r, col, -1, cv2.LINE_AA)
    k = r / 10.0
    w = max(2, int(2 * k))
    x, y = c
    if status == "good":
        pts = np.array([[x - 5 * k, y], [x - 1.5 * k, y + 4 * k], [x + 5.5 * k, y - 4 * k]], np.int32)
        cv2.polylines(img, [pts], False, (20, 20, 20), w, cv2.LINE_AA)
    elif status == "almost":
        cv2.line(img, (x, int(y - 5 * k)), (x, int(y + 1 * k)), (20, 20, 20), w, cv2.LINE_AA)
        cv2.circle(img, (x, int(y + 5 * k)), max(1, int(1.3 * k)), (20, 20, 20), -1, cv2.LINE_AA)
    elif status == "fix":
        cv2.line(img, (int(x - 4 * k), int(y - 4 * k)), (int(x + 4 * k), int(y + 4 * k)), (255, 255, 255), w, cv2.LINE_AA)
        cv2.line(img, (int(x - 4 * k), int(y + 4 * k)), (int(x + 4 * k), int(y - 4 * k)), (255, 255, 255), w, cv2.LINE_AA)
    else:  # unsure
        cv2.putText(img, "?", (int(x - 4 * k), int(y + 5 * k)), cv2.FONT_HERSHEY_SIMPLEX, 0.5 * k, (20, 20, 20), w, cv2.LINE_AA)


def _wrap(text: str, width_chars: int) -> List[str]:
    lines, cur = [], ""
    for w in text.split():
        if len(cur) + len(w) + 1 > width_chars and cur:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    return lines + ([cur] if cur else [])


def _panel(img: np.ndarray, tl: Tuple[int, int], br: Tuple[int, int], alpha: float = 0.78) -> None:
    sub = img[tl[1] : br[1], tl[0] : br[0]]
    img[tl[1] : br[1], tl[0] : br[0]] = cv2.addWeighted(np.full_like(sub, (22, 18, 16)), alpha, sub, 1 - alpha, 0)


def _state_at(reports: List[RepReport], t: float) -> Tuple[Optional[RepReport], Dict[str, Optional[str]], Optional[Check]]:
    """The rep being watched at time t, what the lifter can already know about it, and the one thing to say."""
    rep = None
    for r in reports:
        if r.start_t <= t:
            rep = r
    if rep is None:
        return None, {}, None
    seen = {c.key: (c.status if t >= c.resolved_t else None) for c in rep.checks}
    bad = [c for c in rep.checks if t >= c.resolved_t and c.status in ("almost", "fix")]
    bad.sort(key=lambda c: (c.status != "fix", PRIORITY.index(c.key)))
    return rep, seen, (bad[0] if bad else None)


def draw_coach(frame: np.ndarray, track: GhostTrack, reports: List[RepReport], time_sec: float, sc: float) -> np.ndarray:
    out = frame.copy()
    h, w = out.shape[:2]
    k = w / 540.0
    rep, seen, fix = _state_at(reports, time_sec)
    pos = {a.side: _at(track, a, time_sec) for a in track.arms}
    thick = max(8, int(w * 0.03))

    # Green target arm only while something needs fixing: it shows where the arm should be.
    show_target = rep is not None and fix is not None and fix.key in ("hands", "depth") and time_sec <= rep.end_t
    if show_target:
        shadow = np.zeros_like(out)
        for q in pos.values():
            cv2.line(shadow, _pt(q["sh"], sc), _pt(q["gel"], sc), GREEN, thick, cv2.LINE_AA)
            cv2.line(shadow, _pt(q["gel"], sc), _pt(q["gwr"], sc), GREEN, thick, cv2.LINE_AA)
            for key in ("gel", "gwr"):
                cv2.circle(shadow, _pt(q[key], sc), int(thick * 0.8), GREEN, -1, cv2.LINE_AA)
        m = shadow.any(axis=2)
        out[m] = cv2.addWeighted(out, 0.5, shadow, 0.5, 0)[m]

    # Your arm: white. Only the forearm changes colour, and only for the hands check.
    fore = {"almost": AMBER_OK, "fix": RED}.get(seen.get("hands") or "", WHITE)
    for q in pos.values():
        cv2.line(out, _pt(q["sh"], sc), _pt(q["el"], sc), WHITE, max(3, thick // 4), cv2.LINE_AA)
        cv2.line(out, _pt(q["el"], sc), _pt(q["wr"], sc), fore, max(3, thick // 4), cv2.LINE_AA)
        for key in ("sh", "el", "wr"):
            cv2.circle(out, _pt(q[key], sc), max(4, thick // 3), WHITE, -1, cv2.LINE_AA)
        if show_target and fix.key == "hands":
            _arrow(out, q["wr"], q["gwr"], sc, AMBER, max(3, thick // 4))
            cv2.putText(out, "hand here", (_pt(q["gwr"], sc)[0] + 8, _pt(q["gwr"], sc)[1] - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.55 * k, GREEN, 2, cv2.LINE_AA)

    # Checklist (top-left)
    keys = [x for x in ("depth", "hands", "lockout", "speed", "arms") if len(track.arms) == 2 or x != "arms"]
    row = int(34 * k)
    _panel(out, (int(8 * k), int(8 * k)), (int(190 * k), int(52 * k) + row * len(keys)))
    cv2.putText(out, f"REP {rep.index}" if rep else "GET READY", (int(18 * k), int(30 * k)), cv2.FONT_HERSHEY_SIMPLEX, 0.55 * k, WHITE, 2, cv2.LINE_AA)
    for n, key in enumerate(keys):
        y = int(30 * k) + int(14 * k) + row * (n + 1) - int(8 * k)
        _icon(out, (int(28 * k), y), int(11 * k), seen.get(key))
        cv2.putText(out, LABELS[key], (int(48 * k), y + int(6 * k)), cv2.FONT_HERSHEY_SIMPLEX, 0.6 * k, WHITE, 2, cv2.LINE_AA)

    # One sentence at the bottom
    if rep is None:
        msg, col = "Start your set. I am watching.", GRAY
    elif fix is not None:
        msg, col = fix.message, RED if fix.status == "fix" else AMBER_OK
    elif not any(seen.values()):
        msg, col = "Rep in progress. Keep going.", GRAY
    elif "unsure" in seen.values():
        msg, col = "Good so far. Film from the side so I can see more.", GREEN
    else:
        msg, col = "Good rep!", GREEN
    lines = _wrap(msg, int(30 * (w / 540.0) ** 0 * 1.0) if w < 700 else 44)
    bar = int((18 + 26 * len(lines)) * k)
    _panel(out, (0, h - bar), (w, h), 0.85)
    cv2.rectangle(out, (0, h - bar), (w, h - bar + max(3, int(4 * k))), col, -1)
    for n, ln in enumerate(lines):
        (tw, _), _ = cv2.getTextSize(ln, cv2.FONT_HERSHEY_SIMPLEX, 0.72 * k, 2)
        cv2.putText(out, ln, (max(10, (w - tw) // 2), h - bar + int((34 + 26 * n) * k)), cv2.FONT_HERSHEY_SIMPLEX, 0.72 * k, WHITE, 2, cv2.LINE_AA)
    return out


def draw_summary(frame: np.ndarray, reports: List[RepReport]) -> np.ndarray:
    out = (frame * 0.25).astype(np.uint8)
    h, w = out.shape[:2]
    k = w / 540.0
    cv2.putText(out, "YOUR SET", (int(24 * k), int(60 * k)), cv2.FONT_HERSHEY_SIMPLEX, 1.0 * k, WHITE, 3, cv2.LINE_AA)
    y = int(110 * k)
    for r in reports[:6]:
        cv2.putText(out, f"Rep {r.index}", (int(24 * k), y + int(6 * k)), cv2.FONT_HERSHEY_SIMPLEX, 0.7 * k, WHITE, 2, cv2.LINE_AA)
        x = int(120 * k)
        for c in r.checks:
            _icon(out, (x, y), int(12 * k), c.status)
            cv2.putText(out, c.label, (x - int(18 * k), y + int(30 * k)), cv2.FONT_HERSHEY_SIMPLEX, 0.38 * k, GRAY, 1, cv2.LINE_AA)
            x += int(64 * k)
        y += int(70 * k)
    lines = set_lines(reports)
    cv2.putText(out, "NEXT SET", (int(24 * k), y + int(20 * k)), cv2.FONT_HERSHEY_SIMPLEX, 0.7 * k, GREEN, 2, cv2.LINE_AA)
    y += int(54 * k)
    for ln in lines[:2]:
        for part in _wrap(ln, 34):
            cv2.putText(out, part, (int(24 * k), y), cv2.FONT_HERSHEY_SIMPLEX, 0.62 * k, WHITE, 2, cv2.LINE_AA)
            y += int(30 * k)
        y += int(10 * k)
    return out


def render_ghost_video(source_video_path: str, track: GhostTrack, reports: List[RepReport], out_path: str, max_side: int = 960) -> str:
    cap = cv2.VideoCapture(source_video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    sc = min(1.0, max_side / max(track.width, track.height))
    ow, oh = int(track.width * sc) // 2 * 2, int(track.height * sc) // 2 * 2
    raw = out_path + ".raw.mp4"
    wr = cv2.VideoWriter(raw, cv2.VideoWriter_fourcc(*"mp4v"), fps, (ow, oh))
    i, last_raw = 0, None
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        small = cv2.resize(frame, (ow, oh))
        wr.write(draw_coach(small, track, reports, i / fps, ow / track.width))
        last_raw = small
        i += 1
    if last_raw is not None:
        card = draw_summary(last_raw, reports)
        for _ in range(int(fps * 3)):
            wr.write(card)
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
