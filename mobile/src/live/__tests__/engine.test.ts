import assert from "node:assert/strict";
import {
  aggregate,
  evaluateAll,
  evaluateCheck,
  getRubric,
  jointAngle3d,
  jointAngleDeg,
  listExercises,
  median,
  measureJoint,
  measureWristStack,
  plausible,
  worstCue,
} from "../engine.ts";

const mk = (x: number, y: number, vis = 1, world?: [number, number, number]) => ({
  x, y, vis, wx: world?.[0], wy: world?.[1], wz: world?.[2],
});

const ASPECT = 16 / 9;

// ---- the bug that started all of this: a squat must not be judged as a press
assert.ok(listExercises().includes("low_incline_db_press"));
assert.throws(() => getRubric("barbell_back_squat"), /no rubric/, "an unsupported exercise must refuse, not guess");
console.log("ENGINE_NO_DEFAULT_OK");

// ---- rubric loads with the checks the JSON declares
const rubric = getRubric("low_incline_db_press");
const ids = rubric.checks.map((c) => c.id);
assert.deepEqual(ids, ["depth", "lockout", "elbow_path", "tempo", "symmetry"]);
// A press reads equally well face-on and at 45 degrees, so the rubric accepts both. Demanding one
// exact camera position refused clips that were perfectly measurable.
assert.deepEqual(rubric.view, ["front", "45"]);
console.log("ENGINE_RUBRIC_LOAD_OK");

// ---- angle maths, in both spaces
{
  const a = { x: 0.5, y: 0.3, vis: 1 }, b = { x: 0.5, y: 0.5, vis: 1 }, c = { x: 0.62, y: 0.62, vis: 1 };
  const norm = jointAngleDeg(a, b, c, ASPECT);
  const px = jointAngleDeg({ ...a, x: a.x * 1920, y: a.y * 1080 }, { ...b, x: b.x * 1920, y: b.y * 1080 }, { ...c, x: c.x * 1920, y: c.y * 1080 });
  assert.ok(Math.abs(norm - px) < 0.01, `aspect scaling must match pixel space: ${norm} vs ${px}`);
  const d3 = jointAngle3d(
    { x: 0, y: 0, vis: 1, wx: 0, wy: 0, wz: 0 },
    { x: 0, y: 0, vis: 1, wx: 0, wy: 1, wz: 0 },
    { x: 0, y: 0, vis: 1, wx: 1, wy: 1, wz: 0 },
  );
  assert.ok(Math.abs(d3 - 90) < 0.01, `3d right angle, got ${d3}`);
}
console.log("ENGINE_ANGLE_OK");

// ---- plausibility guard
assert.equal(plausible("elbow", 13), false, "a 13-degree elbow in a press is a tracking failure");
assert.equal(plausible("elbow", 90), true);
assert.equal(plausible("left_ankle", 100), true, "side prefix must be stripped");
assert.equal(plausible("elbow", NaN), false);
console.log("ENGINE_PLAUSIBLE_OK");

// ---- helpers
assert.equal(median([3, 1, 2]), 2);
assert.equal(median([4, 1, 3, 2]), 2.5);
assert.equal(aggregate([10, 20, 30, 40], "min_of_3"), 20);
assert.ok(Number.isNaN(aggregate([], "median")));
console.log("ENGINE_AGGREGATE_OK");

// ---- an unseen joint is 'unsure', never a verdict
{
  const frames = [{
    left_shoulder: mk(0.5, 0.4, 0.2), left_elbow: mk(0.5, 0.6, 0.2), left_wrist: mk(0.62, 0.62, 0.2),
  }];
  const m = measureJoint(frames, "left", "elbow", "in_plane", 0.6, "median", ASPECT);
  assert.equal(m.confidence, "unsure");
  assert.equal(m.reason, "below_visibility_floor");
  const v = evaluateCheck(rubric.checks[0], { exerciseId: rubric.id, side: "left", frames, aspect: ASPECT });
  assert.equal(v.status, "unsure", "a hidden joint must not produce good/almost/fix");
  console.log("ENGINE_UNSURE_OK");
}

