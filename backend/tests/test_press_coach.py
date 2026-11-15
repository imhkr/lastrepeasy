import re

import numpy as np

from app.services.ghost import build_ghost_track
from app.services.pose_analyzer import FramePoseMetrics, Keypoint2D
from app.services.press_coach import MESSAGES, analyze_reps, set_lines, set_score
from tests.fixture_util import load_fixture

FPS = 15


def make_press(reps=2, bottom=80.0, top=172.0, down_s=2.0, up_s=1.5, lean=5.0, vis=1.0):
    """A one-arm press built from geometry: shoulder at the origin, forearm leaning `lean` deg toward the head."""
    ang = []
    hold = int(0.8 * FPS)
    ang += [top] * hold
    for _ in range(reps):
        ang += list(np.linspace(top, bottom, max(2, int(down_s * FPS))))
        ang += [bottom] * int(0.3 * FPS)
        ang += list(np.linspace(bottom, top, max(2, int(up_s * FPS))))
        ang += [top] * hold
    tl = []
    for i, a in enumerate(ang):
        th = np.radians(a)
        p = (a - bottom) / max(top - bottom, 1e-6)
        l = np.radians(lean * (1 - p))
        el = np.array([-0.30 * np.sin(th), 0.30 * np.cos(th)])
        wr = el + 0.28 * np.array([-np.sin(l), -np.cos(l)])
        parts = {"shoulder": (0.0, 0.0), "elbow": tuple(el), "wrist": tuple(wr), "hip": (0.2, 0.5)}
        kp = {f"right_{k}": Keypoint2D(0.5 + x * 0.5, 0.5 + y * 0.5, vis, x, y, 0.0) for k, (x, y) in parts.items()}
        tl.append(FramePoseMetrics(frame_idx=i, time_sec=i / FPS, keypoints=kp, dominant_side="right"))
    return tl


def run(tl):
    tr = build_ghost_track("incline_press_nippard", tl, 1000, 1000)
    assert tr is not None
    return analyze_reps(tr)


def status(rep, key):
    return {c.key: c.status for c in rep.checks}[key]


def test_users_real_clip_is_judged_correctly():
    tl, w, h = load_fixture()
    tr = build_ghost_track("incline_press_nippard", tl, w, h)
    reps = analyze_reps(tr)
    assert len(reps) == 1, "the clip holds exactly one rep"
    s = {c.key: c.status for c in reps[0].checks}
    assert s["depth"] == "good" and s["lockout"] == "good", s
    assert "fix" not in s.values(), "a correct rep must never be marked wrong"
    assert s["hands"] == "unsure", "wrist is hidden behind the dumbbell at the bottom, so we must say so"
    assert set_score(reps) >= 80


def test_good_synthetic_rep_is_all_good():
    reps = run(make_press(reps=2))
    assert len(reps) == 2
    for r in reps:
        assert {c.status for c in r.checks} == {"good"}, [(c.key, c.status) for c in r.checks]
    assert set_lines(reps) == ["Clean set. Every check was good."]


def test_each_mistake_is_caught_by_its_own_check():
    assert status(run(make_press(bottom=130))[0], "depth") == "fix"
    assert status(run(make_press(top=125))[0], "lockout") == "fix"
    assert status(run(make_press(down_s=0.4))[0], "speed") == "fix"
    r = run(make_press(lean=80))[0]
    assert status(r, "hands") == "fix" and "head" in {c.key: c.message for c in r.checks}["hands"]
    assert build_ghost_track("incline_press_nippard", make_press(vis=0.3), 1000, 1000) is None, "unseen arm: draw and judge nothing"


def test_plain_words_for_beginners():
    texts = [m for group in MESSAGES.values() for m in group.values()]
    tl, w, h = load_fixture()
    reps = analyze_reps(build_ghost_track("incline_press_nippard", tl, w, h))
    texts += [c.message for r in reps for c in r.checks] + set_lines(reps)
    assert texts
    for t in texts:
        assert len(t.split()) <= 14, t
        assert not re.search(r"°|degree|angle|extension|flexion|scapul|humer", t, re.I), t
