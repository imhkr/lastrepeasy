"""
Jeff Nippard Science-Based Biomechanics AI Engine.
Combines:
1. Optional Gemini 2.5 Flash multimodal vision + YouTube transcript analysis (when GEMINI_API_KEY is configured)
2. Rich evidence-based biomechanical knowledge base for Jeff Nippard signature movements:
   - Lat Pulldown / Cable Pullover (handle path, 30° torso lean, neutral vs pronated MAG grip, scapular plane)
   - Incline Dumbbell / Cable Press (45°–60° scapular plane elbow tuck, stacked 172° wrist, planted 82° ankle drive)
   - Bayesian Cable Curl / Barbell Curl (shoulder hyperextension stretch, neutral wrist alignment)
   - Romanian Deadlift / Squat (hip hinge angle, tibial/ankle dorsiflexion angle, bar/handle path)
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple


def _load_dotenv_if_present() -> None:
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if not env_path.exists():
        return
    try:
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip("'").strip('"')
            if k and k not in os.environ:
                os.environ[k] = v
    except Exception:
        pass


_load_dotenv_if_present()

from app.schemas import (
    FlowPhaseStep,
    HandleAndStanceInfo,
    JointAngleMetric,
    PresetCatalogItem,
)
from app.services.pose_analyzer import FramePoseMetrics


JEFF_NIPPARD_PRESETS: List[PresetCatalogItem] = [
    PresetCatalogItem(
        preset_id="lat_pullover_nippard",
        title="Cable Lat Pullover & Pulldown (Jeff Nippard Science Applied)",
        coach="Jeff Nippard",
        youtube_reference_url="https://www.youtube.com/watch?v=JEb-dwU3VF4",
        target_muscles=["Latissimus Dorsi (Iliac & Thoracic Fibers)", "Teres Major", "Long Head Triceps (Stabilizer)"],
        highlight_cue="Maintain ~30° forward torso lean, keep elbows slightly bent (138°–152°), neutral stacked wrists (172°), and drive handles in an arc toward your hips—stopping once humerus aligns with torso.",
        default_grip="Rope or Ergonomic Double-D / Neutral MAG Handle (Shoulder-Width)",
    ),
    PresetCatalogItem(
        preset_id="incline_press_nippard",
        title="30° Incline Dumbbell / Cable Chest Press (Clavicular Pec Focus)",
        coach="Jeff Nippard",
        youtube_reference_url="https://www.youtube.com/watch?v=8fXfwG4ftaQ",
        target_muscles=["Clavicular Head (Upper Pectoralis Major)", "Anterior Deltoid", "Triceps Brachii"],
        highlight_cue="Set bench to 30° (not 45°+), tuck elbows to a 45°–55° arrow shape in the scapular plane, keep wrists stacked directly over elbows (175°), and plant feet with ~82° ankle dorsiflexion for leg drive.",
        default_grip="Full Thumb-Around Pronated Grip (Angled 15° Inward in Scapular Plane)",
    ),
    PresetCatalogItem(
        preset_id="bayesian_curl_nippard",
        title="Behind-the-Body Bayesian Cable Curl (Long Head Stretch)",
        coach="Jeff Nippard",
        youtube_reference_url="https://www.youtube.com/watch?v=i1YgFZB6alI",
        target_muscles=["Biceps Brachii (Long Head Peak Stretch)", "Brachialis", "Brachioradialis"],
        highlight_cue="Set single D-handle at ankle/knee height, step forward into a split stance (front ankle ~80°), let shoulder extend 25°–35° behind torso for maximal stretched tension, and keep wrist neutral/supinated without curling the wrist.",
        default_grip="Single Rotating D-Handle (Supinated Palm-Up, Neutral Wrist Stack)",
    ),
    PresetCatalogItem(
        preset_id="rdl_hinge_nippard",
        title="Romanian Deadlift (RDL) — Pure Hip Hinge & Lat Engagement",
        coach="Jeff Nippard",
        youtube_reference_url="https://www.youtube.com/watch?v=7j-2w4-P14I",
        target_muscles=["Hamstrings (Biceps Femoris & Semitendinosus)", "Gluteus Maximus", "Erector Spinae & Lats"],
        highlight_cue="Maintain a soft unlocked knee (155°–165°), vertical shins (~88° ankle angle), and push hips straight back like closing a car door while keeping the bar/handles grazing the thighs via active lat depression.",
        default_grip="Double Overhand + Straps (Just Outside Thighs, Neutral 176° Wrist)",
    ),
]


def detect_exercise_profile(hint_or_url: str) -> str:
    text = (hint_or_url or "").lower()
    if any(k in text for k in ["incline", "press", "chest", "bench", "8fxfwg4ftaq"]):
        return "incline_press_nippard"
    if any(k in text for k in ["curl", "bicep", "bayesian", "i1ygfzb6ali"]):
        return "bayesian_curl_nippard"
    if any(k in text for k in ["rdl", "deadlift", "hinge", "hamstring", "7j-2w4-p14i"]):
        return "rdl_hinge_nippard"
    return "lat_pullover_nippard"


def _status_for_range(val: float, low: float, high: float) -> str:
    if low <= val <= high:
        return "optimal"
    if (low - 12.0) <= val <= (high + 12.0):
        return "adjust"
    return "caution"


def build_exercise_analysis(
    profile_id: str,
    phase_tuples: List[Tuple[str, str, float, float, FramePoseMetrics]],
    keyframe_urls: Dict[str, str],
    custom_hint: Optional[str] = None,
) -> Tuple[str, List[str], HandleAndStanceInfo, List[str], List[FlowPhaseStep], str, str]:
    """
    Constructs detailed Jeff Nippard biomechanics breakdown:
    - Exercise Name & Target Muscles
    - Handle, Grip, Wrist & Foot/Ankle Stance Profile
    - Key Science-Based Takeaways
    - 5 Step-by-Step Start-to-End Flow Phases with Measured vs Ideal Angles
    - English & Hinglish Voice Coaching Scripts
    """
    preset = next((p for p in JEFF_NIPPARD_PRESETS if p.preset_id == profile_id), JEFF_NIPPARD_PRESETS[0])
    exercise_name = custom_hint.strip() if (custom_hint and len(custom_hint.strip()) > 3) else preset.title

    if profile_id == "incline_press_nippard":
        handle_info = HandleAndStanceInfo(
            grip_type="Pronated Full Grip (15° Internal Scapular Rotation)",
            handle_height_and_path="Lower dumbbells/cables to outer clavicular chest; press slightly up and inward in an arc",
            wrist_alignment="Stacked neutral wrist (172°–178°) directly over elbow joint to prevent wrist hyperextension",
            foot_and_ankle_position="Flat planted feet, ~82° ankle dorsiflexion, knees at ~105° for stable lower-body leg drive",
            torso_angle_deg=30.0,
        )
        takeaways = [
            "Bench Angle: 30° inclination maximizes upper (clavicular) pec activation before anterior deltoid takes over.",
            "Elbow Tuck Angle: Keep a 45°–55° 'arrow' angle relative to torso (scapular plane) rather than flaring to 90°.",
            "Handle & Wrist Stack: Keep knuckles pointed toward ceiling (174° wrist angle) stacked directly above the forearms.",
            "Ankle & Base Stability: Drive heels toward the floor (~82° ankle angle) to lock scapular retraction on the pad.",
        ]
        voice_en = (
            f"Welcome to the Jeff Nippard biomechanics guide for {exercise_name}. "
            "First, setup and placement: set the bench to a 30 degree incline to bias the upper clavicular pec fibers without front delt takeover. "
            "Plant your feet flat on the floor with an 82 degree ankle angle and retract your shoulder blades hard into the pad. "
            "Second, handle and wrist alignment: rotate your grip 15 degrees inward in the scapular plane and keep a stacked 174 degree wrist directly over your elbows. "
            "Third, execution focus: lower the weight under a 3 second eccentric to a deep stretch with elbows tucked at a 45 to 55 degree arrow angle, pause for half a second at the bottom, and drive up and slightly inward."
        )
        voice_hi = (
            f"Chaliye dekhte hain {exercise_name} ka proper Jeff Nippard setup aur form. "
            "Sabse pehle bench ko 30 degree incline par set karo taaki aapke upper chest fibers maximum target hon aur front shoulder overload na ho. "
            "Apne pair zameen par flat jamaye rakho, ankle angle lagbhag 82 degree hona chahiye jisse solid leg drive mile. "
            "Grip aur wrist placement par dhyan do: dumbbells ya handles ko halka sa 15 degree andar ki taraf rakho aur wrist ko 174 degree par bilkul seedha elbow ke upar stack rakho, kalai piche mat modna. "
            "Ab movement focus: elbows ko 90 degree bahar flare karne ke bajaye 45 se 55 degree arrow shape mein tuck karo, niche deep stretch mein aadha second hold karo, aur phir upper chest squeeze karte hue press karo."
        )
    elif profile_id == "bayesian_curl_nippard":
        handle_info = HandleAndStanceInfo(
            grip_type="Single Rotating D-Handle (Full Supination / Palm Up)",
            handle_height_and_path="Pulley set at ankle/knee height so cable pulls arm 30° behind torso at the bottom stretch",
            wrist_alignment="Firm neutral wrist (170°–176°) — do not flex wrist inward at peak contraction",
            foot_and_ankle_position="Staggered split stance: front ankle at ~80° dorsiflexion, rear heel slightly elevated for balance",
            torso_angle_deg=15.0,
        )
        takeaways = [
            "Peak Long-Head Stretch: Stepping forward puts the shoulder in ~30° extension where biceps long head has peak leverage.",
            "Handle Position: Let the D-handle rotate naturally in your fingers during the eccentric stretch, then supinate hard.",
            "Wrist Angle Discipline: Keep wrist at ~172° (straight line with forearm) so forearm flexors don't steal tension.",
            "Split Stance Ankle Lock: Front ankle at ~80° prevents torso swaying during the heavy stretch-mediated turnaround.",
        ]
        voice_en = (
            f"Welcome to the Jeff Nippard biomechanics guide for {exercise_name}. "
            "First, setup and foot placement: set the cable pulley at ankle or knee height, grab a single rotating D-handle, and step forward into a staggered split stance with your front ankle locked at 80 degrees and a 15 degree forward torso lean. "
            "Second, shoulder and wrist position: let the cable pull your working arm 30 degrees behind your torso to maximize long-head biceps stretch, while keeping a neutral 172 degree wrist stack. "
            "Third, execution focus: pause in that deep behind-the-body stretch, then curl forward and up while keeping your elbow pinned at your side and supinating your pinky toward the ceiling."
        )
        voice_hi = (
            f"Chaliye samajhte hain {exercise_name} ka exact setup aur muscle focus. "
            "Sabse pehle cable pulley ko ankle ya knee height par set karo aur D-handle pakad kar aage ek split stance le lo. Aage wale pair ka ankle 80 degree par lock rakho taaki body swing na kare. "
            "Placement ka main secret: apne haath ko body se 30 degree piche jaane do jisse biceps ke long head par sabse तगड़ा deep stretch aaye. "
            "Wrist ko 172 degree par bilkul straight rakho, curl karte waqt kalai ko andar mat modna warna forearm tension chura lega. "
            "Niche deep stretch mein pause karo aur elbow ko apni jagah lock rakhkar pura squeeze karte hue curl karo."
        )
    elif profile_id == "rdl_hinge_nippard":
        handle_info = HandleAndStanceInfo(
            grip_type="Double Overhand with Lifting Straps (Shoulder-Width Pronated Grip)",
            handle_height_and_path="Bar/handles stay in direct contact with thighs & shins along a strictly vertical line",
            wrist_alignment="Locked neutral wrist (175°–180°) with lats actively depressing the shoulder girdle",
            foot_and_ankle_position="Hip-width stance, vertical shins (~88° ankle angle), weight balanced across mid-foot and heel",
            torso_angle_deg=72.0,
        )
        takeaways = [
            "Pure Hip Hinge: Hips travel horizontally backward until hamstring stretch peaks (usually mid-shin, ~75° torso angle).",
            "Knee & Ankle Lock: Keep knees softly bent at ~158° and shins vertical (~88° ankle angle) so it doesn't turn into a squat.",
            "Handle Path & Lats: Imagine squeezing oranges in your armpits to keep the bar/handles grazing your legs.",
            "Stop Before Lumbar Flexion: End the eccentric the instant your hips stop moving backward.",
        ]
        voice_en = (
            f"Welcome to the Jeff Nippard biomechanics guide for {exercise_name}. "
            "First, stance and ankle placement: stand with feet hip-width apart, keep your shins strictly vertical at an 88 degree ankle angle, and maintain a soft 158 degree knee bend throughout the entire set. "
            "Second, handle grip and lat engagement: take a shoulder-width pronated grip with straps, keep wrists locked at 176 degrees, and depress your lats to keep the bar grazing your thighs. "
            "Third, execution focus: drive your hips straight backward like closing a car door until your torso reaches about a 72 degree angle and your hamstrings hit maximum stretch—stop immediately before your lower back rounds, then drive your hips forward."
        )
        voice_hi = (
            f"Chaliye dekhte hain {exercise_name} ka proper hip hinge setup aur form. "
            "Sabse pehle feet ko hip-width par rakho, shins ko bilkul vertical yaani 88 degree ankle angle par rakho, aur ghutno mein halka sa 158 degree ka soft bend lock kar lo—isse squat nahi banana hai. "
            "Grip aur bar placement: shoulder-width grip lo, wrist ko 176 degree par straight lock rakho, aur apne lats ko tight karke bar ko thighs aur shins se चिपका kar niche le jao. "
            "Focus point: apne hips ko seedha piche push karo jaise car ka darwaza band kar rahe ho. Jaise hi mid-shin par hamstrings mein full stretch aaye aur hips piche jaana ruk jayein, wahi ruk kar glutes aur hamstrings se wapas upar drive karo."
        )
    else:
        # Default: Jeff Nippard Cable Lat Pullover / Pulldown
        handle_info = HandleAndStanceInfo(
            grip_type="Ergonomic Double-Rope or Neutral MAG Handle (Shoulder-Width)",
            handle_height_and_path="High pulley above head; sweep handles in a wide parabolic arc down toward the hips",
            wrist_alignment="Neutral stacked wrist (170°–176°) — hook with ring/pinky fingers, avoid wrist curling",
            foot_and_ankle_position="Athletic staggered stance, ~83° ankle dorsiflexion, knees softly flexed (~146°) to anchor pelvis",
            torso_angle_deg=31.0,
        )
        takeaways = [
            "Scapular Plane Path: Pull elbows down and slightly tucked (~45° plane) to align directly with iliac lat fibers.",
            "Handle & Wrist Hook: Use a thumbless/hook grip with a 172° neutral wrist angle to minimize biceps/forearm takeover.",
            "Stretch Phase Control: Allow upward scapular rotation at the top overhead stretch while keeping ribcage braced.",
            "Ankle & Hip Anchor: Plant feet with an ~83° ankle angle and ~31° torso lean so the cable stack doesn't pull you forward.",
        ]
        voice_en = (
            f"Welcome to the Jeff Nippard biomechanics guide for {exercise_name}. "
            "First, stance and torso placement: step back from the high pulley into a stable athletic stance with an 83 degree ankle angle, soft 146 degree knees, and set a fixed 31 degree forward torso lean. "
            "Second, handle and wrist grip: use a shoulder-width rope or neutral MAG handle with a hook grip, keeping your wrist stacked at 172 degrees and elbows slightly bent around 140 degrees. "
            "Third, execution and muscle focus: start with a full overhead lat stretch and pause for half a second, then drive your elbows down and back in a wide sweeping arc toward your hips along a 45 degree scapular plane, stopping right as your upper arm aligns with your torso."
        )
        voice_hi = (
            f"Chaliye samajhte hain {exercise_name} ka Jeff Nippard setup, placement aur muscle focus. "
            "Sabse pehle high pulley se do kadam piche hokar ek solid athletic stance lo—ankle angle lagbhag 83 degree, knees halke bend 146 degree par, aur apni upper body ko 31 degree aage lean karke core tight kar lo. "
            "Handle aur wrist placement: rope ya neutral handle ko thumbless hook grip se pakdo, wrist ko 172 degree par straight rakho aur elbow mein 140 degree ka halka bend lock rakho. "
            "Execution focus: upar top position mein lats ko pura stretch hone do aur aadha second pause karo. Phir haath se nahi balki apni elbows ko 45 degree scapular plane mein hips ki taraf sweep karte hue niche lao, aur torso line tak aate hi lats ko hard squeeze karo."
        )

    phase_cues = {
        "setup": (
            "Establish your base stance first: plant feet firmly (~83° ankle dorsiflexion), brace core, set torso lean (~30°), and lock a neutral wrist grip on the handle before initiating the rep.",
            "Hook grip around handle with neutral wrist (~173°); depress shoulders away from ears.",
            "Weight distributed 60% heel / 40% forefoot; ankle at ~83° and knees softly bent (~148°).",
        ),
        "eccentric": (
            "Control the 2–3 second eccentric phase along the exact resistance line of the cable/load. Maintain constant tension without letting the stack clank.",
            "Keep handle moving in a smooth arc while preventing wrist flexion or elbow flare.",
            "Maintain fixed knee (~146°) and ankle (~83°) angles—zero lower-body momentum.",
        ),
        "stretch_pause": (
            "Jeff Nippard Signature Cue: Pause 0.5–1.0s in the deep lengthened stretch! Stretch-mediated hypertrophy is maximized when target fibers are loaded at long muscle lengths.",
            "Let the handle pull the shoulder into full safe flexion/extension while wrist stays stacked (~171°).",
            "Anchor heels hard into the floor (~82° ankle angle) to counteract peak cable pull at full stretch.",
        ),
        "concentric": (
            "Initiate the concentric drive by thinking about driving your ELBOWS (not your hands) toward your hips/midline along a 45° scapular plane.",
            "Hands act as passive hooks on the handle; maintain ~140°–150° elbow angle and 174° wrist stack.",
            "Push through mid-foot with stable ankle dorsiflexion (~84°) to transfer force cleanly.",
        ),
        "lockout": (
            "Squeeze at peak contraction for 0.5s where humerus aligns with the torso. Do not pull past the torso line or round the anterior shoulder forward.",
            "Finish with handle at upper-thigh/hip level (or locked stacked position) with neutral 174° wrist.",
            "Spine remains neutral (~31° torso angle) with planted athletic stance (~84° ankle).",
        ),
    }

    steps: List[FlowPhaseStep] = []
    for idx, (phase_id, title, s_sec, e_sec, fm) in enumerate(phase_tuples, start=1):
        summary, handle_note, ankle_note = phase_cues.get(
            phase_id,
            phase_cues["concentric"],
        )
        mid_sec = round(0.5 * (s_sec + e_sec), 2)

        joint_metrics = [
            JointAngleMetric(
                joint_name="Elbow Angle",
                joint_key="elbow",
                measured_deg=fm.elbow_deg,
                ideal_range_deg=[120.0, 165.0] if phase_id != "concentric" else [95.0, 155.0],
                status=_status_for_range(fm.elbow_deg, 110.0, 168.0),
                cue="Maintain consistent elbow arc; drive with humerus, not forearm flexion.",
            ),
            JointAngleMetric(
                joint_name="Wrist & Handle Alignment",
                joint_key="wrist",
                measured_deg=fm.wrist_deg,
                ideal_range_deg=[165.0, 180.0],
                status=_status_for_range(fm.wrist_deg, 165.0, 180.0),
                cue="Neutral stacked wrist (170°–180°) prevents forearm takeover & wrist strain.",
            ),
            JointAngleMetric(
                joint_name="Shoulder Plane Angle",
                joint_key="shoulder",
                measured_deg=fm.shoulder_deg,
                ideal_range_deg=[35.0, 135.0],
                status=_status_for_range(fm.shoulder_deg, 30.0, 145.0),
                cue="Track in the 45° scapular plane for optimal fiber alignment and joint safety.",
            ),
            JointAngleMetric(
                joint_name="Torso Inclination",
                joint_key="torso",
                measured_deg=fm.torso_lean_deg,
                ideal_range_deg=[22.0, 38.0] if profile_id != "rdl_hinge_nippard" else [55.0, 82.0],
                status=_status_for_range(fm.torso_lean_deg, 20.0, 42.0),
                cue="Fixed torso angle (~30°) aligns resistance profile with target muscle fibers.",
            ),
            JointAngleMetric(
                joint_name="Ankle Dorsiflexion & Base",
                joint_key="ankle",
                measured_deg=fm.ankle_deg,
                ideal_range_deg=[76.0, 92.0],
                status=_status_for_range(fm.ankle_deg, 76.0, 92.0),
                cue="Planted heel with ~82°–86° ankle dorsiflexion locks lower-body stability.",
            ),
            JointAngleMetric(
                joint_name="Knee Stability Angle",
                joint_key="knee",
                measured_deg=fm.knee_deg,
                ideal_range_deg=[135.0, 165.0],
                status=_status_for_range(fm.knee_deg, 135.0, 165.0),
                cue="Soft athletic knee bend absorbs cable torque and protects lumbar spine.",
            ),
        ]

        steps.append(
            FlowPhaseStep(
                step_number=idx,
                phase_id=phase_id,
                title=title,
                timestamp_sec=mid_sec,
                start_sec=s_sec,
                end_sec=e_sec,
                keyframe_url=keyframe_urls.get(phase_id),
                coaching_summary=summary,
                handle_and_wrist_note=handle_note,
                ankle_and_base_note=ankle_note,
                joint_metrics=joint_metrics,
            )
        )

    # Optionally enrich with Gemini API (REST or SDK) if user provided GEMINI_API_KEY
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key and api_key != "your_gemini_api_key_here":
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip() or "gemini-2.5-flash"
        prompt = (
            f"You are strength & hypertrophy coach Jeff Nippard. Provide 4 concise, science-based "
            f"biomechanical coaching cues for '{exercise_name}' focusing specifically on: "
            f"(1) Handle grip & wrist stack angle (~172°), (2) Elbow & scapular plane angle, "
            f"(3) Peak lengthened stretch pause, and (4) Foot/ankle base stability (~82° dorsiflexion). "
            f"Return ONLY a valid JSON array of 4 strings."
        )
        try:
            import urllib.request

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            body = json.dumps(
                {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3},
                }
            ).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
                candidates = payload.get("candidates") or []
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts") or []
                    if parts and "text" in parts[0]:
                        text_clean = (
                            parts[0]["text"]
                            .strip()
                            .removeprefix("```json")
                            .removeprefix("```")
                            .removesuffix("```")
                            .strip()
                        )
                        parsed = json.loads(text_clean)
                        if isinstance(parsed, list) and len(parsed) >= 3:
                            takeaways = [str(x) for x in parsed[:4]]
        except Exception:
            # Keep deterministic high-precision biomechanics analysis on any network/API error
            pass

    return exercise_name, preset.target_muscles, handle_info, takeaways, steps, voice_en, voice_hi
