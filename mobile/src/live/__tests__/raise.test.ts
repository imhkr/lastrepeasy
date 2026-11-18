// The angle axis, proven on the movement that forced it.
//
// A lateral raise is the counter-example to every other family: shoulder-to-wrist barely changes,
// so the axis-free "distance" test sees a flat line, and the arm never points upward, so the
// press's learned axis has nothing to learn. Before the angle axis this family counted zero reps --
// the rubric existed, the picker offered it, and the coach silently did nothing.
import assert from "node:assert/strict";
import { evaluateAll } from "../engine.ts";
import { createSegmenter } from "../segment.ts";
import type { Landmarks, Pt } from "../engine.ts";

const FPS = 15;
// hip-shoulder-elbow: ~10 deg with the arm at the side, ~90 deg at shoulder height. Inverted so
// progress 1 is the rest position (arm down), like every other family. The lowering is the RETURN
// half: a raise lifts first and comes down second.
const RAISE_TRACK = {
  joint: "shoulder" as const, origin: "shoulder" as const, point: "wrist" as const,
  axis: "angle" as const, invert: true, eccentric: "return" as const,
};

// Arm abducted `deg` from the torso, standing. The abduction angle and this "arm angle from
// vertical" are the same number, which is what makes the clip checkable by eye.
// The arm is kept straight (elbow 180) because a bent elbow is the fault, not the rep.
function raisePose(abductDeg: number, vis = 1): Landmarks {
  const hipY = 0.8, shoulderY = 0.4;
  const upper = 0.16, fore = 0.16;
  const a = (abductDeg * Math.PI) / 180;
  const ex = 0.15 * Math.sin(a);
  const ey = shoulderY + 0.15 * Math.cos(a);
  const wx = ex + fore * Math.sin(a);
  const wy = ey + fore * Math.cos(a);

  const mk = (x: number, y: number): Pt => ({ x, y, vis, wx: x - 0.5, wy: y - 0.5, wz: 0 });
  const out: Landmarks = {};
  for (const [side, dz] of [["left", -0.03], ["right", 0.03]] as const) {
    out[`${side}_hip`] = mk(0.5 + dz, hipY);
    out[`${side}_shoulder`] = mk(0.5 + dz, shoulderY);
    out[`${side}_elbow`] = mk(0.5 + ex + dz, ey);
    out[`${side}_wrist`] = mk(0.5 + wx + dz, wy);
    out[`${side}_knee`] = mk(0.5 + dz, hipY + upper);
    out[`${side}_ankle`] = mk(0.5 + dz, 0.95);
    out[`${side}_foot_index`] = mk(0.58 + dz, 0.95);
  }
  return out;
}

function clip(abducts: number[], holdS = 0.8): Landmarks[] {
  const frames: Landmarks[] = [];
  const hold = Math.max(2, Math.round(holdS * FPS));
  for (let i = 0; i < hold; i++) frames.push(raisePose(8)); // stand with arms down
  for (const top of abducts) {
    for (let i = 0; i < round(1.2); i++) frames.push(raisePose(8 + ((top - 8) * i) / (round(1.2) - 1)));
    for (let i = 0; i < round(0.3); i++) frames.push(raisePose(top));
    for (let i = 0; i < round(1.5); i++) frames.push(raisePose(top - ((top - 8) * i) / (round(1.5) - 1)));
    for (let i = 0; i < hold; i++) frames.push(raisePose(8));
  }
  return frames;
}

function round(sec: number): number {
  return Math.max(2, Math.round(sec * FPS));
}

function segment(frames: Landmarks[]) {
  const seg = createSegmenter({ track: RAISE_TRACK });
  const reps: any[] = [];
  frames.forEach((lm, i) => {
    const done = seg.update(lm, i / FPS);
    if (done) reps.push(done);
  });
  return { reps, side: seg.side() };
}

// ---- the load-bearing claim: a raise is counted at all
{
  const { reps } = segment(clip([90, 90]));
  assert.equal(reps.length, 2, `a two-rep raise must segment as two, got ${reps.length}`);
  console.log("RAISE_SEGMENTS_OK");
}

// ---- the distance axis really cannot count this, which is why the axis exists
{
  const asDistance = createSegmenter({
    track: { joint: "shoulder", origin: "shoulder", point: "wrist", axis: "distance" },
  });
  let n = 0;
  clip([90, 90]).forEach((lm, i) => {
    if (asDistance.update(lm, i / FPS)) n += 1;
  });
  assert.equal(n, 0, `distance axis must not count a raise, counted ${n}`);
  console.log("RAISE_DISTANCE_BLIND_OK");
}

// ---- a full raise is not accused of stopping short
{
  const { reps, side } = segment(clip([90, 90]));
  const frames = clip([90, 90]);
  for (const r of reps) {
    const t0 = r.times[0], t1 = r.times[r.times.length - 1];
    const win = frames.filter((_, i) => i / FPS >= t0 - 1e-3 && i / FPS <= t1 + 1e-3);
    const verdicts = evaluateAll({
      exerciseId: "db-lateral-raise",
      side: side ?? "right",
      frames: win,
      aspect: 1,
      progress: win.length === r.progress.length ? r.progress : undefined,
      secondsAvailable: r.eccentricSeconds ?? undefined,
    });
    const range = verdicts.find((v) => v.id === "range");
    assert.ok(range, "the raise rubric must have a range check");
    assert.notEqual(range!.status, "fix", `a full raise was failed on range: ${JSON.stringify(range)}`);
  }
  console.log("RAISE_RANGE_OK");
}

// ---- a relaxing set is judged on the way DOWN, not on the way up
// The clip lifts slowly (1.8 s) and drops quickly (0.5 s). Measured on the wrong half this would
// report ~1.8 s and pass; measured correctly it reports ~0.5 s and catches the dropped weight.
{
  const frames: Landmarks[] = [];
  const hold = Math.round(0.8 * FPS);
  for (let i = 0; i < hold; i++) frames.push(raisePose(8));
  for (const _ of [0, 1]) {
    const up = Math.round(1.8 * FPS);
    for (let i = 0; i < up; i++) frames.push(raisePose(8 + (82 * i) / (up - 1)));
    const down = Math.max(2, Math.round(0.5 * FPS));
    for (let i = 0; i < down; i++) frames.push(raisePose(90 - (82 * i) / (down - 1)));
    for (let i = 0; i < hold; i++) frames.push(raisePose(8));
  }
  const { reps } = segment(frames);
  assert.ok(reps.length >= 1, "the uneven-tempo raise must still segment");
  const secs = reps[0].eccentricSeconds as number;
  assert.ok(
    secs !== null && secs < 1.0,
    `tempo must time the fast lowering (~0.5 s), not the slow lift (~1.8 s); got ${secs}`,
  );
  console.log("RAISE_TEMPO_HALF_OK");
}

console.log("RAISE_ALL_OK");
