// Rep segmentation: cuts a stream of tracked frames into reps, so the rubric can be evaluated at
// the phase each check cares about (bottom depth, lockout at the top, eccentric tempo).
//
// The old coach decided "is this a rep" and "is this rep good" in one pass, which meant a rep's
// start could only be found after its verdict was already half-decided. Here the split is explicit:
// this module only finds boundaries and phase landmarks, and `engine.ts` judges them. A segmenter
// bug then shows up as a wrong count, not as a wrong cue.
//
// Height is measured in WORLD metres, not normalized image units. In image space x and y are in
// different units (a 1080x1920 phone stretches y by 1.8x against x), so a forearm that really
// points straight up reads as tilted, and the press line drifts as the elbow bends. World
// landmarks are already metric and camera-corrected, which is why ghost.py and the old coach both
// used them for this exact measurement.
import type { Landmarks, Pt } from "./engine.ts";

export type PhaseLandmarks = {
  startT: number; // first frame at the top, before lowering
  bottomT: number; // lowest point
  endT: number; // back at the top
  eccentricSeconds: number | null; // 80% -> 20% of this rep's own range, so rep 1 is judged fairly
  progress: number[]; // 0 bottom .. 1 top, one per consumed frame
  times: number[]; // timestamp of each progress entry, so a judge can slice by phase
};

export type Segmenter = {
  update: (lm: Landmarks, t: number) => PhaseLandmarks | null;
  pending: () => PhaseLandmarks | null; // a rep that has gone down but has not come back up yet
  side: () => "left" | "right" | null;
  // The lifter's own press line, learned from the forearm at lockout. Judges that compare a limb to
  // "up" must use this instead of the torso axis: on an incline the arm travels along the bench
  // angle, so the torso axis reports a large fault on every clean rep.
  axis: () => [number, number, number] | null;
  reset: () => void;
};

export type SegmentOpts = {
  topEnter?: number; // progress at or above this counts as "at the top"
  bottomBelow?: number; // progress under this means the rep actually moved
  minRange?: number; // torso-lengths of hand travel a real rep must cover
  minArc?: number; // degrees the tracked joint must bend for a rep that barely travels
  minRepSeconds?: number; // refractory window, so a wobble at the top cannot score twice
  lostFrames?: number; // frames without a tracked limb before the run is abandoned
  track?: TrackSpec; // which joint defines the rep, and which point travels
};

// What a rep is differs by movement family. A press is counted by the wrist rising off the chest
// and the elbow extending; a squat is counted by the hip dropping toward the planted foot and the
// knee extending. Both are "a joint extends while a point returns to the top", so the body geometry
// is the only thing that changes -- and hardcoding the press version meant no other family could be
// counted at all.
export type TrackSpec = {
  joint: "elbow" | "knee" | "shoulder" | "hip" | "ankle";
  // The anchor the travelling point is measured against. It must be the part that does NOT move:
  // the shoulder for a press, the planted foot for a squat. Measuring a squat's hip against the
  // shoulder fails because both drop together and the difference barely changes.
  origin: "shoulder" | "hip" | "ankle";
  point: "wrist" | "elbow" | "knee" | "hip" | "ankle" | "foot_index" | "shoulder";
  // Where "up" comes from. Three signals, because no single one covers every movement:
  //
  //  * forearm - the press. Learned from the forearm at lockout, because the press line is tilted
  //    by the bench.
  //  * distance - hip-to-planted-foot for a squat, shoulder-to-wrist for a curl. The two ends of
  //    the moving segment get closer as the joint bends, with no direction involved, so a lifter
  //    who folds forward does not rotate the reference out from under their own rep counter.
  //  * angle - the tracked joint's own interior angle. The only signal that works when the segment
  //    length does not change: a lateral raise keeps shoulder-to-wrist constant and simply swings
  //    the arm, so both the press's axis and the distance test see nothing at all.
  axis: "forearm" | "distance" | "angle";
  // Angle axis only. Most joints read LARGEST at rest (a standing hip, a flat ankle), so progress
  // 1 -- which every family uses for "at rest, ready for the next rep" -- is already the high end.
  // A few read smallest at rest: an arm hanging at the side has a near-zero shoulder angle, and a
  // calf's heel-dropped start is the closed end of the ankle. Those invert.
  invert?: boolean;
  // Which half of the rep is the lowering. A press and a squat start at the top and lower under
  // load, so it is the FIRST half; a curl, raise, pressdown or leg extension starts relaxed and
  // lifts first, so the lowering is the RETURN half. Timing the wrong half reports a slow
  // concentric as a fast eccentric.
  eccentric?: "outbound" | "return";
};

