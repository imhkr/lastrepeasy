// Guards the generated WebView bundle against the bugs that took a real clip to find.
//
// runtime.generated.ts is what the phone actually executes. If the bundler drops a module, flattens
// two same-named exports into one, or ships stale TypeScript, the app goes blank or judges wrongly
// and no unit test of engine.ts would notice. So these checks run the BUNDLE, not the source.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RUNTIME_JS } from "../runtime.generated.ts";

const LIVE: any = new Function(`${RUNTIME_JS}\nreturn LIVE;`)();

// ---- the bundle is wired up at all
assert.ok(LIVE.rubrics && LIVE.rubrics.low_incline_db_press, "bundle must carry the rubric");
assert.equal(typeof LIVE.engine.evaluateAll, "function");
assert.equal(typeof LIVE.engine.detectView, "function");
assert.equal(typeof LIVE.overlay.buildSkeleton, "function");
assert.equal(typeof LIVE.segment.createSegmenter, "function");
console.log("RUNTIME_WIRED_OK");

// ---- namespacing: engine and overlay both export plausible/DEG from their own module. A flattened
// bundle would silently pick one. Both must still work through their own namespaces.
assert.equal(LIVE.engine.plausible("elbow", 90), true);
assert.equal(LIVE.engine.plausible("elbow", 8), false);
assert.equal(LIVE.overlay.plausible("elbow", 90), true);
console.log("RUNTIME_NAMESPACED_OK");

// ---- the real clip. This is the regression the whole rewrite exists for: a press clip must be
// segmented into reps and judged without inventing impossible angles.
type Frame = { t: number; kp: Record<string, number[]> };
const clip = JSON.parse(
  readFileSync(new URL("../../../../backend/tests/fixtures/press_clip_landmarks.json", import.meta.url), "utf8"),
) as { width: number; height: number; frames: Frame[] };

const toLandmarks = (f: Frame) => {
  const lm: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f.kp)) {
    lm[k] = { x: v[0], y: v[1], vis: v[2], wx: v[3], wy: v[4], wz: v[5] };
  }
  return lm;
};

const frames = clip.frames.map(toLandmarks);
const aspect = clip.width / clip.height;

const view = LIVE.engine.detectView(frames);
assert.ok(["front", "side", "45"].includes(view.view), `view must classify, got ${view.view}`);
console.log("RUNTIME_VIEW_OK");

// The segmenter must find at least one rep, and its bottom must lie inside the rep it belongs to.
const seg = LIVE.segment.createSegmenter();
const reps: any[] = [];
for (const f of clip.frames) {
  const done = seg.update(toLandmarks(f), f.t);
  if (done) reps.push(done);
}
assert.ok(reps.length >= 1, `expected at least one rep, got ${reps.length}`);
for (const r of reps) {
  assert.ok(r.bottomT >= r.startT, `bottom ${r.bottomT} must not precede start ${r.startT}`);
  assert.ok(r.endT >= r.bottomT, `end ${r.endT} must not precede bottom ${r.bottomT}`);
}
console.log(`RUNTIME_SEGMENT_OK reps=${reps.length}`);

// ---- judging: every verdict must be a legal status, a real cue, and a plausible number.
const startIdx = Math.max(0, clip.frames.findIndex((f) => f.t >= reps[reps.length - 1].startT));
const repFrames = clip.frames.slice(startIdx).map(toLandmarks);
const verdicts = LIVE.engine.evaluateAll({
  exerciseId: "low_incline_db_press",
  side: "right",
  frames: repFrames,
  aspect,
  secondsAvailable: reps[reps.length - 1].eccentricSeconds ?? undefined,
});
assert.ok(verdicts.length > 0, "a judged rep must produce verdicts");
for (const vd of verdicts) {
  assert.ok(["good", "almost", "fix", "unsure"].includes(vd.status), `bad status ${vd.status}`);
  assert.ok(vd.cue && vd.cue.en && vd.cue.hi, `verdict ${vd.id} has no bilingual cue`);
  if (vd.status !== "unsure") {
    assert.ok(Number.isFinite(vd.value), `${vd.id} claims ${vd.status} with no number`);
  }
}
console.log("RUNTIME_VERDICTS_OK " + verdicts.map((x: any) => `${x.id}:${x.status}`).join(","));

// ---- refusal: an exercise with no rubric must throw, never fall back to something else.
assert.throws(
  () => LIVE.engine.getRubric("barbell_back_squat"),
  /no rubric/,
  "an unsupported exercise must refuse",
);
console.log("RUNTIME_NO_DEFAULT_OK");

// ---- the cue must match the failure direction. A rep that went too deep must not be told to
// "go lower": on a one-sided band the number alone cannot say which side it missed.
const deepCheck = LIVE.engine.getRubric("low_incline_db_press").checks.find((c: any) => c.id === "depth");
const tooDeep = LIVE.engine.evaluateCheck(deepCheck, {
  exerciseId: "low_incline_db_press",
  side: "right",
  frames: repFrames,
  aspect,
  secondsAvailable: 2,
});
if (tooDeep.status === "fix" && Number.isFinite(tooDeep.value) && tooDeep.value < deepCheck.good[0]) {
  assert.ok(
    !/go a little lower/i.test(tooDeep.cue.en),
    `a too-deep rep got a "go lower" cue: ${tooDeep.cue.en}`,
  );
}
console.log("RUNTIME_CUE_SIDE_OK");

console.log("RUNTIME_OK");