// ---- out-of-plane without world landmarks is 'unsure', not a 2D fallback
{
  const frames = [{
    left_shoulder: mk(0.5, 0.4), left_elbow: mk(0.5, 0.6), left_wrist: mk(0.62, 0.62),
  }];
  const m = measureJoint(frames, "left", "elbow", "out_of_plane", 0.6, "median", ASPECT);
  assert.equal(m.confidence, "unsure");
  assert.equal(m.reason, "world_landmarks_absent");
}
console.log("ENGINE_WORLD_GUARD_OK");

// ---- a good rep with plausible world-space geometry passes every check
// Build one arm whose interior elbow angle really is elbowDeg, in both spaces. The world
// points must encode the angle -- otherwise the world-space checks read whatever geometry
// was accidentally supplied and the test stops testing anything.
function pressFrame(elbowDeg: number, opts: { side?: string } = {}) {
  const side = opts.side ?? "left";
  const th = (elbowDeg * Math.PI) / 180;
  const sh: [number, number, number] = [0, 0, 0];
  const upLen = 0.30, foreLen = 0.28;
  const el: [number, number, number] = [0, upLen, 0];
  // forearm measured from the upper arm (which points from elbow back to shoulder, i.e. -y)
  const wr: [number, number, number] = [foreLen * Math.sin(th), upLen - foreLen * Math.cos(th), 0];
  const toImg = (p: [number, number, number]) => [0.5 + p[0] * 0.5, 0.2 + p[1] * 0.6];
  const si = toImg(sh), ei = toImg(el), wi = toImg(wr);
  return {
    [`${side}_shoulder`]: mk(si[0], si[1], 1, sh),
    [`${side}_elbow`]: mk(ei[0], ei[1], 1, el),
    [`${side}_wrist`]: mk(wi[0], wi[1], 1, wr),
  };
}
{
  // sanity: the synthetic frame really does carry the requested angle
  const probe = pressFrame(80);
  const got = jointAngle3d(probe.left_shoulder, probe.left_elbow, probe.left_wrist);
  assert.ok(Math.abs(got - 80) < 0.01, `test fixture broken: asked 80, built ${got}`);
}
{
  const bottom = Array.from({ length: 5 }, () => pressFrame(80));
  const top = Array.from({ length: 5 }, () => pressFrame(172));
  const depth = evaluateCheck(rubric.checks[0], { exerciseId: rubric.id, side: "left", frames: bottom, aspect: ASPECT });
  assert.notEqual(depth.status, "fix", `80-degree bottom must not be a depth fault: ${JSON.stringify(depth)}`);
  const lock = evaluateCheck(rubric.checks[1], { exerciseId: rubric.id, side: "left", frames: top, aspect: ASPECT });
  assert.notEqual(lock.status, "fix", `172-degree lockout must not be a lockout fault`);
}
console.log("ENGINE_GOOD_REP_OK");

// ---- tempo requires timing, and says so when it has none
{
  const v = evaluateCheck(rubric.checks[3], { exerciseId: rubric.id, side: "left", frames: [] , aspect: ASPECT });
  assert.equal(v.status, "unsure", "no timing means no tempo verdict");
  const slow = evaluateCheck(rubric.checks[3], { exerciseId: rubric.id, side: "left", frames: [], secondsAvailable: 2.0, aspect: ASPECT });
  assert.equal(slow.status, "good");
  const fast = evaluateCheck(rubric.checks[3], { exerciseId: rubric.id, side: "left", frames: [], secondsAvailable: 0.3, aspect: ASPECT });
  assert.equal(fast.status, "fix");
}
console.log("ENGINE_TEMPO_OK");

