import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CORE_JS } from "../liveCore.ts";

const CORE: any = new Function(CORE_JS + "; return CORE;")();

function run(frames: any[]) {
  const coach = CORE.createCoach();
  const events: any[] = [];
  let last: any = null;
  for (const f of frames) {
    const r = coach.update(f);
    events.push(...r.events);
    last = r.view;
  }
  return { reps: coach.reps(), events, last };
}
const st = (rep: any, key: string) => Object.fromEntries(rep.checks.map((c: any) => [c.key, c.status]))[key];

// ---- G3: same landmarks the Python coach judged
const fx = JSON.parse(readFileSync(new URL("../../../../backend/tests/fixtures/press_clip_landmarks.json", import.meta.url), "utf8"));
const real = run(fx.frames.map((f: any) => ({ t: f.t, w: fx.width, h: fx.height, kp: f.kp })));
assert.equal(real.reps.length, 1, "real clip has exactly one rep, got " + real.reps.length);
const rc = Object.fromEntries(real.reps[0].checks.map((c: any) => [c.key, c.status]));
console.log("real clip verdicts", JSON.stringify(rc));
assert.equal(rc.depth, "good");
assert.equal(rc.lockout, "good");
assert.equal(rc.hands, "unsure");
assert.notEqual(rc.speed, "fix");
assert.ok(!Object.values(rc).includes("fix"), "a correct rep must never be marked wrong");
assert.ok(real.events.some((e: any) => e.type === "rep_done" && /^Rep 1\./.test(e.speak.en) && /^Rep 1\./.test(e.speak.hi)), "speaks after the rep, in both languages");
console.log("LIVE_CORE_OK");

// ---- G4: deliberate mistakes on synthetic reps (geometry mirrors backend/tests/test_press_coach.py)
const FPS = 15;
function press(o: { reps?: number; bottom?: number; top?: number; down?: number; up?: number; lean?: number; vis?: number; both?: boolean; lagBottom?: number }) {
  const { reps = 2, bottom = 80, top = 172, down = 2.0, up = 1.5, lean = 5, vis = 1, both = false, lagBottom = 0 } = o;
  const seq: number[] = [];
  const hold = Math.floor(0.8 * FPS);
  const ramp = (a: number, b: number, s: number) => {
    const n = Math.max(2, Math.floor(s * FPS));
    return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
  };
  for (let i = 0; i < hold; i++) seq.push(top);
  for (let r = 0; r < reps; r++) {
    seq.push(...ramp(top, bottom, down), ...Array(Math.floor(0.3 * FPS)).fill(bottom), ...ramp(bottom, top, up));
    for (let i = 0; i < hold; i++) seq.push(top);
  }
  return seq.map((a, i) => {
    const kp: any = {};
    for (const side of both ? ["left", "right"] : ["right"]) {
      const aa = side === "left" ? Math.min(top, a + lagBottom * (1 - (a - bottom) / (top - bottom))) : a;
      const th = (aa * Math.PI) / 180;
      const p = (aa - bottom) / Math.max(top - bottom, 1e-6);
      const l = (lean * (1 - p) * Math.PI) / 180;
      const el = [-0.3 * Math.sin(th), 0.3 * Math.cos(th)];
      const wr = [el[0] + 0.28 * -Math.sin(l), el[1] + 0.28 * -Math.cos(l)];
      const mk = (x: number, y: number) => [0.5 + x * 0.5, 0.5 + y * 0.5, vis, x, y, 0];
      kp[`${side}_shoulder`] = mk(0, 0); kp[`${side}_elbow`] = mk(el[0], el[1]);
      kp[`${side}_wrist`] = mk(wr[0], wr[1]); kp[`${side}_hip`] = mk(0.2, 0.5);
    }
    return { t: i / FPS, w: 1000, h: 1000, kp };
  });
}

const good = run(press({ reps: 2 }));
assert.equal(good.reps.length, 2, "two good reps found, got " + good.reps.length);
for (const r of good.reps) assert.ok(r.checks.every((c: any) => c.status === "good"), JSON.stringify(r.checks.map((c: any) => [c.key, c.status])));
assert.ok(good.events.filter((e: any) => e.type === "rep_done").every((e: any) => /Good rep\./.test(e.speak.en) && /Badhiya rep\./.test(e.speak.hi)), "quiet praise only on good reps");

assert.equal(st(run(press({ reps: 1, bottom: 130 })).reps[0], "depth"), "fix", "shallow");
assert.equal(st(run(press({ reps: 1, top: 125 })).reps[0], "lockout"), "fix", "no lockout");
assert.equal(st(run(press({ reps: 1, down: 0.4 })).reps[0], "speed"), "fix", "dropping fast");
const drift = run(press({ reps: 1, lean: 80 })).reps[0];
assert.equal(st(drift, "hands"), "fix", "hands drifting");
assert.ok(/head/.test(drift.checks.find((c: any) => c.key === "hands").message), "says which way");
assert.equal(st(run(press({ reps: 1, both: true, lagBottom: 50 })).reps[0], "arms"), "fix", "one arm lagging");
assert.equal(run(press({ reps: 1, vis: 0.3 })).reps.length, 0, "unseen arms: judge nothing");
console.log("LIVE_MISTAKES_OK");

// holding still with tracker noise is not a rep and must stay silent
{
  const still = press({ reps: 0 });
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
  const noisy = Array.from({ length: 150 }, (_, i) => {
    const f: any = JSON.parse(JSON.stringify(still[i % still.length]));
    for (const k of Object.keys(f.kp)) { f.kp[k][0] += rnd() * 0.004; f.kp[k][1] += rnd() * 0.004; f.kp[k][3] += rnd() * 0.004; f.kp[k][4] += rnd() * 0.004; }
    f.t = i / FPS;
    return f;
  });
  const r = run(noisy);
  assert.equal(r.reps.length, 0, "no reps while standing still");
  assert.equal(r.events.length, 0, "silent while standing still");
  console.log("LIVE_STILL_OK");
}
