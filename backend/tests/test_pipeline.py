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
