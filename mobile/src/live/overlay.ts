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
