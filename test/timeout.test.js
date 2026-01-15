import test from "node:test";
import assert from "node:assert/strict";
import { withTimeout } from "../src/lib/timeout.js";

test("withTimeout resolves when promise finishes in time", async () => {
  const result = await withTimeout(Promise.resolve(123), 50, "fast");
  assert.equal(result, 123);
});

test("withTimeout rejects when promise is too slow", async () => {
  await assert.rejects(
    () => withTimeout(new Promise((r) => setTimeout(() => r("ok"), 50)), 10, "slow"),
    /Timeout after/
  );
});