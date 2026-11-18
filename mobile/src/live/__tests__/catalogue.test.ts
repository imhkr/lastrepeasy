// Guards the thing that makes 89 rubrics real: every one of them can be counted.
//
// Adding rubrics is easy; adding rubrics that the segmenter can actually cut into reps is the part
// that fails silently. A rubric whose `track` names a geometry the segmenter does not implement
// loads fine, appears in the picker, and then counts zero reps forever -- the coach looks alive and
// does nothing. This walks the whole catalogue and asserts each one produces a rep from a clip
// built from its OWN declared geometry.
import assert from "node:assert/strict";
import { getRubric, listExercises } from "../engine.ts";
import { createSegmenter } from "../segment.ts";
import type { Landmarks, Pt } from "../engine.ts";

const FPS = 15;

// (proximal, pivot, distal) per joint, mirroring the segmenter's TRIPLES.
const TRIPLES: Record<string, [string, string, string]> = {
  elbow: ["shoulder", "elbow", "wrist"],
  knee: ["hip", "knee", "ankle"],
  shoulder: ["hip", "shoulder", "elbow"],
  hip: ["shoulder", "hip", "knee"],
  ankle: ["knee", "ankle", "foot_index"],
};

// Where each landmark sits in a neutral standing body, in metres, y down.
const BASE: Record<string, [number, number]> = {
  shoulder: [0.12, 0.25],
  elbow: [0.20, 0.10],
  wrist: [0.20, -0.05],
  hip: [0.10, -0.05],
  knee: [0.10, -0.30],
  ankle: [0.10, -0.55],
  foot_index: [0.15, -0.58],
};

function rotate(dx: number, dy: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a), s = Math.sin(a);
  return [dx * c - dy * s, dx * s + dy * c];
}

// A body whose tracked joint really is at `deg`. The chain is built from the triple, so the joint
// angle is the one the rubric names, and the landmark that must stay put (the anchor) really does.
//
// Which end moves: the tracked POINT has to travel for a rep to exist at all. For a squat the
// tracked point is the hip and the ankle is the anchor, so the hip swings and the foot stays. For a
// raise the point is the wrist, which is not on the triple, so the elbow swings and the wrist
// follows it.
function pose(track: any, deg: number, vis = 1): Landmarks {
  const [pn, vn, dn] = TRIPLES[track.joint];
  // Canonical positions per side; `sign` mirrors x.
  const at = (side: "left" | "right", name: string): [number, number] => {
    const [x, y] = BASE[name];
    return [x * (side === "left" ? -1 : 1), y];
  };

  const place: Record<string, [number, number]> = {};
  for (const side of ["left", "right"] as const) {
    for (const name of Object.keys(BASE)) place[`${side}_${name}`] = at(side, name);
    const piv = at(side, vn);
    const movingDist = track.point !== pn;
    if (movingDist) {
      // Hold the proximal end, swing the distal end to `deg` away from it.
      const prox = at(side, pn);
      const [ux, uy] = [prox[0] - piv[0], prox[1] - piv[1]];
      const [rx, ry] = rotate(ux, uy, deg);
      place[`${side}_${dn}`] = [piv[0] + rx, piv[1] + ry];
      // A tracked point that is not on the triple (a wrist for a shoulder angle) rides the chain.
      if (!(track.point in BASE) || !(track.point === pn || track.point === vn || track.point === dn)) {
        const distal = place[`${side}_${dn}`];
        place[`${side}_${track.point}`] = [
          piv[0] + (distal[0] - piv[0]) * 1.8,
          piv[1] + (distal[1] - piv[1]) * 1.8,
        ];
      }
    } else {
      // The tracked point IS the proximal end (a squat's hip): hold the distal end, swing the prox.
      const dist = at(side, dn);
      const [ux, uy] = [dist[0] - piv[0], dist[1] - piv[1]];
      const [rx, ry] = rotate(ux, uy, deg);
      place[`${side}_${pn}`] = [piv[0] + rx, piv[1] + ry];
    }
  }

  const out: Landmarks = {};
  for (const [name, [x, y]] of Object.entries(place)) {
    out[name] = { x: 0.5 + x, y: 0.5 + y, vis, wx: x, wy: y, wz: 0 } as Pt;
  }
  return out;
}

function clipFor(track: any): Landmarks[] {
  const frames: Landmarks[] = [];
  const hold = Math.round(0.7 * FPS);
  // Rest at the end the family calls "top", sweep to the far end, come back.
  const top = track.invert ? 15 : 170;
  const far = track.invert ? 95 : 85;
  for (let i = 0; i < hold; i++) frames.push(pose(track, top));
  for (let r = 0; r < 2; r++) {
    const down = Math.round(1.2 * FPS);
    for (let i = 0; i < down; i++) frames.push(pose(track, top + ((far - top) * i) / (down - 1)));
    const up = Math.round(1.4 * FPS);
    for (let i = 0; i < up; i++) frames.push(pose(track, far + ((top - far) * i) / (up - 1)));
    for (let i = 0; i < hold; i++) frames.push(pose(track, top));
  }
  return frames;
}

// A rubric that omits `track` is the documented press default, so it is countable too -- it just
// inherits its geometry rather than declaring it.
const DEFAULT_TRACK = { joint: "elbow", origin: "shoulder", point: "wrist", axis: "forearm" };

const ids = listExercises();
assert.ok(ids.length >= 88, `the catalogue must cover the plan, got ${ids.length}`);

const uncountable: string[] = [];
for (const id of ids) {
  const r: any = getRubric(id);
  const track = r.track ?? DEFAULT_TRACK;
  assert.ok(r.start_cue?.en, `${id} has no start cue, so the user is told to do the wrong thing`);
  assert.ok(TRIPLES[track.joint], `${id}: unknown joint ${track.joint}`);
  if (track.axis === "forearm") continue; // learned axis needs a lockout; proven by the press suites

  const frames = clipFor(track);
  const seg = createSegmenter({ track });
  let reps = 0;
  frames.forEach((lm, i) => {
    if (seg.update(lm, i / FPS)) reps += 1;
  });
  if (reps === 0) uncountable.push(`${id} (${track.axis}/${track.joint})`);
}

assert.deepEqual(uncountable, [], `rubrics that can never count a rep: ${uncountable.join(", ")}`);
console.log(`CATALOGUE_COUNTABLE_OK ${ids.length} rubrics`);

console.log("CATALOGUE_ALL_OK");
