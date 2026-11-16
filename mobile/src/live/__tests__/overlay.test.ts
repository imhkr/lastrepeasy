import assert from "node:assert/strict";
import { SKELETON, buildSkeleton, buildTargetArc, gaugeModel, jointAngleDeg, plausible } from "../overlay.ts";

// Every landmark a full pose uses, placed so nothing overlaps and all confidently seen.
const NAMES = new Set<string>();
for (const [a, b] of SKELETON) { NAMES.add(a); NAMES.add(b); }
function fullPose(vis = 0.95): Record<string, { x: number; y: number; vis: number }> {
  const lm: any = {};
  let i = 0;
  for (const n of NAMES) { lm[n] = { x: 0.1 + 0.01 * i, y: 0.2 + 0.01 * i, vis }; i++; }
  return lm;
}

// ---- a full visible pose draws a bone for every connection
{
  const lm = fullPose();
  const items = buildSkeleton(lm);
  const bones = items.filter((d) => d.kind === "bone");
  assert.equal(bones.length, SKELETON.length, "one bone per connection, got " + bones.length);
  assert.ok(items.every((d) => d.kind === "bone"), "no highlight means bones only");
  assert.ok(bones.every((d) => d.color === "rgba(226,232,240,0.55)" && d.width === 2.5), "neutral thin style");
  console.log("OVERLAY_SKELETON_OK");
}

// ---- the anti-cartoon rule: a weak landmark kills every bone that touches it
{
  const lm = fullPose();
  lm.left_elbow = { ...lm.left_elbow, vis: 0.2 };
  const bones = buildSkeleton(lm).filter((d) => d.kind === "bone") as any[];
  const using = bones.filter((d) => d.a === lm.left_elbow || d.b === lm.left_elbow);
  assert.equal(using.length, 0, "no bone may use a low-visibility landmark");
  const touching = SKELETON.filter(([a, b]) => a === "left_elbow" || b === "left_elbow").length;
  assert.equal(bones.length, SKELETON.length - touching, "only the elbow bones disappear");
  // ghost style is stricter: the same frame drops more
  lm.left_elbow = { ...lm.left_elbow, vis: 0.6 };
  assert.ok(buildSkeleton(lm, { ghost: true }).length < buildSkeleton(lm).length, "ghost hides shaky bones");
  console.log("OVERLAY_ANTICARTOON_OK");
}

// ---- highlight colours ONLY the bones touching the named joint
{
  const lm = fullPose();
  const items = buildSkeleton(lm, { highlight: "left_elbow", highlightColor: "#F54646" });
  const bones = items.filter((d) => d.kind === "bone") as any[];
  const coloured = bones.filter((d) => d.color === "#F54646");
  const touching = SKELETON.filter(([a, b]) => a === "left_elbow" || b === "left_elbow");
  assert.equal(coloured.length, touching.length, "only the two elbow bones coloured, got " + coloured.length);
  for (const d of coloured) assert.ok(d.a === lm.left_elbow || d.b === lm.left_elbow, "coloured bone touches the joint");
  assert.ok(bones.filter((d) => d.color !== "#F54646").every((d) => d.color === "rgba(226,232,240,0.55)"), "rest stays neutral");
  const dot = items.find((d) => d.kind === "joint") as any;
  assert.ok(dot && dot.color === "#F54646" && dot.at === lm.left_elbow, "the joint dot shares the colour");
  assert.equal(buildSkeleton(fullPose()).filter((d) => d.kind === "joint").length, 0, "no highlight, no dot");
  console.log("OVERLAY_HIGHLIGHT_OK");
}

// ---- jointAngleDeg on a real right angle
{
  // pivot at (0.5, 0.5); one arm straight up (image y down), one straight right
  const lm = {
    left_shoulder: { x: 0.5, y: 0.2, vis: 1 },
    left_elbow: { x: 0.5, y: 0.5, vis: 1 },
    left_wrist: { x: 0.8, y: 0.5, vis: 1 },
  };
  const deg = jointAngleDeg(lm, "left_shoulder", "left_elbow", "left_wrist");
  assert.ok(Math.abs(deg - 90) < 1e-6, "expected 90, got " + deg);
  assert.ok(Number.isNaN(jointAngleDeg(lm, "left_shoulder", "left_elbow", "nope")), "missing point is NaN, never a guess");
  console.log("OVERLAY_ANGLE_OK");
}

// ---- target arc + marker follow the joint's adjacent bones
{
  const lm = fullPose();
  // a straight-down forearm off a straight-down upper arm: the marker should sit on the arc at 30 degrees
  lm.left_shoulder = { x: 0.5, y: 0.2, vis: 1 };
  lm.left_elbow = { x: 0.5, y: 0.5, vis: 1 };
  lm.left_wrist = { x: 0.5, y: 0.8, vis: 1 };
  const items = buildTargetArc(lm, "left_elbow", { current: 30, goodMin: 50, goodMax: 80, almostMin: 40, almostMax: 90 });
  assert.equal(items.filter((d) => d.kind === "arc").length, 2, "almost band plus good band");
  const marker = items.find((d) => d.kind === "marker") as any;
  assert.ok(marker && Number.isFinite(marker.angleDeg), "marker carries the current angle");
  assert.ok(Math.hypot(marker.at.x - lm.left_elbow.x, marker.at.y - lm.left_elbow.y) > 0, "marker sits off the vertex");
  const missing = { ...fullPose(), left_elbow: { ...lm.left_elbow, vis: 0.1 } };
  assert.equal(buildTargetArc(missing, "left_elbow", { current: 30, goodMin: 50, goodMax: 80 }).length, 0, "no pivot, no arc");
  console.log("OVERLAY_ARC_OK");
}

// ---- plausibility guard
assert.equal(plausible("elbow", 13), false, "a 13-degree press elbow is a tracking failure");
assert.equal(plausible("elbow", 90), true);
assert.equal(plausible("left_knee", 10), false);
assert.equal(plausible("hip", 210), false);
assert.equal(plausible("ankle", 100), true);
assert.equal(plausible("elbow", NaN), false, "an unmeasured angle is never plausible");
console.log("OVERLAY_PLAUSIBLE_OK");

// ---- gauge readout
{
  const nan = gaugeModel("elbow", NaN, [70, 95], [55, 110]);
  assert.equal(nan.status, "unsure", "never guess");
  assert.equal(nan.band, "70-95");
  assert.equal(gaugeModel("elbow", 80, [70, 95], [55, 110]).status, "good");
  assert.equal(gaugeModel("elbow", 60, [70, 95], [55, 110]).status, "almost");
  assert.equal(gaugeModel("elbow", 30, [70, 95], [55, 110]).status, "fix");
  const g = gaugeModel("elbow", 80.4, [70, 95], [55, 110]);
  assert.equal(g.value, 80, "value is rounded for the readout");
  console.log("OVERLAY_GAUGE_OK");
}

console.log("OVERLAY_OK");
