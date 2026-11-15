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

    # Two short lines at the bottom: English, then Hinglish
    if rep is None:
        en, hi, col = "Start your set. I am watching.", "Set shuru karo. Main dekh raha hoon.", GRAY
    elif fix is not None:
        en, hi, col = fix.message, fix.message_hi, RED if fix.status == "fix" else AMBER_OK
    elif not any(seen.values()):
        en, hi, col = "Rep in progress. Keep going.", "Rep chal raha hai. Chalte raho.", GRAY
    elif "unsure" in seen.values():
        en, hi, col = "Good so far. Put the phone at your side.", "Abhi tak badhiya. Phone side mein rakho.", GREEN
    else:
        en, hi, col = "Good rep!", "Badhiya rep!", GREEN
    en_lines, hi_lines = _wrap(en, 30 if w < 700 else 44), _wrap(hi, 34 if w < 700 else 50)
    bar = int((20 + 25 * len(en_lines) + 22 * len(hi_lines)) * k)
    _panel(out, (0, h - bar), (w, h), 0.88)
    cv2.rectangle(out, (0, h - bar), (w, h - bar + max(3, int(4 * k))), col, -1)
    y = h - bar + int(30 * k)
    for ln in en_lines:
        (tw, _), _ = cv2.getTextSize(ln, cv2.FONT_HERSHEY_SIMPLEX, 0.68 * k, 2)
        cv2.putText(out, ln, (max(10, (w - tw) // 2), y), cv2.FONT_HERSHEY_SIMPLEX, 0.68 * k, WHITE, 2, cv2.LINE_AA)
        y += int(25 * k)
    for ln in hi_lines:
        (tw, _), _ = cv2.getTextSize(ln, cv2.FONT_HERSHEY_SIMPLEX, 0.55 * k, 1)
        cv2.putText(out, ln, (max(10, (w - tw) // 2), y), cv2.FONT_HERSHEY_SIMPLEX, 0.55 * k, (130, 220, 255), 1, cv2.LINE_AA)
        y += int(22 * k)
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


# ---------------------------------------------------------------- "YOU vs SHOULD BE" pictures

PANEL_W, PANEL_H, HEAD_H = 480, 640, 96
AMBER_BAR = (0, 150, 255)


def _read_frame(video_path: str, t: float) -> Optional[np.ndarray]:
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, int(round(t * fps))))
    ok, frame = cap.read()
    cap.release()
    return frame if ok else None


def _crop_box(points: List[np.ndarray], w: int, h: int) -> Tuple[int, int, int, int]:
    """A 3:4 window around the arm (and its target), zoomed in so the arm fills the picture."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    size = max(max(xs) - min(xs), (max(ys) - min(ys)) * 0.75, 120) * 1.7
    bw, bh = size, size * 4 / 3
    bw, bh = min(bw, w), min(bh, h)
    if bw / bh > 0.75:
        bw = bh * 0.75
    else:
        bh = bw / 0.75
    x0 = int(np.clip(cx - bw / 2, 0, w - bw))
    y0 = int(np.clip(cy - bh / 2, 0, h - bh))
    return x0, y0, int(bw), int(bh)


def _crop_panel(frame: np.ndarray, box: Tuple[int, int, int, int]) -> Tuple[np.ndarray, float, Tuple[int, int]]:
    x0, y0, bw, bh = box
    img = cv2.resize(frame[y0 : y0 + bh, x0 : x0 + bw], (PANEL_W, PANEL_H), interpolation=cv2.INTER_AREA)
    return img, PANEL_W / bw, (x0, y0)


def _to(p: np.ndarray, sc: float, off: Tuple[int, int]) -> Tuple[int, int]:
    return int(round((p[0] - off[0]) * sc)), int(round((p[1] - off[1]) * sc))


def _tag(img: np.ndarray, p: Tuple[int, int], text: str, col, dy: int = -22) -> None:
    """A word next to a joint, with a dark outline so it reads on any background."""
    x = int(np.clip(p[0] + 18, 6, img.shape[1] - 150))
    y = int(np.clip(p[1] + dy, 24, img.shape[0] - 8))
    cv2.putText(img, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (20, 20, 20), 5, cv2.LINE_AA)
    cv2.putText(img, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, col, 2, cv2.LINE_AA)


def _header(panel: np.ndarray, big: str, small: str, color) -> np.ndarray:
    bar = np.full((HEAD_H, PANEL_W, 3), (22, 18, 16), np.uint8)
    bar[:8] = color
    cv2.putText(bar, big, (14, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.95, WHITE, 3, cv2.LINE_AA)
    cv2.putText(bar, small, (14, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (200, 200, 200), 2, cv2.LINE_AA)
    return np.vstack([bar, panel])


def render_compare(video_path: str, track: GhostTrack, t: float, check: Check, out_path: str) -> Optional[str]:
    """Left: what you did (the wrong part in amber). Right: how it should look (green arm). Zoomed on your arm."""
    frame = _read_frame(video_path, t)
    if frame is None:
        return None
    h, w = frame.shape[:2]
    pos = [_at(track, a, t) for a in track.arms]
    pts = [q[k] for q in pos for k in ("sh", "el", "wr", "gel", "gwr")]
    box = _crop_box(pts, w, h)
    base, sc, off = _crop_panel(frame, box)
    thick = 14
    wrong = check.status in ("almost", "fix")
    # Only draw YOUR arm when the camera really saw it; a guessed arm drawn off your real arm would mislead.
    trusted = all(float(np.interp(t, a.t, a.vis)) >= 0.6 for a in track.arms) and check.status != "unsure"

    left = base.copy()
    for q in pos if trusted else []:
        sh, el, wr = _to(q["sh"], sc, off), _to(q["el"], sc, off), _to(q["wr"], sc, off)
        cv2.line(left, sh, el, WHITE, thick, cv2.LINE_AA)
        cv2.line(left, el, wr, AMBER_BAR if wrong else WHITE, thick, cv2.LINE_AA)
        for p in (sh, el, wr):
            cv2.circle(left, p, thick // 2 + 3, (20, 20, 20), -1, cv2.LINE_AA)
            cv2.circle(left, p, thick // 2, WHITE, -1, cv2.LINE_AA)
        _tag(left, el, "KOHNI", WHITE, 34)
        _tag(left, wr, "HAATH", AMBER_BAR if wrong else WHITE, -18)
        if check.key == "hands":  # the straight-up line the hand should sit on
            d = q["gwr"] - q["gel"]
            n = d / (np.linalg.norm(d) + 1e-9)
            for s0 in range(0, int(np.linalg.norm(d) * sc * 1.3), 26):
                a = el[0] + n[0] * s0, el[1] + n[1] * s0
                b = el[0] + n[0] * (s0 + 13), el[1] + n[1] * (s0 + 13)
                cv2.line(left, (int(a[0]), int(a[1])), (int(b[0]), int(b[1])), GREEN, 3, cv2.LINE_AA)

    right = base.copy()
    shadow = np.zeros_like(right)
    for q in pos:
        sh, gel, gwr = _to(q["sh"], sc, off), _to(q["gel"], sc, off), _to(q["gwr"], sc, off)
        cv2.line(shadow, sh, gel, GREEN, thick + 6, cv2.LINE_AA)
        cv2.line(shadow, gel, gwr, GREEN, thick + 6, cv2.LINE_AA)
        for p in (gel, gwr):
            cv2.circle(shadow, p, thick, GREEN, -1, cv2.LINE_AA)
    m = shadow.any(axis=2)
    right[m] = cv2.addWeighted(right, 0.35, shadow, 0.65, 0)[m]
    for q in pos:
        _tag(right, _to(q["gel"], sc, off), "KOHNI (elbow)", GREEN, 34)
        _tag(right, _to(q["gwr"], sc, off), "HAATH (hand)", GREEN, -18)
    for q in pos if trusted else []:  # your arm stays visible, thin, so you can compare
        cv2.line(right, _to(q["sh"], sc, off), _to(q["el"], sc, off), WHITE, 3, cv2.LINE_AA)
        cv2.line(right, _to(q["el"], sc, off), _to(q["wr"], sc, off), WHITE, 3, cv2.LINE_AA)

    left = _header(left, "AAP AISE KAR RAHE HO", "YOU DO THIS", AMBER_BAR)
    right = _header(right, "AISE HONA CHAHIYE", "IT SHOULD BE LIKE THIS", GREEN)
    img = np.hstack([left, np.full((left.shape[0], 6, 3), (22, 18, 16), np.uint8), right]) if trusted else right
    cv2.imwrite(out_path, img, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    return out_path


def render_speed(check: Check, out_path: str) -> str:
    """Two bars: how long you took to lower the weight vs the 2 seconds you should take."""
    you = float(np.clip(check.value / 0.48, 0.3, 4.0)) if check.value == check.value else 1.0
    img = np.full((420, 960, 3), (22, 18, 16), np.uint8)
    cv2.putText(img, "NEECHE AATE TIME KITNA TIME?", (24, 54), cv2.FONT_HERSHEY_SIMPLEX, 1.0, WHITE, 3, cv2.LINE_AA)
    cv2.putText(img, "HOW LONG YOU TAKE TO LOWER THE WEIGHT", (24, 88), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (200, 200, 200), 2, cv2.LINE_AA)
    scale = 190.0  # pixels per second
    rows = [("AAP (YOU)", you, AMBER_BAR if check.status != "good" else GREEN), ("SAHI (SHOULD BE)", 2.0, GREEN)]
    for n, (label, secs, col) in enumerate(rows):
        y = 150 + n * 120
        cv2.putText(img, label, (24, y - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.8, WHITE, 2, cv2.LINE_AA)
        cv2.rectangle(img, (24, y), (24 + int(secs * scale), y + 50), col, -1)
        cv2.putText(img, f"{secs:.1f} sec", (24 + int(secs * scale) + 14, y + 36), cv2.FONT_HERSHEY_SIMPLEX, 0.95, WHITE, 3, cv2.LINE_AA)
    cv2.putText(img, "Count: 1 ... 2   (1 ... 2 gino)", (24, 400), cv2.FONT_HERSHEY_SIMPLEX, 0.8, GREEN, 2, cv2.LINE_AA)
    cv2.imwrite(out_path, img, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    return out_path
