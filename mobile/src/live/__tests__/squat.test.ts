// Proves the second movement family works end to end. Until now the segmenter counted reps off the
// elbow and the engine only knew elbow bands, so a squat could not be counted or judged at all --
// which is why the coach could only ever cover the press family.
//
// Each clip is real geometry: the hip travels down toward the planted foot as the knee bends, which
// is exactly what a hack squat looks like from the side.
import assert from "node:assert/strict";
import { evaluateAll, getRubric } from "../engine.ts";
import { createSegmenter } from "../segment.ts";
import type { Landmarks, Pt } from "../engine.ts";

const FPS = 15;
const ASPECT = 1;
const SQUAT_TRACK = {
  joint: "knee" as const, origin: "ankle" as const, point: "hip" as const, axis: "distance" as const,
};

// A side-on squat. The foot stays planted, the knee bends to `deg`, and the hip drops by the
// geometry of a two-segment leg -- so the hip really does travel when the knee bends.
// `lean` tips the torso forward, which is the fault the lean check exists to catch.
function squatPose(deg: number, lean = 10, vis = 1): Landmarks {
  const thigh = 0.42, shin = 0.42;
  const a = (deg * Math.PI) / 180;
  // Knee angle `deg` between the shin (pointing down from knee to ankle) and the thigh.
  const ankleY = 0.95;
  const kneeY = ankleY - shin;
  const kneeX = 0.5;
  // Thigh swings back from the knee by (180 - deg) from straight down.
  const thighFromDown = Math.PI - a;
  const hipX = kneeX + thigh * Math.sin(thighFromDown);
  const hipY = kneeY - thigh * Math.cos(thighFromDown);
  // Torso leans forward `lean` degrees from vertical, measured from the hip.
  const l = (lean * Math.PI) / 180;
  const torso = 0.5;
  const shX = hipX + torso * Math.sin(l);
  const shY = hipY - torso * Math.cos(l);

  const mk = (x: number, y: number): Pt => ({ x, y, vis, wx: x - 0.5, wy: y - 0.5, wz: 0 });
  const out: Landmarks = {};
  for (const [side, dz] of [["left", -0.03], ["right", 0.03]] as const) {
    out[`${side}_hip`] = mk(hipX + dz, hipY);
    out[`${side}_knee`] = mk(kneeX + dz, kneeY);
    out[`${side}_ankle`] = mk(kneeX + dz, ankleY);
    out[`${side}_foot_index`] = mk(kneeX + 0.08 + dz, ankleY);
    out[`${side}_shoulder`] = mk(shX + dz, shY);
    out[`${side}_elbow`] = mk(shX + dz, shY + 0.15);
    out[`${side}_wrist`] = mk(shX + dz, shY + 0.3);
  }
  return out;
}

type Opts = { reps?: number; bottom?: number; top?: number; downS?: number; upS?: number; lean?: number };

function clip({ reps = 2, bottom = 85, top = 172, downS = 2.0, upS = 1.5, lean = 10 }: Opts = {}): Landmarks[] {
  const angles: number[] = [];
  const hold = Math.round(0.8 * FPS);
  for (let i = 0; i < hold; i++) angles.push(top);
  for (let r = 0; r < reps; r++) {
    const down = Math.max(2, Math.round(downS * FPS));
    for (let i = 0; i < down; i++) angles.push(top - ((top - bottom) * i) / (down - 1));
    for (let i = 0; i < Math.round(0.3 * FPS); i++) angles.push(bottom);
    const up = Math.max(2, Math.round(upS * FPS));
    for (let i = 0; i < up; i++) angles.push(bottom + ((top - bottom) * i) / (up - 1));
    for (let i = 0; i < hold; i++) angles.push(top);
  }
  return angles.map((a) => squatPose(a, lean));
}

function judge(frames: Landmarks[]) {
  const seg = createSegmenter({ track: SQUAT_TRACK });
  const reps: any[] = [];
  frames.forEach((lm, i) => {
    const done = seg.update(lm, i / FPS);
    if (done) reps.push(done);
  });
  return reps.map((r) => {
    const t0 = r.times[0], t1 = r.times[r.times.length - 1];
    const win = frames.filter((_, i) => i / FPS >= t0 - 1e-3 && i / FPS <= t1 + 1e-3);
    const verdicts = evaluateAll({
      exerciseId: "hack-squat",
      side: seg.side() ?? "right",
      frames: win,
      aspect: ASPECT,
      progress: win.length === r.progress.length ? r.progress : undefined,
      secondsAvailable: r.eccentricSeconds ?? undefined,
    });
    return Object.fromEntries(verdicts.map((v) => [v.id, v.status])) as Record<string, string>;
  });
}

function onlyFix(statuses: Record<string, string>, want: string | null, label: string) {
  const fixes = Object.entries(statuses).filter(([, s]) => s === "fix").map(([id]) => id);
  assert.deepEqual(fixes, want === null ? [] : [want], `${label}: expected ${want ?? "no fixes"}, got ${fixes.join(",") || "none"}`);
}

// ---- the load-bearing claim: a squat is counted at all
{
  const reps = judge(clip());
  assert.equal(reps.length, 2, `a two-rep squat must segment as two, got ${reps.length}`);
  console.log("SQUAT_SEGMENTS_OK");
}

// ---- the squat rubric resolves and declares the right geometry
{
  const r = getRubric("hack-squat") as any;
  assert.equal(r.family, "squat");
  assert.deepEqual(r.track, SQUAT_TRACK);
  assert.deepEqual(r.checks.map((c: any) => c.id), ["depth", "lockout", "lean", "tempo", "even"]);
  console.log("SQUAT_RUBRIC_OK");
}

// ---- a clean squat is not accused of anything
{
  const reps = judge(clip());
  for (const s of reps) onlyFix(s, null, "clean squat");
  console.log("SQUAT_CLEAN_OK");
}

// ---- a half squat is caught on depth alone
{
  const reps = judge(clip({ bottom: 135 }));
  assert.ok(reps.length >= 1, "a shallow squat still segments");
  for (const s of reps) {
    const fixes = Object.entries(s).filter(([, v]) => v === "fix").map(([k]) => k);
    assert.ok(fixes.includes("depth"), `a half squat must be caught on depth, got ${fixes.join(",") || "none"}`);
  }
  console.log("SQUAT_SHALLOW_OK");
}

// ---- collapsing the chest forward is caught on lean
{
  const reps = judge(clip({ lean: 70 }));
  assert.ok(reps.length >= 1, "a leaning squat still segments");
  const fixes = Object.entries(reps[0]).filter(([, v]) => v === "fix").map(([k]) => k);
  assert.ok(fixes.includes("lean"), `a folded chest must be caught on lean, got ${fixes.join(",") || "none"}`);
  console.log("SQUAT_LEAN_OK");
}

console.log("SQUAT_ALL_OK");
