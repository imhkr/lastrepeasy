from __future__ import annotations

import os
import unittest
from pathlib import Path

from app.services.video_ingestor import generate_synthetic_workout_video
from app.services.pose_analyzer import analyze_video_pose_timeline, detect_five_workout_phases
from app.services.nippard_ai import JEFF_NIPPARD_PRESETS, build_exercise_analysis
from app.services.flow_renderer import render_keyframes_and_flow_videos


class TestFormFlowPipeline(unittest.TestCase):
    def test_presets_and_end_to_end_flow_generation(self):
        self.assertGreaterEqual(len(JEFF_NIPPARD_PRESETS), 4)
        self.assertEqual(JEFF_NIPPARD_PRESETS[0].coach, "Jeff Nippard")

        base_dir = Path(__file__).resolve().parent.parent / "storage"
        src_vid = str(base_dir / "uploads" / "test_workout.mp4")

        # 1. Generate synthetic workout clip
        generate_synthetic_workout_video(src_vid, "Jeff Nippard Cable Lat Pullover", duration_sec=4.0)
        self.assertTrue(os.path.exists(src_vid))

        # 2. Run pose & angle tracking
        timeline, dur = analyze_video_pose_timeline(src_vid, sample_fps=8.0)
        self.assertGreater(len(timeline), 10)
        self.assertAlmostEqual(dur, 4.0, delta=0.5)

        # 3. Segment into 5 start-to-end phases & extract Jeff Nippard biomechanics cues
        phases = detect_five_workout_phases(timeline, dur)
        self.assertEqual(len(phases), 5)

        ex_name, muscles, handle_info, takeaways, steps, voice_en, voice_hi = build_exercise_analysis(
            "lat_pullover_nippard", phases, {}
        )
        self.assertIn("wrist", handle_info.wrist_alignment.lower())
        self.assertIn("ankle", handle_info.foot_and_ankle_position.lower())
        self.assertEqual(len(steps), 5)
        self.assertTrue(len(voice_en) > 40)
        self.assertTrue(len(voice_hi) > 40)

        # 4. Render 5 HUD Keyframes + Step-by-Step Start-to-End Flow Video
        kf_urls, flow_url, full_url = render_keyframes_and_flow_videos(
            source_video_path=src_vid,
            job_id="unittest01",
            exercise_name=ex_name,
            timeline=timeline,
            phase_tuples=phases,
            steps=steps,
            frames_dir=str(base_dir / "frames"),
            outputs_dir=str(base_dir / "outputs"),
            public_base_url="http://localhost:8000",
        )

        self.assertEqual(len(kf_urls), 5)
        self.assertTrue(flow_url.endswith("unittest01_step_by_step_flow.mp4"))
        self.assertTrue(os.path.exists(base_dir / "outputs" / "unittest01_step_by_step_flow.mp4"))
        self.assertTrue(os.path.exists(base_dir / "outputs" / "unittest01_annotated_full.mp4"))

        for step in steps:
            joint_keys = {jm.joint_key for jm in step.joint_metrics}
            self.assertTrue({"elbow", "wrist", "shoulder", "torso", "ankle", "knee"}.issubset(joint_keys))


if __name__ == "__main__":
    unittest.main()


def test_upload_rejects_clip_over_20_seconds(tmp_path):
    import cv2
    import numpy as np
    from fastapi.testclient import TestClient
    from app.main import app

    path = tmp_path / "long.mp4"
    w = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), 5, (64, 64))
    for _ in range(5 * 25):  # 25 s
        w.write(np.zeros((64, 64, 3), np.uint8))
    w.release()
    with open(path, "rb") as f:
        r = TestClient(app).post("/api/analyze/upload", files={"file": ("long.mp4", f, "video/mp4")})
    assert r.status_code == 400


def _wait(cl, jid):
    import time

    for _ in range(120):
        j = cl.get(f"/api/jobs/{jid}").json()
        if j["status"] in ("completed", "failed"):
            return j
        time.sleep(1)
    return j


def test_upload_without_a_person_fails_instead_of_inventing_joints(tmp_path):
    from fastapi.testclient import TestClient
    from app.main import app
    from app.services.video_ingestor import generate_synthetic_workout_video

    clip = str(tmp_path / "empty.mp4")
    generate_synthetic_workout_video(output_path=clip, exercise_title="Cable Lat Pullover")
    cl = TestClient(app)
    with open(clip, "rb") as f:
        jid = cl.post("/api/analyze/upload", files={"file": ("empty.mp4", f, "video/mp4")}, data={"exercise_hint": "incline press"}).json()["job_id"]
    j = _wait(cl, jid)
    assert j["status"] == "failed" and "person" in j["error"].lower()


