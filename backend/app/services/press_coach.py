"""
Rep-by-rep coaching for pressing (incline dumbbell press), in plain words for a total beginner.

Four checks per rep, each good / almost / fix:
  depth   - how low the elbows go (2D elbow angle at the bottom)
  lockout - how straight the arms get at the top
  hands   - forearms stacked straight up over the elbows (lean from "up", median over the lower half of the rep)
  speed   - time to lower the weight (wrist height from 80% to 20% of its range)

Thresholds are mirrored in mobile/src/live/liveCore.ts; keep both in step (a fixture test checks they agree).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

import numpy as np

from app.services.ghost import GhostTrack

DEPTH_GOOD, DEPTH_ALMOST = 105.0, 120.0  # elbow angle at the bottom (smaller = deeper)
LOCK_GOOD, LOCK_ALMOST = 155.0, 140.0  # elbow angle at the top
HANDS_GOOD, HANDS_ALMOST = 30.0, 50.0  # forearm lean from straight up
DOWN_GOOD, DOWN_FAST = 0.9, 0.45  # seconds from 80% to 20% of the wrist's height (about 0.48 x the full lowering time: 0.9 = 2 s down)
TOP_P, BOTTOM_P = 0.8, 0.35  # wrist height fractions that count as "top" and "went down"
ARMS_EVEN_DEG = 25.0
MIN_SEEN = {"depth": 0.25, "lockout": 0.5, "hands": 0.6}  # landmark confidence needed before we judge; below it we say so. Depth is lenient: the dumbbell hides the wrist at the bottom

LABELS = {"depth": "Depth", "lockout": "Lockout", "hands": "Hands", "speed": "Speed", "arms": "Arms"}
PRIORITY = ["depth", "hands", "lockout", "speed", "arms"]  # which fix to say first

MESSAGES: Dict[str, Dict[str, str]] = {
    "depth": {
        "good": "Great depth. Elbows went low.",
        "almost": "Go a little lower.",
        "fix": "Go lower. Bring the weights near your chest.",
    },
    "lockout": {
        "good": "Full lockout at the top.",
        "almost": "Press a bit higher at the top.",
        "fix": "Press all the way up until your arms are straight.",
    },
    "hands": {
        "good": "Hands stayed over your elbows.",
        "almost_head": "Hands drift toward your head. Keep them over your elbows.",
        "almost_feet": "Hands drift toward your feet. Keep them over your elbows.",
        "fix_head": "Hands are far toward your head. Stack them straight over your elbows.",
        "fix_feet": "Hands are far toward your feet. Stack them straight over your elbows.",
    },
    "speed": {
        "good": "Good, slow and controlled.",
        "almost": "A bit fast. Take 2 seconds going down.",
        "fix": "Too fast. Lower in 2 seconds, do not drop it.",
    },
    "unsure": {
        "depth": "I could not see your elbows clearly. Film from the side.",
        "lockout": "I could not see your arms clearly at the top. Film from the side.",
        "hands": "I could not see your hands clearly. Film from the side.",
    },
    "arms": {
        "good": "Both arms moved together.",
        "fix": "One arm is lower. Keep both arms even.",
    },
}


@dataclass
class Check:
    key: str
    label: str
    status: str  # good | almost | fix | unsure (could not see well enough to judge)
    message: str
    resolved_t: float = 0.0  # when in the clip the lifter could first see this verdict


@dataclass
class RepReport:
    index: int
    start_t: float
    bottom_t: float
    end_t: float
    checks: List[Check] = field(default_factory=list)

    def worst(self) -> Optional[Check]:
        bad = [c for c in self.checks if c.status in ("almost", "fix")]
        bad.sort(key=lambda c: (c.status != "fix", PRIORITY.index(c.key)))
        return bad[0] if bad else None


def _med(a: np.ndarray, k: int = 5) -> np.ndarray:
    if len(a) < k:
        return a
    p = np.pad(a, k // 2, mode="edge")
    return np.array([np.median(p[i : i + k]) for i in range(len(a))])


def _cross_down(t: np.ndarray, p: np.ndarray, i0: int, level: float) -> Optional[float]:
    """First time at/after i0 that p falls to <= level, linearly interpolated."""
    for i in range(max(i0, 1), len(p)):
        if p[i] <= level < p[i - 1]:
            return float(t[i - 1] + (t[i] - t[i - 1]) * (p[i - 1] - level) / (p[i - 1] - p[i]))
    return None


def _judge(key: str, seen: float, status: str) -> str:
    return "unsure" if seen < MIN_SEEN[key] else status


def _status(value: float, good: float, almost: float, smaller_is_better: bool) -> str:
    if smaller_is_better:
        return "good" if value <= good else "almost" if value <= almost else "fix"
    return "good" if value >= good else "almost" if value >= almost else "fix"


def analyze_reps(track: GhostTrack) -> List[RepReport]:
    arms = track.arms
    t = arms[0].t
    p = _med(np.mean([a.progress for a in arms], axis=0))
    elbow = _med(np.mean([a.elbow_deg for a in arms], axis=0))
    lean = _med(np.mean([a.lean_deg for a in arms], axis=0))
    vis = np.mean([a.vis for a in arms], axis=0)

    top = p >= TOP_P
    reps: List[RepReport] = []
    i = 0
    n = len(t)
    while i < n:
        if not top[i]:
            i += 1
            continue
        j = i
        while j + 1 < n and top[j + 1]:
            j += 1  # last frame of this top run
        k = j + 1
        while k < n and not top[k]:
            k += 1
        if k >= n:
            break  # never came back to the top: unfinished rep
        gap = slice(j + 1, k)
        if p[gap].min() < BOTTOM_P:
            reps.append(_report(len(reps) + 1, t, p, elbow, lean, vis, arms, j, k))
        i = k
    return reps


def _report(idx: int, t, p, elbow, lean, vis, arms, j: int, k: int) -> RepReport:
    gap = np.arange(j + 1, k)
    bi = int(gap[np.argmin(p[gap])])
    rep = RepReport(idx, float(t[j]), float(t[bi]), float(t[k]))

    deepest = np.sort(elbow[gap])[:3]
    depth_deg = float(np.median(deepest))
    st = _judge("depth", float(np.median(vis[gap])), _status(depth_deg, DEPTH_GOOD, DEPTH_ALMOST, True))
    rep.checks.append(Check("depth", LABELS["depth"], st, MESSAGES["unsure"]["depth"] if st == "unsure" else MESSAGES["depth"][st], rep.bottom_t))

    lower = gap[p[gap] < 0.6]
    lean_med = float(np.median(lean[lower])) if len(lower) else 0.0
    mag = abs(lean_med)
    st = _judge("hands", float(np.median(vis[lower])) if len(lower) else 0.0, _status(mag, HANDS_GOOD, HANDS_ALMOST, True))
    side = "head" if lean_med >= 0 else "feet"
    msg = MESSAGES["unsure"]["hands"] if st == "unsure" else MESSAGES["hands"]["good"] if st == "good" else MESSAGES["hands"][f"{st}_{side}"]
    rep.checks.append(Check("hands", LABELS["hands"], st, msg, rep.bottom_t))

    top_deg = float(np.max(elbow[max(k - 2, 0) : k + 4]))  # straightest the arm got as the rep finished
    st = _judge("lockout", float(np.median(vis[max(k - 2, 0) : k + 4])), _status(top_deg, LOCK_GOOD, LOCK_ALMOST, False))
    rep.checks.append(Check("lockout", LABELS["lockout"], st, MESSAGES["unsure"]["lockout"] if st == "unsure" else MESSAGES["lockout"][st], rep.end_t))

    t_hi = _cross_down(t, p, j, TOP_P)
    t_lo = _cross_down(t, p, j, 0.2)
    if t_hi is not None and t_lo is not None:
        secs = t_lo - t_hi
        st = _status(secs, DOWN_GOOD, DOWN_FAST, False)
        rep.checks.append(Check("speed", LABELS["speed"], st, MESSAGES["speed"][st], rep.bottom_t))

    if len(arms) == 2:
        d = np.abs(arms[0].elbow_deg - arms[1].elbow_deg)[bi]
        st = "good" if d <= ARMS_EVEN_DEG else "fix"
        rep.checks.append(Check("arms", LABELS["arms"], st, MESSAGES["arms"][st], rep.bottom_t))
    return rep


def set_score(reps: List[RepReport]) -> int:
    pts = {"good": 100, "almost": 65, "fix": 25}
    vals = [pts[c.status] for r in reps for c in r.checks if c.status in pts]
    return int(round(sum(vals) / len(vals))) if vals else 0


def set_lines(reps: List[RepReport]) -> List[str]:
    """Short plain-language list for the results screen: what to fix next set, most important first."""
    if not reps:
        return ["No full rep found. Start with arms straight up, lower, and press back up."]
    worst: Dict[str, Check] = {}
    unsure = any(c.status == "unsure" for r in reps for c in r.checks)
    for r in reps:
        for c in r.checks:
            if c.status in ("almost", "fix") and (c.key not in worst or c.status == "fix"):
                worst[c.key] = c
    lines = [c.message for c in sorted(worst.values(), key=lambda c: (c.status != "fix", PRIORITY.index(c.key)))]
    if unsure:
        lines.append("Some checks were hidden. Film from the side so I can see your arms.")
    return lines or ["Clean set. Every check was good."]
