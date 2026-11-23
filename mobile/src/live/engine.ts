// On-device rubric engine: the same judgement the Python backend makes, running in the WebView so the
// live coach can respond in ~20 ms with no network. It reads the SAME rubric JSON (rubrics.generated.ts,
// emitted by backend/app/services/rubric_codegen.py) rather than keeping its own copy of the thresholds.
//
// The old liveCore.ts hardcoded one exercise's numbers and judged every clip with them, which is how a
// squat got told to "straighten your arms". Exercise choice is now a required input; there is no default.
import { RUBRICS } from "./rubrics.generated.ts";

export type Status = "good" | "almost" | "fix" | "unsure";
export type Confidence = "measured" | "estimate" | "unsure";

export type Pt = { x: number; y: number; vis: number; wx?: number; wy?: number; wz?: number };
export type Landmarks = Record<string, Pt>;

export type CheckVerdict = {
  id: string;
  label: string;
  status: Status;
  confidence: Confidence;
  value: number;
  cue: { en: string; hi: string };
  reason?: string;
};

export type RubricCheck = {
  id: string;
  label: string;
  joint?: string;
  at?: string;
  measure?: string;
  capture?: "in_plane" | "out_of_plane";
  robust?: string;
  min_visibility?: number;
  good: [number, number];
  almost?: [number, number];
  // Status cues. `below` / `above` override `fix` when the value fell off that side of the band,
  // because "go lower" is the wrong advice for a rep that already went too low -- and on a
  // one-sided band the value alone cannot say which side it missed on.
  cue: Partial<Record<Status | "below" | "above", { en: string; hi: string }>>;
};

export type Rubric = {
  id: string;
  name?: string;
  family?: string;
  // One view, or a set of views the rubric judges reliably from. A press is equally readable from
  // the front and from 45 degrees; demanding exactly "45" refused clips that were perfectly
  // measurable, so the rubric states the set instead of the ideal.
  view?: string | string[];
  // Which geometry defines one rep for this exercise. Omitted means the press default
  // (wrist off the shoulder, elbow extending); a squat names the hip travelling toward the
  // planted foot with the knee extending, which is what makes it countable at all.
  track?: {
    joint: "elbow" | "knee" | "shoulder" | "hip" | "ankle";
    origin: "shoulder" | "hip" | "ankle";
    point: "wrist" | "elbow" | "knee" | "hip" | "ankle" | "foot_index" | "shoulder";
    axis: "forearm" | "distance" | "angle";
    invert?: boolean;
    eccentric?: "outbound" | "return";
  };
  phases?: string[];
  setup?: RubricCheck[];
  checks: RubricCheck[];
};

const DEG = 180 / Math.PI;
const RANGES: Record<string, [number, number]> = {
  elbow: [20, 180], knee: [20, 180], shoulder: [0, 195], hip: [10, 200], ankle: [30, 160],
};

// Plan ids are hyphenated (`low-incline-db-press`) while rubric files are underscored, because the
// two were written in different places. A tap on an exercise card therefore asked for a rubric that
// existed and was told it did not. Only the FORMAT is unified; an id with no rubric still throws.
export function normalizeId(exerciseId: string): string {
  return exerciseId.replace(/-/g, "_").trim().toLowerCase();
}

export function getRubric(exerciseId: string): Rubric {
  const all = RUBRICS as Record<string, unknown>;
  const r = (all[exerciseId] ?? all[normalizeId(exerciseId)]) as Rubric | undefined;
  if (!r) {
    // Loud, not silent. Judging an unknown exercise with a guessed rubric is the original bug.
    throw new Error(
      `no rubric for "${exerciseId}"; known: ${Object.keys(RUBRICS).sort().join(", ")}`,
    );
  }
  return r;
}

export function listExercises(): string[] {
  return Object.keys(RUBRICS).sort();
}

export function plausible(joint: string, deg: number): boolean {
  if (!Number.isFinite(deg)) return false;
  const r = RANGES[joint.replace(/^(left|right)_/, "")];
  return !r || (deg >= r[0] && deg <= r[1]);
}

