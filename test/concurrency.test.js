import test from "node:test";
import assert from "node:assert/strict";
import { withConcurrencyLimit } from "../src/lib/concurrency.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("withConcurrencyLimit limits parallel execution", async () => {
  const limit = withConcurrencyLimit(2);

  let active = 0;
  let maxActive = 0;

  const tasks = Array.from({ length: 6 }, (_, i) =>
    limit(async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await sleep(20);
      active--;
      return i;
    })
  );

  const res = await Promise.all(tasks);
  assert.equal(res.length, 6);
  assert.ok(maxActive <= 2);
});