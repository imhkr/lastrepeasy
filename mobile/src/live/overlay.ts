// Draw list for the live coach overlay. Pure data, no canvas and no DOM: the WebView walks this list and paints it,
// so the same layout is assertable in node tests. The rule that matters: every bone comes from two REAL tracked
// landmarks. A missing or weak landmark leaves a gap instead of a guessed limb - that gap is what stopped the
// overlay looking like an invented cartoon arm.
export type Pt = { x: number; y: number; vis: number };
export type Landmarks = Record<string, Pt>;
export type Status = "good" | "almost" | "fix" | "unsure";
export type DrawItem =
  | { kind: "bone"; a: Pt; b: Pt; color: string; width: number }
  | { kind: "joint"; at: Pt; color: string; r: number }
  | { kind: "arc"; at: Pt; startDeg: number; endDeg: number; color: string; width: number }
  | { kind: "marker"; at: Pt; angleDeg: number; color: string };

// MediaPipe's 33-point pose, named "<side>_<part>". Order is parent -> child so an arc can read the joint's
// orientation from the pair of bones meeting at it.
export const SKELETON: [string, string][] = [
  ["left_ear", "left_eye"],
  ["left_eye", "nose"],
  ["nose", "right_eye"],
  ["right_eye", "right_ear"],
  ["nose", "left_shoulder"],
  ["nose", "right_shoulder"],
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["left_ankle", "left_heel"],
  ["left_heel", "left_foot_index"],
  ["left_ankle", "left_foot_index"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["right_ankle", "right_heel"],
  ["right_heel", "right_foot_index"],
  ["right_ankle", "right_foot_index"],
];

const VIS = 0.5;
const WIDTH = 2.5;
const NEUTRAL = "rgba(226,232,240,0.55)";
const GOOD = "#3CEB6E";
const ALMOST = "#FFAF00";
const DEG = 180 / Math.PI;

export type SkeletonOpts = {
  width?: number;
  color?: string;
  vis?: number;
  jointR?: number;
  highlight?: string; // a joint name; only the bones touching it get the status colour
  highlightColor?: string;
  ghost?: boolean; // shaky tracking: drop bones sooner rather than draw a jittery limb
  ghostVis?: number;
};

export function buildSkeleton(lm: Landmarks, opts: SkeletonOpts = {}): DrawItem[] {
  const out: DrawItem[] = [];
  const minVis = opts.ghost ? (opts.ghostVis ?? 0.8) : (opts.vis ?? VIS);
  const width = opts.width ?? WIDTH;
  const neutral = opts.color ?? NEUTRAL;
  const hl = opts.highlight;
  const hlColor = opts.highlightColor ?? GOOD;
  const seen = (n: string) => !!lm[n] && lm[n].vis >= minVis;

  for (const [a, b] of SKELETON) {
    if (!seen(a) || !seen(b)) continue; // both ends real, or no bone at all
    const touch = hl === a || hl === b;
    out.push({ kind: "bone", a: lm[a], b: lm[b], color: touch ? hlColor : neutral, width: touch ? width + 0.5 : width });
  }
  if (hl && seen(hl)) out.push({ kind: "joint", at: lm[hl], color: hlColor, r: opts.jointR ?? 4 });
  return out;
}

export type TargetRange = { current: number; goodMin: number; goodMax: number; almostMin?: number; almostMax?: number };
export type ArcOpts = { radius?: number; width?: number; color?: string; almostColor?: string; vis?: number };

// Arc + marker around the joint vertex, so the fix reads as a direction ("30 degrees short") not just a number.
// Radius is a fraction of image width; angles are image-space degrees, 0 = +x, growing clockwise (y points down).
export function buildTargetArc(lm: Landmarks, joint: string, range: TargetRange, opts: ArcOpts = {}): DrawItem[] {
  const pivot = lm[joint];
  if (!pivot || pivot.vis < (opts.vis ?? VIS)) return []; // no measured joint, nothing to explain
  const radius = opts.radius ?? 0.1;
  const width = opts.width ?? 3;
  const good = opts.color ?? GOOD;
  const parentEdge = SKELETON.find(([, b]) => b === joint);
  const childEdge = SKELETON.find(([a]) => a === joint);
  const parent = parentEdge ? lm[parentEdge[0]] : undefined;
  const child = childEdge ? lm[childEdge[1]] : undefined;

  let base = 0;
  let sign = 1;
  if (parent) base = Math.atan2(parent.y - pivot.y, parent.x - pivot.x) * DEG; // 0 degrees along the incoming bone
  if (parent && child) {
    const cross = (parent.x - pivot.x) * (child.y - pivot.y) - (parent.y - pivot.y) * (child.x - pivot.x);
    sign = cross < 0 ? -1 : 1; // measure the same way round the joint as the real limb is bent
  }

  const out: DrawItem[] = [];
  if (range.almostMin != null && range.almostMax != null) {
    out.push({ kind: "arc", at: pivot, startDeg: base + sign * range.almostMin, endDeg: base + sign * range.almostMax, color: opts.almostColor ?? ALMOST, width: width + 2 });
  }
  out.push({ kind: "arc", at: pivot, startDeg: base + sign * range.goodMin, endDeg: base + sign * range.goodMax, color: good, width });
  if (Number.isFinite(range.current)) {
    const ray = (base + sign * range.current) / DEG;
    out.push({
      kind: "marker",
      at: { x: pivot.x + radius * Math.cos(ray), y: pivot.y + radius * Math.sin(ray), vis: pivot.vis },
      angleDeg: base + sign * range.current,
      color: good,
    });
  }
  return out;
}

export function jointAngleDeg(lm: Landmarks, a: string, b: string, c: string, aspect = 1): number {
  const A = lm[a], B = lm[b], C = lm[c];
  if (!A || !B || !C) return NaN; // one missing point means the angle was never measured
  // Landmarks are normalized, so x and y are in different units on a non-square frame. Scaling x by the
  // aspect ratio first is what makes the angle true: without it a diagonal forearm reads ~16 degrees off
  // on a 16:9 phone, the same projection error that made the old coach accuse correct reps.
  const ux = (A.x - B.x) * aspect, uy = A.y - B.y;
  const vx = (C.x - B.x) * aspect, vy = C.y - B.y;
  const nu = Math.hypot(ux, uy), nv = Math.hypot(vx, vy);
  if (nu < 1e-9 || nv < 1e-9) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (nu * nv)))) * DEG;
}

