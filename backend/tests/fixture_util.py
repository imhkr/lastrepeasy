import json
from pathlib import Path

from app.services.pose_analyzer import FramePoseMetrics, Keypoint2D

FIXTURE = Path(__file__).parent / "fixtures" / "press_clip_landmarks.json"


def load_fixture(path=FIXTURE):
    d = json.load(open(path))
    tl = []
    for i, f in enumerate(d["frames"]):
        kp = {k: Keypoint2D(v[0], v[1], v[2], v[3], v[4], v[5]) for k, v in f["kp"].items()}
        tl.append(FramePoseMetrics(frame_idx=i, time_sec=f["t"], keypoints=kp))
    return tl, d["width"], d["height"]
