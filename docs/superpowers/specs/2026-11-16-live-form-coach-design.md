# Live Form Coach — Design

Date: 2026-11-16
Status: approved for implementation planning
Supersedes: `backend/app/services/press_coach.py`, `mobile/src/live/liveCore.ts`

## Problem

The live coach is inaccurate and looks cartoonish.

Root causes, from reading the current code:

1. **One scalar for everything.** `liveCore.ts` judges five checks from the 2D elbow angle for a single
   exercise. `ghost.py` has exactly one profile (`incline_press_nippard`). The app's plans contain 90
   exercises.
2. **Wrong coordinate space.** All angles are computed from 2D image coordinates. A 2024 evaluation of
   MediaPipe 3D pose for physical exercises found accuracy "highly dependent on the camera's viewing
   angle". 2D angles shift with camera position, so the same correct rep scores differently when the
   phone moves.
3. **Fabricated overlay.** `ghostFor()` invents a shoulder/elbow/wrist from a hardcoded target angle and
   draws it as fat green tubes. Nothing of the user's actual body is drawn. That is the cartoon.
4. **Duplicated logic.** The same rules are hand-written twice (Python `press_coach.py`, JS `liveCore.ts`)
   and kept in step by a sync test. Every rule change is a two-place edit that can silently drift.

## Goals

- Judge all 90 plan exercises correctly, phase by phase, from setup to lockout.
- Never mark a correct rep wrong. When the view or visibility is inadequate, say "cannot judge" instead of
  guessing.
- Replace the cartoon arm with the user's real tracked skeleton plus a target arc.
- Make accuracy measurable rather than felt: labelled real clips as regression tests, plus a
  local-vs-cloud disagreement log.

## Non-goals

- New exercises beyond the 90 in `mobile/src/data/plans.json` (the schema makes adding them a file, not
  a code change, but authoring them is out of scope for phase 1).
- Real-time 3D mesh reconstruction, barbell/plate detection, or multi-person scenes.
- Replacing the recorded-clip analysis pipeline (`/api/analyze/*`). It keeps working.

## Architecture

Three tiers, split by latency budget.

| Tier | Runs on | Latency | Responsibility |
|---|---|---|---|
| 0 | Phone (WebView) | ~20 ms/frame | Pose, kinematics, rubric rules, overlay, instant cues |
| 1 | Backend → Coarena VLM | 1.3–3.5 s | Adjudicate a completed rep from evidence bundle |
| 2 | Offline tooling | minutes | Author and review the 90 rubrics |

Measured on 2026-11-16 against `https://coarena.ai/api/v1`:
`gpt-6-luna` 1.3–3.5 s text, `gemini-3-8-flash` 2.2 s with vision, `claude-*` on key1 returns
402 Payment Required. Cloud models therefore cannot sit in the frame loop; they sit at rep boundaries,
where a 2 s delay is invisible because the user is resetting for the next rep.

```
mobile/app/live.tsx                 RN shell: camera permission, voice, language
mobile/src/live/liveHtml.ts         WebView page: MediaPipe, render loop, postMessage bridge
  skeleton.ts                       thin skeleton + joint highlight from 33 landmarks
  targetArc.ts                      ideal-range arc at the judged joint
  gauge.ts                          numeric readout: joint, angle, target band
  core/                             tier-0 rubric engine (pure, no DOM)
  rubrics.generated.ts              emitted from the canonical JSON, do not hand-edit
backend/app/rubrics/<exercise>.json canonical rubric source, read by BOTH tiers
backend/app/services/
  kinematics.py                     2D/world landmarks -> measurements, per contract
  rubric_engine.py                  same rules as core/, from the same JSON
  vlm_judge.py                      evidence bundle -> adjudicated verdict
  keypool.py                        4-key rotation, 402/429 backoff
```

The single JSON rubric directory is the structural fix for drift: tier 0 and tier 1 cannot disagree about
what a measurement means or what its bands are, because neither owns that knowledge.