// ---- symmetry needs both arms visible
{
  const oneArm = Array.from({ length: 5 }, () => pressFrame(80));
  const v = evaluateCheck(rubric.checks[4], { exerciseId: rubric.id, side: "left", frames: oneArm, aspect: ASPECT });
  assert.equal(v.status, "unsure", "one visible arm cannot prove a difference");
}
console.log("ENGINE_SYMMETRY_OK");

// ---- wrist stack: the reference is the lifter's own press line, not the torso axis.
// A press on an incline travels up-and-forward, so the torso axis reports ~60 deg of drift on a
// clean rep; the segmenter learns the real line from the forearm at lockout and passes it in.
{
  const body = {
    left_shoulder: mk(0.46, 0.3), right_shoulder: mk(0.54, 0.3),
    left_hip: mk(0.47, 0.7), right_hip: mk(0.53, 0.7),
  };
  const wl = (x: number, y: number, wx: number, wy: number) => ({ ...mk(x, y), wx, wy, wz: 0 });
  const UP: [number, number, number] = [0, -1, 0];
  // forearm straight up from the elbow: stacked
  const stacked = [{
    ...body,
    left_elbow: wl(0.5, 0.5, 0, 0),
    left_wrist: wl(0.5, 0.35, 0, 0.15),
  }];
  const mOk = measureWristStack(stacked, "left", 0.6, UP);
  assert.ok(mOk.value < 5, `a forearm along the press line must read as stacked, got ${mOk.value}`);

  // forearm 30 deg off the press line: a lean the rubric should catch
  const lean = Math.sin(Math.PI / 6) * 0.15, drop = Math.cos(Math.PI / 6) * 0.15;
  const leaning = [{
    ...body,
    left_elbow: wl(0.5, 0.5, 0, 0),
    left_wrist: wl(0.5 + lean, 0.5 - drop, lean, drop),
  }];
  const mBad = measureWristStack(leaning, "left", 0.6, UP);
  assert.ok(Math.abs(mBad.value - 30) < 3, `a 30 deg lean must read as ~30, got ${mBad.value}`);

  // and it must refuse rather than fall back to a reference it knows is wrong
  const noAxis = measureWristStack(stacked, "left", 0.6, undefined);
  assert.equal(noAxis.confidence, "unsure", "without a press line there is no honest verdict");
}
console.log("ENGINE_WRIST_STACK_OK");

// ---- one cue at a time, fix before almost, rubric order respected
{
  const made = (id: string, status: any, label = id) => ({ id, label, status, confidence: "measured" as const, value: 0, cue: { en: "", hi: "" } });
  const w = worstCue([made("depth", "almost"), made("lockout", "fix"), made("tempo", "fix")]);
  assert.equal(w?.id, "lockout", "fix beats almost, then rubric order decides");
  assert.equal(worstCue([made("depth", "good")]), null, "a clean rep has nothing to say");
}
console.log("ENGINE_WORST_CUE_OK");

// ---- every cue in every rubric is plain language
for (const id of listExercises()) {
  const r = getRubric(id);
  for (const c of [...(r.setup ?? []), ...r.checks]) {
    for (const [k, v] of Object.entries(c.cue)) {
      for (const lang of ["en", "hi"] as const) {
        const text = (v as any)[lang] as string;
        assert.ok(text && text.trim().length > 0, `${id}/${c.id}/${k}/${lang} is empty`);
        const words = text.trim().split(/\s+/).length;
        assert.ok(words <= 14, `${id}/${c.id}/${k}/${lang} has ${words} words: "${text}"`);
        assert.ok(!/\d+\s*deg/i.test(text), `${id}/${c.id}/${k}/${lang} mentions degrees: "${text}"`);
        assert.ok(!/flexion|extension|abduction|scapula|torque|\bROM\b/i.test(text), `${id}/${c.id}/${k}/${lang} uses jargon: "${text}"`);
      }
    }
  }
}
console.log("ENGINE_PLAIN_OK");

console.log("ENGINE_ALL_OK");
