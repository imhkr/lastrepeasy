"""Dump real landmarks from a clip so Python and JavaScript coaches can be checked on identical data.
Usage: .venv/bin/python tests/make_fixture.py clip.mp4 tests/fixtures/out.json"""
import json
import sys

import cv2

from app.services.pose_analyzer import analyze_video_pose_timeline

PARTS = ("shoulder", "elbow", "wrist", "hip")
src, dst = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
cap.release()
tl, _ = analyze_video_pose_timeline(src, sample_fps=15, allow_synthetic=False)
frames = [
    {"t": m.time_sec, "kp": {f"{s}_{p}": [round(k.x, 4), round(k.y, 4), round(k.visibility, 3), round(k.wx, 4), round(k.wy, 4), round(k.wz, 4)]
                           for s in ("left", "right") for p in PARTS for k in [m.keypoints[f"{s}_{p}"]]}}
    for m in tl
]
json.dump({"width": w, "height": h, "frames": frames}, open(dst, "w"), separators=(",", ":"))
print(len(frames), "frames ->", dst)
