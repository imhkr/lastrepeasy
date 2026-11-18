// The tier-1 call, and the rule that keeps it from talking over itself.
//
// A vision call takes several seconds -- longer than a rep -- so a naive "one call per rep" would
// queue a set's worth of requests whose answers land after the set has ended. The throttle is the
// thing that makes the second opinion usable at all, so it is tested rather than assumed.
import assert from "node:assert/strict";

// Mirrors the throttle in app/live.tsx: one request in flight, later reps dropped.
function makeGate() {
  let inFlight = false;
  const sent: number[] = [];
  const dropped: number[] = [];
  const gate = (index: number, done: Promise<void>) => {
    if (inFlight) {
      dropped.push(index);
      return false;
    }
    inFlight = true;
    sent.push(index);
    done.finally(() => {
      inFlight = false;
    });
    return true;
  };
  return { gate, sent, dropped };
}

{
  let release: (() => void) | null = null;
  const slow = new Promise<void>((r) => {
    release = r;
  });
  const g = makeGate();
  assert.equal(g.gate(1, slow), true, "the first rep is sent");
  assert.equal(g.gate(2, slow), false, "a rep while one is in flight is dropped, not queued");
  assert.equal(g.gate(3, slow), false, "and so is the next");
  assert.deepEqual(g.sent, [1]);
  assert.deepEqual(g.dropped, [2, 3]);
  release!();
  // Let the finally microtask run, then the gate is free again.
  setTimeout(() => {
    const fast = Promise.resolve();
    assert.equal(g.gate(4, fast), true, "once the call returns, the next rep is checked");
    console.log("ADJUDICATE_THROTTLE_OK");
    console.log("ADJUDICATE_ALL_OK");
  }, 0);
}