export const PRESS_TRACK: TrackSpec = { joint: "elbow", origin: "shoulder", point: "wrist", axis: "forearm" };

const DEFAULT_OPTS: Required<Omit<SegmentOpts, "track">> = {
  topEnter: 0.8,
  bottomBelow: 0.35,
  minRange: 0.25, // torso-lengths THIS rep's hands must travel
  // Two ways to be a rep, because either can be the only signal present. A shallow press barely
  // moves the hands but bends the elbow 40 degrees; a press done with a swung forearm travels a
  // long way with almost no elbow bend. Requiring both lost the shallow rep -- the exact fault
  // this coach exists to catch -- and requiring neither scores a shrug.
  minArc: 20, // degrees
  minRepSeconds: 0.35,
  lostFrames: 20,
};

// (proximal, pivot, distal) per joint, mirroring backend/app/services/kinematics.py.
const TRIPLES: Record<TrackSpec["joint"], [string, string, string]> = {
  elbow: ["shoulder", "elbow", "wrist"],
  knee: ["hip", "knee", "ankle"],
  shoulder: ["hip", "shoulder", "elbow"],
  hip: ["shoulder", "hip", "knee"],
  ankle: ["knee", "ankle", "foot_index"],
};

// A dumbbell often hides the wrist at the bottom of a press, so the wrist gate is deliberately
// loose; the shoulder and elbow carry the trust.
const WRIST_VIS = 0.4;
const ARM_VIS = 0.5;
// A lockout frame is one near THIS lifter's straightest arm, not an absolute 150 deg. MediaPipe's
// world landmarks are a learned depth lift, so a genuinely locked-out elbow often reads 140-145;
// an absolute gate would never fire and "up" would never be found.
const EXTENDED_FRAC = 0.9; // within 10% of the best extension seen so far
const EXTENDED_ABS = 120; // still refuse a clearly bent arm, whichever the relative test says
const WINDOW = 240; // frames kept for tempo (~8 s at 30 fps)
// Depth assumed before the first rep has been seen, in torso-lengths. A press starting from a
// baseline of zero would read every approach as "already at the bottom" -- the descent needs a
// range to be measured against before the descent exists.
const PRIOR_DEPTH = 0.45;
const MAX_DEPTH = 1.4; // no press drops more than this many torso-lengths from lockout

type V3 = [number, number, number];

// The landmarks a rep is counted from, resolved for one side.
type Limb = {
  prox: Pt; // proximal end of the tracked joint
  piv: Pt; // the joint itself
  dist: Pt; // distal end
  org: Pt; // the anchor the travelling point is measured against
  pt: Pt; // the point that travels
  sh: Pt; // shoulder, for torso length
  hip: Pt; // hip, for torso length
};

function worldOf(p: Pt): V3 | null {
  return p.wx == null || p.wy == null || p.wz == null ? null : [p.wx, p.wy, p.wz];
}