// Landmarks are normalized, so x and y are in different units on a non-square frame. Scaling x by the
// aspect ratio is what makes the angle true; skipping it skews a diagonal limb by ~16 deg on 16:9.
export function jointAngleDeg(a: Pt, b: Pt, c: Pt, aspect = 1): number {
  const ux = (a.x - b.x) * aspect, uy = a.y - b.y;
  const vx = (c.x - b.x) * aspect, vy = c.y - b.y;
  const nu = Math.hypot(ux, uy), nv = Math.hypot(vx, vy);
  if (nu < 1e-9 || nv < 1e-9) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (nu * nv)))) * DEG;
}

// World-space angle. MediaPipe's world landmarks are a learned depth lift, not a measurement, so callers
// report the result as an 'estimate' -- the rubric widens its band to match.
export function jointAngle3d(a: Pt, b: Pt, c: Pt): number {
  if (a.wx == null || b.wx == null || c.wx == null) return NaN;
  const ux = a.wx! - b.wx!, uy = a.wy! - b.wy!, uz = a.wz! - b.wz!;
  const vx = c.wx! - b.wx!, vy = c.wy! - b.wy!, vz = c.wz! - b.wz!;
  const nu = Math.hypot(ux, uy, uz), nv = Math.hypot(vx, vy, vz);
  if (nu < 1e-9 || nv < 1e-9) return NaN;
  const cos = (ux * vx + uy * vy + uz * vz) / (nu * nv);
  return Math.acos(Math.max(-1, Math.min(1, cos))) * DEG;
}

const TRIPLES: Record<string, [string, string, string]> = {
  elbow: ["shoulder", "elbow", "wrist"],
  knee: ["hip", "knee", "ankle"],
  shoulder: ["hip", "shoulder", "elbow"],
  hip: ["shoulder", "hip", "knee"],
  ankle: ["knee", "ankle", "foot_index"],
};