**Rubric location.** `render.yaml` deploys with `rootDir: backend`, so the Docker build context is
`backend/` only and anything at the repo root is invisible to the deployed container. The canonical
rubrics therefore live in `backend/app/rubrics/`. The mobile side cannot import across that boundary at
build time (Metro bundles from `mobile/`), so a small codegen step emits
`mobile/src/live/rubrics.generated.ts` from the JSON. Generation runs in CI and in a pre-commit check; a
test asserts the committed generated file matches the JSON byte for byte, so a rubric edit that forgets to
regenerate fails the build instead of shipping a stale phone.

## Kinematics contract

Every measurement declares its space and frame. Nothing computes an angle without declaring both.

```jsonc
{
  "id": "elbow_flexion",
  "space": "world3d",        // "image2d" | "world3d"
  "frame": "torso",          // "image" | "torso" (hip->shoulder axis) | "gravity"
  "robust": "median",        // median | min_of_3 | p10 | p90 | max
  "min_visibility": 0.6
}
```

Space selection rules:

- **In-plane motion** (elbow flexion seen from the side, knee valgus seen from the front): `image2d`,
  expressed in the `torso` frame so phone tilt does not shift the value.
- **Out-of-plane motion** (press depth toward camera, squat hip-vs-knee height from a 45° view):
  `world3d`. These are estimated by MediaPipe's learned depth lift, not measured, so any check using them
  is marked `confidence: "estimate"` and given a wider band.
- **View gate.** Each rubric declares `view: "side" | "front" | "45"`. Before judging, the engine measures
  torso facing and shoulder-width ratio. If the observed view does not match, it shows a placement guide
  and does not judge. Guessing from a bad angle is the current bug; refusing is the fix.
- **Per-check visibility floors** replace the single global `MIN_VIS`.

`robust` exists because real clips have occlusion spikes. Rep depth uses `min_of_3`-style robustness
(three lowest samples, median of those), matching what the current coach already does at the bottom.

## Rubric schema

Phase-tagged, so "start to end" is literal.

```jsonc
{
  "id": "low_incline_db_press",
  "family": "press",
  "view": "45",
  "phases": ["setup", "eccentric", "bottom", "concentric", "lockout"],
  "setup": [
    { "id": "bench_angle", "measure": "torso_incline", "good": [25, 35], "almost": [20, 40],
      "cue": { "almost": "Set the bench a little higher.",
               "fix": "Set the bench to about 30 degrees." } }
  ],
  "checks": [
    { "id": "depth", "measure": "elbow_flexion", "at": "bottom",
      "good": [70, 95], "almost": [95, 110],
      "cue": { "almost": "Go a little lower.",
               "fix": "Lower until your upper arms are level with your torso.",
               "good": "Good. You went down low enough." } },
    { "id": "elbow_path", "measure": "wrist_vs_elbow_stack", "at": "eccentric",
      "good": [0, 12], "almost": [12, 22],
      "cue": { "almost": "Keep your wrists over your elbows.",
               "fix": "Your hands drift. Keep wrists stacked over elbows." } }
  ]
}
```

Every `cue` string carries an English and a Hinglish twin. The plain-words rule from `GATES-coach2.md`
survives: no degrees, no joint jargon, at most 14 words.

## Feedback model

Phase-by-phase, one cue at a time. The current implementation already has the silence discipline
(`showUntil`, one `worst()` pick); it keeps that and gains phase awareness.

- `setup`: stance/grip/body-position checks. Must pass before rep 1 is counted. Failure speaks once.
- `eccentric` / `concentric`: at most one in-flight cue, sampled, throttled to one per ~2 s.
- `bottom`, `lockout`: the authoritative checkpoints. One cue each, worst-first by `PRIORITY`.
- Rep end: verdict + speak, as today.
- Set end: per-rep rows, then the single most important fix.

`PRIORITY` becomes per-family rather than global, because "depth" is not the first thing to fix in a calf
raise.

## Tier 1 evidence bundle

At each rep boundary the phone POSTs to `/api/live/adjudicate`:

```jsonc
{
  "exercise": "low_incline_db_press",
  "rep": 4,
  "view": "45",
  "rubric_version": "2026-11-16",
  "landmarks": [ /* ~30 frames x 33 keypoints, downsampled, t + x,y,z,visibility */ ],
  "keyframes": [ /* three 480px JPEGs at base64, q0.7: bottom, mid, top */ ],
  "local_verdict": { "checks": [ /* tier-0 output */ ] }
}
```

