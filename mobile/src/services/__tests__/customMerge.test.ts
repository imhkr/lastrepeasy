import assert from "node:assert/strict";
import { mergeCustom, makeExercise, exStoreKey, dayStoreKey } from "../customMerge.ts";

const base: any = {
  id: "p", name: "P", author: "", summary: "",
  weeks: [1, 2].map((week) => ({ week, block: 1, label: "", days: [{ day: "Push", exercises: [{ id: "a", name: "A", warmup: "", rest: "", subs: [], groups: [] }] }] })),
};
const ex = makeExercise("  Cable Crunch ", 3, "", "1-2 min");
assert.equal(ex.name, "Cable Crunch");
assert.equal(ex.groups[0].reps, "8-12");
assert.equal(ex.custom, true);
assert.equal(makeExercise("x", 0, "5", "").groups[0].sets, 1);

const store = { days: { [dayStoreKey("p", 1)]: ["Abs"] }, ex: { [exStoreKey("p", 1, 0)]: [ex], [exStoreKey("p", 1, 1)]: [makeExercise("Plank", 3, "60s", "")] } };
const m = mergeCustom(base, withDefaults(store));
assert.deepEqual(m.weeks[0].days.map((d) => d.day), ["Push", "Abs"]);
assert.deepEqual(m.weeks[0].days[0].exercises.map((e) => e.name), ["A", "Cable Crunch"]);
assert.deepEqual(m.weeks[0].days[1].exercises.map((e) => e.name), ["Plank"]);
assert.equal(m.weeks[0].days[1].custom, true);
assert.equal(m.weeks[1].days.length, 1); // week 2 untouched
assert.equal(base.weeks[0].days.length, 1); // input not mutated
console.log("CUSTOM_MERGE_OK");

// ---- edits, order, hidden, day names, key shifting
import { editKey, moveId, shiftDayKeys, withDefaults } from "../customMerge.ts";
const b2: any = { id: "p", name: "P", author: "", summary: "", weeks: [{ week: 1, block: 1, label: "", days: [{ day: "Push", exercises: ["a", "b", "c"].map((id) => ({ id, name: id.toUpperCase(), warmup: "", rest: "2 min", subs: [], groups: [{ sets: 2, reps: "6-8", effort: "RIR 1" }, { sets: 1, reps: "10", effort: "RIR 0" }] })) }] }] };
const st = withDefaults({
  edits: { [editKey("p", 1, 0, "a")]: { sets: 4, reps: "5", rest: "3 min", name: "A2" } },
  order: { "p:1:0": ["c", "a"] },
  hidden: { "p:1:0": ["b"] },
  dayNames: { "p:1:0": "Chest" },
});
const m2 = mergeCustom(b2, st).weeks[0].days[0];
assert.equal(m2.day, "Chest");
assert.deepEqual(m2.exercises.map((e) => e.id), ["c", "a"]);
const a = m2.exercises[1];
assert.deepEqual([a.name, a.rest, a.edited, a.groups.length, a.groups[0].sets, a.groups[0].reps, a.groups[0].effort], ["A2", "3 min", true, 1, 4, "5", "RIR 1"]);
assert.deepEqual(m2.hidden, [{ id: "b", name: "B" }]);
assert.equal(b2.weeks[0].days[0].exercises[0].name, "A"); // input not mutated
assert.deepEqual(moveId(["x", "y", "z"], "y", -1), ["y", "x", "z"]);
assert.deepEqual(moveId(["x", "y", "z"], "x", -1), ["x", "y", "z"]);
assert.deepEqual(moveId(["x", "y", "z"], "z", 1), ["x", "y", "z"]);
const sh = shiftDayKeys({ "p:1:0": 0, "p:1:1": 1, "p:1:2": 2, "p:1:2:a": 3, "p:2:2": 4, "q:1:2": 5 }, "p", 1, 1);
assert.deepEqual(sh, { "p:1:0": 0, "p:1:1": 2, "p:1:1:a": 3, "p:2:2": 4, "q:1:2": 5 });
assert.equal(withDefaults({ days: { x: ["y"] } }).edits !== undefined, true); // old saved stores still load
console.log("CUSTOM_EDIT_OK");
