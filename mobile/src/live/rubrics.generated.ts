// GENERATED FILE -- do not edit by hand.
// Source: backend/app/rubrics/*.json
// Regenerate: cd backend && .venv/bin/python -m app.services.rubric_codegen
//
// The drift test (backend/tests/test_rubric_codegen.py) fails when this file does not match
// the JSON, so a rubric change cannot reach one tier and miss the other.

export type Rubric = Record<string, unknown>;

export const RUBRICS: Record<string, Rubric> = {
  "hack-squat": {
    "_source_file": "hack-squat.json",
    "checks": [
      {
        "almost": [
          110,
          128
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Go lower. Take your hips down between your feet.",
            "hi": "Neeche jao. Hips pairon ke beech le jao."
          },
          "almost": {
            "en": "Go a little lower. Sit down between your feet.",
            "hi": "Thoda aur neeche jao. Pairon ke beech baitho."
          },
          "below": {
            "en": "That is very deep. Come up until your thighs are level.",
            "hi": "Yeh bahut neeche hai. Upar aao jab tak jaanghein level aayein."
          },
          "fix": {
            "en": "Go lower. Take your hips down between your feet.",
            "hi": "Neeche jao. Hips pairon ke beech le jao."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          60,
          110
        ],
        "id": "depth",
        "joint": "knee",
        "label": "Depth",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          142,
          158
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Stand a little taller. Straighten your legs.",
            "hi": "Thoda aur seedhe khade ho. Pairn seedhe karo."
          },
          "fix": {
            "en": "Stand all the way up and straighten your legs.",
            "hi": "Poora khade ho jao aur pairn seedhe karo."
          },
          "good": {
            "en": "Good. You stood all the way up.",
            "hi": "Badhiya. Aap poore khade ho gaye."
          }
        },
        "good": [
          158,
          180
        ],
        "id": "lockout",
        "joint": "knee",
        "label": "Standing up",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          45,
          60
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Keep your chest up as you sit down.",
            "hi": "Neeche baithte time chest upar rakho."
          },
          "fix": {
            "en": "Your chest is falling. Keep it up and sit down.",
            "hi": "Chest gir raha hai. Upar rakho aur baitho."
          },
          "good": {
            "en": "Good. Your chest stayed up.",
            "hi": "Badhiya. Aapka chest upar raha."
          }
        },
        "good": [
          0,
          45
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Chest up",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.45,
          0.9
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Keep a steady 2 seconds down.",
            "hi": "Bahut dheere hai. Neeche aane mein 2 second rakho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds going down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way down and count 2.",
            "hi": "Bahut tez hai. Neeche control karo aur 2 gino."
          },
          "fix": {
            "en": "Too fast. Control the way down and count 2.",
            "hi": "Bahut tez hai. Neeche control karo aur 2 gino."
          },
          "good": {
            "en": "Good. You came down slowly.",
            "hi": "Badhiya. Aap dheere neeche aaye."
          }
        },
        "good": [
          0.9,
          3.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      },
      {
        "almost": [
          12,
          20
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "One leg is a little behind. Push evenly.",
            "hi": "Ek pair thoda peeche hai. Barabar dhakelo."
          },
          "fix": {
            "en": "One leg is doing less. Push evenly with both legs.",
            "hi": "Ek pair kam kar raha hai. Dono se barabar dhakelo."
          },
          "good": {
            "en": "Good. Both legs moved together.",
            "hi": "Badhiya. Dono pairn saath chale."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "knee",
        "label": "Both legs",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "squat",
    "id": "hack-squat",
    "name": "Hack Squat",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-17",
    "setup": [],
    "start_cue": {
      "en": "Stand tall, then sit down slowly and stand back up.",
      "hi": "Seedhe khade ho, phir dheere baitho aur upar aao."
    },
    "track": {
      "axis": "distance",
      "joint": "knee",
      "origin": "ankle",
      "point": "hip"
    },
    "validated": false,
    "validation_note": "Bands are the standard squat coaching ranges, not measured against a labelled clip. Unlike the press rubric, no reference footage has confirmed them yet.",
    "view": [
      "side",
      "45"
    ]
  },
  "low_incline_db_press": {
    "_source_file": "low_incline_db_press.json",
    "checks": [
      {
        "almost": [
          100,
          112
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Go lower. Take the dumbbells down to your chest.",
            "hi": "Neeche jao. Dumbbell chest tak lao."
          },
          "almost": {
            "en": "Go a little lower.",
            "hi": "Thoda aur neeche jao."
          },
          "below": {
            "en": "That is very deep. Stop when your upper arm is level.",
            "hi": "Yeh bahut neeche chala gaya. Upper arm level aate hi ruko."
          },
          "fix": {
            "en": "Lower until your upper arms are level with your torso.",
            "hi": "Neeche tab tak jao jab tak upper arm shareer ke level na aaye."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          20,
          100
        ],
        "id": "depth",
        "joint": "elbow",
        "label": "Depth",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          145,
          160
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Push a little higher. Make your arms straight.",
            "hi": "Thoda aur upar dhakelo. Haath seedhe karo."
          },
          "fix": {
            "en": "Push all the way up. Make your arms fully straight.",
            "hi": "Poora upar dhakelo. Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. Your arms went fully straight.",
            "hi": "Badhiya. Aapke haath poore seedhe hue."
          }
        },
        "good": [
          160,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          30,
          50
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Keep your wrists over your elbows.",
            "hi": "Haath kohni ke seedha upar rakho."
          },
          "fix": {
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "good": {
            "en": "Good. Your hands are right above your elbows.",
            "hi": "Badhiya. Haath kohni ke seedha upar hain."
          }
        },
        "good": [
          0,
          30
        ],
        "id": "elbow_path",
        "joint": "wrist",
        "label": "Hands",
        "measure": "wrist_vs_elbow_stack",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.45,
          0.9
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Keep a steady 2 seconds down.",
            "hi": "Bahut dheere hai. Neeche aane mein 2 second rakho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds going down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weights. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weights. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You came down slowly.",
            "hi": "Badhiya. Aap dheere neeche aaye."
          }
        },
        "good": [
          0.9,
          3.0
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      },
      {
        "almost": [
          12,
          20
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "One arm is a little behind. Move them together.",
            "hi": "Ek haath thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is much lower. Move both arms together.",
            "hi": "Ek haath bahut neeche hai. Dono haath saath chalao."
          },
          "good": {
            "en": "Good. Both arms moved together.",
            "hi": "Badhiya. Dono haath saath chale."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "symmetry",
        "joint": "elbow",
        "label": "Arms",
        "measure": "arm_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "press",
    "id": "low_incline_db_press",
    "name": "Low Incline DB Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-17",
    "setup": [
      {
        "almost": [
          20,
          45
        ],
        "cue": {
          "almost": {
            "en": "Set the bench a little higher.",
            "hi": "Bench thoda aur upar karo."
          },
          "fix": {
            "en": "Set the bench to one notch up from flat.",
            "hi": "Bench ko flat se ek notch upar set karo."
          },
          "good": {
            "en": "Good. The bench is at a low incline.",
            "hi": "Badhiya. Bench thoda sa tilted hai."
          }
        },
        "frame": "gravity",
        "good": [
          25,
          35
        ],
        "id": "bench_angle",
        "joint": "torso",
        "label": "Bench angle",
        "measure": "torso_incline",
        "space": "image2d"
      }
    ],
    "start_cue": {
      "en": "Hold the weights up, then lower them slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "view": [
      "front",
      "45"
    ]
  }
};
