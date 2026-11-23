import assert from "node:assert/strict";
import { classifyMuscleActivation } from "../muscleMap";

const jm = classifyMuscleActivation("Smith Machine JM Press", ["triceps"]);
assert.ok(jm.primary.has("triceps"), "JM Press should target triceps");
assert.ok(!jm.primary.has("chest"), "JM Press should not misclassify as chest");

const lp = classifyMuscleActivation("Leg Press", ["leg_isolation"]);
assert.ok(lp.primary.has("quads"), "Leg Press should target quads");
assert.ok(!lp.primary.has("chest"), "Leg Press should not misclassify as chest");

const lc = classifyMuscleActivation("Seated Leg Curl", ["leg_isolation"]);
assert.ok(lc.primary.has("hamstrings"), "Seated Leg Curl should target hamstrings");

const cr = classifyMuscleActivation("Standing Calf Raise", ["calf"]);
assert.ok(cr.primary.has("calves"), "Standing Calf Raise should target calves");

const cc = classifyMuscleActivation("Cable Crunch", ["core"]);
assert.ok(cc.primary.has("abs"), "Cable Crunch should target abs");

const sp = classifyMuscleActivation("Machine Shoulder Press", ["shoulder_press"]);
assert.ok(sp.primary.has("shoulders"), "Machine Shoulder Press should target shoulders");

console.log("MUSCLE_MAP_OK");
