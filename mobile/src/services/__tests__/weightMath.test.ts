import assert from "node:assert/strict";
import { compareLifts, e1rm, topSet, volume, formatKgDelta, type LiftEntry } from "../weightMath.ts";

const entry = (sets: { kg: number; reps: number }[]): LiftEntry => ({
  id: "x_2026-11-01",
  exerciseId: "x",
  exerciseName: "X",
  date: "2026-11-01T10:00:00Z",
  sets,
});

// first time: nothing to compare against
assert.equal(compareLifts(null, [{ kg: 60, reps: 8 }]).verdict, "first");

// heavier weight, same reps -> up, +2.5 kg
const up = compareLifts(entry([{ kg: 60, reps: 8 }]), [{ kg: 62.5, reps: 8 }]);
assert.equal(up.verdict, "up");
assert.equal(up.deltaKg, 2.5);
assert.ok(up.deltaE1rm > 0);

// same weight, more reps -> up (0 kg change but stronger)
const moreReps = compareLifts(entry([{ kg: 60, reps: 8 }]), [{ kg: 60, reps: 10 }]);
assert.equal(moreReps.verdict, "up");
assert.equal(moreReps.deltaKg, 0);

// identical -> same
assert.equal(compareLifts(entry([{ kg: 60, reps: 8 }]), [{ kg: 60, reps: 8 }]).verdict, "same");

// lighter -> down
const down = compareLifts(entry([{ kg: 60, reps: 8 }]), [{ kg: 55, reps: 8 }]);
assert.equal(down.verdict, "down");
assert.equal(down.deltaKg, -5);

// top set picks the strongest set, ignores blanks
assert.deepEqual(topSet([{ kg: 0, reps: 0 }, { kg: 50, reps: 5 }, { kg: 40, reps: 12 }]), { kg: 50, reps: 5 });
assert.equal(topSet([{ kg: 0, reps: 0 }]), null);

// math helpers
assert.equal(e1rm({ kg: 100, reps: 3 }), 110);
assert.equal(volume([{ kg: 10, reps: 10 }, { kg: 20, reps: 5 }]), 200);
assert.equal(formatKgDelta(2.5), "+2.5 kg");
assert.equal(formatKgDelta(-1), "-1 kg");
assert.equal(formatKgDelta(0), "same weight");

console.log("WEIGHTMATH_OK");
