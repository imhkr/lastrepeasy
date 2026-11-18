"""Generate a rubric for every exercise in the plan, from its movement family.

Writing 90 rubrics by hand looked like 90 research jobs. It is 13 families sharing one set of
measurements, so the honest version of this is: one template per family, with the small number of
per-exercise variations that genuinely have different geometry (a fly is not a press, an RDL barely
bends the knee). This module owns that mapping and emits the JSON.

EVERYTHING IT EMITS IS UNVALIDATED. `"validated": false` and a note are stamped on every file, because
the bands are coaching-textbook ranges for that movement, not measurements taken off a labelled clip.
The one exception is a family whose bands a human has already confirmed, which is why this module will
not overwrite a rubric that declares `validated: true`.

Usage:
    cd backend && .venv/bin/python -m app.services.rubric_gen          # write missing rubrics
    cd backend && .venv/bin/python -m app.services.rubric_gen --force  # rewrite unvalidated ones
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from .movement_families import FAMILIES, UNCLASSIFIED, census, plan_exercise_ids

RUBRIC_DIR = Path(__file__).resolve().parents[1] / "rubrics"

NOTE = (
    "Bands are the standard coaching ranges for this movement, not measured against a labelled "
    "clip. Treat a fix verdict as a prompt to look, not as a measured fault."
)


# ---------------------------------------------------------------- geometry per family

# Each family's rep definition. Kept here rather than read from FAMILIES so a template can vary it
# when one exercise's geometry differs from its family's majority.
TRACK: Dict[str, Dict] = {fam: dict(spec["track"]) for fam, spec in FAMILIES.items()}


# ---------------------------------------------------------------- check helpers

def cue(good: str, hi_good: str, fix: str, hi_fix: str,
        above: Optional[str] = None, hi_above: Optional[str] = None,
        below: Optional[str] = None, hi_below: Optional[str] = None,
        almost: Optional[str] = None, hi_almost: Optional[str] = None) -> Dict:
    """One check's cue set.

    `above` and `below` are not decoration: the engine picks between them from which side of the
    band the value missed on (see `missSide`). Without them, "too deep" and "too shallow" share the
    generic fix and half of all corrections say the opposite of what the lifter needs.
    """
    out: Dict = {
        "good": {"en": good, "hi": hi_good},
        "fix": {"en": fix, "hi": hi_fix},
    }
    if above:
        out["above"] = {"en": above, "hi": hi_above or above}
    if below:
        out["below"] = {"en": below, "hi": hi_below or below}
    # Every check needs an `almost` line: the engine can return `almost` for any numeric band, and
    # `_parse` refuses a check whose almost verdict has no cue to say. Falling back to the fix line
    # keeps the contract without pretending the near miss is a success.
    out["almost"] = (
        {"en": almost, "hi": hi_almost or almost}
        if almost
        else {"en": fix, "hi": hi_fix}
    )
    return out


def joint_check(cid: str, label: str, joint: str, at: str, robust: str,
                good: Tuple[float, float], almost: Tuple[float, float],
                cues: Dict, min_vis: float = 0.6) -> Dict:
    return {
        "id": cid, "label": label, "joint": joint, "at": at, "robust": robust,
        "capture": "in_plane", "min_visibility": min_vis,
        "good": list(good), "almost": list(almost), "cue": cues,
    }


def tempo_check(good: Tuple[float, float], almost: Tuple[float, float],
                down: str, down_hi: str) -> Dict:
    return {
        "id": "tempo", "label": "Speed", "at": "eccentric", "robust": "median",
        "capture": "in_plane", "measure": "eccentric_seconds",
        "good": list(good), "almost": list(almost),
        "cue": cue(
            "Good. You controlled the weight.", "Badhiya. Aapne weight control kiya.",
            f"Too fast. {down}", f"Bahut tez hai. {down_hi}",
            almost="A bit fast. Count 2 seconds on the way down.",
            hi_almost="Thoda tez hai. Neeche aate time 2 tak gino.",
            below=f"Too fast. {down}", hi_below=f"Bahut tez hai. {down_hi}",
        ),
    }


def lean_check(good: Tuple[float, float], almost: Tuple[float, float],
               label: str, ok: str, ok_hi: str, fix: str, fix_hi: str) -> Dict:
    return {
        "id": "lean", "label": label, "joint": "torso", "at": "bottom", "robust": "median",
        "capture": "in_plane", "measure": "torso_lean", "min_visibility": 0.6,
        "good": list(good), "almost": list(almost),
        "cue": cue(ok, ok_hi, fix, fix_hi),
    }


def even_check(joint: str, label: str, ok: str, ok_hi: str, fix: str, fix_hi: str) -> Dict:
    return {
        "id": "even", "label": label, "joint": joint, "at": "bottom", "robust": "median",
        "capture": "in_plane", "measure": "side_difference", "min_visibility": 0.7,
        "good": [0, 12], "almost": [12, 20],
        "cue": cue(ok, ok_hi, fix, fix_hi,
                   almost="One side is a little behind. Move them together.",
                   hi_almost="Ek side thoda peeche hai. Dono saath chalao."),
    }


# ---------------------------------------------------------------- family templates

def chest_press(name: str, eid: str) -> List[Dict]:
    return [
        joint_check("depth", "Depth", "elbow", "bottom", "min_of_3", (25, 100), (100, 112),
                    cue("Good. You went down low enough.", "Badhiya. Aap kaafi neeche gaye.",
                        "Take the weight down to your chest.", "Weight chest tak neeche lao.",
                        above="Go lower. Take the weight down to your chest.",
                        hi_above="Neeche jao. Weight chest tak lao.",
                        below="That is very deep. Stop when your upper arm is level.",
                        hi_below="Yeh bahut neeche hai. Upper arm level aate hi ruko."),
                    min_vis=0.55),
        joint_check("lockout", "Lockout", "elbow", "lockout", "max", (160, 180), (145, 160),
                    cue("Good. Your arms finished straight.", "Badhiya. Haath poore seedhe hue.",
                        "Push all the way up and straighten your arms.",
                        "Poora upar dhakelo aur haath seedhe karo.")),
        {
            "id": "hands", "label": "Hands", "joint": "wrist", "at": "eccentric", "robust": "median",
            "capture": "in_plane", "min_visibility": 0.6, "measure": "wrist_vs_elbow_stack",
            "good": [0, 30], "almost": [30, 50],
            "cue": cue("Good. Your hands stayed over your elbows.",
                       "Badhiya. Haath kohni ke upar rahe.",
                       "Your hands drift. Keep wrists stacked over elbows.",
                       "Haath hat rahe hain. Kohni ke seedha upar rakho."),
        },
        tempo_check((0.9, 3.0), (0.45, 0.9),
                    "Do not drop the weight. Count 2 seconds.",
                    "Weight girao mat. 2 tak gino."),
        even_check("elbow", "Arms",
                   "Good. Both arms moved together.", "Badhiya. Dono haath saath chale.",
                   "One arm is much lower. Move both arms together.",
                   "Ek haath bahut neeche hai. Dono haath saath chalao."),
    ]


def chest_flye(name: str, eid: str) -> List[Dict]:
    # A flye opens the arms wide with a nearly fixed elbow. Judging it with the press's elbow-angle
    # depth band would call every correct rep shallow, because the elbow never bends.
    return [
        {
            "id": "stretch", "label": "Range", "joint": "shoulder", "at": "bottom", "robust": "max",
            "capture": "in_plane", "min_visibility": 0.6,
            "good": [60, 100], "almost": [45, 60],
            "cue": cue("Good. You opened your arms wide enough.",
                       "Badhiya. Aapne haath kaafi khol diye.",
                       "Open your arms wider at the bottom.",
                       "Neeche haath aur phailao.",
                       above="Not so wide. Stop when you feel a stretch.",
                       hi_above="Itna zyada nahi. Stretch lage wahan ruko.",
                       below="Open wider and feel the stretch across your chest.",
                       hi_below="Aur phailao aur chest par stretch mehsoos karo."),
        },
        {
            "id": "elbow_soft", "label": "Elbows", "joint": "elbow", "at": "eccentric",
            "robust": "median", "capture": "in_plane", "min_visibility": 0.6,
            "good": [140, 180], "almost": [120, 140],
            "cue": cue("Good. Your elbows stayed softly straight.",
                       "Badhiya. Kohni halki seedhi rahi.",
                       "Keep a soft bend in your elbows, do not let them collapse.",
                       "Kohni mein halka bend rakho, poora mat modho."),
        },
        tempo_check((0.9, 3.0), (0.45, 0.9),
                    "Control the opening. Count 2 seconds.",
                    "Kholne mein control rakho. 2 tak gino."),
        {
            "id": "even", "label": "Both arms", "joint": "shoulder", "at": "bottom",
            "robust": "median", "capture": "in_plane", "measure": "side_difference",
            "min_visibility": 0.7, "good": [0, 14], "almost": [14, 22],
            "cue": cue("Good. Both arms opened together.", "Badhiya. Dono haath saath khule.",
                       "One arm is opening less. Move both together.",
                       "Ek haath kam khul raha hai. Dono saath kholo."),
        },
    ]


def pushup(name: str, eid: str) -> List[Dict]:
    return [
        joint_check("depth", "Depth", "elbow", "bottom", "min_of_3", (60, 110), (110, 130),
                    cue("Good. You went down low enough.", "Badhiya. Aap kaafi neeche gaye.",
                        "Lower your chest closer to the floor.",
                        "Chest ko floor ke aur paas lao.",
                        below="Do not sink that low. Stop a fist above the floor.",
                        hi_below="Itna neeche nahi. Floor se mutthi bhar upar ruko."),
                    min_vis=0.55),
        joint_check("lockout", "Top", "elbow", "lockout", "max", (155, 180), (140, 155),
                    cue("Good. Your arms finished straight.", "Badhiya. Haath poore seedhe hue.",
                        "Push all the way up.", "Poora upar dhakelo.")),
        lean_check((0, 30), (30, 45), "Back",
                   "Good. Your back stayed in one line.", "Badhiya. Aapki back ek line mein rahi.",
                   "Your hips are sagging or piking. Keep one straight line.",
                   "Hips gir rahe hain ya uthe hue hain. Ek seedhi line rakho."),
        tempo_check((0.9, 3.0), (0.45, 0.9),
                    "Lower yourself under control. Count 2 seconds.",
                    "Neeche control se aao. 2 tak gino."),
    ]


def shoulder_press(name: str, eid: str) -> List[Dict]:
    return [
        joint_check("depth", "Depth", "elbow", "bottom", "min_of_3", (25, 100), (100, 115),
                    cue("Good. You went down low enough.", "Badhiya. Aap kaafi neeche gaye.",
                        "Lower the weight to ear height.", "Weight kaan ki height tak lao.",
                        above="Go lower, down to ear height.",
                        hi_above="Neeche jao, kaan ki height tak.",
                        below="Not below ear height. Stop there.",
                        hi_below="Kaan se neeche nahi. Wahin ruko."),
                    min_vis=0.55),
        joint_check("lockout", "Lockout", "elbow", "lockout", "max", (160, 180), (145, 160),
                    cue("Good. Your arms finished straight.", "Badhiya. Haath poore seedhe hue.",
                        "Push all the way up.", "Poora upar dhakelo.")),
        lean_check((0, 20), (20, 32), "Back",
                   "Good. Your back stayed tall.", "Badhiya. Aapki back seedhi rahi.",
                   "You are leaning back. Keep your ribs down.",
                   "Aap peeche jhuk rahe hain. Ribs neeche rakho."),
        tempo_check((0.9, 3.0), (0.45, 0.9),
                    "Lower under control. Count 2 seconds.",
                    "Neeche control se aao. 2 tak gino."),
        even_check("elbow", "Arms",
                   "Good. Both arms moved together.", "Badhiya. Dono haath saath chale.",
                   "One arm is much lower. Move both arms together.",
                   "Ek haath bahut neeche hai. Dono haath saath chalao."),
    ]


def lateral_raise(name: str, eid: str) -> List[Dict]:
    return [
        {
            "id": "range", "label": "Height", "joint": "shoulder", "at": "bottom", "robust": "max",
            "capture": "in_plane", "min_visibility": 0.6,
            "good": [75, 105], "almost": [60, 75],
            "cue": cue("Good. You raised to shoulder height.",
                       "Badhiya. Kandhe ki height tak uthaya.",
                       "Lift to shoulder height, no higher.",
                       "Kandhe ki height tak uthao, usse zyada nahi.",
                       above="Not above the shoulder. Stop at shoulder height.",
                       hi_above="Kandhe se zyada upar nahi. Kandhe tak hi ruko.",
                       below="Lift higher, up to shoulder height.",
                       hi_below="Aur upar uthao, kandhe ki height tak."),
        },
        tempo_check((0.9, 3.5), (0.45, 0.9),
                    "Do not drop the weight. Count 2 seconds.",
                    "Weight girao mat. 2 tak gino."),
        even_check("shoulder", "Both arms",
                   "Good. Both arms went up together.", "Badhiya. Dono haath saath uthe.",
                   "One arm is much lower. Raise both arms together.",
                   "Ek haath bahut neeche hai. Dono haath saath uthao."),
    ]


def row_pulldown(name: str, eid: str) -> List[Dict]:
    return [
        joint_check("range", "Range", "elbow", "bottom", "min_of_3", (20, 75), (75, 95),
                    cue("Good. You pulled all the way in.", "Badhiya. Aap poora kheench laaye.",
                        "Pull further. Bring the weight all the way in.",
                        "Aur kheencho. Weight poora andar lao.",
                        above="Do not pull past your body. Stop when the elbow is behind you.",
                        hi_above="Shareer se aage nahi. Kohni peeche aate hi ruko.",
                        below="Pull further, all the way in.",
                        hi_below="Aur kheencho, poora andar tak."),
                    min_vis=0.55),
        joint_check("stretch", "Stretch", "elbow", "lockout", "max", (145, 180), (130, 145),
                    cue("Good. You let the weight stretch you out.",
                        "Badhiya. Aapne weight ko khulne diya.",
                        "Let your arms straighten fully at the top.",
                        "Upar jaate time haath poore seedhe hone do.")),
        lean_check((0, 25), (25, 40), "Back",
                   "Good. Your body stayed still.", "Badhiya. Aapka shareer sthir raha.",
                   "You are swinging. Keep your body still and pull.",
                   "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."),
        tempo_check((0.8, 3.5), (0.4, 0.8),
                    "Control the stretch. Count 2 seconds.",
                    "Khulne mein control rakho. 2 tak gino."),
        even_check("elbow", "Both arms",
                   "Good. Both arms pulled together.", "Badhiya. Dono haath saath khinche.",
                   "One arm is doing less. Pull with both evenly.",
                   "Ek haath kam kar raha hai. Dono se barabar kheencho."),
    ]


def curl(name: str, eid: str) -> List[Dict]:
    return [
        joint_check("range", "Range", "elbow", "bottom", "min_of_3", (20, 70), (70, 95),
                    cue("Good. You curled all the way up.", "Badhiya. Aap poora upar aaye.",
                        "Curl higher before you lower.",
                        "Neeche laane se pehle aur upar karo.",
                        above="Do not swing that high. Stop before your elbow pinches.",
                        hi_above="Itna zyada upar nahi. Kohni mein khinchne se pehle ruko.",
                        below="Curl higher, squeeze at the top.",
                        hi_below="Aur upar karo, upar squeeze karo."),
                    min_vis=0.55),
        joint_check("lockout", "Bottom", "elbow", "lockout", "max", (150, 180), (135, 150),
                    cue("Good. You lowered your arms fully.", "Badhiya. Aapne haath poore neeche kiye.",
                        "Lower all the way down so the muscle can stretch.",
                        "Poora neeche lao taaki muscle stretch ho.")),
        lean_check((0, 12), (12, 22), "Body",
                   "Good. Your body stayed still.", "Badhiya. Aapka shareer sthir raha.",
                   "You are swinging your body. Keep your back still and curl.",
                   "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."),
        tempo_check((0.9, 3.5), (0.45, 0.9),
                    "Do not let it drop. Count 2 seconds.",
                    "Girne mat do. 2 tak gino."),
    ]


def triceps(name: str, eid: str) -> List[Dict]:
    return [
        joint_check("range", "Range", "elbow", "bottom", "min_of_3", (20, 80), (80, 100),
                    cue("Good. You straightened your arms fully.",
                        "Badhiya. Aapne haath poore seedhe kiye.",
                        "Straighten your arms all the way.",
                        "Haath poore seedhe karo.",
                        below="Do not hyperextend. Stop when the arm is straight.",
                        hi_below="Seedhe se zyada nahi. Seedha hote hi ruko."),
                    min_vis=0.55),
        joint_check("stretch", "Stretch", "elbow", "lockout", "max", (40, 110), (110, 130),
                    cue("Good. You let the elbow close fully.", "Badhiya. Kohni poora band hui.",
                        "Let the elbow close all the way so the muscle stretches.",
                        "Kohni poora band hone do taaki muscle stretch ho.")),
        lean_check((0, 18), (18, 30), "Body",
                   "Good. Your body stayed still.", "Badhiya. Aapka shareer sthir raha.",
                   "You are leaning into it. Keep your body still.",
                   "Aap shareer se dhakel rahe hain. Shareer sthir rakho."),
        tempo_check((0.9, 3.5), (0.45, 0.9),
                    "Control the return. Count 2 seconds.",
                    "Wapas aane mein control rakho. 2 tak gino."),
    ]


def squat(name: str, eid: str) -> List[Dict]:
    return [
        joint_check("depth", "Depth", "knee", "bottom", "min_of_3", (60, 110), (110, 128),
                    cue("Good. You went down low enough.", "Badhiya. Aap kaafi neeche gaye.",
                        "Go lower. Take your hips down between your feet.",
                        "Neeche jao. Hips pairon ke beech le jao.",
                        above="Go lower. Take your hips down between your feet.",
                        hi_above="Neeche jao. Hips pairon ke beech le jao.",
                        below="That is very deep. Come up until your thighs are level.",
                        hi_below="Yeh bahut neeche hai. Upar aao jab tak jaanghein level aayein."),
                    min_vis=0.55),
        joint_check("lockout", "Standing up", "knee", "lockout", "max", (158, 180), (142, 158),
                    cue("Good. You stood all the way up.", "Badhiya. Aap poore khade ho gaye.",
                        "Stand all the way up and straighten your legs.",
                        "Poora khade ho jao aur pairn seedhe karo.")),
        lean_check((0, 45), (45, 60), "Chest up",
                   "Good. Your chest stayed up.", "Badhiya. Aapka chest upar raha.",
                   "Your chest is falling. Keep it up as you sit down.",
                   "Chest gir raha hai. Neeche baithte time chest upar rakho."),
        tempo_check((0.9, 3.5), (0.45, 0.9),
                    "Control the way down and count 2.",
                    "Neeche control karo aur 2 gino."),
        even_check("knee", "Both legs",
                   "Good. Both legs moved together.", "Badhiya. Dono pairn saath chale.",
                   "One leg is doing less. Push evenly with both legs.",
                   "Ek pair kam kar raha hai. Dono se barabar dhakelo."),
    ]


def lunge(name: str, eid: str) -> List[Dict]:
    checks = squat(name, eid)
    # A lunge is a single-leg movement, so a left-vs-right comparison at the same instant measures
    # the split stance rather than a fault. The front knee is the one being judged.
    return [c for c in checks if c["id"] != "even"]


def hinge(name: str, eid: str) -> List[Dict]:
    # A hinge is mostly hip travel with a small knee bend and a large torso change. The squat's
    # depth band on the knee would call a correct RDL "far too shallow" every single rep.
    return [
        lean_check((45, 95), (35, 45), "Back flat",
                   "Good. Your back stayed flat as you hinged.",
                   "Badhiya. Hinge karte time back flat rahi.",
                   "Your back is rounding. Keep your chest proud and push your hips back.",
                   "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."),
        joint_check("stretch", "Stretch", "knee", "bottom", "min_of_3", (110, 165), (95, 110),
                    cue("Good. You pushed your hips back far enough.",
                        "Badhiya. Aapne hips kaafi peeche kiye.",
                        "Push your hips further back to feel the stretch.",
                        "Hips aur peeche le jao taaki stretch mehsoos ho.",
                        below="Do not squat it. Keep a small bend in the knee.",
                        hi_below="Squat mat karo. Knee mein halka bend rakho."),
                    min_vis=0.55),
        joint_check("lockout", "Standing", "knee", "lockout", "max", (160, 180), (145, 160),
                    cue("Good. You stood all the way up.", "Badhiya. Aap poore khade ho gaye.",
                        "Finish the rep standing tall with your glutes tight.",
                        "Rep poora karo, seedhe khade ho aur glutes tight karo.")),
        tempo_check((0.9, 4.0), (0.45, 0.9),
                    "Control the way down and count 2.",
                    "Neeche control karo aur 2 gino."),
    ]


def leg_isolation(name: str, eid: str) -> List[Dict]:
    # Leg CURL is the inverse of leg EXTENSION: the knee is bent at the top of a curl. Both live in
    # one family because they share a joint and a machine, but not a direction.
    is_curl = "curl" in eid or "leg-curl" in eid
    checks = [
        joint_check("range", "Range", "knee", "bottom", "min_of_3", (20, 90), (90, 115),
                    cue("Good. You moved through the full range.",
                        "Badhiya. Aapne poora range cover kiya.",
                        "Go further into the movement.",
                        "Movement mein aur aage jao.",
                        below="That is far enough. Do not force more.",
                        hi_below="Itna hi kaafi hai. Zyada zor mat lagao."),
                    min_vis=0.55),
        joint_check("lockout", "Finish", "knee", "lockout", "max", (150, 180), (135, 150),
                    cue("Good. You finished the movement.", "Badhiya. Aapne movement poora kiya.",
                        "Finish the movement before you come back.",
                        "Wapas aane se pehle movement poora karo.")),
        tempo_check((0.9, 3.5), (0.45, 0.9),
                    "Control the way back. Count 2 seconds.",
                    "Wapas aane mein control rakho. 2 tak gino."),
    ]
    if is_curl:
        for c in checks:
            if c["id"] == "lockout":
                c["label"] = "Top"
    return checks


def hip_isolation(name: str, eid: str) -> List[Dict]:
    return [
        {
            "id": "range", "label": "Range", "joint": "hip", "at": "bottom", "robust": "min_of_3",
            "capture": "in_plane", "min_visibility": 0.55,
            "good": [15, 70], "almost": [8, 15],
            "cue": cue("Good. You moved through a full range.",
                       "Badhiya. Aapne poora range cover kiya.",
                       "Move further out to the side.",
                       "Side mein aur door le jao.",
                       below="Move further out to the side.",
                       hi_below="Side mein aur door le jao."),
        },
        tempo_check((0.9, 4.0), (0.45, 0.9),
                    "Control the way back. Count 2 seconds.",
                    "Wapas aane mein control rakho. 2 tak gino."),
    ]


def calf(name: str, eid: str) -> List[Dict]:
    return [
        joint_check("range", "Range", "ankle", "bottom", "min_of_3", (60, 105), (105, 120),
                    cue("Good. You came up onto your toes fully.",
                        "Badhiya. Aap poore toes par aaye.",
                        "Push up higher onto your toes.",
                        "Aur upar aao, toes par.",
                        above="That is high enough. Do not roll your ankle.",
                        hi_above="Itna hi kaafi hai. Ankle mat mudo."),
                    min_vis=0.55),
        joint_check("stretch", "Stretch", "ankle", "lockout", "max", (60, 105), (40, 60),
                    cue("Good. You let the heel drop fully.",
                        "Badhiya. Aapne heel poora neeche kiya.",
                        "Let your heel drop below the step for a stretch.",
                        "Heel ko step se neeche jaane do, stretch ke liye.")),
        tempo_check((0.9, 3.5), (0.45, 0.9),
                    "Control the way down. Count 2 seconds.",
                    "Neeche aane mein control rakho. 2 tak gino."),
    ]


def core(name: str, eid: str) -> List[Dict]:
    if "vacuum" in eid:
        return [
            {
                "id": "hold", "label": "Hold", "joint": "torso", "at": "eccentric",
                "robust": "median", "capture": "in_plane", "measure": "eccentric_seconds",
                "min_visibility": 0.5, "good": [3.0, 30.0], "almost": [1.5, 3.0],
                "cue": cue("Good. You held the vacuum.", "Badhiya. Aapne vacuum hold kiya.",
                           "Hold it longer, at least 3 seconds.",
                           "Aur der hold karo, kam se kam 3 second."),
            },
        ]
    return [
        joint_check("range", "Range", "hip", "bottom", "min_of_3", (20, 80), (80, 100),
                    cue("Good. You curled all the way through.",
                        "Badhiya. Aap poora curl kiye.",
                        "Crunch further, bring your ribs to your hips.",
                        "Aur crunch karo, ribs ko hips ke paas lao.",
                        above="That is enough. Do not pull your back.",
                        hi_above="Itna hi kaafi hai. Back ko kheencho mat.",
                        below="Crunch further so your abs do the work.",
                        hi_below="Aur crunch karo taaki abs kaam karein."),
                    min_vis=0.55),
        {
            "id": "stretch", "label": "Return", "joint": "hip", "at": "lockout", "robust": "max",
            "capture": "in_plane", "min_visibility": 0.55,
            "good": [120, 180], "almost": [105, 120],
            "cue": cue("Good. You opened up fully at the bottom.",
                       "Badhiya. Neeche aap poora khule.",
                       "Slow the return so the abs stretch.",
                       "Wapas dheere aao taaki abs stretch hon."),
        },
        tempo_check((0.8, 3.5), (0.4, 0.8),
                    "Control the return. Count 2 seconds.",
                    "Wapas aane mein control rakho. 2 tak gino."),
    ]


TEMPLATES = {
    "chest_press": chest_press,
    # Override kinds. These are real templates, not family names: a flye and a pushup are in the
    # chest family and share none of the press's geometry.
    "chest_flye": chest_flye,
    "pushup": pushup,
    "lunge": lunge,
    "shoulder_press": shoulder_press,
    "lateral_raise": lateral_raise,
    "row_pulldown": row_pulldown,
    "curl": curl,
    "triceps": triceps,
    "squat_lunge": squat,
    "hinge": hinge,
    "leg_isolation": leg_isolation,
    "hip_isolation": hip_isolation,
    "calf": calf,
    "core": core,
}

# Exercises whose geometry differs from their family's majority, and which template they actually
# need. A flye is not a press and an RDL is not a squat, and coaching them as one produces confident
# wrong corrections -- the exact failure this coach exists to fix.
OVERRIDES: Dict[str, str] = {
    "pec-deck": "chest_flye",
    "pec-deck-w-integrated-partials": "chest_flye",
    "cable-flye": "chest_flye",
    "low-incline-dumbbell-flye": "chest_flye",
    "bent-over-cable-pec-flye-w-integrated-partials": "chest_flye",
    "deficit-pushup": "pushup",
    "db-walking-lunge": "lunge",
    "smith-machine-lunge": "lunge",
    "smith-machine-reverse-lunge": "lunge",
}

VIEW_BY_FAMILY: Dict[str, List[str]] = {
    "chest_press": ["front", "45"],
    "shoulder_press": ["front", "45"],
    "lateral_raise": ["front", "45"],
    "row_pulldown": ["side", "45"],
    "curl": ["side", "45"],
    "triceps": ["side", "45"],
    "squat_lunge": ["side", "45"],
    "hinge": ["side", "45"],
    "leg_isolation": ["side", "45"],
    "hip_isolation": ["front", "45"],
    "calf": ["side", "45"],
    "core": ["side", "45"],
}

START_CUE: Dict[str, Tuple[str, str]] = {
    "chest_press": ("Hold the weight up, then lower it slowly.",
                    "Weight upar pakdo, phir dheere neeche lao."),
    "shoulder_press": ("Hold the weight at shoulder height, then press up.",
                       "Weight kandhe par rakho, phir upar dhakelo."),
    "lateral_raise": ("Stand tall with the weights at your sides.",
                      "Seedhe khade ho, weight haath ke bagal mein."),
    "row_pulldown": ("Start with your arms long, then pull in.",
                     "Haath seedhe karke shuru karo, phir andar kheencho."),
    "curl": ("Stand tall with your arms down, then curl up.",
             "Seedhe khade ho, haath neeche, phir upar curl karo."),
    "triceps": ("Set your elbow still, then straighten your arm.",
                "Kohni sthir rakho, phir haath seedha karo."),
    "squat_lunge": ("Stand tall, then sit down slowly and stand back up.",
                    "Seedhe khade ho, phir dheere baitho aur upar aao."),
    "hinge": ("Stand tall, then push your hips back with a flat back.",
              "Seedhe khade ho, phir back flat rakhte hue hips peeche le jao."),
    "leg_isolation": ("Set up on the machine and move through the full range.",
                      "Machine par set ho, poora range cover karo."),
    "hip_isolation": ("Stand tall, then move your leg out to the side.",
                      "Seedhe khade ho, phir pair side mein le jao."),
    "calf": ("Stand on the edge of a step, then rise onto your toes.",
             "Step ke kinare khade ho, phir toes par upar aao."),
    "core": ("Lie back, then curl your ribs toward your hips.",
             "Peeche leto, phir ribs ko hips ki taraf curl karo."),
}


def title_of(eid: str) -> str:
    small = {"db", "ez", "ohp", "rdl", "t", "1", "2", "3", "45", "w", "or", "in", "the", "at"}
    words = eid.replace("_", "-").split("-")
    out: List[str] = []
    for i, w in enumerate(words):
        if w.lower() in ("db", "ez", "rdl", "ohp"):
            out.append(w.upper())
        elif w.lower() == "t" and i + 1 < len(words):
            out.append("T")
        elif w.isdigit():
            out.append(w)
        elif i > 0 and w.lower() in small:
            out.append(w.lower())
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)


def build(eid: str, family: str) -> Dict:
    kind = OVERRIDES.get(eid, family)
    if kind not in TEMPLATES:
        raise KeyError(f"{eid}: no template for {kind!r}")
    checks = TEMPLATES[kind](title_of(eid), eid)

    track = dict(TRACK[family])
    if kind in ("lunge",):
        track = dict(TRACK["squat_lunge"])
    if kind == "pushup":
        # A pushup is a press with the body as the bench: the wrist travels away from the shoulder
        # along the body's own line, so the press's learned axis is the right signal here.
        track = {"joint": "elbow", "origin": "shoulder", "point": "wrist", "axis": "forearm"}
    if family == "chest_press" and kind == "chest_flye":
        # A flye's elbow stays softly fixed, so the rep is the shoulder opening and closing. Counting
        # it off the press's forearm axis would find no lockout and report zero reps.
        track = {"joint": "shoulder", "origin": "shoulder", "point": "wrist",
                 "axis": "angle", "invert": True, "eccentric": "return"}
    if family in ("curl", "triceps", "lateral_raise", "hinge"):
        # These start relaxed and lift first, so the lowering is the RETURN half of the rep.
        track["eccentric"] = "return"

    en, hi = START_CUE[family]
    return {
        "id": eid.replace("-", "_"),
        "name": title_of(eid),
        "family": family,
        "view": VIEW_BY_FAMILY[family],
        "rubric_version": "2026-11-18",
        # Marks this file as machine output, so the generator can tell its own work apart from a
        # hand-authored rubric and refuse to overwrite the latter.
        "_generated": True,
        "validated": False,
        "validation_note": NOTE,
        "track": track,
        "start_cue": {"en": en, "hi": hi},
        "phases": ["setup", "eccentric", "bottom", "concentric", "lockout"],
        "setup": [],
        "checks": checks,
    }


def KIND_IS_FAMILY(kind: str) -> bool:
    return kind in TEMPLATES


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--force", action="store_true", help="rewrite rubrics that are not validated")
    args = ap.parse_args(argv)

    groups = census(plan_exercise_ids())
    written: List[str] = []
    skipped: List[str] = []
    unclassified = groups.pop(UNCLASSIFIED, [])

    # Rubric ids a human already wrote, whatever file they live in. A plan id normalizes to the same
    # id (`low-incline-db-press` -> `low_incline_db_press`), so generating from the plan would emit
    # a second file claiming that id and the codegen would refuse the whole set as a duplicate.
    hand_authored = set()
    for path in RUBRIC_DIR.glob("*.json"):
        try:
            data = json.loads(path.read_text())
        except Exception:
            continue
        if not data.get("_generated"):
            hand_authored.add(str(data.get("id", "")).replace("-", "_"))

    for family, ids in sorted(groups.items()):
        for eid in ids:
            if eid.replace("-", "_") in hand_authored:
                skipped.append(eid)
                continue
            path = RUBRIC_DIR / f"{eid}.json"
            if path.exists():
                existing = json.loads(path.read_text())
                # Only ever rewrite this generator's own output. A hand-authored rubric -- the press
                # and squat references, which carry bands a human actually checked -- is not
                # regenerable, and `--force` must not be able to flatten years of notes into a
                # template. It did exactly that once; this is the fix.
                if not existing.get("_generated"):
                    skipped.append(eid)
                    continue
                if existing.get("validated") and not args.force:
                    skipped.append(eid)
                    continue
            path.write_text(json.dumps(build(eid, family), indent=2, ensure_ascii=False) + "\n")
            written.append(eid)

    print(f"wrote {len(written)} rubrics, skipped {len(skipped)}")
    if unclassified:
        print(f"no family, no rubric: {', '.join(unclassified)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())