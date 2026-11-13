import assert from "node:assert/strict";
import { restSeconds, clock } from "../rest.ts";

assert.equal(restSeconds("~2-3 min"), 180);
assert.equal(restSeconds("2-4 min"), 240);
assert.equal(restSeconds("30-60 sec"), 60);
assert.equal(restSeconds("~0.5-1 min"), 60);
assert.equal(restSeconds("~3-5 min"), 300);
assert.equal(restSeconds("N/A"), 0);
assert.equal(restSeconds(""), 0);
assert.equal(clock(180), "3:00");
assert.equal(clock(65), "1:05");
console.log("REST_OK");