export function median(items: number[]): number {
  const a = items.filter((v) => Number.isFinite(v)).sort((x, y) => x - y);
  if (!a.length) return NaN;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

export function aggregate(values: number[], how = "median"): number {
  const a = values.filter((v) => Number.isFinite(v));
  if (!a.length) return NaN;
  if (how === "max") return Math.max(...a);
  if (how === "min_of_3") return median(a.slice().sort((x, y) => x - y).slice(0, 3));
  if (how === "p10" || how === "p90") {
    const s = a.slice().sort((x, y) => x - y);
    const q = how === "p10" ? 0.1 : 0.9;
    return s[Math.min(s.length - 1, Math.floor(q * (s.length - 1) + 0.5))];
  }
  return median(a);
}

function bandStatus(v: number, good: [number, number], almost?: [number, number]): Status {
  if (v >= good[0] && v <= good[1]) return "good";
  if (almost && v >= almost[0] && v <= almost[1]) return "almost";
  return "fix";
}

// Which side of the band the value missed on. `good` decides the reference: a depth band of
// [70, 95] means under 70 is too shallow (go lower) and over 95 is too deep (do not go so low).
// Without this, both failures collapse into one cue and half of them say the opposite of the fix.
function missSide(v: number, good: [number, number]): "below" | "above" {
  return v < good[0] ? "below" : "above";
}

// Measure one joint across a window of frames. A hidden joint returns NaN and the caller reports
// 'unsure' -- never a guess, because a false correction on a correct rep is the worst outcome.
export function measureJoint(
  frames: Landmarks[],
  side: string,
  joint: string,
  capture: "in_plane" | "out_of_plane",
  minVis: number,
  robust: string,
  aspect = 1,
): { value: number; confidence: Confidence; reason?: string; samples: number } {
  const triple = TRIPLES[joint];
  if (!triple) return { value: NaN, confidence: "unsure", reason: `unknown_joint:${joint}`, samples: 0 };
  const [p0, p1, p2] = triple;
  const vals: number[] = [];
  let worldPresent = false;
  for (const f of frames) {
    const a = f[`${side}_${p0}`], b = f[`${side}_${p1}`], c = f[`${side}_${p2}`];
    if (!a || !b || !c) continue;
    if (a.wx != null && b.wx != null && c.wx != null && (a.wx || b.wx || c.wx)) worldPresent = true;
    if (Math.min(a.vis, b.vis, c.vis) < minVis) continue;
    const v = capture === "out_of_plane" ? jointAngle3d(a, b, c) : jointAngleDeg(a, b, c, aspect);
    if (Number.isFinite(v)) vals.push(v);
  }
  if (capture === "out_of_plane" && !worldPresent) {
    return { value: NaN, confidence: "unsure", reason: "world_landmarks_absent", samples: 0 };
  }
  if (!vals.length) return { value: NaN, confidence: "unsure", reason: "below_visibility_floor", samples: 0 };
  const value = aggregate(vals, robust);
  if (!plausible(joint, value)) {
    return { value, confidence: "unsure", reason: `implausible:${joint}=${value.toFixed(1)}deg`, samples: vals.length };
  }
  return {
    value,
    confidence: capture === "out_of_plane" ? "estimate" : "measured",
    samples: vals.length,
  };
}

// How far the torso is from upright, in the image plane: 0 is standing straight, 90 is lying flat.
// This is the hinge measure. A squat leans forward a little, an RDL leans a lot, and a curl should
// barely lean at all -- so the same number expresses three different faults depending on the rubric.
//
// It is deliberately image-space. Torso angle is in-plane for every camera position the rubrics
// accept, so a 2D reading is a real measurement; using world landmarks here would import the depth
// lift's error for no gain.
export function measureTorsoLean(
  frames: Landmarks[],
  aspect = 1,
): { value: number; confidence: Confidence; reason?: string } {
  const leans: number[] = [];
  for (const f of frames) {
    const ls = f.left_shoulder, rs = f.right_shoulder, lh = f.left_hip, rh = f.right_hip;
    if (!ls || !rs || !lh || !rh) continue;
    if (Math.min(ls.vis, rs.vis, lh.vis, rh.vis) < 0.6) continue;
    const shx = (ls.x + rs.x) / 2, shy = (ls.y + rs.y) / 2;
    const hpx = (lh.x + rh.x) / 2, hpy = (lh.y + rh.y) / 2;
    // Hip -> shoulder, aspect-corrected so the angle is physical rather than a normalized artefact.
    const vx = (shx - hpx) * aspect, vy = shy - hpy;
    const n = Math.hypot(vx, vy);
    if (n < 1e-9) continue;
    // Image y grows downward, so "up" is (0, -1). A vertical torso gives dot = 1 and 0 degrees.
    const dot = Math.max(-1, Math.min(1, -vy / n));
    leans.push((Math.acos(dot) * 180) / Math.PI);
  }
  if (!leans.length) return { value: NaN, confidence: "unsure", reason: "torso_axis_lost" };
  const value = median(leans);
  if (!Number.isFinite(value)) return { value: NaN, confidence: "unsure", reason: "torso_axis_lost" };
  return { value, confidence: "measured" };
}

// "Hands stacked over elbows" means the forearm points along the press line, so the reference is
// the line the hands travel on -- not the torso's up axis and not the upper arm.
//
// Both obvious alternatives are wrong on a real incline press. Against the upper arm, a straight
// arm scores as perfectly stacked and a correctly vertical forearm scores as badly off. Against
// the torso's up axis, an incline press reads as a 60-degree fault on every clean rep, because the
// arm travels up-and-forward along the bench angle rather than straight up. The press axis is
// derived by the segmenter from the lifter's own forearm at lockout, so it absorbs the bench angle
// and the camera tilt together, and the check then measures genuine drift during the rep.
export function measureWristStack(
  frames: Landmarks[],
  side: string,
  minVis: number,
  pressAxis?: [number, number, number],
): { value: number; confidence: Confidence; reason?: string } {
  // Refused rather than guessed: without the press line the only alternative reference is the torso
  // axis, which reports ~60 deg of drift on a clean incline rep. No axis, no verdict.
  if (!pressAxis) return { value: NaN, confidence: "unsure", reason: "no_press_axis" };
  const leans: number[] = [];
  for (const f of frames) {
    const sh = f[`${side}_shoulder`], el = f[`${side}_elbow`], wr = f[`${side}_wrist`];
    if (!sh || !el || !wr) continue;
    if (Math.min(sh.vis, el.vis, wr.vis) < minVis) continue;
    if (el.wx == null || wr.wx == null) continue;
    const axis = pressAxis;
    const fore: [number, number, number] = [wr.wx - el.wx, wr.wy! - el.wy!, wr.wz! - el.wz!];
    const nu = Math.hypot(axis[0], axis[1], axis[2]);
    const nf = Math.hypot(fore[0], fore[1], fore[2]);
    if (nu < 1e-9 || nf < 1e-9) continue;
    const u: [number, number, number] = [axis[0] / nu, axis[1] / nu, axis[2] / nu];
    let dot = (u[0] * fore[0] + u[1] * fore[1] + u[2] * fore[2]) / nf;
    // A forearm along the press line can point either way along it; direction is not the fault,
    // the deviation is, so fold the angle into 0..90 instead of scoring a flipped axis as worst.
    dot = Math.abs(Math.max(-1, Math.min(1, dot)));
    leans.push((Math.acos(dot) * 180) / Math.PI);
  }
  if (!leans.length) return { value: NaN, confidence: "unsure", reason: "below_visibility_floor" };
  return { value: median(leans), confidence: "estimate" };
}

function pickCue(check: RubricCheck, status: Status, value: number): { en: string; hi: string } {
  if (status === "unsure") {
    return {
      en: "I could not see that part clearly. Move the phone to the side.",
      hi: "Woh hissa saaf nahi dikha. Phone side mein rakho.",
    };
  }
  // A side-specific cue wins over the generic `fix`, so "too deep" and "too shallow" stop sharing
  // one sentence. Falls back to `fix`, then to the good line, so a rubric need not define all three.
  if (status === "fix") {
    const side = missSide(value, check.good);
    const c = check.cue[side] || check.cue.fix || check.cue.good;
    if (c) return { en: c.en, hi: c.hi };
  }
  const c = check.cue[status] || check.cue.fix || check.cue.good;
  if (!c) return { en: "", hi: "" };
  return { en: c.en, hi: c.hi };
}

export type EvaluateInput = {
  exerciseId: string;
  side: string;
  frames: Landmarks[];
  aspect?: number;
  secondsAvailable?: number; // eccentric duration, measured by the caller's rep segmentation
  progress?: number[]; // 0 bottom .. 1 top, one per frame; lets a check pick its own phase
  pressAxis?: [number, number, number]; // the lifter's own press line, from the segmenter
};

// Slice the frames belonging to the phase a check asks about. `at` is declared in the rubric
// ("depth at the bottom", "lockout at lockout"), and judging the whole rep against a bottom-only
// check measures the wrong moment: a depth band applied on the way back up sees a straight arm and
// reports "too shallow" on a perfect rep.
//
// The cut is relative to THIS rep's own progress range, not to 0 and 1. A rep resolves the moment
// it returns to the top mark, so its highest progress is often around 0.8 -- a fixed 0.85 window
// would then contain no frames at all and the lockout check would report "I could not see you" on
// every single rep.
export function phaseFrames(input: EvaluateInput, at: string | undefined, eccentricDir?: string): Landmarks[] {
  const p = input.progress;
  if (!p || p.length !== input.frames.length || !at) return input.frames;
  const lo = Math.min(...p);
  const hi = Math.max(...p);
  const span = hi - lo;
  if (!(span > 1e-6)) return input.frames;
  let iMin = 0;
  for (let i = 1; i < p.length; i++) if (p[i] < p[iMin]) iMin = i;
  const norm = (x: number) => (x - lo) / span;
  const idx: number[] = [];
  for (let i = 0; i < p.length; i++) {
    const n = norm(p[i]);
    if (at === "bottom" && n <= 0.25) idx.push(i);
    else if (at === "lockout" && i >= iMin && n >= 0.8) idx.push(i);
    else if (at === "eccentric") {
      if (((eccentricDir === "return" ? i >= iMin : i <= iMin) || n <= 0.25) && n < 0.6) idx.push(i);
    }
  }
  return idx.length ? idx.map((i) => input.frames[i]) : input.frames;
}

// Judge one window of frames against one check of the rubric.
export function evaluateCheck(check: RubricCheck, input: EvaluateInput, eccentricDir?: string): CheckVerdict {
  const aspect = input.aspect ?? 1;
  const minVis = check.min_visibility ?? 0.6;
  const robust = check.robust ?? "median";
  const capture = check.capture ?? "in_plane";
  // Each check is graded at the phase it names. Doing this once here is what keeps "depth at the
  // bottom" from being measured as the arm comes back up.
  const frames = phaseFrames(input, check.at, eccentricDir);

  if (check.measure === "eccentric_seconds") {
    const secs = input.secondsAvailable;
    if (secs == null || !Number.isFinite(secs)) {
      return { id: check.id, label: check.label, status: "unsure", confidence: "unsure", value: NaN,
        cue: pickCue(check, "unsure", NaN), reason: "no_rep_timing" };
    }
    const st = bandStatus(secs, check.good, check.almost);
    return { id: check.id, label: check.label, status: st, confidence: "measured", value: secs, cue: pickCue(check, st, secs) };
  }

  if (check.measure === "wrist_vs_elbow_stack") {
    const m = measureWristStack(frames, input.side, minVis, input.pressAxis);
    if (m.confidence === "unsure") {
      return { id: check.id, label: check.label, status: "unsure", confidence: "unsure", value: NaN,
        cue: pickCue(check, "unsure", NaN), reason: m.reason };
    }
    const st = bandStatus(m.value, check.good, check.almost);
    return { id: check.id, label: check.label, status: st, confidence: m.confidence, value: m.value, cue: pickCue(check, st, m.value) };
  }

  if (check.measure === "torso_lean") {
    const m = measureTorsoLean(frames, aspect);
    if (m.confidence === "unsure") {
      return { id: check.id, label: check.label, status: "unsure", confidence: "unsure", value: NaN,
        cue: pickCue(check, "unsure", NaN), reason: m.reason };
    }
    const st = bandStatus(m.value, check.good, check.almost);
    return { id: check.id, label: check.label, status: st, confidence: m.confidence, value: m.value, cue: pickCue(check, st, m.value) };
  }

  if (check.measure === "arm_difference" || check.measure === "side_difference") {
    const other = input.side === "left" ? "right" : "left";
    const a = measureJoint(frames, input.side, check.joint ?? "elbow", capture, minVis, robust, aspect);
    const b = measureJoint(frames, other, check.joint ?? "elbow", capture, minVis, robust, aspect);
    if (a.confidence === "unsure" || b.confidence === "unsure") {
      // Comparing an arm we cannot see would invent a difference.
      return { id: check.id, label: check.label, status: "unsure", confidence: "unsure", value: NaN,
        cue: pickCue(check, "unsure", NaN), reason: a.reason || b.reason };
    }
    const diff = Math.abs(a.value - b.value);
    const st = bandStatus(diff, check.good, check.almost);
    return { id: check.id, label: check.label, status: st, confidence: "estimate", value: diff, cue: pickCue(check, st, diff) };
  }

  const m = measureJoint(frames, input.side, check.joint ?? "elbow", capture, minVis, robust, aspect);
  if (m.confidence === "unsure") {
    return { id: check.id, label: check.label, status: "unsure", confidence: "unsure", value: m.value,
      cue: pickCue(check, "unsure", NaN), reason: m.reason };
  }
  const st = bandStatus(m.value, check.good, check.almost);
  return { id: check.id, label: check.label, status: st, confidence: m.confidence, value: m.value, cue: pickCue(check, st, m.value) };
}

export function evaluateAll(input: EvaluateInput): CheckVerdict[] {
  const rubric = getRubric(input.exerciseId);
  return rubric.checks.map((c) => evaluateCheck(c, input, rubric.track?.eccentric));
}

// ---------------------------------------------------------------- view gate

// Shoulder separation relative to torso length decides the view. Both distances are corrected into
// the same physical unit first: normalized x and y are on different scales whenever the frame is
// not square, so on a 1080x1920 phone a raw ratio is inflated by 1.78 and a true side view reads as
// 45.
//
// Thresholds come from the geometry, not from taste. Projected width is metric width times
// cos(yaw), and one real clip measures 0.403 corrected against 0.410 metric -- so face-on is
// 0.425, the 45-degree point is 0.30, and side-on is 0. Those three anchors are what the bands are
// set around.
export const VIEW_FRONT_RATIO = 0.36;
export const VIEW_SIDE_RATIO = 0.1;

export type ViewReading = { view: "front" | "side" | "45" | "unknown"; confidence: number; ratio: number };

// Which way is the lifter facing? Shoulder width over torso length, averaged over frames.
// Side-on, the shoulders collapse onto each other; face-on they are clearly apart. This survives
// MediaPipe's depth noise far better than a 3D facing vector, which is noisy by construction.
//
// Both distances are corrected into the same physical unit first. Normalized x and y are on
// different scales whenever the frame is not square: on a 1080x1920 phone a raw ratio is inflated
// by 1.78, and a true side view then reads as "45". Measured against the same clip's metric 3D
// shoulder width, the corrected ratio (0.403) matches it (0.410) while the raw ratio (0.663) does
// not -- so the correction is what makes the number mean anything.
export function detectView(frames: Landmarks[], aspect = 1): ViewReading {
  const ratios: number[] = [];
  for (const f of frames) {
    const ls = f.left_shoulder, rs = f.right_shoulder, lh = f.left_hip, rh = f.right_hip;
    if (!ls || !rs || !lh || !rh) continue;
    if (Math.min(ls.vis, rs.vis) < 0.5) continue;
    const gap = Math.hypot((ls.x - rs.x) * aspect, ls.y - rs.y);
    const shx = (ls.x + rs.x) / 2, shy = (ls.y + rs.y) / 2;
    const hpx = (lh.x + rh.x) / 2, hpy = (lh.y + rh.y) / 2;
    const torso = Math.hypot((shx - hpx) * aspect, shy - hpy);
    if (torso < 1e-9) continue;
    ratios.push(gap / torso);
  }
  if (!ratios.length) return { view: "unknown", confidence: 0, ratio: NaN };
  const r = median(ratios);
  if (r >= VIEW_FRONT_RATIO) {
    return { view: "front", confidence: Math.max(0, Math.min(1, (r - VIEW_FRONT_RATIO) / 0.1 + 0.5)), ratio: r };
  }
  if (r <= VIEW_SIDE_RATIO) {
    return { view: "side", confidence: Math.max(0, Math.min(1, (VIEW_SIDE_RATIO - r) / 0.08 + 0.5)), ratio: r };
  }
  const mid = (VIEW_FRONT_RATIO + VIEW_SIDE_RATIO) / 2;
  return { view: "45", confidence: Math.max(0, Math.min(1, 1 - Math.abs(r - mid) / 0.13)), ratio: r };
}

// Should this rubric judge at all from here? A wrong camera position distorts every number the
// same way, so a verdict produced there is a confident lie rather than a slightly-off reading.
// `required` may be a set: a press is equally readable face-on and at 45 degrees, and demanding
// one exact value refused clips that were perfectly measurable.
export function gateView(observed: string, required: string | string[] | undefined): { ok: boolean; reason: string } {
  if (!required) return { ok: true, reason: "" };
  const wanted = Array.isArray(required) ? required : [required];
  if (!wanted.length || wanted.includes("any")) return { ok: true, reason: "" };
  if (observed === "unknown") return { ok: false, reason: "view_unknown" };
  if (wanted.includes(observed)) return { ok: true, reason: "" };
  return { ok: false, reason: `view_mismatch:${observed}_not_${wanted.join("|")}` };
}

// One cue at a time: the single most important thing to fix, ordered by the rubric (first listed wins),
// with 'fix' beating 'almost'. Returning a list here is how coaches end up talking over themselves.
export function worstCue(verdicts: CheckVerdict[]): CheckVerdict | null {
  for (const v of verdicts) if (v.status === "fix") return v;
  for (const v of verdicts) if (v.status === "almost") return v;
  return null;
}