Backend sends rubric + keyframes + a compact landmark summary to the VLM with a `json_schema` response
format (supported by all working models on the endpoint). Response:

```jsonc
{ "checks": [ { "id": "depth", "status": "fix", "reason": "upper arms stop above torso level" } ],
  "overall": "3 of 5 checks need work", "confidence": 0.82 }
```

VLM verdict is authoritative for the record. Disagreements with tier 0 are logged to
`backend/storage/adjudications/*.jsonl`. That log is the accuracy metric: it shows which local rules are
systematically wrong, which is what to fix next.

Budget: three keyframes (~40 KB each) plus a landmarks summary, not video. One call per rep.

## Key handling

Keys live only in `backend/.env` as `COARENA_API_KEY_1..4`, never committed (`.env` is gitignored; only
`.env.example` is tracked, as placeholders). `render.yaml` declares them `sync: false` so Render prompts.

`keypool.py` round-robins across keys, backs off on 402/429, health-scores each, and sticky-fails a key
that returns 402 repeatedly. Model routing prefers `gpt-6-luna` (fastest) and `gemini-3-8-flash` (vision)
on the Coarena endpoint; the pre-existing `GEMINI_API_KEY` path in `nippard_ai.py` stays for the recorded
clip pipeline.

The phone never holds a key. It calls the backend.

## Failure modes

| Failure | Behaviour |
|---|---|
| No network / backend down | Tier 0 only. Judges and speaks normally. Adjudication skipped, logged as pending. |
| All keys 402/429 | Same as above, with a logged warning. |
| View mismatch | Placement guide. No judging, no cues. |
| Low visibility at a joint | That check reports `unsure`, never a guess. |
| VLM returns invalid JSON | Retry once, then fall back to the local verdict and log. |
| Phone too slow | Existing model step-down (heavy → full → lite) is preserved. |

## Overlay

Replace the fabricated ghost arm.

- **Skeleton**: all 33 landmarks, thin (2–3 px), semi-transparent neutral grey. It reads as "my body is
  being tracked", not a character.
- **Highlight**: only the joint under judgement is coloured — green inside band, amber near, red out.
- **Target arc**: a small arc at the judged joint showing the ideal angular range, with a live marker for
  the current angle.
- **Gauge**: compact numeric readout — joint name, live angle, band — so the feedback is quantitative and
  not a cartoon.
- Never draw a limb the tracker did not see. Missing data means a gap, not an invented arm.

## Testing

1. **Rubric logic** — synthetic landmark fixtures per family, in CI, fast.
2. **Labeled real clips** — user records good form plus each deliberate fault per family. Expected verdict
   per rep becomes a golden fixture. Both Python and JS must reproduce it.
3. **VLM adjudication** — recorded evidence bundles must produce schema-valid output and must not flip a
   correct rep to wrong.
4. **Regression** — the existing `press_clip_landmarks.json` fixture keeps working through the new engine.
5. **Disagreement metric** — `adjudications/*.jsonl` summarised by check id, so accuracy is tracked over
   time.

## Phasing

**Phase 1 (this spec's implementation)** — press family, full stack: kinematics contract, rubric engine in
both languages, view gate, real skeleton + arc + gauge overlay, tier-1 adjudication, 4-key pool, labelled
clip tests. One family proves every layer end to end.

**Phase 2–8** — squat, hinge, curl, row, raise/fly, calf, carry. Each is rubric content plus one labelled
clip set. No new architecture.

**Phase 9** — retire `press_coach.py` and `liveCore.ts`, keep the recorded-clip pipeline on the new
kinematics module.

## Risks

- **View gate costs setup friction.** Mitigated by a clear placement guide and by only requiring it where
  the rubric declares it.
- **Out-of-plane checks remain estimated.** Mitigated by declaring `confidence: "estimate"` and widening
  bands; never presented to the user as exact.
- **VLM cost and latency.** Mitigated by one call per rep, small payloads, and key rotation.
- **90 rubrics are a lot of authoring.** Mitigated by Tier 2: generate drafts with the VLM, review, and
  version them as JSON.
