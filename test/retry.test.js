import test from "node:test";
import assert from "node:assert/strict";
import { withRetry } from "../src/lib/retry.js";

test("withRetry succeeds after a few failures", async () => {
  let calls = 0;

  const value = await withRetry(async () => {
    calls++;
    if (calls < 3) throw new Error("boom");
    return "ok";
  }, 3, 1);

  assert.equal(value, "ok");
  assert.equal(calls, 3);
});

test("withRetry throws after exhausting attempts", async () => {
  let calls = 0;

  await assert.rejects(
    () =>
      withRetry(async () => {
        calls++;
        throw new Error("always");
      }, 2, 1),
    /always/
  );

  // retries=2 => max attempts = 3 (1 initial + 2 retries)
  assert.equal(calls, 3);
});