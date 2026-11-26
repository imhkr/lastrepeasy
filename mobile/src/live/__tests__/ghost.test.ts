// The shadow arm: where the forearm should be, at the phase the rep is in.
//
// Plain node run: node --experimental-strip-types src/live/__tests__/ghost.test.ts
import assert from "node:assert/strict";
import { RUNTIME_JS } from "../runtime.generated.ts";
import { liveHtml } from "../liveHtml.ts";
import { getRubric, listExercises } from "../engine.ts";
import type { Landmarks } from "../engine.ts";
import {
  buildShadowArm, createGhostRunner, GHOST_CYCLE, ghostStep, ghostTargetDeg, jointAngleDeg, teachGhostRunner,
} from "../overlay.ts";

const ASPECT = 0.75; // portrait 480x640, so x and y are on different scales like a real phone
const FORE = 0.16; // forearm length, in height units

// A side-view pushdown arm: upper arm hanging straight down from the shoulder, forearm bent to
// exactly `deg` of interior elbow angle, forward (+x) like a handle held in front of the body.
function pose(deg: number, vis = 0.95): Landmarks {
  const sh = { x: 0.5, y: 0.35, vis };
  const el = { x: 0.5, y: 0.55, vis };
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad), dy = -Math.cos(rad); // rotate 0,-1 (up) toward +x by deg
  const wr = { x: el.x + (dx * FORE) / ASPECT, y: el.y + dy * FORE, vis };
  return {
    left_shoulder: sh, left_elbow: el, left_wrist: wr,
    right_shoulder: sh, right_elbow: el, right_wrist: wr,
  };
}

// ---- the rubric curve ------------------------------------------------------

const SPEC = { at_bottom: 70, at_top: 170 };
assert.equal(ghostTargetDeg(SPEC, 0), 70, "phase 0 is the bottom target");
assert.equal(ghostTargetDeg(SPEC, 1), 170, "phase 1 is the lockout target");
assert.equal(ghostTargetDeg(SPEC, 0.5), 120, "half way is half way");
assert.equal(ghostTargetDeg(SPEC, -1), 70, "phase is clamped low");
assert.equal(ghostTargetDeg(SPEC, 2), 170, "phase is clamped high");
assert.ok(Number.isNaN(ghostTargetDeg(undefined, 0.5)), "no spec, no target");
assert.ok(Number.isNaN(ghostTargetDeg(SPEC, NaN)), "no phase, no target");
console.log("GHOST_TARGET_OK");

// ---- the shadow limb -------------------------------------------------------

// The shadow must land at the requested angle in the SAME aspect-corrected space the in-plane
// check measures, or the picture and the verdict would describe different joints.
for (const deg of [70, 90, 120, 170]) {
  const lm = pose(90);
  const items = buildShadowArm(lm, "left", deg, ASPECT);
  assert.equal(items.length, 2, "one forearm bone and one wrist dot");
  assert.equal(items[0].kind, "bone");
  const bone = items[0] as { kind: "bone"; a: { x: number; y: number }; b: { x: number; y: number; vis: number } };
  // Measured by the production angle function, so the test cannot validate the shadow with a
  // different definition of "angle" than the verdict uses.
  const got = jointAngleDeg({ ...lm, shadow_wrist: bone.b }, "left_shoulder", "left_elbow", "shadow_wrist", ASPECT);
  assert.ok(Math.abs(got - deg) < 1e-6, `shadow bends ${got.toFixed(2)} for a ${deg} target`);
  const len = Math.hypot((bone.b.x - lm.left_elbow.x) * ASPECT, bone.b.y - lm.left_elbow.y);
  assert.ok(Math.abs(len - FORE) < 1e-9, "shadow keeps the lifter's own forearm length");
  // The shadow pivots on the REAL elbow: it never invents a second joint.
  assert.deepEqual(bone.a, lm.left_elbow);
}
// Both sides, because the segmenter can pick either one.
assert.equal(buildShadowArm(pose(90), "right", 120, ASPECT).length, 2, "right arm works too");

// An interior angle is unsigned, so the angle test above cannot catch a shadow rotating the wrong
// way. The shadow must stay on the side the real forearm is on -- in front of the body, not behind.
{
  const lm = pose(90);
  const fwd = buildShadowArm(lm, "left", 140, ASPECT)[0] as { b: { x: number } };
  assert.ok(fwd.b.x > lm.left_elbow.x, "shadow wrist stays in front, where the handle is");
  const behind = { ...lm, left_wrist: { x: lm.left_elbow.x - (lm.left_wrist.x - lm.left_elbow.x), y: lm.left_wrist.y, vis: 0.95 } };
  const back = buildShadowArm(behind, "left", 140, ASPECT)[0] as { b: { x: number } };
  assert.ok(back.b.x < behind.left_elbow.x, "shadow follows the forearm to the other side too");
}
console.log("GHOST_LIMB_OK");

// A missing or shaky arm leaves a gap, not a guessed limb.
assert.deepEqual(buildShadowArm(pose(90, 0.2), "left", 120, ASPECT), [], "weak landmarks, no shadow");
assert.deepEqual(buildShadowArm({}, "left", 120, ASPECT), [], "no landmarks, no shadow");
assert.deepEqual(buildShadowArm(pose(90), "left", NaN, ASPECT), [], "no target, no shadow");
console.log("GHOST_REFUSE_OK");

