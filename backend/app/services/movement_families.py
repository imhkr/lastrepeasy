"""Classify every exercise in the plan into a movement family.

Rubric authoring is the bulk of the remaining work for the live coach, and it looked like 90
separate research jobs. It is not: the 90 collapse into a dozen families that share one set of
measurements, one rep definition and one set of faults. This module is the mapping, kept in code
so it is reviewable and testable rather than living in someone's head.

The classification reads the exercise NAME only. plans.json carries id/name/sets/reps and no muscle
or movement metadata, so there is nothing else to read. That means the keyword lists below are the
contract -- an id that matches nothing lands in UNCLASSIFIED and is reported, never silently
guessed into a neighbouring family.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Dict, List, Tuple

PLANS_PATH = Path(__file__).resolve().parents[3] / "mobile" / "src" / "data" / "plans.json"

# Family -> the measurement primitives its checks are built from, in the order a rubric lists them
# (first = highest priority when several things are wrong at once).
FAMILIES: Dict[str, Dict] = {
    "chest_press": {
        "track": {"joint": "elbow", "origin": "shoulder", "point": "wrist", "axis": "forearm"},
        "measures": ["elbow_angle", "wrist_vs_elbow_stack", "eccentric_seconds", "side_difference"],
        "faults": ["depth", "lockout", "hands", "speed", "one side lagging"],
    },
    "shoulder_press": {
        "track": {"joint": "elbow", "origin": "shoulder", "point": "wrist", "axis": "forearm"},
        "measures": ["elbow_angle", "wrist_vs_elbow_stack", "eccentric_seconds", "side_difference"],
        "faults": ["depth", "lockout", "hands", "speed", "one side lagging"],
    },
    "lateral_raise": {
        # ANGLE, not distance. A raise keeps shoulder-to-wrist almost constant -- the arm swings but
        # does not change length -- so a distance signal sees a flat line and counts no reps at all.
        # The shoulder component is what moves: TRIPLES["shoulder"] is hip-shoulder-elbow, which is
        # ~10 deg with the arm at the side and ~90 deg with the arm out at shoulder height. `invert`
        # because the machine needs progress 1 to mean "at rest, ready for the next rep", and here
        # rest is the SMALL end of the joint's range -- the opposite of a press or a squat.
        "track": {"joint": "shoulder", "origin": "shoulder", "point": "wrist", "axis": "angle", "invert": True},
        "measures": ["shoulder_angle", "eccentric_seconds", "side_difference"],
        "faults": ["too low", "too high", "speed", "one side lagging"],
    },
    "row_pulldown": {
        # Distance, not the press's learned axis. A row's shoulder-to-wrist length changes plenty as
        # the elbow bends, and nothing in this family's checks compares a limb to "up", so the
        # simpler axis-free signal is strictly more robust than learning a direction.
        "track": {"joint": "elbow", "origin": "shoulder", "point": "wrist", "axis": "distance"},
        "measures": ["elbow_angle", "torso_lean", "eccentric_seconds", "side_difference"],
        "faults": ["range", "lean", "speed", "one side lagging"],
    },
    "curl": {
        "track": {"joint": "elbow", "origin": "shoulder", "point": "wrist", "axis": "distance"},
        "measures": ["elbow_angle", "torso_lean", "eccentric_seconds"],
        "faults": ["range", "body swing", "speed"],
    },
    "triceps": {
        "track": {"joint": "elbow", "origin": "shoulder", "point": "wrist", "axis": "distance"},
        "measures": ["elbow_angle", "torso_lean", "eccentric_seconds"],
        "faults": ["range", "elbow drift", "speed"],
    },
    "squat_lunge": {
        "track": {"joint": "knee", "origin": "ankle", "point": "hip", "axis": "distance"},
        "measures": ["knee_angle", "torso_lean", "eccentric_seconds", "side_difference"],
        "faults": ["depth", "lockout", "chest", "speed", "one leg lagging"],
    },
    "hinge": {
        "track": {"joint": "knee", "origin": "ankle", "point": "hip", "axis": "distance"},
        "measures": ["knee_angle", "torso_lean", "eccentric_seconds"],
        "faults": ["hip travel", "back angle", "speed"],
    },
    "leg_isolation": {
        "track": {"joint": "knee", "origin": "ankle", "point": "hip", "axis": "distance"},
        "measures": ["knee_angle", "eccentric_seconds"],
        "faults": ["range", "speed"],
    },
    "hip_isolation": {
        # ANGLE. The old spec said origin=shoulder, point=hip, which is the torso itself -- a
        # constant. A leg swinging out to the side changes the hip angle, not any segment length.
        # No invert: with this triple the angle is largest standing (leg down) and shrinks as the
        # leg abducts, so the rest position is already the large end, which is where the count starts.
        "track": {"joint": "hip", "origin": "shoulder", "point": "knee", "axis": "angle"},
        "measures": ["hip_angle", "eccentric_seconds"],
        "faults": ["range", "speed"],
    },
    "calf": {
        # ANGLE. Knee-to-toe barely changes across a calf raise; the ankle joint is what travels.
        # Invert: TRIPLES["ankle"] is knee-ankle-toe, which is LARGEST with the heel dropped and
        # SMALLEST at the top of the raise -- the opposite of every other family, where the top is
        # the large end. Without the inversion the heel-dropped rest position would read as the top.
        "track": {"joint": "ankle", "origin": "knee", "point": "foot_index", "axis": "angle", "invert": True},
        "measures": ["ankle_angle", "eccentric_seconds"],
        "faults": ["range", "speed"],
    },
    "core": {
        "track": {"joint": "hip", "origin": "shoulder", "point": "knee", "axis": "distance"},
        "measures": ["hip_angle", "torso_lean", "eccentric_seconds"],
        "faults": ["range", "speed"],
    },
}

UNCLASSIFIED = "unclassified"

# Order matters: the first match wins, so the narrow movements come before the broad ones. A
# triceps pressdown contains "press" and must not reach the chest family; a leg press contains
# "press" and is not a chest press either.
RULES: List[Tuple[str, str]] = [
    # "glute kickback" before the triceps list, which would otherwise claim it on the word
    # "kickback" and coach a hip extension as an elbow movement.
    (r"glute kickback", "hip_isolation"),
    (r"skull|french|pressdown|kickback|katana|triceps|pushdown", "triceps"),
    (r"crunch|vaccum|vacuum|russian twist|leg raise|rollout|ab wheel|ab-wheel", "core"),
    (r"calf|ankle", "calf"),
    (r"hip adduction|hip abduction", "hip_isolation"),
    (r"leg press|leg extension|leg curl|sissy|seated leg|lying leg|single leg", "leg_isolation"),
    (r"rdl|deadlift|hinge|hyperextension|roman chair|good morning", "hinge"),
    (r"squat|lunge|hack squat|split squat|step up", "squat_lunge"),
    (r"curl|zottman|preacher", "curl"),
    (r"lateral raise|y raise|rear delt|reverse flye|reverse pec", "lateral_raise"),
    (r"shoulder press|overhead press|ohp|arnold", "shoulder_press"),
    (r"pulldown|pull down|pull-up|pullup|pull up|lat pull|lat prayer|face pull|"
     r"pull-in|pull in|pull around|row|shrug|lat-focused|lat focused", "row_pulldown"),
    (r"chest press|bench press|db press|machine chest|pec deck|flye|fly|pushup|push-up|dip|"
     r"smith machine press|incline", "chest_press"),
]

_COMPILED = [(re.compile(p), fam) for p, fam in RULES]


def classify(exercise_id: str) -> str:
    """Family for one exercise id, or UNCLASSIFIED. Never guesses into a neighbour."""
    text = exercise_id.replace("-", " ").replace("_", " ").lower()
    for pattern, family in _COMPILED:
        if pattern.search(text):
            return family
    return UNCLASSIFIED


def plan_exercise_ids(path: Path = PLANS_PATH) -> List[str]:
    """Every distinct exercise id the app can ask about, in first-seen order."""
    data = json.loads(path.read_text())
    seen: Dict[str, None] = {}

    def walk(node) -> None:
        if isinstance(node, list):
            for item in node:
                walk(item)
            return
        if not isinstance(node, dict):
            return
        exercises = node.get("exercises")
        if isinstance(exercises, list):
            for e in exercises:
                if isinstance(e, dict) and e.get("id"):
                    seen.setdefault(e["id"], None)
        for key, value in node.items():
            if key != "exercises":
                walk(value)

    walk(data)
    return list(seen)


def census(ids: List[str] | None = None) -> Dict[str, List[str]]:
    """Group every exercise by family, with the unclassified ones listed explicitly."""
    out: Dict[str, List[str]] = {}
    for eid in ids if ids is not None else plan_exercise_ids():
        out.setdefault(classify(eid), []).append(eid)
    return out


def coverage(path: Path = PLANS_PATH) -> Tuple[int, Counter]:
    groups = census(plan_exercise_ids(path))
    return len(plan_exercise_ids(path)), Counter({k: len(v) for k, v in groups.items()})


if __name__ == "__main__":
    total, counts = coverage()
    print(f"{total} distinct exercises across {len(counts)} families")
    for fam, n in counts.most_common():
        print(f"  {fam:16} {n:3}")
    un = census().get(UNCLASSIFIED) or []
    if un:
        print("\nunclassified (need a rule or a manual family):")
        for eid in un:
            print(f"  {eid}")