def test_ghost_arm_stacks_forearm_and_follows_elbow_target():
    import numpy as np
    from app.services.pose_analyzer import FramePoseMetrics, Keypoint2D
    from app.services.ghost import build_ghost_track

    # Fake a clean press: forearm always vertical, elbow angle swinging 90 (bottom) to 170 (top).
    tl = []
    for i in range(30):
        ph = 0.5 - 0.5 * np.cos(2 * np.pi * i / 29)  # 0 bottom .. 1 top
        th = np.radians(90 + 80 * ph)
        el = (-0.30 * np.sin(th), 0.30 * np.cos(th))  # shoulder at the origin, y down
        parts = {"shoulder": (0.0, 0.0), "elbow": el, "wrist": (el[0], el[1] - 0.28), "hip": (0.0, 0.5)}
        kp = {f"right_{k}": Keypoint2D(0.5 + x * 0.5, 0.5 + y * 0.5, 1.0, x, y, 0.0) for k, (x, y) in parts.items()}
        tl.append(FramePoseMetrics(frame_idx=i, time_sec=i / 10, keypoints=kp, dominant_side="right"))
    tr = build_ghost_track("incline_press_nippard", tl, 1000, 1000)
    assert tr is not None and len(tr.arms) == 1
    a = tr.arms[0]
    assert float(np.mean(a.off_deg)) < 5, "a straight-up forearm is already stacked"
    assert abs(a.ghost_deg.min() - 90) < 1 and abs(a.ghost_deg.max() - 170) < 1
    assert build_ghost_track("lat_pullover_nippard", tl, 1000, 1000) is None, "only pressing is supported"


def test_upload_returns_personal_fixes_and_honest_score(tmp_path, monkeypatch):
    import app.main as main
    from app.services.pose_analyzer import analyze_video_pose_timeline as real
    from fastapi.testclient import TestClient
    from app.main import app

    # The generated clip has no person; let it use the synthetic skeleton so the rest of the pipeline is exercised.
    monkeypatch.setattr(main, "analyze_video_pose_timeline", lambda p, sample_fps=8.0, allow_synthetic=True: real(p, sample_fps, True))
    from app.services.video_ingestor import generate_synthetic_workout_video

    clip = str(tmp_path / "ok.mp4")
    generate_synthetic_workout_video(output_path=clip, exercise_title="Cable Lat Pullover")
    cl = TestClient(app)
    with open(clip, "rb") as f:
        jid = cl.post("/api/analyze/upload", files={"file": ("ok.mp4", f, "video/mp4")}, data={"exercise_hint": "lat pulldown"}).json()["job_id"]
    j = _wait(cl, jid)
    assert j["status"] == "completed", j.get("error")
    assert j["my_form_fixes"], "uploads must carry personal corrections"
    assert not j["my_form_fixes"][0][0].isdigit(), "no step-number prefix"
    assert 0 <= j["overall_form_score"] <= 100


def test_upload_returns_per_rep_checklist_and_ghost_video(tmp_path, monkeypatch):
    """Whole upload path with the real landmarks of a recorded press standing in for the pose model."""
    import app.main as main
    from fastapi.testclient import TestClient
    from app.main import app
    from app.services.video_ingestor import generate_synthetic_workout_video
    from tests.fixture_util import load_fixture

    timeline, _, _ = load_fixture()
    monkeypatch.setattr(main, "analyze_video_pose_timeline", lambda p, sample_fps=8.0, allow_synthetic=True: (timeline, 4.27))
    clip = str(tmp_path / "press.mp4")
    generate_synthetic_workout_video(output_path=clip, exercise_title="Incline press")
    cl = TestClient(app)
    with open(clip, "rb") as f:
        jid = cl.post("/api/analyze/upload", files={"file": ("press.mp4", f, "video/mp4")}, data={"exercise_hint": "incline dumbbell press"}).json()["job_id"]
    j = _wait(cl, jid)
    assert j["status"] == "completed", j.get("error")
    assert j["ghost_video_url"], "coaching video expected"
    assert len(j["rep_reports"]) == 1
    keys = {c["key"]: c["status"] for c in j["rep_reports"][0]["checks"]}
    assert keys["depth"] == "good" and "fix" not in keys.values()
    assert j["my_form_fixes"] and 0 <= j["overall_form_score"] <= 100
    checks = {c["key"]: c for c in j["rep_reports"][0]["checks"]}
    assert all(c["message_hi"] for c in checks.values()), "every check needs its Hinglish twin"
    assert checks["speed"]["status"] == "almost" and checks["speed"]["image_url"].endswith(".jpg"), "a picture for every fix"
    assert checks["hands"]["status"] == "unsure" and checks["hands"]["image_url"].endswith(".jpg"), "unsure hands still get a how-it-should-look picture"
    assert checks["depth"]["image_url"] is None, "no picture for what was done right"
    assert j["my_form_fixes_hi"], "Hinglish list too"
