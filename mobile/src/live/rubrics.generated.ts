// GENERATED FILE -- do not edit by hand.
// Source: backend/app/rubrics/*.json
// Regenerate: cd backend && .venv/bin/python -m app.services.rubric_codegen
//
// The drift test (backend/tests/test_rubric_codegen.py) fails when this file does not match
// the JSON, so a rubric change cannot reach one tier and miss the other.

export type Rubric = Record<string, unknown>;

export const RUBRICS: Record<string, Rubric> = {
  "1_arm_lat_pull_in": {
    "_generated": true,
    "_source_file": "1-arm-lat-pull-in.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "1_arm_lat_pull_in",
    "name": "1 Arm Lat Pull in",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "1_arm_reverse_pec_deck": {
    "_generated": true,
    "_source_file": "1-arm-reverse-pec-deck.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          115
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "1_arm_reverse_pec_deck",
    "name": "1 Arm Reverse Pec Deck",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "ab_wheel_rollout": {
    "_generated": true,
    "_source_file": "ab-wheel-rollout.json",
    "checks": [
      {
        "almost": [
          90,
          110
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Crunch further so your abs do the work.",
            "hi": "Aur crunch karo taaki abs kaam karein."
          },
          "almost": {
            "en": "Crunch further, bring your ribs to your hips.",
            "hi": "Aur crunch karo, ribs ko hips ke paas lao."
          },
          "below": {
            "en": "That is enough. Do not pull your back.",
            "hi": "Itna hi kaafi hai. Back ko kheencho mat."
          },
          "fix": {
            "en": "Crunch further, bring your ribs to your hips.",
            "hi": "Aur crunch karo, ribs ko hips ke paas lao."
          },
          "good": {
            "en": "Good. You curled all the way through.",
            "hi": "Badhiya. Aap poora curl kiye."
          }
        },
        "good": [
          25,
          90
        ],
        "id": "range",
        "joint": "hip",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          105,
          120
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Slow the return so the abs stretch.",
            "hi": "Wapas dheere aao taaki abs stretch hon."
          },
          "fix": {
            "en": "Slow the return so the abs stretch.",
            "hi": "Wapas dheere aao taaki abs stretch hon."
          },
          "good": {
            "en": "Good. You opened up fully at the bottom.",
            "hi": "Badhiya. Neeche aap poora khule."
          }
        },
        "good": [
          120,
          180
        ],
        "id": "stretch",
        "joint": "hip",
        "label": "Return",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "core",
    "id": "ab_wheel_rollout",
    "name": "Ab Wheel Rollout",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Lie back, then curl your ribs toward your hips.",
      "hi": "Peeche leto, phir ribs ko hips ki taraf curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "arms_extended_45_hyperextension": {
    "_generated": true,
    "_source_file": "arms-extended-45-hyperextension.json",
    "checks": [
      {
        "almost": [
          35,
          45
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Your back is rounding. Keep your chest proud and push your hips back.",
            "hi": "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."
          },
          "fix": {
            "en": "Your back is rounding. Keep your chest proud and push your hips back.",
            "hi": "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."
          },
          "good": {
            "en": "Good. Your back stayed flat as you hinged.",
            "hi": "Badhiya. Hinge karte time back flat rahi."
          }
        },
        "good": [
          45,
          95
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back flat",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          125,
          145
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "almost": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "fix": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "good": {
            "en": "Good. You pushed your hips back far enough.",
            "hi": "Badhiya. Aapne hips kaafi peeche kiye."
          }
        },
        "good": [
          65,
          125
        ],
        "id": "stretch",
        "joint": "hip",
        "label": "Hinge",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          140,
          155
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the rep standing tall with your glutes tight.",
            "hi": "Rep poora karo, seedhe khade ho aur glutes tight karo."
          },
          "fix": {
            "en": "Finish the rep standing tall with your glutes tight.",
            "hi": "Rep poora karo, seedhe khade ho aur glutes tight karo."
          },
          "good": {
            "en": "Good. You stood all the way up.",
            "hi": "Badhiya. Aap poore khade ho gaye."
          }
        },
        "good": [
          155,
          180
        ],
        "id": "lockout",
        "joint": "hip",
        "label": "Standing",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
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
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "hinge",
    "id": "arms_extended_45_hyperextension",
    "name": "Arms Extended 45 Hyperextension",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall, then push your hips back with a flat back.",
      "hi": "Seedhe khade ho, phir back flat rakhte hue hips peeche le jao."
    },
    "track": {
      "axis": "angle",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "bayesian_cable_curl": {
    "_generated": true,
    "_source_file": "bayesian-cable-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          12,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "fix": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "bayesian_cable_curl",
    "name": "Bayesian Cable Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "bent_over_cable_pec_flye_w_integrated_partials": {
    "_generated": true,
    "_source_file": "bent-over-cable-pec-flye-w-integrated-partials.json",
    "checks": [
      {
        "almost": [
          45,
          60
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Not so wide. Stop when you feel a stretch.",
            "hi": "Itna zyada nahi. Stretch lage wahan ruko."
          },
          "almost": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "below": {
            "en": "Open wider and feel the stretch across your chest.",
            "hi": "Aur phailao aur chest par stretch mehsoos karo."
          },
          "fix": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "good": {
            "en": "Good. You opened your arms wide enough.",
            "hi": "Badhiya. Aapne haath kaafi khol diye."
          }
        },
        "good": [
          60,
          100
        ],
        "id": "stretch",
        "joint": "shoulder",
        "label": "Range",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          120,
          140
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "fix": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "good": {
            "en": "Good. Your elbows stayed softly straight.",
            "hi": "Badhiya. Kohni halki seedhi rahi."
          }
        },
        "good": [
          140,
          180
        ],
        "id": "elbow_soft",
        "joint": "elbow",
        "label": "Elbows",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      },
      {
        "almost": [
          14,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "fix": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "good": {
            "en": "Good. Both arms opened together.",
            "hi": "Badhiya. Dono haath saath khule."
          }
        },
        "good": [
          0,
          14
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "bent_over_cable_pec_flye_w_integrated_partials",
    "name": "Bent Over Cable Pec Flye w Integrated Partials",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "angle",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "bottom_2_3_constant_tension_preacher_curl": {
    "_generated": true,
    "_source_file": "bottom-2-3-constant-tension-preacher-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "bottom_2_3_constant_tension_preacher_curl",
    "name": "Bottom 2 3 Constant Tension Preacher Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "cable_crunch": {
    "_generated": true,
    "_source_file": "cable-crunch.json",
    "checks": [
      {
        "almost": [
          90,
          110
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Crunch further so your abs do the work.",
            "hi": "Aur crunch karo taaki abs kaam karein."
          },
          "almost": {
            "en": "Crunch further, bring your ribs to your hips.",
            "hi": "Aur crunch karo, ribs ko hips ke paas lao."
          },
          "below": {
            "en": "That is enough. Do not pull your back.",
            "hi": "Itna hi kaafi hai. Back ko kheencho mat."
          },
          "fix": {
            "en": "Crunch further, bring your ribs to your hips.",
            "hi": "Aur crunch karo, ribs ko hips ke paas lao."
          },
          "good": {
            "en": "Good. You curled all the way through.",
            "hi": "Badhiya. Aap poora curl kiye."
          }
        },
        "good": [
          25,
          90
        ],
        "id": "range",
        "joint": "hip",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          105,
          120
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Slow the return so the abs stretch.",
            "hi": "Wapas dheere aao taaki abs stretch hon."
          },
          "fix": {
            "en": "Slow the return so the abs stretch.",
            "hi": "Wapas dheere aao taaki abs stretch hon."
          },
          "good": {
            "en": "Good. You opened up fully at the bottom.",
            "hi": "Badhiya. Neeche aap poora khule."
          }
        },
        "good": [
          120,
          180
        ],
        "id": "stretch",
        "joint": "hip",
        "label": "Return",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "core",
    "id": "cable_crunch",
    "name": "Cable Crunch",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Lie back, then curl your ribs toward your hips.",
      "hi": "Peeche leto, phir ribs ko hips ki taraf curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "cable_flye": {
    "_generated": true,
    "_source_file": "cable-flye.json",
    "checks": [
      {
        "almost": [
          45,
          60
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Not so wide. Stop when you feel a stretch.",
            "hi": "Itna zyada nahi. Stretch lage wahan ruko."
          },
          "almost": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "below": {
            "en": "Open wider and feel the stretch across your chest.",
            "hi": "Aur phailao aur chest par stretch mehsoos karo."
          },
          "fix": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "good": {
            "en": "Good. You opened your arms wide enough.",
            "hi": "Badhiya. Aapne haath kaafi khol diye."
          }
        },
        "good": [
          60,
          100
        ],
        "id": "stretch",
        "joint": "shoulder",
        "label": "Range",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          120,
          140
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "fix": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "good": {
            "en": "Good. Your elbows stayed softly straight.",
            "hi": "Badhiya. Kohni halki seedhi rahi."
          }
        },
        "good": [
          140,
          180
        ],
        "id": "elbow_soft",
        "joint": "elbow",
        "label": "Elbows",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      },
      {
        "almost": [
          14,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "fix": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "good": {
            "en": "Good. Both arms opened together.",
            "hi": "Badhiya. Dono haath saath khule."
          }
        },
        "good": [
          0,
          14
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "cable_flye",
    "name": "Cable Flye",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "angle",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "cable_paused_shrug_in": {
    "_generated": true,
    "_source_file": "cable-paused-shrug-in.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "cable_paused_shrug_in",
    "name": "Cable Paused Shrug in",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "cable_reverse_flye_mechanical_dropset": {
    "_generated": true,
    "_source_file": "cable-reverse-flye-mechanical-dropset.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          115
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is much lower. Raise both arms together.",
            "hi": "Ek haath bahut neeche hai. Dono haath saath uthao."
          },
          "good": {
            "en": "Good. Both arms went up together.",
            "hi": "Badhiya. Dono haath saath uthe."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "cable_reverse_flye_mechanical_dropset",
    "name": "Cable Reverse Flye Mechanical Dropset",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "cable_skull_crusher": {
    "_generated": true,
    "_source_file": "cable-skull-crusher.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "cable_skull_crusher",
    "name": "Cable Skull Crusher",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "cable_triceps_kickback": {
    "_generated": true,
    "_source_file": "cable-triceps-kickback.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "cable_triceps_kickback",
    "name": "Cable Triceps Kickback",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "chest_supported_machine_row": {
    "_generated": true,
    "_source_file": "chest-supported-machine-row.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "chest_supported_machine_row",
    "name": "Chest Supported Machine Row",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "chest_supported_t_bar_row": {
    "_generated": true,
    "_source_file": "chest-supported-t-bar-row.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "chest_supported_t_bar_row",
    "name": "Chest Supported T Bar Row",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "chest_supported_t_bar_row_kelso_shrug": {
    "_generated": true,
    "_source_file": "chest-supported-t-bar-row-kelso-shrug.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "chest_supported_t_bar_row_kelso_shrug",
    "name": "Chest Supported T Bar Row Kelso Shrug",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "close_grip_lat_pulldown": {
    "_generated": true,
    "_source_file": "close-grip-lat-pulldown.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "close_grip_lat_pulldown",
    "name": "Close Grip Lat Pulldown",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "concentration_cable_curl": {
    "_generated": true,
    "_source_file": "concentration-cable-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "concentration_cable_curl",
    "name": "Concentration Cable Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "cross_body_cable_y_raise": {
    "_generated": true,
    "_source_file": "cross-body-cable-y-raise.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          165
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "cross_body_cable_y_raise",
    "name": "Cross Body Cable Y Raise",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "cross_body_lat_pull_around": {
    "_generated": true,
    "_source_file": "cross-body-lat-pull-around.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "cross_body_lat_pull_around",
    "name": "Cross Body Lat Pull Around",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "cuffed_behind_the_back_lateral_raise": {
    "_generated": true,
    "_source_file": "cuffed-behind-the-back-lateral-raise.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          115
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "cuffed_behind_the_back_lateral_raise",
    "name": "Cuffed Behind the Back Lateral Raise",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "db-lateral-raise": {
    "_generated": true,
    "_source_file": "db-lateral-raise.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Not above the shoulder. Stop at shoulder height.",
            "hi": "Kandhe se zyada upar nahi. Kandhe tak hi ruko."
          },
          "almost": {
            "en": "A little higher. Lift to shoulder height.",
            "hi": "Thoda aur upar. Kandhe ki height tak uthao."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift to shoulder height, no higher.",
            "hi": "Kandhe ki height tak uthao, usse zyada nahi."
          },
          "good": {
            "en": "Good. You raised the weights to shoulder height.",
            "hi": "Badhiya. Weight kandhe tak uthaya."
          }
        },
        "good": [
          75,
          105
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "A bit fast. Count 2 seconds coming down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weights. Count 2.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weights. Count 2.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You lowered the weights slowly.",
            "hi": "Badhiya. Weight dheere neeche laaya."
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
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "One arm is a little lower. Raise both evenly.",
            "hi": "Ek haath thoda neeche hai. Dono barabar uthao."
          },
          "fix": {
            "en": "One arm is much lower. Raise both arms together.",
            "hi": "Ek haath bahut neeche hai. Dono haath saath uthao."
          },
          "good": {
            "en": "Good. Both arms went up together.",
            "hi": "Badhiya. Dono haath saath uthe."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "db-lateral-raise",
    "name": "DB Lateral Raise",
    "phases": [
      "setup",
      "concentric",
      "top",
      "eccentric"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are standard lateral-raise coaching ranges, not measured against a labelled clip. No reference footage has confirmed them.",
    "view": [
      "front",
      "45"
    ]
  },
  "db_bench_press": {
    "_generated": true,
    "_source_file": "db-bench-press.json",
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
            "en": "Go lower. Take the weight down to your chest.",
            "hi": "Neeche jao. Weight chest tak lao."
          },
          "almost": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "below": {
            "en": "That is very deep. Stop when your upper arm is level.",
            "hi": "Yeh bahut neeche hai. Upper arm level aate hi ruko."
          },
          "fix": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          25,
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
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "fix": {
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "good": {
            "en": "Good. Your arms finished straight.",
            "hi": "Badhiya. Haath poore seedhe hue."
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
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "fix": {
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "good": {
            "en": "Good. Your hands stayed over your elbows.",
            "hi": "Badhiya. Haath kohni ke upar rahe."
          }
        },
        "good": [
          0,
          30
        ],
        "id": "hands",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
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
        "id": "even",
        "joint": "elbow",
        "label": "Arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "db_bench_press",
    "name": "DB Bench Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "forearm",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "db_calf_jumps": {
    "_generated": true,
    "_source_file": "db-calf-jumps.json",
    "checks": [
      {
        "almost": [
          98,
          110
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "below": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "fix": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "good": {
            "en": "Good. You came up onto your toes fully.",
            "hi": "Badhiya. Aap poore toes par aaye."
          }
        },
        "good": [
          110,
          165
        ],
        "id": "range",
        "joint": "ankle",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          100,
          112
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "almost": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "fix": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "good": {
            "en": "Good. You let the heel drop fully.",
            "hi": "Badhiya. Aapne heel poora neeche kiya."
          }
        },
        "good": [
          55,
          100
        ],
        "id": "stretch",
        "joint": "ankle",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way down. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way down. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "calf",
    "id": "db_calf_jumps",
    "name": "DB Calf Jumps",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand on the edge of a step, then rise onto your toes.",
      "hi": "Step ke kinare khade ho, phir toes par upar aao."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "ankle",
      "origin": "knee",
      "point": "foot_index"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "db_walking_lunge": {
    "_generated": true,
    "_source_file": "db-walking-lunge.json",
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
            "en": "Go lower. Take your hips down between your feet.",
            "hi": "Neeche jao. Hips pairon ke beech le jao."
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
            "en": "Stand all the way up and straighten your legs.",
            "hi": "Poora khade ho jao aur pairn seedhe karo."
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
            "en": "Your chest is falling. Keep it up as you sit down.",
            "hi": "Chest gir raha hai. Neeche baithte time chest upar rakho."
          },
          "fix": {
            "en": "Your chest is falling. Keep it up as you sit down.",
            "hi": "Chest gir raha hai. Neeche baithte time chest upar rakho."
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
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
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "squat_lunge",
    "id": "db_walking_lunge",
    "name": "DB Walking Lunge",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
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
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "decline_machine_chest_press": {
    "_generated": true,
    "_source_file": "decline-machine-chest-press.json",
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
            "en": "Go lower. Take the weight down to your chest.",
            "hi": "Neeche jao. Weight chest tak lao."
          },
          "almost": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "below": {
            "en": "That is very deep. Stop when your upper arm is level.",
            "hi": "Yeh bahut neeche hai. Upper arm level aate hi ruko."
          },
          "fix": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          25,
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
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "fix": {
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "good": {
            "en": "Good. Your arms finished straight.",
            "hi": "Badhiya. Haath poore seedhe hue."
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
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "fix": {
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "good": {
            "en": "Good. Your hands stayed over your elbows.",
            "hi": "Badhiya. Haath kohni ke upar rahe."
          }
        },
        "good": [
          0,
          30
        ],
        "id": "hands",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
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
        "id": "even",
        "joint": "elbow",
        "label": "Arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "decline_machine_chest_press",
    "name": "Decline Machine Chest Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "forearm",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "deficit_pushup": {
    "_generated": true,
    "_source_file": "deficit-pushup.json",
    "checks": [
      {
        "almost": [
          110,
          130
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower your chest closer to the floor.",
            "hi": "Chest ko floor ke aur paas lao."
          },
          "below": {
            "en": "Do not sink that low. Stop a fist above the floor.",
            "hi": "Itna neeche nahi. Floor se mutthi bhar upar ruko."
          },
          "fix": {
            "en": "Lower your chest closer to the floor.",
            "hi": "Chest ko floor ke aur paas lao."
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
        "joint": "elbow",
        "label": "Depth",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          140,
          155
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Push all the way up.",
            "hi": "Poora upar dhakelo."
          },
          "fix": {
            "en": "Push all the way up.",
            "hi": "Poora upar dhakelo."
          },
          "good": {
            "en": "Good. Your arms finished straight.",
            "hi": "Badhiya. Haath poore seedhe hue."
          }
        },
        "good": [
          155,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Top",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          30,
          45
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Your hips are sagging or piking. Keep one straight line.",
            "hi": "Hips gir rahe hain ya uthe hue hain. Ek seedhi line rakho."
          },
          "fix": {
            "en": "Your hips are sagging or piking. Keep one straight line.",
            "hi": "Hips gir rahe hain ya uthe hue hain. Ek seedhi line rakho."
          },
          "good": {
            "en": "Good. Your back stayed in one line.",
            "hi": "Badhiya. Aapki back ek line mein rahi."
          }
        },
        "good": [
          0,
          30
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Lower yourself under control. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche control se aao. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Lower yourself under control. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche control se aao. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "deficit_pushup",
    "name": "Deficit Pushup",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "forearm",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "dual_cable_triceps_press": {
    "_generated": true,
    "_source_file": "dual-cable-triceps-press.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
      },
      {
        "almost": [
          18,
          30
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "fix": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          18
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "dual_cable_triceps_press",
    "name": "Dual Cable Triceps Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "dual_handle_lat_pulldown_mid_back_lats": {
    "_generated": true,
    "_source_file": "dual-handle-lat-pulldown-mid-back-lats.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "dual_handle_lat_pulldown_mid_back_lats",
    "name": "Dual Handle Lat Pulldown Mid Back Lats",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "ez_bar_cheat_curl": {
    "_generated": true,
    "_source_file": "ez-bar-cheat-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          12,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "fix": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "ez_bar_cheat_curl",
    "name": "EZ Bar Cheat Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "ez_bar_skull_crusher": {
    "_generated": true,
    "_source_file": "ez-bar-skull-crusher.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "ez_bar_skull_crusher",
    "name": "EZ Bar Skull Crusher",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "glute_kickback": {
    "_generated": true,
    "_source_file": "glute-kickback.json",
    "checks": [
      {
        "almost": [
          155,
          168
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "almost": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "fix": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "good": {
            "en": "Good. You moved through a full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          90,
          155
        ],
        "id": "range",
        "joint": "hip",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "hip_isolation",
    "id": "glute_kickback",
    "name": "Glute Kickback",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall, then move your leg out to the side.",
      "hi": "Seedhe khade ho, phir pair side mein le jao."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
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
  "hammer_curl": {
    "_generated": true,
    "_source_file": "hammer-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          12,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "fix": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "hammer_curl",
    "name": "Hammer Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "hammer_preacher_curl": {
    "_generated": true,
    "_source_file": "hammer-preacher-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "hammer_preacher_curl",
    "name": "Hammer Preacher Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "incline_db_stretch_curl": {
    "_generated": true,
    "_source_file": "incline-db-stretch-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "incline_db_stretch_curl",
    "name": "Incline DB Stretch Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "incline_db_y_raise": {
    "_generated": true,
    "_source_file": "incline-db-y-raise.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          165
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is much lower. Raise both arms together.",
            "hi": "Ek haath bahut neeche hai. Dono haath saath uthao."
          },
          "good": {
            "en": "Good. Both arms went up together.",
            "hi": "Badhiya. Dono haath saath uthe."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "incline_db_y_raise",
    "name": "Incline DB Y Raise",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "inverse_db_zottman_curl": {
    "_generated": true,
    "_source_file": "inverse-db-zottman-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          12,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "fix": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "inverse_db_zottman_curl",
    "name": "Inverse DB Zottman Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "katana_triceps_extension": {
    "_generated": true,
    "_source_file": "katana-triceps-extension.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
      },
      {
        "almost": [
          18,
          30
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "fix": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          18
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "katana_triceps_extension",
    "name": "Katana Triceps Extension",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "kneeling_overhead_cable_curl": {
    "_generated": true,
    "_source_file": "kneeling-overhead-cable-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          12,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "fix": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "kneeling_overhead_cable_curl",
    "name": "Kneeling Overhead Cable Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "lat_focused_cable_row": {
    "_generated": true,
    "_source_file": "lat-focused-cable-row.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "lat_focused_cable_row",
    "name": "Lat Focused Cable Row",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "lean_back_lat_pulldown": {
    "_generated": true,
    "_source_file": "lean-back-lat-pulldown.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "lean_back_lat_pulldown",
    "name": "Lean Back Lat Pulldown",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "leg_extension": {
    "_generated": true,
    "_source_file": "leg-extension.json",
    "checks": [
      {
        "almost": [
          90,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "below": {
            "en": "That is far enough. Do not force more.",
            "hi": "Itna hi kaafi hai. Zyada zor mat lagao."
          },
          "fix": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "good": {
            "en": "Good. You moved through the full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          20,
          90
        ],
        "id": "range",
        "joint": "knee",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "fix": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "good": {
            "en": "Good. You finished the movement.",
            "hi": "Badhiya. Aapne movement poora kiya."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "knee",
        "label": "Finish",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "leg_isolation",
    "id": "leg_extension",
    "name": "Leg Extension",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set up on the machine and move through the full range.",
      "hi": "Machine par set ho, poora range cover karo."
    },
    "track": {
      "axis": "distance",
      "joint": "knee",
      "origin": "ankle",
      "point": "hip"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "leg_press": {
    "_generated": true,
    "_source_file": "leg-press.json",
    "checks": [
      {
        "almost": [
          90,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "below": {
            "en": "That is far enough. Do not force more.",
            "hi": "Itna hi kaafi hai. Zyada zor mat lagao."
          },
          "fix": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "good": {
            "en": "Good. You moved through the full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          20,
          90
        ],
        "id": "range",
        "joint": "knee",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "fix": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "good": {
            "en": "Good. You finished the movement.",
            "hi": "Badhiya. Aapne movement poora kiya."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "knee",
        "label": "Finish",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "leg_isolation",
    "id": "leg_press",
    "name": "Leg Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set up on the machine and move through the full range.",
      "hi": "Machine par set ho, poora range cover karo."
    },
    "track": {
      "axis": "distance",
      "joint": "knee",
      "origin": "ankle",
      "point": "hip"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "leg_press_calf_press": {
    "_generated": true,
    "_source_file": "leg-press-calf-press.json",
    "checks": [
      {
        "almost": [
          98,
          110
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "below": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "fix": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "good": {
            "en": "Good. You came up onto your toes fully.",
            "hi": "Badhiya. Aap poore toes par aaye."
          }
        },
        "good": [
          110,
          165
        ],
        "id": "range",
        "joint": "ankle",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          100,
          112
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "almost": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "fix": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "good": {
            "en": "Good. You let the heel drop fully.",
            "hi": "Badhiya. Aapne heel poora neeche kiya."
          }
        },
        "good": [
          55,
          100
        ],
        "id": "stretch",
        "joint": "ankle",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way down. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way down. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "calf",
    "id": "leg_press_calf_press",
    "name": "Leg Press Calf Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand on the edge of a step, then rise onto your toes.",
      "hi": "Step ke kinare khade ho, phir toes par upar aao."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "ankle",
      "origin": "knee",
      "point": "foot_index"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
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
  },
  "low_incline_dumbbell_flye": {
    "_generated": true,
    "_source_file": "low-incline-dumbbell-flye.json",
    "checks": [
      {
        "almost": [
          45,
          60
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Not so wide. Stop when you feel a stretch.",
            "hi": "Itna zyada nahi. Stretch lage wahan ruko."
          },
          "almost": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "below": {
            "en": "Open wider and feel the stretch across your chest.",
            "hi": "Aur phailao aur chest par stretch mehsoos karo."
          },
          "fix": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "good": {
            "en": "Good. You opened your arms wide enough.",
            "hi": "Badhiya. Aapne haath kaafi khol diye."
          }
        },
        "good": [
          60,
          100
        ],
        "id": "stretch",
        "joint": "shoulder",
        "label": "Range",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          120,
          140
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "fix": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "good": {
            "en": "Good. Your elbows stayed softly straight.",
            "hi": "Badhiya. Kohni halki seedhi rahi."
          }
        },
        "good": [
          140,
          180
        ],
        "id": "elbow_soft",
        "joint": "elbow",
        "label": "Elbows",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      },
      {
        "almost": [
          14,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "fix": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "good": {
            "en": "Good. Both arms opened together.",
            "hi": "Badhiya. Dono haath saath khule."
          }
        },
        "good": [
          0,
          14
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "low_incline_dumbbell_flye",
    "name": "Low Incline Dumbbell Flye",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "angle",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "low_incline_smith_machine_press": {
    "_generated": true,
    "_source_file": "low-incline-smith-machine-press.json",
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
            "en": "Go lower. Take the weight down to your chest.",
            "hi": "Neeche jao. Weight chest tak lao."
          },
          "almost": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "below": {
            "en": "That is very deep. Stop when your upper arm is level.",
            "hi": "Yeh bahut neeche hai. Upper arm level aate hi ruko."
          },
          "fix": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          25,
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
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "fix": {
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "good": {
            "en": "Good. Your arms finished straight.",
            "hi": "Badhiya. Haath poore seedhe hue."
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
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "fix": {
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "good": {
            "en": "Good. Your hands stayed over your elbows.",
            "hi": "Badhiya. Haath kohni ke upar rahe."
          }
        },
        "good": [
          0,
          30
        ],
        "id": "hands",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
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
        "id": "even",
        "joint": "elbow",
        "label": "Arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "low_incline_smith_machine_press",
    "name": "Low Incline Smith Machine Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "forearm",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "lying_leg_curl": {
    "_generated": true,
    "_source_file": "lying-leg-curl.json",
    "checks": [
      {
        "almost": [
          90,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "below": {
            "en": "That is far enough. Do not force more.",
            "hi": "Itna hi kaafi hai. Zyada zor mat lagao."
          },
          "fix": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "good": {
            "en": "Good. You moved through the full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          20,
          90
        ],
        "id": "range",
        "joint": "knee",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "fix": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "good": {
            "en": "Good. You finished the movement.",
            "hi": "Badhiya. Aapne movement poora kiya."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "knee",
        "label": "Top",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "leg_isolation",
    "id": "lying_leg_curl",
    "name": "Lying Leg Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set up on the machine and move through the full range.",
      "hi": "Machine par set ho, poora range cover karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "knee",
      "origin": "ankle",
      "point": "hip"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "lying_paused_rope_face_pull": {
    "_generated": true,
    "_source_file": "lying-paused-rope-face-pull.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "lying_paused_rope_face_pull",
    "name": "Lying Paused Rope Face Pull",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "machine_chest_press": {
    "_generated": true,
    "_source_file": "machine-chest-press.json",
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
            "en": "Go lower. Take the weight down to your chest.",
            "hi": "Neeche jao. Weight chest tak lao."
          },
          "almost": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "below": {
            "en": "That is very deep. Stop when your upper arm is level.",
            "hi": "Yeh bahut neeche hai. Upper arm level aate hi ruko."
          },
          "fix": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          25,
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
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "fix": {
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "good": {
            "en": "Good. Your arms finished straight.",
            "hi": "Badhiya. Haath poore seedhe hue."
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
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "fix": {
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "good": {
            "en": "Good. Your hands stayed over your elbows.",
            "hi": "Badhiya. Haath kohni ke upar rahe."
          }
        },
        "good": [
          0,
          30
        ],
        "id": "hands",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
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
        "id": "even",
        "joint": "elbow",
        "label": "Arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "machine_chest_press",
    "name": "Machine Chest Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "forearm",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "machine_hip_abduction": {
    "_generated": true,
    "_source_file": "machine-hip-abduction.json",
    "checks": [
      {
        "almost": [
          155,
          168
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "almost": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "fix": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "good": {
            "en": "Good. You moved through a full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          90,
          155
        ],
        "id": "range",
        "joint": "hip",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "hip_isolation",
    "id": "machine_hip_abduction",
    "name": "Machine Hip Abduction",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall, then move your leg out to the side.",
      "hi": "Seedhe khade ho, phir pair side mein le jao."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "machine_hip_adduction": {
    "_generated": true,
    "_source_file": "machine-hip-adduction.json",
    "checks": [
      {
        "almost": [
          155,
          168
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "almost": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "fix": {
            "en": "Move further out to the side.",
            "hi": "Side mein aur door le jao."
          },
          "good": {
            "en": "Good. You moved through a full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          90,
          155
        ],
        "id": "range",
        "joint": "hip",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "hip_isolation",
    "id": "machine_hip_adduction",
    "name": "Machine Hip Adduction",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall, then move your leg out to the side.",
      "hi": "Seedhe khade ho, phir pair side mein le jao."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "machine_lat_pullover": {
    "_generated": true,
    "_source_file": "machine-lat-pullover.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "machine_lat_pullover",
    "name": "Machine Lat Pullover",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "machine_lateral_raise": {
    "_generated": true,
    "_source_file": "machine-lateral-raise.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          115
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is much lower. Raise both arms together.",
            "hi": "Ek haath bahut neeche hai. Dono haath saath uthao."
          },
          "good": {
            "en": "Good. Both arms went up together.",
            "hi": "Badhiya. Dono haath saath uthe."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "machine_lateral_raise",
    "name": "Machine Lateral Raise",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "machine_shoulder_press": {
    "_generated": true,
    "_source_file": "machine-shoulder-press.json",
    "checks": [
      {
        "almost": [
          100,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Go lower, down to ear height.",
            "hi": "Neeche jao, kaan ki height tak."
          },
          "almost": {
            "en": "Lower the weight to ear height.",
            "hi": "Weight kaan ki height tak lao."
          },
          "below": {
            "en": "Not below ear height. Stop there.",
            "hi": "Kaan se neeche nahi. Wahin ruko."
          },
          "fix": {
            "en": "Lower the weight to ear height.",
            "hi": "Weight kaan ki height tak lao."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          25,
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
            "en": "Push all the way up.",
            "hi": "Poora upar dhakelo."
          },
          "fix": {
            "en": "Push all the way up.",
            "hi": "Poora upar dhakelo."
          },
          "good": {
            "en": "Good. Your arms finished straight.",
            "hi": "Badhiya. Haath poore seedhe hue."
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
          20,
          32
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning back. Keep your ribs down.",
            "hi": "Aap peeche jhuk rahe hain. Ribs neeche rakho."
          },
          "fix": {
            "en": "You are leaning back. Keep your ribs down.",
            "hi": "Aap peeche jhuk rahe hain. Ribs neeche rakho."
          },
          "good": {
            "en": "Good. Your back stayed tall.",
            "hi": "Badhiya. Aapki back seedhi rahi."
          }
        },
        "good": [
          0,
          20
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Lower under control. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche control se aao. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Lower under control. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche control se aao. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
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
        "id": "even",
        "joint": "elbow",
        "label": "Arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "shoulder_press",
    "id": "machine_shoulder_press",
    "name": "Machine Shoulder Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight at shoulder height, then press up.",
      "hi": "Weight kandhe par rakho, phir upar dhakelo."
    },
    "track": {
      "axis": "forearm",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "medicine_ball_russian_twists": {
    "_generated": true,
    "_source_file": "medicine-ball-russian-twists.json",
    "checks": [
      {
        "almost": [
          90,
          110
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Crunch further so your abs do the work.",
            "hi": "Aur crunch karo taaki abs kaam karein."
          },
          "almost": {
            "en": "Crunch further, bring your ribs to your hips.",
            "hi": "Aur crunch karo, ribs ko hips ke paas lao."
          },
          "below": {
            "en": "That is enough. Do not pull your back.",
            "hi": "Itna hi kaafi hai. Back ko kheencho mat."
          },
          "fix": {
            "en": "Crunch further, bring your ribs to your hips.",
            "hi": "Aur crunch karo, ribs ko hips ke paas lao."
          },
          "good": {
            "en": "Good. You curled all the way through.",
            "hi": "Badhiya. Aap poora curl kiye."
          }
        },
        "good": [
          25,
          90
        ],
        "id": "range",
        "joint": "hip",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          105,
          120
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Slow the return so the abs stretch.",
            "hi": "Wapas dheere aao taaki abs stretch hon."
          },
          "fix": {
            "en": "Slow the return so the abs stretch.",
            "hi": "Wapas dheere aao taaki abs stretch hon."
          },
          "good": {
            "en": "Good. You opened up fully at the bottom.",
            "hi": "Badhiya. Neeche aap poora khule."
          }
        },
        "good": [
          120,
          180
        ],
        "id": "stretch",
        "joint": "hip",
        "label": "Return",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "core",
    "id": "medicine_ball_russian_twists",
    "name": "Medicine Ball Russian Twists",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Lie back, then curl your ribs toward your hips.",
      "hi": "Peeche leto, phir ribs ko hips ki taraf curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "n1_style_short_head_curl": {
    "_generated": true,
    "_source_file": "n1-style-short-head-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          12,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "fix": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "n1_style_short_head_curl",
    "name": "N1 Style Short Head Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "overhead_cable_triceps_extension_bar": {
    "_generated": true,
    "_source_file": "overhead-cable-triceps-extension-bar.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
      },
      {
        "almost": [
          18,
          30
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "fix": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          18
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "overhead_cable_triceps_extension_bar",
    "name": "Overhead Cable Triceps Extension Bar",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "paused_assisted_dip": {
    "_generated": true,
    "_source_file": "paused-assisted-dip.json",
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
            "en": "Go lower. Take the weight down to your chest.",
            "hi": "Neeche jao. Weight chest tak lao."
          },
          "almost": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "below": {
            "en": "That is very deep. Stop when your upper arm is level.",
            "hi": "Yeh bahut neeche hai. Upper arm level aate hi ruko."
          },
          "fix": {
            "en": "Take the weight down to your chest.",
            "hi": "Weight chest tak neeche lao."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          25,
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
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "fix": {
            "en": "Push all the way up and straighten your arms.",
            "hi": "Poora upar dhakelo aur haath seedhe karo."
          },
          "good": {
            "en": "Good. Your arms finished straight.",
            "hi": "Badhiya. Haath poore seedhe hue."
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
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "fix": {
            "en": "Your hands drift. Keep wrists stacked over elbows.",
            "hi": "Haath hat rahe hain. Kohni ke seedha upar rakho."
          },
          "good": {
            "en": "Good. Your hands stayed over your elbows.",
            "hi": "Badhiya. Haath kohni ke upar rahe."
          }
        },
        "good": [
          0,
          30
        ],
        "id": "hands",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
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
        "id": "even",
        "joint": "elbow",
        "label": "Arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "paused_assisted_dip",
    "name": "Paused Assisted Dip",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "forearm",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "paused_barbell_rdl": {
    "_generated": true,
    "_source_file": "paused-barbell-rdl.json",
    "checks": [
      {
        "almost": [
          35,
          45
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Your back is rounding. Keep your chest proud and push your hips back.",
            "hi": "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."
          },
          "fix": {
            "en": "Your back is rounding. Keep your chest proud and push your hips back.",
            "hi": "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."
          },
          "good": {
            "en": "Good. Your back stayed flat as you hinged.",
            "hi": "Badhiya. Hinge karte time back flat rahi."
          }
        },
        "good": [
          45,
          95
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back flat",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          125,
          145
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "almost": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "fix": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "good": {
            "en": "Good. You pushed your hips back far enough.",
            "hi": "Badhiya. Aapne hips kaafi peeche kiye."
          }
        },
        "good": [
          65,
          125
        ],
        "id": "stretch",
        "joint": "hip",
        "label": "Hinge",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          140,
          155
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the rep standing tall with your glutes tight.",
            "hi": "Rep poora karo, seedhe khade ho aur glutes tight karo."
          },
          "fix": {
            "en": "Finish the rep standing tall with your glutes tight.",
            "hi": "Rep poora karo, seedhe khade ho aur glutes tight karo."
          },
          "good": {
            "en": "Good. You stood all the way up.",
            "hi": "Badhiya. Aap poore khade ho gaye."
          }
        },
        "good": [
          155,
          180
        ],
        "id": "lockout",
        "joint": "hip",
        "label": "Standing",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
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
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "hinge",
    "id": "paused_barbell_rdl",
    "name": "Paused Barbell RDL",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall, then push your hips back with a flat back.",
      "hi": "Seedhe khade ho, phir back flat rakhte hue hips peeche le jao."
    },
    "track": {
      "axis": "angle",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "pec_deck": {
    "_generated": true,
    "_source_file": "pec-deck.json",
    "checks": [
      {
        "almost": [
          45,
          60
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Not so wide. Stop when you feel a stretch.",
            "hi": "Itna zyada nahi. Stretch lage wahan ruko."
          },
          "almost": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "below": {
            "en": "Open wider and feel the stretch across your chest.",
            "hi": "Aur phailao aur chest par stretch mehsoos karo."
          },
          "fix": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "good": {
            "en": "Good. You opened your arms wide enough.",
            "hi": "Badhiya. Aapne haath kaafi khol diye."
          }
        },
        "good": [
          60,
          100
        ],
        "id": "stretch",
        "joint": "shoulder",
        "label": "Range",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          120,
          140
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "fix": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "good": {
            "en": "Good. Your elbows stayed softly straight.",
            "hi": "Badhiya. Kohni halki seedhi rahi."
          }
        },
        "good": [
          140,
          180
        ],
        "id": "elbow_soft",
        "joint": "elbow",
        "label": "Elbows",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      },
      {
        "almost": [
          14,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "fix": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "good": {
            "en": "Good. Both arms opened together.",
            "hi": "Badhiya. Dono haath saath khule."
          }
        },
        "good": [
          0,
          14
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "pec_deck",
    "name": "Pec Deck",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "angle",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "pec_deck_w_integrated_partials": {
    "_generated": true,
    "_source_file": "pec-deck-w-integrated-partials.json",
    "checks": [
      {
        "almost": [
          45,
          60
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Not so wide. Stop when you feel a stretch.",
            "hi": "Itna zyada nahi. Stretch lage wahan ruko."
          },
          "almost": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "below": {
            "en": "Open wider and feel the stretch across your chest.",
            "hi": "Aur phailao aur chest par stretch mehsoos karo."
          },
          "fix": {
            "en": "Open your arms wider at the bottom.",
            "hi": "Neeche haath aur phailao."
          },
          "good": {
            "en": "Good. You opened your arms wide enough.",
            "hi": "Badhiya. Aapne haath kaafi khol diye."
          }
        },
        "good": [
          60,
          100
        ],
        "id": "stretch",
        "joint": "shoulder",
        "label": "Range",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          120,
          140
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "fix": {
            "en": "Keep a soft bend in your elbows, do not let them collapse.",
            "hi": "Kohni mein halka bend rakho, poora mat modho."
          },
          "good": {
            "en": "Good. Your elbows stayed softly straight.",
            "hi": "Badhiya. Kohni halki seedhi rahi."
          }
        },
        "good": [
          140,
          180
        ],
        "id": "elbow_soft",
        "joint": "elbow",
        "label": "Elbows",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the opening. Count 2 seconds.",
            "hi": "Bahut tez hai. Kholne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      },
      {
        "almost": [
          14,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "fix": {
            "en": "One arm is opening less. Move both together.",
            "hi": "Ek haath kam khul raha hai. Dono saath kholo."
          },
          "good": {
            "en": "Good. Both arms opened together.",
            "hi": "Badhiya. Dono haath saath khule."
          }
        },
        "good": [
          0,
          14
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "chest_press",
    "id": "pec_deck_w_integrated_partials",
    "name": "Pec Deck w Integrated Partials",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight up, then lower it slowly.",
      "hi": "Weight upar pakdo, phir dheere neeche lao."
    },
    "track": {
      "axis": "angle",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "preacher_hammer_curl": {
    "_generated": true,
    "_source_file": "preacher-hammer-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "preacher_hammer_curl",
    "name": "Preacher Hammer Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "pull_up_wide_grip": {
    "_generated": true,
    "_source_file": "pull-up-wide-grip.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "pull_up_wide_grip",
    "name": "Pull Up Wide Grip",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "rear_delt_45_cable_flye": {
    "_generated": true,
    "_source_file": "rear-delt-45-cable-flye.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          115
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "rear_delt_45_cable_flye",
    "name": "Rear Delt 45 Cable Flye",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "reverse_grip_cable_curl": {
    "_generated": true,
    "_source_file": "reverse-grip-cable-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          12,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "fix": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "reverse_grip_cable_curl",
    "name": "Reverse Grip Cable Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "reverse_pec_deck_w_integrated_partials": {
    "_generated": true,
    "_source_file": "reverse-pec-deck-w-integrated-partials.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          115
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is much lower. Raise both arms together.",
            "hi": "Ek haath bahut neeche hai. Dono haath saath uthao."
          },
          "good": {
            "en": "Good. Both arms went up together.",
            "hi": "Badhiya. Dono haath saath uthe."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "reverse_pec_deck_w_integrated_partials",
    "name": "Reverse Pec Deck w Integrated Partials",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "roman_chair_leg_raise": {
    "_generated": true,
    "_source_file": "roman-chair-leg-raise.json",
    "checks": [
      {
        "almost": [
          90,
          110
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Crunch further so your abs do the work.",
            "hi": "Aur crunch karo taaki abs kaam karein."
          },
          "almost": {
            "en": "Crunch further, bring your ribs to your hips.",
            "hi": "Aur crunch karo, ribs ko hips ke paas lao."
          },
          "below": {
            "en": "That is enough. Do not pull your back.",
            "hi": "Itna hi kaafi hai. Back ko kheencho mat."
          },
          "fix": {
            "en": "Crunch further, bring your ribs to your hips.",
            "hi": "Aur crunch karo, ribs ko hips ke paas lao."
          },
          "good": {
            "en": "Good. You curled all the way through.",
            "hi": "Badhiya. Aap poora curl kiye."
          }
        },
        "good": [
          25,
          90
        ],
        "id": "range",
        "joint": "hip",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          105,
          120
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Slow the return so the abs stretch.",
            "hi": "Wapas dheere aao taaki abs stretch hon."
          },
          "fix": {
            "en": "Slow the return so the abs stretch.",
            "hi": "Wapas dheere aao taaki abs stretch hon."
          },
          "good": {
            "en": "Good. You opened up fully at the bottom.",
            "hi": "Badhiya. Neeche aap poora khule."
          }
        },
        "good": [
          120,
          180
        ],
        "id": "stretch",
        "joint": "hip",
        "label": "Return",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "core",
    "id": "roman_chair_leg_raise",
    "name": "Roman Chair Leg Raise",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Lie back, then curl your ribs toward your hips.",
      "hi": "Peeche leto, phir ribs ko hips ki taraf curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "seated_db_french_press": {
    "_generated": true,
    "_source_file": "seated-db-french-press.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
      },
      {
        "almost": [
          18,
          30
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "fix": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          18
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "seated_db_french_press",
    "name": "Seated DB French Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "seated_db_shoulder_press": {
    "_generated": true,
    "_source_file": "seated-db-shoulder-press.json",
    "checks": [
      {
        "almost": [
          100,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Go lower, down to ear height.",
            "hi": "Neeche jao, kaan ki height tak."
          },
          "almost": {
            "en": "Lower the weight to ear height.",
            "hi": "Weight kaan ki height tak lao."
          },
          "below": {
            "en": "Not below ear height. Stop there.",
            "hi": "Kaan se neeche nahi. Wahin ruko."
          },
          "fix": {
            "en": "Lower the weight to ear height.",
            "hi": "Weight kaan ki height tak lao."
          },
          "good": {
            "en": "Good. You went down low enough.",
            "hi": "Badhiya. Aap kaafi neeche gaye."
          }
        },
        "good": [
          25,
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
            "en": "Push all the way up.",
            "hi": "Poora upar dhakelo."
          },
          "fix": {
            "en": "Push all the way up.",
            "hi": "Poora upar dhakelo."
          },
          "good": {
            "en": "Good. Your arms finished straight.",
            "hi": "Badhiya. Haath poore seedhe hue."
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
          20,
          32
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning back. Keep your ribs down.",
            "hi": "Aap peeche jhuk rahe hain. Ribs neeche rakho."
          },
          "fix": {
            "en": "You are leaning back. Keep your ribs down.",
            "hi": "Aap peeche jhuk rahe hain. Ribs neeche rakho."
          },
          "good": {
            "en": "Good. Your back stayed tall.",
            "hi": "Badhiya. Aapki back seedhi rahi."
          }
        },
        "good": [
          0,
          20
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Lower under control. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche control se aao. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Lower under control. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche control se aao. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
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
        "id": "even",
        "joint": "elbow",
        "label": "Arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "shoulder_press",
    "id": "seated_db_shoulder_press",
    "name": "Seated DB Shoulder Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Hold the weight at shoulder height, then press up.",
      "hi": "Weight kandhe par rakho, phir upar dhakelo."
    },
    "track": {
      "axis": "forearm",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "seated_leg_curl": {
    "_generated": true,
    "_source_file": "seated-leg-curl.json",
    "checks": [
      {
        "almost": [
          90,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "below": {
            "en": "That is far enough. Do not force more.",
            "hi": "Itna hi kaafi hai. Zyada zor mat lagao."
          },
          "fix": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "good": {
            "en": "Good. You moved through the full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          20,
          90
        ],
        "id": "range",
        "joint": "knee",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "fix": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "good": {
            "en": "Good. You finished the movement.",
            "hi": "Badhiya. Aapne movement poora kiya."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "knee",
        "label": "Top",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "leg_isolation",
    "id": "seated_leg_curl",
    "name": "Seated Leg Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set up on the machine and move through the full range.",
      "hi": "Machine par set ho, poora range cover karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "knee",
      "origin": "ankle",
      "point": "hip"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "single_leg_leg_extension": {
    "_generated": true,
    "_source_file": "single-leg-leg-extension.json",
    "checks": [
      {
        "almost": [
          90,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "below": {
            "en": "That is far enough. Do not force more.",
            "hi": "Itna hi kaafi hai. Zyada zor mat lagao."
          },
          "fix": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "good": {
            "en": "Good. You moved through the full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          20,
          90
        ],
        "id": "range",
        "joint": "knee",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "fix": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "good": {
            "en": "Good. You finished the movement.",
            "hi": "Badhiya. Aapne movement poora kiya."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "knee",
        "label": "Finish",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "leg_isolation",
    "id": "single_leg_leg_extension",
    "name": "Single Leg Leg Extension",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set up on the machine and move through the full range.",
      "hi": "Machine par set ho, poora range cover karo."
    },
    "track": {
      "axis": "distance",
      "joint": "knee",
      "origin": "ankle",
      "point": "hip"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "sissy_squat": {
    "_generated": true,
    "_source_file": "sissy-squat.json",
    "checks": [
      {
        "almost": [
          90,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "below": {
            "en": "That is far enough. Do not force more.",
            "hi": "Itna hi kaafi hai. Zyada zor mat lagao."
          },
          "fix": {
            "en": "Go further into the movement.",
            "hi": "Movement mein aur aage jao."
          },
          "good": {
            "en": "Good. You moved through the full range.",
            "hi": "Badhiya. Aapne poora range cover kiya."
          }
        },
        "good": [
          20,
          90
        ],
        "id": "range",
        "joint": "knee",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "fix": {
            "en": "Finish the movement before you come back.",
            "hi": "Wapas aane se pehle movement poora karo."
          },
          "good": {
            "en": "Good. You finished the movement.",
            "hi": "Badhiya. Aapne movement poora kiya."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "knee",
        "label": "Finish",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way back. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "leg_isolation",
    "id": "sissy_squat",
    "name": "Sissy Squat",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set up on the machine and move through the full range.",
      "hi": "Machine par set ho, poora range cover karo."
    },
    "track": {
      "axis": "distance",
      "joint": "knee",
      "origin": "ankle",
      "point": "hip"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "slow_eccentric_bayesian_curl": {
    "_generated": true,
    "_source_file": "slow-eccentric-bayesian-curl.json",
    "checks": [
      {
        "almost": [
          75,
          100
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Curl higher, squeeze at the top.",
            "hi": "Aur upar karo, upar squeeze karo."
          },
          "almost": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "below": {
            "en": "Do not swing that high. Stop before your elbow pinches.",
            "hi": "Itna zyada upar nahi. Kohni mein khinchne se pehle ruko."
          },
          "fix": {
            "en": "Curl higher before you lower.",
            "hi": "Neeche laane se pehle aur upar karo."
          },
          "good": {
            "en": "Good. You curled all the way up.",
            "hi": "Badhiya. Aap poora upar aaye."
          }
        },
        "good": [
          20,
          75
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          135,
          150
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "fix": {
            "en": "Lower all the way down so the muscle can stretch.",
            "hi": "Poora neeche lao taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You lowered your arms fully.",
            "hi": "Badhiya. Aapne haath poore neeche kiye."
          }
        },
        "good": [
          150,
          180
        ],
        "id": "lockout",
        "joint": "elbow",
        "label": "Bottom",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          12,
          22
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "fix": {
            "en": "You are swinging your body. Keep your back still and curl.",
            "hi": "Aap shareer jhula rahe hain. Back sthir rakho aur curl karo."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not let it drop. Count 2 seconds.",
            "hi": "Bahut tez hai. Girne mat do. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "curl",
    "id": "slow_eccentric_bayesian_curl",
    "name": "Slow Eccentric Bayesian Curl",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with your arms down, then curl up.",
      "hi": "Seedhe khade ho, haath neeche, phir upar curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "slow_eccentric_ez_bar_skull_crusher": {
    "_generated": true,
    "_source_file": "slow-eccentric-ez-bar-skull-crusher.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "slow_eccentric_ez_bar_skull_crusher",
    "name": "Slow Eccentric EZ Bar Skull Crusher",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "smith_machine_jm_press": {
    "_generated": true,
    "_source_file": "smith-machine-jm-press.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "id": "smith_machine_jm_press",
    "name": "Smith Machine Jm Press",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "smith_machine_lunge": {
    "_generated": true,
    "_source_file": "smith-machine-lunge.json",
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
            "en": "Go lower. Take your hips down between your feet.",
            "hi": "Neeche jao. Hips pairon ke beech le jao."
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
            "en": "Stand all the way up and straighten your legs.",
            "hi": "Poora khade ho jao aur pairn seedhe karo."
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
            "en": "Your chest is falling. Keep it up as you sit down.",
            "hi": "Chest gir raha hai. Neeche baithte time chest upar rakho."
          },
          "fix": {
            "en": "Your chest is falling. Keep it up as you sit down.",
            "hi": "Chest gir raha hai. Neeche baithte time chest upar rakho."
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
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
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "squat_lunge",
    "id": "smith_machine_lunge",
    "name": "Smith Machine Lunge",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
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
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "smith_machine_reverse_lunge": {
    "_generated": true,
    "_source_file": "smith-machine-reverse-lunge.json",
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
            "en": "Go lower. Take your hips down between your feet.",
            "hi": "Neeche jao. Hips pairon ke beech le jao."
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
            "en": "Stand all the way up and straighten your legs.",
            "hi": "Poora khade ho jao aur pairn seedhe karo."
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
            "en": "Your chest is falling. Keep it up as you sit down.",
            "hi": "Chest gir raha hai. Neeche baithte time chest upar rakho."
          },
          "fix": {
            "en": "Your chest is falling. Keep it up as you sit down.",
            "hi": "Chest gir raha hai. Neeche baithte time chest upar rakho."
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
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
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "squat_lunge",
    "id": "smith_machine_reverse_lunge",
    "name": "Smith Machine Reverse Lunge",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
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
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "smith_machine_squat": {
    "_generated": true,
    "_source_file": "smith-machine-squat.json",
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
            "en": "Go lower. Take your hips down between your feet.",
            "hi": "Neeche jao. Hips pairon ke beech le jao."
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
            "en": "Stand all the way up and straighten your legs.",
            "hi": "Poora khade ho jao aur pairn seedhe karo."
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
            "en": "Your chest is falling. Keep it up as you sit down.",
            "hi": "Chest gir raha hai. Neeche baithte time chest upar rakho."
          },
          "fix": {
            "en": "Your chest is falling. Keep it up as you sit down.",
            "hi": "Chest gir raha hai. Neeche baithte time chest upar rakho."
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
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
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
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
    "family": "squat_lunge",
    "id": "smith_machine_squat",
    "name": "Smith Machine Squat",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
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
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "snatch_grip_rdl": {
    "_generated": true,
    "_source_file": "snatch-grip-rdl.json",
    "checks": [
      {
        "almost": [
          35,
          45
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Your back is rounding. Keep your chest proud and push your hips back.",
            "hi": "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."
          },
          "fix": {
            "en": "Your back is rounding. Keep your chest proud and push your hips back.",
            "hi": "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."
          },
          "good": {
            "en": "Good. Your back stayed flat as you hinged.",
            "hi": "Badhiya. Hinge karte time back flat rahi."
          }
        },
        "good": [
          45,
          95
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back flat",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          125,
          145
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "almost": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "fix": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "good": {
            "en": "Good. You pushed your hips back far enough.",
            "hi": "Badhiya. Aapne hips kaafi peeche kiye."
          }
        },
        "good": [
          65,
          125
        ],
        "id": "stretch",
        "joint": "hip",
        "label": "Hinge",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          140,
          155
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the rep standing tall with your glutes tight.",
            "hi": "Rep poora karo, seedhe khade ho aur glutes tight karo."
          },
          "fix": {
            "en": "Finish the rep standing tall with your glutes tight.",
            "hi": "Rep poora karo, seedhe khade ho aur glutes tight karo."
          },
          "good": {
            "en": "Good. You stood all the way up.",
            "hi": "Badhiya. Aap poore khade ho gaye."
          }
        },
        "good": [
          155,
          180
        ],
        "id": "lockout",
        "joint": "hip",
        "label": "Standing",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
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
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "hinge",
    "id": "snatch_grip_rdl",
    "name": "Snatch Grip RDL",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall, then push your hips back with a flat back.",
      "hi": "Seedhe khade ho, phir back flat rakhte hue hips peeche le jao."
    },
    "track": {
      "axis": "angle",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "standing_calf_raise": {
    "_generated": true,
    "_source_file": "standing-calf-raise.json",
    "checks": [
      {
        "almost": [
          98,
          110
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "below": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "fix": {
            "en": "Rise higher onto your toes.",
            "hi": "Aur upar aao, toes par."
          },
          "good": {
            "en": "Good. You came up onto your toes fully.",
            "hi": "Badhiya. Aap poore toes par aaye."
          }
        },
        "good": [
          110,
          165
        ],
        "id": "range",
        "joint": "ankle",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          100,
          112
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "almost": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "fix": {
            "en": "Drop your heels lower for a full stretch.",
            "hi": "Heel ko aur neeche jaane do, stretch ke liye."
          },
          "good": {
            "en": "Good. You let the heel drop fully.",
            "hi": "Badhiya. Aapne heel poora neeche kiya."
          }
        },
        "good": [
          55,
          100
        ],
        "id": "stretch",
        "joint": "ankle",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the way down. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the way down. Count 2 seconds.",
            "hi": "Bahut tez hai. Neeche aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "calf",
    "id": "standing_calf_raise",
    "name": "Standing Calf Raise",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand on the edge of a step, then rise onto your toes.",
      "hi": "Step ke kinare khade ho, phir toes par upar aao."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "ankle",
      "origin": "knee",
      "point": "foot_index"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "stiff_leg_deadlift": {
    "_generated": true,
    "_source_file": "stiff-leg-deadlift.json",
    "checks": [
      {
        "almost": [
          35,
          45
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Your back is rounding. Keep your chest proud and push your hips back.",
            "hi": "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."
          },
          "fix": {
            "en": "Your back is rounding. Keep your chest proud and push your hips back.",
            "hi": "Back mud rahi hai. Chest aage rakho aur hips peeche le jao."
          },
          "good": {
            "en": "Good. Your back stayed flat as you hinged.",
            "hi": "Badhiya. Hinge karte time back flat rahi."
          }
        },
        "good": [
          45,
          95
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back flat",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          125,
          145
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "almost": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "fix": {
            "en": "Push your hips further back to feel the stretch.",
            "hi": "Hips aur peeche le jao taaki stretch mehsoos ho."
          },
          "good": {
            "en": "Good. You pushed your hips back far enough.",
            "hi": "Badhiya. Aapne hips kaafi peeche kiye."
          }
        },
        "good": [
          65,
          125
        ],
        "id": "stretch",
        "joint": "hip",
        "label": "Hinge",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          140,
          155
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Finish the rep standing tall with your glutes tight.",
            "hi": "Rep poora karo, seedhe khade ho aur glutes tight karo."
          },
          "fix": {
            "en": "Finish the rep standing tall with your glutes tight.",
            "hi": "Rep poora karo, seedhe khade ho aur glutes tight karo."
          },
          "good": {
            "en": "Good. You stood all the way up.",
            "hi": "Badhiya. Aap poore khade ho gaye."
          }
        },
        "good": [
          155,
          180
        ],
        "id": "lockout",
        "joint": "hip",
        "label": "Standing",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
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
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "hinge",
    "id": "stiff_leg_deadlift",
    "name": "Stiff Leg Deadlift",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall, then push your hips back with a flat back.",
      "hi": "Seedhe khade ho, phir back flat rakhte hue hips peeche le jao."
    },
    "track": {
      "axis": "angle",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "stomach_vacuums": {
    "_generated": true,
    "_source_file": "stomach-vacuums.json",
    "checks": [
      {
        "almost": [
          1.5,
          3.0
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Hold it longer, at least 3 seconds.",
            "hi": "Aur der hold karo, kam se kam 3 second."
          },
          "fix": {
            "en": "Hold it longer, at least 3 seconds.",
            "hi": "Aur der hold karo, kam se kam 3 second."
          },
          "good": {
            "en": "Good. You held the vacuum.",
            "hi": "Badhiya. Aapne vacuum hold kiya."
          }
        },
        "good": [
          3.0,
          30.0
        ],
        "id": "hold",
        "joint": "torso",
        "label": "Hold",
        "measure": "eccentric_seconds",
        "min_visibility": 0.5,
        "robust": "median"
      }
    ],
    "family": "core",
    "id": "stomach_vacuums",
    "name": "Stomach Vacuums",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Lie back, then curl your ribs toward your hips.",
      "hi": "Peeche leto, phir ribs ko hips ki taraf curl karo."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "hip",
      "origin": "shoulder",
      "point": "knee"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "straight_bar_lat_prayer": {
    "_generated": true,
    "_source_file": "straight-bar-lat-prayer.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "straight_bar_lat_prayer",
    "name": "Straight Bar Lat Prayer",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "super_rom_db_lateral_raise": {
    "_generated": true,
    "_source_file": "super-rom-db-lateral-raise.json",
    "checks": [
      {
        "almost": [
          60,
          75
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Lower slightly if your shoulder pinches.",
            "hi": "Agar kandhe mein dabav lage toh thoda kam uthao."
          },
          "almost": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "below": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "fix": {
            "en": "Lift higher, up to shoulder height.",
            "hi": "Aur upar uthao, kandhe ki height tak."
          },
          "good": {
            "en": "Good. You raised to full height.",
            "hi": "Badhiya. Poori height tak uthaya."
          }
        },
        "good": [
          75,
          165
        ],
        "id": "range",
        "joint": "shoulder",
        "label": "Height",
        "min_visibility": 0.6,
        "robust": "max"
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Do not drop the weight. Count 2 seconds.",
            "hi": "Bahut tez hai. Weight girao mat. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is much lower. Raise both arms together.",
            "hi": "Ek haath bahut neeche hai. Dono haath saath uthao."
          },
          "good": {
            "en": "Good. Both arms went up together.",
            "hi": "Badhiya. Dono haath saath uthe."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "shoulder",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "lateral_raise",
    "id": "super_rom_db_lateral_raise",
    "name": "Super Rom DB Lateral Raise",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Stand tall with the weights at your sides.",
      "hi": "Seedhe khade ho, weight haath ke bagal mein."
    },
    "track": {
      "axis": "angle",
      "eccentric": "return",
      "invert": true,
      "joint": "shoulder",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "front",
      "45"
    ]
  },
  "super_rom_overhand_cable_row": {
    "_generated": true,
    "_source_file": "super-rom-overhand-cable-row.json",
    "checks": [
      {
        "almost": [
          85,
          105
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Pull further, all the way in.",
            "hi": "Aur kheencho, poora andar tak."
          },
          "almost": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "below": {
            "en": "Do not pull past your body. Stop when the elbow is behind you.",
            "hi": "Shareer se aage nahi. Kohni peeche aate hi ruko."
          },
          "fix": {
            "en": "Pull further. Bring the weight all the way in.",
            "hi": "Aur kheencho. Weight poora andar lao."
          },
          "good": {
            "en": "Good. You pulled all the way in.",
            "hi": "Badhiya. Aap poora kheench laaye."
          }
        },
        "good": [
          20,
          85
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Range",
        "min_visibility": 0.55,
        "robust": "min_of_3"
      },
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "fix": {
            "en": "Let your arms straighten fully at the top.",
            "hi": "Upar jaate time haath poore seedhe hone do."
          },
          "good": {
            "en": "Good. You let the weight stretch you out.",
            "hi": "Badhiya. Aapne weight ko khulne diya."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "max"
      },
      {
        "almost": [
          25,
          40
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "fix": {
            "en": "You are swinging. Keep your body still and pull.",
            "hi": "Aap jhool rahe hain. Shareer sthir rakho aur kheencho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          25
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Back",
        "measure": "torso_lean",
        "min_visibility": 0.6,
        "robust": "median"
      },
      {
        "almost": [
          0.4,
          0.8
        ],
        "at": "eccentric",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the stretch. Count 2 seconds.",
            "hi": "Bahut tez hai. Khulne mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.8,
          5.5
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
            "en": "One side is a little behind. Move them together.",
            "hi": "Ek side thoda peeche hai. Dono saath chalao."
          },
          "fix": {
            "en": "One arm is doing less. Pull with both evenly.",
            "hi": "Ek haath kam kar raha hai. Dono se barabar kheencho."
          },
          "good": {
            "en": "Good. Both arms pulled together.",
            "hi": "Badhiya. Dono haath saath khinche."
          }
        },
        "good": [
          0,
          12
        ],
        "id": "even",
        "joint": "elbow",
        "label": "Both arms",
        "measure": "side_difference",
        "min_visibility": 0.7,
        "robust": "median"
      }
    ],
    "family": "row_pulldown",
    "id": "super_rom_overhand_cable_row",
    "name": "Super Rom Overhand Cable Row",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Start with your arms long, then pull in.",
      "hi": "Haath seedhe karke shuru karo, phir andar kheencho."
    },
    "track": {
      "axis": "distance",
      "eccentric": "return",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "triceps_diverging_pressdown_long_rope_or_2_ropes": {
    "_generated": true,
    "_source_file": "triceps-diverging-pressdown-long-rope-or-2-ropes.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
      },
      {
        "almost": [
          18,
          30
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "fix": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          18
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "ghost": {
      "at_bottom": 70,
      "at_top": 170
    },
    "id": "triceps_diverging_pressdown_long_rope_or_2_ropes",
    "name": "Triceps Diverging Pressdown Long Rope or 2 Ropes",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "triceps_pressdown": {
    "_generated": true,
    "_source_file": "triceps-pressdown.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
      },
      {
        "almost": [
          18,
          30
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "fix": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          18
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "ghost": {
      "at_bottom": 70,
      "at_top": 170
    },
    "id": "triceps_pressdown",
    "name": "Triceps Pressdown",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  },
  "triceps_pressdown_bar": {
    "_generated": true,
    "_source_file": "triceps-pressdown-bar.json",
    "checks": [
      {
        "almost": [
          130,
          145
        ],
        "at": "lockout",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "below": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "fix": {
            "en": "Straighten your arms all the way.",
            "hi": "Haath poore seedhe karo."
          },
          "good": {
            "en": "Good. You straightened your arms fully.",
            "hi": "Badhiya. Aapne haath poore seedhe kiye."
          }
        },
        "good": [
          145,
          180
        ],
        "id": "range",
        "joint": "elbow",
        "label": "Lockout",
        "min_visibility": 0.55,
        "robust": "max"
      },
      {
        "almost": [
          95,
          115
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "above": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "almost": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "fix": {
            "en": "Bend your elbows more for a deeper stretch.",
            "hi": "Kohni aur zyada mudo taaki muscle stretch ho."
          },
          "good": {
            "en": "Good. You let the elbow close fully.",
            "hi": "Badhiya. Kohni poora band hui."
          }
        },
        "good": [
          35,
          95
        ],
        "id": "stretch",
        "joint": "elbow",
        "label": "Stretch",
        "min_visibility": 0.6,
        "robust": "min_of_3"
      },
      {
        "almost": [
          18,
          30
        ],
        "at": "bottom",
        "capture": "in_plane",
        "cue": {
          "almost": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "fix": {
            "en": "You are leaning into it. Keep your body still.",
            "hi": "Aap shareer se dhakel rahe hain. Shareer sthir rakho."
          },
          "good": {
            "en": "Good. Your body stayed still.",
            "hi": "Badhiya. Aapka shareer sthir raha."
          }
        },
        "good": [
          0,
          18
        ],
        "id": "lean",
        "joint": "torso",
        "label": "Body",
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
            "en": "Very slow. Good control — keep moving smoothly.",
            "hi": "Bahut slow hai. Control achha hai, smooth chalte raho."
          },
          "almost": {
            "en": "A bit fast. Count 2 seconds on the way down.",
            "hi": "Thoda tez hai. Neeche aate time 2 tak gino."
          },
          "below": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "fix": {
            "en": "Too fast. Control the return. Count 2 seconds.",
            "hi": "Bahut tez hai. Wapas aane mein control rakho. 2 tak gino."
          },
          "good": {
            "en": "Good. You controlled the weight.",
            "hi": "Badhiya. Aapne weight control kiya."
          }
        },
        "good": [
          0.9,
          5.5
        ],
        "id": "tempo",
        "label": "Speed",
        "measure": "eccentric_seconds",
        "robust": "median"
      }
    ],
    "family": "triceps",
    "ghost": {
      "at_bottom": 70,
      "at_top": 170
    },
    "id": "triceps_pressdown_bar",
    "name": "Triceps Pressdown Bar",
    "phases": [
      "setup",
      "eccentric",
      "bottom",
      "concentric",
      "lockout"
    ],
    "rubric_version": "2026-11-18",
    "setup": [],
    "start_cue": {
      "en": "Set your elbow still, then straighten your arm.",
      "hi": "Kohni sthir rakho, phir haath seedha karo."
    },
    "track": {
      "axis": "distance",
      "joint": "elbow",
      "origin": "shoulder",
      "point": "wrist"
    },
    "validated": false,
    "validation_note": "Bands are the standard coaching ranges for this movement, not measured against a labelled clip. Treat a fix verdict as a prompt to look, not as a measured fault.",
    "view": [
      "side",
      "45"
    ]
  }
};
