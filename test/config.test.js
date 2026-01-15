import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig, summarizeConfig } from "../src/config.js";

function writeTmpJson(obj) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "shc-"));
  const file = path.join(dir, "selectors.json");
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), "utf-8");
  return file;
}

test("loadConfig loads valid config", () => {
  const file = writeTmpJson({
    jobs: [
      {
        name: "Example",
        url: "https://example.com",
        selectors: [{ name: "H1", selector: "h1", mustBeVisible: true }]
      }
    ]
  });

  const cfg = loadConfig(file);
  const summary = summarizeConfig(cfg);

  assert.equal(summary.jobCount, 1);
  assert.equal(summary.selectorCount, 1);
});

test("loadConfig throws on invalid config", () => {
  const file = writeTmpJson({ jobs: [{ name: "", url: "nope", selectors: [] }] });

  assert.throws(() => loadConfig(file), /Config error/);
});