export type Gauge = { value: number; band: string; status: Status };

// The compact numeric readout beside the arc. Never guesses: a NaN angle is "unsure", not "fix".
export function gaugeModel(jointLabel: string, currentDeg: number, good: [number, number], almost: [number, number]): Gauge {
  const band = `${good[0]}-${good[1]}`;
  if (!Number.isFinite(currentDeg)) return { value: NaN, band, status: "unsure" };
  const value = Math.round(currentDeg);
  if (currentDeg >= good[0] && currentDeg <= good[1]) return { value, band, status: "good" };
  if (currentDeg >= almost[0] && currentDeg <= almost[1]) return { value, band, status: "almost" };
  return { value, band, status: "fix" };
}

const RANGES: Record<string, [number, number]> = {
  elbow: [20, 180], // a loaded press cannot bend below ~20 degrees; 0-ish is a camera or model failure, not a rep
  knee: [20, 180],
  shoulder: [0, 195],
  hip: [20, 200],
  ankle: [30, 160],
};

// Human joints only bend so far. A measured 13-degree elbow in a press almost certainly means the camera is at a
// bad angle or the pose model lost the arm; judging it would accuse the user of a mistake they did not make.
export function plausible(joint: string, deg: number): boolean {
  if (!Number.isFinite(deg)) return false;
  const r = RANGES[joint.replace(/^(left|right)_/, "")];
  return !r || (deg >= r[0] && deg <= r[1]);
}

// ---------------------------------------------------------------- shadow arm