function sub3(a: V3, b: V3): V3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function dot3(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function norm3(a: V3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

function unit3(a: V3): V3 | null {
  const n = norm3(a);
  return n < 1e-6 ? null : [a[0] / n, a[1] / n, a[2] / n];
}

// Interior angle at the pivot, in world space. Used only to pick lockout frames and to measure the
// arc a rep sweeps, so a degree of depth-lift error costs nothing.
function angleDeg3(prox: V3, piv: V3, dist: V3): number {
  const u = unit3(sub3(prox, piv));
  const v = unit3(sub3(dist, piv));
  if (!u || !v) return NaN;
  return (Math.acos(Math.max(-1, Math.min(1, dot3(u, v)))) * 180) / Math.PI;
}

// The press line, from the straightest frames only. A lockout is when the forearm points along
// the line the hands travel; anything measured on a half-bent arm is measuring the bend.
function lockoutAxis(buf: { deg: number; dir: V3 }[]): V3 | null {
  if (buf.length < 3) return null;
  const sorted = buf.slice().sort((a, b) => b.deg - a.deg);
  const take = Math.max(3, Math.round(sorted.length * 0.2));
  let sum: V3 = [0, 0, 0];
  for (let i = 0; i < take; i++) {
    sum = [sum[0] + sorted[i].dir[0], sum[1] + sorted[i].dir[1], sum[2] + sorted[i].dir[2]];
  }
  return unit3(sum);
}

export function createSegmenter(opts: SegmentOpts = {}): Segmenter {
  const o = { ...DEFAULT_OPTS, ...opts };

  // `rise` is in torso-lengths on the axis and distance axes, but in DEGREES on the angle axis.
  // The priors are expressed in rise units, so they have to switch with it: a 0.45 torso-length
  // prior applied to a degree reading would put the reference 0.45 degrees below the top, and
  // every frame would read as a complete rep.
  const angleAxis = (o.track ?? PRESS_TRACK).axis === "angle";
  const priorDepth = angleAxis ? 45 : PRIOR_DEPTH;
  const maxDepth = angleAxis ? 140 : MAX_DEPTH;
  const minRange = angleAxis ? 25 : o.minRange;

  let trackSide: "left" | "right" | null = null;
  let sideMissed = 0;

  // "Up" is the lifter's own pressing line, learned from the forearm at LOCKOUT and nowhere else.
  // Averaging every extended frame instead lets a press that leans at the bottom drag the axis
  // toward the lean, so the very drift the hands check exists to catch becomes the reference and
  // reads as zero. Only the straightest 20% of extended frames vote, which is what the Python
  // coach does and what makes the two tiers agree.
  let up: V3 | null = null;
  let extBuf: { deg: number; dir: V3 }[] = [];
  let bestDeg = 0; // straightest elbow seen, the reference for "extended enough to define up"

  let hist: { t: number; rise: number }[] = [];
  let state: "wait" | "top" | "down" = "wait";
  let rep: PhaseLandmarks | null = null;
  let minP = 1;
  let topRise: number | null = null; // lockout height, the anchor for "fully up"
  let bottomRise: number | null = null; // deepest height so far, the anchor for "fully down"
  let lastTop: { t: number; rise: number } | null = null;
  let prev: { t: number; rise: number } | null = null;
  let repMinDeg = Infinity; // deepest elbow bend in the current rep
  let repMaxDeg = -Infinity; // straightest elbow in the current rep
  let repLoRise = Infinity; // this rep's own lowest height, not the set's
  let repHiRise = -Infinity; // this rep's own highest height
  let repPeakAt = -Infinity; // when the hands last stopped rising
  let lastRepEnd = -Infinity; // refractory anchor

  function reset() {
    trackSide = null;
    sideMissed = 0;
    up = null;
    extBuf = [];
    bestDeg = 0;
    hist = [];
    state = "wait";
    rep = null;
    minP = 1;
    topRise = null;
    bottomRise = null;
    lastTop = null;
    prev = null;
    repMinDeg = Infinity;
    repMaxDeg = -Infinity;
    repLoRise = Infinity;
    repHiRise = -Infinity;
    repPeakAt = -Infinity;
    lastRepEnd = -Infinity;
  }

  // One side for the whole set. Averaging the sides, or switching between them, moves the tracked
  // point sideways the moment one landmark crosses the visibility floor, and that step reads as a
  // full descent while the lifter is still at the top.
  //
  // The landmarks that matter are named by the track spec, not hardcoded: the press watches
  // wrist-against-shoulder, a squat watches hip-against-foot. Only the geometry differs, so the
  // counting logic below stays exactly the same.
  function limb(lm: Landmarks): Limb | null {
    const track = o.track ?? PRESS_TRACK;
    const [pn, vn, dn] = TRIPLES[track.joint];
    const usable = (s: "left" | "right"): Limb | null => {
      const need: Record<string, true> = {};
      for (const n of [pn, vn, dn, track.origin, track.point, "shoulder", "hip"]) need[n] = true;
      const got: Record<string, Pt> = {};
      for (const n of Object.keys(need)) {
        const p = lm[`${s}_${n}`];
        if (!p || !worldOf(p)) return null;
        // A dumbbell hides the wrist at the bottom of a press, so the wrist floor is deliberately
        // loose; every other landmark carries the trust.
        if (p.vis < (n === "wrist" ? WRIST_VIS : ARM_VIS)) return null;
        got[n] = p;
      }
      return {
        prox: got[pn], piv: got[vn], dist: got[dn],
        org: got[track.origin], pt: got[track.point],
        sh: got.shoulder, hip: got.hip,
      };
    };
    if (trackSide) {
      const a = usable(trackSide);
      if (a) {
        sideMissed = 0;
        return a;
      }
      sideMissed += 1;
      if (sideMissed < o.lostFrames) return null;
      // Swapping sides mid-set would jump the reference point and manufacture a rep.
      reset();
      return null;
    }
    let best: { s: "left" | "right"; v: number } | null = null;
    for (const s of ["left", "right"] as const) {
      const a = usable(s);
      if (!a) continue;
      const v = Math.min(a.piv.vis, a.pt.vis, a.org.vis);
      if (!best || v > best.v) best = { s, v };
    }
    if (!best) return null;
    trackSide = best.s;
    return limb(lm);
  }

  function update(lm: Landmarks, t: number): PhaseLandmarks | null {
    const track = o.track ?? PRESS_TRACK;
    const a = limb(lm);
    if (!a) return null;

    const SH = worldOf(a.sh)!;
    const HIP = worldOf(a.hip)!;

    // Torso length is rigid: it does not change as a joint bends, so it is the stable unit to
    // normalize by. Arm length collapses at the bottom of a press, which would make the same
    // vertical drop read as a bigger one exactly where the depth check is graded.
    const torso = norm3(sub3(SH, HIP));
    if (torso < 1e-6) return null;

    const deg = angleDeg3(worldOf(a.prox)!, worldOf(a.piv)!, worldOf(a.dist)!);
    if (Number.isFinite(deg)) bestDeg = Math.max(bestDeg, deg);
    // `extended` only ever decides which frames may define the press line, so it is meaningless for
    // every other axis. World landmarks are a learned depth lift, so a genuinely locked-out elbow
    // often reads 140-145; an absolute gate alone would never fire, which is why it is relative to
    // this lifter's own straightest frame.
    const extended = Number.isFinite(deg) && deg >= EXTENDED_ABS && deg >= bestDeg * EXTENDED_FRAC;

  // How far the travelling point has travelled toward the "top" position, in torso lengths. Deeper
  // is smaller in every family, so the state machine below is family-agnostic.
  let rise: number;
  if (track.axis === "forearm") {
    // "Up" is the lifter's own pressing line, learned from the forearm at LOCKOUT and nowhere
    // else. Averaging every extended frame lets a press that leans at the bottom drag the axis
    // toward the lean, so the very drift the hands check exists to catch becomes the reference
    // and reads as zero. Only the straightest 20% of extended frames vote.
    if (extended) {
      const fdir = unit3(sub3(worldOf(a.dist)!, worldOf(a.piv)!));
      if (fdir) {
        extBuf.push({ deg, dir: fdir });
        if (extBuf.length > WINDOW) extBuf.shift();
        up = lockoutAxis(extBuf);
      }
    }
    if (!up) return null; // no lockout seen yet: cannot tell which way is up
    rise = dot3(sub3(worldOf(a.pt)!, worldOf(a.org)!), up) / torso;
  } else if (track.axis === "angle") {
    // The tracked joint's own interior angle. The only signal that survives a movement where the
    // segment length never changes: a lateral raise keeps shoulder-to-wrist constant and simply
    // swings the arm, so both the press's learned axis and the distance test see nothing at all.
    if (!Number.isFinite(deg)) return null;
    // The state machine assumes bigger rise == nearer the top in every family. Most joints match
    // that already (a raise's shoulder angle is largest with the arm at the side); the ones that
    // are highest at the flexed end declare `invert`, so the direction is decided in one place.
    rise = track.invert ? 180 - deg : deg;
  } else {
    // Axis-free: the straight-line distance between the two ends of the moving segment, in torso
    // lengths. Hip-to-planted-foot shortens as the knee bends; shoulder-to-wrist shortens as the
    // elbow bends. Neither needs a direction, so a lifter who folds or drifts does not rotate the
    // reference out from under their own rep counter -- the fault stays available for the rubric
    // to judge instead of silencing the count.
    rise = norm3(sub3(worldOf(a.pt)!, worldOf(a.org)!)) / torso;
  }

  // What closes a rep is "the joint is back where the rep started". For a press and a squat that
  // is a straightened joint, which `extended` finds precisely -- and closing earlier than that
  // would put the lockout frame outside the rep it belongs to. The angle axis has no such joint to
  // straighten (a raise's arm is straight throughout), so it closes on `nearTop` alone, which is
  // already expressed in `rise` units and therefore already knows about `invert`.
  const atTopEnd = track.axis === "angle" ? true : extended;
    hist.push({ t, rise });
    if (hist.length > WINDOW) hist.shift();

    // The range is anchored at the top, not at a running minimum. A running minimum sits at the
    // deepest point so far, so every descent reads as "already at the bottom" and the bottom
    // lands on the first frame of the drop.
    if (topRise === null) topRise = rise;
    if (rise > topRise) topRise = rise;
    if (bottomRise === null) bottomRise = topRise - priorDepth;
    if (rise < bottomRise) bottomRise = Math.max(rise, topRise - maxDepth);

    const span = Math.max(topRise - bottomRise, 1e-6);
    const p = Math.min(1, Math.max(0, (rise - bottomRise) / span));

    if (state === "wait") {
      if (p >= o.topEnter) {
        state = "top";
        lastTop = { t, rise };
      }
    } else if (state === "top") {
      if (p < o.topEnter) {
        state = "down";
        rep = { startT: lastTop ? lastTop.t : t, bottomT: t, endT: t, eccentricSeconds: null, progress: [p], times: [t] };
        minP = p;
        repMinDeg = Number.isFinite(deg) ? deg : Infinity;
        repMaxDeg = Number.isFinite(deg) ? deg : -Infinity;
        repLoRise = rise;
        repHiRise = lastTop ? lastTop.rise : rise;
        repPeakAt = t;
      } else {
        lastTop = { t, rise };
      }
    } else if (rep) {
      rep.progress.push(p);
      rep.times.push(t);
      if (Number.isFinite(deg)) {
        if (deg < repMinDeg) repMinDeg = deg;
        if (deg > repMaxDeg) repMaxDeg = deg;
      }
      // Bottom tracked as it happens. Searching history for a minimum instead reaches back into
      // the previous rep and reports a bottom that precedes this rep's start.
      if (p < minP) {
        minP = p;
        rep.bottomT = t;
      }
      if (rise > repHiRise) {
        repHiRise = rise;
        repPeakAt = t;
      }
      if (rise < repLoRise) repLoRise = rise;

      // This rep's OWN travel, not the set's. Using the running top/bottom range meant the very
      // first wobble inherited a full rep's span and every later twitch scored a rep -- one clip
      // produced 14 reps for 2 real ones.
      const repSpan = repHiRise - repLoRise;
      // Two ways to qualify, because either signal can be the only one present. A deliberately
      // shallow press moves the hands barely at all but bends the elbow 40 degrees; a press done
      // by swinging the forearm travels the full range with almost no elbow bend.
      const arc = Number.isFinite(repMaxDeg) && Number.isFinite(repMinDeg) ? repMaxDeg - repMinDeg : 0;
      const realRep = arc >= o.minArc || repSpan >= minRange;
      //
      // A rep ends when the arm is EXTENDED again, not when progress creeps back past a threshold.
      // Progress is anchored to a top mark that keeps rising as the arm straightens, so it can
      // close the rep while the elbow is still bent -- and the lockout frame, which is the whole
      // point of the lockout check, would then fall outside the rep and be graded as missing.
      //
      // Closing on the FIRST extended frame also ended a rep mid-press: on a clean clip the arm
      // reached its extension threshold at 145 degrees and the next frames carried it to 172, so
      // the lockout check graded the approach and called a locked-out rep "almost".
      const nearTop = repPeakAt < t && repHiRise - rise >= 0 && rise >= repHiRise - Math.max(repSpan * 0.08, 1e-3);
      if (
        atTopEnd &&
        realRep &&
        nearTop &&
        rep.progress.length > 5 &&
        t - rep.startT >= o.minRepSeconds &&
        t - lastRepEnd >= o.minRepSeconds
      ) {
        rep.endT = t;
        rep.eccentricSeconds = eccentricSeconds(hist, rep.startT, t, o, track.eccentric === "return");
        const done: PhaseLandmarks = { ...rep };
        state = "top";
        rep = null;
        lastTop = { t, rise };
        prev = { t, rise };
        lastRepEnd = t;
        return done;
      }
      // Fell back to the top without moving and without extending: a wobble, not a rep.
      if (p >= 0.98 && !realRep) {
        rep = null;
        state = "top";
        lastTop = { t, rise };
      } else if (rep.progress.length > 600) {
        rep = null; // runaway window: tracking lost, do not grow forever
        state = "wait";
      }
    }

    prev = { t, rise };
    return null;
  }

  return { update, pending: () => rep, side: () => trackSide, axis: () => up, reset };
}

// Seconds from 80% to 20% of the rep's own range. Using the rep's own range instead of a global
// one is what lets the first rep be judged on equal footing: a short first rep would otherwise
// appear slower than it was.
//
// WHICH half of the rep is the eccentric depends on the family, and getting it backwards times the
// concentric and calls it slow. A press starts at lockout and lowers under load, so its eccentric
// is the first half (progress falling 1 -> 0). A curl or a raise starts relaxed and lifts first, so
// its eccentric is the RETURN half (progress rising 0 -> 1). Declared per family as `eccentric`.
function eccentricSeconds(
  hist: { t: number; rise: number }[],
  startT: number,
  endT: number,
  o: Required<Omit<SegmentOpts, "track">>,
  returnHalf: boolean,
): number | null {
  const seg = hist.filter((s) => s.t >= startT - 1.5 && s.t <= endT + 1e-4);
  if (seg.length < 4) return null;
  let hi = seg[0].rise;
  let lo = Infinity;
  for (const s of seg) {
    if (s.rise > hi) hi = s.rise;
    if (s.rise < lo) lo = s.rise;
  }
  if (hi - lo < 1e-6) return null;
  const norm = (v: number) => (v - lo) / (hi - lo);
  let iMin = 0;
  for (let i = 1; i < seg.length; i++) if (seg[i].rise < seg[iMin].rise) iMin = i;

  // Where the trace crosses `level`, searched in the direction this family's eccentric travels.
  // Bounds are clamped to the array: `iMin` can be either endpoint, and an unclamped `to` walks off
  // the end of `seg` and throws on a rep that bottoms at the first or last frame.
  const cross = (level: number, rising: boolean): number | null => {
    const from = Math.max(rising ? iMin : 1, 1);
    const to = Math.min(rising ? seg.length - 1 : iMin, seg.length - 1);
    for (let j = from; j <= to; j++) {
      const a = norm(seg[j - 1].rise);
      const b = norm(seg[j].rise);
      const hit = rising ? b >= level && a < level : b <= level && a > level;
      if (hit) return seg[j - 1].t + ((seg[j].t - seg[j - 1].t) * (level - a)) / (b - a);
    }
    return null;
  };

  const tA = returnHalf ? cross(0.2, true) : cross(o.topEnter, false);
  const tB = returnHalf ? cross(0.8, true) : cross(0.2, false);
  if (tA === null || tB === null) return null;
  const dt = Math.abs(tB - tA);
  return dt > 0 ? dt : null;
}