// The user's exact case: a lifter stalled at 90 degrees while the shadow is half way through the
// demo rep. The shadow must be visibly straighter than the arm, or it teaches nothing.
const stalled = pose(90);
const halfTarget = ghostTargetDeg(SPEC, 0.5);
const half = buildShadowArm(stalled, "left", halfTarget, ASPECT)[0] as { b: { x: number; y: number; vis: number } };
const shown = jointAngleDeg({ ...stalled, shadow_wrist: half.b }, "left_shoulder", "left_elbow", "shadow_wrist", ASPECT);
assert.ok(shown - 90 > 25, `a stalled lifter sees a ${Math.round(shown)}-degree shadow, not 90`);
console.log("GHOST_STALLED_VISIBLE_OK");

// ---- the runner -------------------------------------------------------------

// Frames at 30 fps, like the page; a single big jump would be rate-limited and prove nothing.
function frames(r: ReturnType<typeof createGhostRunner>, from: number, to: number, progress: (t: number) => number | null): number {
  let t = from;
  for (; t < to; t += 1 / 30) ghostStep(r, t, progress(t));
  return ghostStep(r, to, progress(to));
}

// The ready position is the bent arm a pushdown starts from -- not the straight one the first
// build rested on, which lay a straight shadow over a bent lifter before they had moved.
{
  const r = createGhostRunner();
  assert.equal(ghostStep(r, 100, null), 0, "starts bent, over the ready position");
}

// Between reps the shadow demonstrates on a loop, so the movement is visible before the first
// rep is ever counted. A frozen shadow reads as "the feature is broken".
{
  const r = createGhostRunner();
  frames(r, 0, 1.2, () => null);
  const top = ghostStep(r, 1.2, null);
  assert.ok(top > 0.95, `demonstrates the push to lockout, got ${top.toFixed(2)}`);
  frames(r, 1.2, 2.4, () => null);
  const bottom = ghostStep(r, 2.4, null);
  assert.ok(bottom < 0.05, `and returns to the bent ready position, got ${bottom.toFixed(2)}`);
}

// THE BUG: the shadow used to run on its own timer, so it straightened while the lifter rested at
// the bottom. It must follow the lifter's own progress while they move...
{
  const r = createGhostRunner();
  const rising = (t: number) => 0.1 + 0.5 * t; // pushing over one second
  frames(r, 0, 1, rising);
  assert.ok(Math.abs(r.phase - rising(1)) < 0.05, `lockstep with the lifter, got ${r.phase.toFixed(2)}`);
  const falling = (t: number) => 1.6 - 0.5 * t; // and bending back
  frames(r, 1, 2, falling);
  assert.ok(Math.abs(r.phase - falling(2)) < 0.05, `and follows them back down, got ${r.phase.toFixed(2)}`);
}

// ...but when the hand stops moving it must finish the push, because "my hand is not going down
// while the shadow is" is the whole point of showing it.
{
  const r = createGhostRunner();
  frames(r, 0, 1, () => 0.3);
  const stalled = frames(r, 1, 2.5, () => 0.3);
  assert.ok(stalled > 0.8, `stalled lifter still sees the push, got ${stalled.toFixed(2)}`);
  // And it hands control back as soon as the lifter moves again.
  const resumed = frames(r, 2.5, 3.5, (t) => 1 - 0.5 * (t - 2.5));
  assert.ok(Math.abs(resumed - 0.5) < 0.06, `returns to lockstep, got ${resumed.toFixed(2)}`);
}

// A slow frame or a backgrounded tab must not teleport the shadow across the rep.
{
  const r = createGhostRunner();
  ghostStep(r, 0, 0.1);
  const jumped = ghostStep(r, 5, 0.1);
  assert.ok(jumped - 0.1 <= 3 * 0.5 + 1e-9, "clamped dt bounds one frame's move");
  assert.ok(Number.isFinite(jumped) && jumped >= 0 && jumped <= 1, "phase stays a number in range");
}

// Tempo is learned from completed reps for the idle loop and the stall rescue.
{
  const r = createGhostRunner();
  assert.equal(r.duration, GHOST_CYCLE);
  teachGhostRunner(r, 3.6);
  assert.equal(r.duration, 3.6, "tempo is learned from the last rep");
  teachGhostRunner(r, 0.2);
  assert.equal(r.duration, 1.2, "clamped fast");
  teachGhostRunner(r, 50);
  assert.equal(r.duration, 8, "clamped slow");
  teachGhostRunner(r, -3);
  assert.equal(r.duration, 8, "a nonsense duration is ignored");
}
console.log("GHOST_CLOCK_OK");

// ---- rubric + bundle wiring ------------------------------------------------

const withGhost = listExercises().filter((id) => getRubric(id).ghost);
assert.deepEqual(withGhost, [
  "triceps_diverging_pressdown_long_rope_or_2_ropes",
  "triceps_pressdown",
  "triceps_pressdown_bar",
], "only the pressdown family ships a shadow");
assert.deepEqual(getRubric("triceps-pressdown").ghost, SPEC, "canonical JSON reaches the phone");
console.log("GHOST_RUBRIC_OK");

const LIVE = new Function(`${RUNTIME_JS}\nreturn LIVE;`)() as any;
assert.equal(typeof LIVE.overlay.buildShadowArm, "function", "bundle exposes the shadow limb");
assert.equal(typeof LIVE.overlay.ghostStep, "function", "bundle exposes the runner");
assert.deepEqual(LIVE.rubrics.triceps_pressdown.ghost, SPEC, "bundle carries the ghost config");
assert.ok(liveHtml({ exerciseId: "triceps_pressdown" }).includes("buildShadowArm"), "the live page draws it");
console.log("GHOST_BUNDLE_OK");