// The rubric declares where the arm should be at each end of the rep. Only movements whose form
// is visible in the arm path carry this block; without it no shadow is drawn at all.
export type GhostSpec = { at_bottom: number; at_top: number };

// Phase is the segmenter's own 0..1 (0 = bottom, joint closed; 1 = lockout). One meaning of
// "phase" in the whole system, so the shadow can never disagree with the judge about the rep.
export function ghostTargetDeg(spec: GhostSpec | undefined, phase: number): number {
  if (!spec || !Number.isFinite(phase)) return NaN;
  const p = Math.max(0, Math.min(1, phase));
  return spec.at_bottom + (spec.at_top - spec.at_bottom) * p;
}

const SHADOW = "rgba(110,235,60,0.55)";
const SHADOW_W = 11;

// The shadow keeps the REAL shoulder and elbow and prescribes only the forearm. Inventing an upper
// arm would put a limb on screen the tracker never saw (the old cartoon), and the pressdown's fault
// is the hand path, not the upper-arm angle. The angle is measured the same way the in-plane check
// measures it -- x scaled by aspect -- so the shadow and the verdict describe the same joint.
export function buildShadowArm(lm: Landmarks, side: string, targetDeg: number, aspect = 1): DrawItem[] {
  const sh = lm[`${side}_shoulder`], el = lm[`${side}_elbow`], wr = lm[`${side}_wrist`];
  if (!sh || !el || !wr) return [];
  // No wrist means no forearm length to project along, and the direction to rotate toward is lost.
  if (Math.min(sh.vis, el.vis) < 0.5 || wr.vis < 0.4) return [];
  if (!Number.isFinite(targetDeg)) return [];
  const ux = (sh.x - el.x) * aspect, uy = sh.y - el.y; // elbow -> shoulder
  const fx = (wr.x - el.x) * aspect, fy = wr.y - el.y; // elbow -> wrist
  const nu = Math.hypot(ux, uy), nf = Math.hypot(fx, fy);
  if (nu < 1e-6 || nf < 1e-6) return [];
  const rad = (targetDeg * Math.PI) / 180;
  const px = -uy / nu, py = ux / nu; // perpendicular to the upper arm
  const sign = fx * px + fy * py >= 0 ? 1 : -1; // rotate toward the side the real forearm is on
  const cos = Math.cos(rad), sin = Math.sin(rad) * sign;
  const dx = (ux / nu) * cos + px * sin;
  const dy = (uy / nu) * cos + py * sin;
  const gwr = { x: el.x + (dx * nf) / aspect, y: el.y + dy * nf, vis: 1 };
  return [
    { kind: "bone", a: el, b: gwr, color: SHADOW, width: SHADOW_W },
    { kind: "joint", at: gwr, color: SHADOW, r: 4 },
  ];
}

// The shadow runs on its own clock, started with the rep. It is NOT a copy of the lifter's
// progress: a shadow slaved to progress freezes the instant the lifter stalls -- which is exactly
// the moment it has something to teach.
export type GhostClock = { t0: number | null; duration: number };
export const GHOST_CYCLE = 2.4; // seconds to demonstrate a full rep before one has been learned

export function createGhostClock(): GhostClock {
  return { t0: null, duration: GHOST_CYCLE };
}

// 1 at the start (arm straight), 0 at half the cycle (elbow closed), back to 1. Between reps the
// clock is unset and the shadow rests at 1, over the lifter's own straight arm.
export function ghostPhase(c: GhostClock, t: number): number {
  if (c.t0 === null) return 1;
  const u = (t - c.t0) / c.duration;
  if (!(u >= 0) || u >= 1) return 1;
  return u < 0.5 ? 1 - 2 * u : 2 * u - 1;
}

// Tempo lock: the next rep is demonstrated at the pace of the last one, so the shadow moves with
// the lifter instead of at an arbitrary speed. Bounds keep a mis-segmented 12-second "rep" from
// turning the shadow into a slideshow.
export function teachGhostClock(c: GhostClock, seconds: number): void {
  if (!(seconds > 0)) return;
  c.duration = Math.min(8, Math.max(1.2, seconds));
}
