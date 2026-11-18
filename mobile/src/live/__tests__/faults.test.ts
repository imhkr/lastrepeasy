// Guards the faults the coach exists to catch. Each clip here is built from geometry with exactly
// one injected mistake, and the engine must name that mistake -- and, just as important, must not
// name any other. A false "fix" on a clean rep is the failure this rewrite was opened to stop.
import assert from "node:assert/strict";
import { evaluateAll, getRubric } from "../engine.ts";
import { createSegmenter } from "../segment.ts";
import type { Landmarks, Pt } from "../engine.ts";

const FPS = 15;
const ASPECT = 1;

// shoulder at the origin, elbow angle `deg`, forearm leaning `lean` degrees toward the head.
// World landmarks carry the geometry in metres; image landmarks are the same pose normalized.
function pose(deg: number, lean: number, vis = 1): Landmarks {
  const th = (deg * Math.PI) / 180;
  const elx = -0.3 * Math.sin(th), ely = 0.3 * Math.cos(th);
  const l = (lean * Math.PI) / 180;
  const wrx = elx - 0.28 * Math.sin(l), wry = ely - 0.28 * Math.cos(l);

  const mk = (x: number, y: number): Pt => ({ x: 0.5 + x * 0.5, y: 0.5 + y * 0.5, vis, wx: x, wy: y, wz: 0 });
  const out: Landmarks = {};
  for (const [side, sx] of [["left", -1], ["right", 1]] as const) {
    out[`${side}_shoulder`] = mk(0, 0);
    out[`${side}_elbow`] = mk(elx * sx, ely);
    out[`${side}_wrist`] = mk(wrx * sx, wry);
    out[`${side}_hip`] = mk(0.2, 0.5);
  }
  return out;
}

type Opts = { reps?: number; bottom?: number; top?: number; downS?: number; upS?: number; lean?: number };

function clip({ reps = 2, bottom = 80, top = 172, downS = 2.0, upS = 1.5, lean = 5 }: Opts = {}): Landmarks[] {
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
  return angles.map((a) => pose(a, lean * (1 - (a - bottom) / Math.max(top - bottom, 1e-6))));
}

function judge(frames: Landmarks[]) {
  const seg = createSegmenter();
  const reps: any[] = [];
  frames.forEach((lm, i) => {
    const done = seg.update(lm, i / FPS);
    if (done) reps.push(done);
  });
  return reps.map((r) => {
    const t0 = r.times[0], t1 = r.times[r.times.length - 1];
    const win = frames.filter((_, i) => i / FPS >= t0 - 1e-3 && i / FPS <= t1 + 1e-3);
    const verdicts = evaluateAll({
      exerciseId: "low_incline_db_press",
      side: seg.side() ?? "right",
      frames: win,
      aspect: ASPECT,
      progress: win.length === r.progress.length ? r.progress : undefined,
      secondsAvailable: r.eccentricSeconds ?? undefined,
      pressAxis: seg.axis() ?? undefined,
    });
    return Object.fromEntries(verdicts.map((v) => [v.id, v.status])) as Record<string, string>;
  });
}

function onlyFix(statuses: Record<string, string>, want: string | null, label: string) {
  const fixes = Object.entries(statuses).filter(([, s]) => s === "fix").map(([id]) => id);
  assert.deepEqual(fixes, want === null ? [] : [want], `${label}: expected fixes ${want ?? "none"}, got ${fixes.join(",") || "none"}`);
}

// ---- a clean set is never accused of anything
{
  const reps = judge(clip());
  assert.equal(reps.length, 2, "two clean reps must segment as two");
  for (const s of reps) onlyFix(s, null, "clean rep");
  console.log("FAULTS_CLEAN_OK");
}

// ---- a shallow press is caught on depth. This is the clip that reported ZERO reps when height
// alone defined a rep, because the hands barely travel while the elbow bends a full 37 degrees.
{
  const reps = judge(clip({ bottom: 130 }));
  assert.equal(reps.length, 2, "a shallow rep still segments");
  for (const s of reps) onlyFix(s, "depth", "shallow rep");
  console.log("FAULTS_SHALLOW_OK");
}

// ---- stopping short is caught on lockout, and graded at the real top, not the way up
{
  const reps = judge(clip({ top: 125 }));
  assert.equal(reps.length, 2);
  for (const s of reps) onlyFix(s, "lockout", "short lockout");
  console.log("FAULTS_LOCKOUT_OK");
}

// ---- dropping the weight is caught on tempo
{
  const reps = judge(clip({ downS: 0.4 }));
  assert.equal(reps.length, 2);
  for (const s of reps) onlyFix(s, "tempo", "fast eccentric");
  console.log("FAULTS_TEMPO_OK");
}

// ---- a forearm that swings off the press line is caught on the hands check. Only that check is
// asserted here: the same lean also rotates the 2D elbow, so depth legitimately moves with it.
{
  const reps = judge(clip({ lean: 80 }));
  assert.ok(reps.length >= 1, "a swinging press still segments");
  assert.equal(reps[0].elbow_path, "fix", `a swinging forearm must be caught, got ${reps[0].elbow_path}`);
  console.log("FAULTS_HANDS_OK");
}

console.log("FAULTS_OK");
