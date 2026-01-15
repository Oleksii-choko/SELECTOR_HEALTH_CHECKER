import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { runChecks } from "../src/runner.js";

function startServer() {
  const server = http.createServer((req, res) => {
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`
        <!doctype html>
        <html>
          <body>
            <h1 id="ok">Hello</h1>
          </body>
        </html>
      `);
      return;
    }
    res.writeHead(404);
    res.end("Not found");
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function mkTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shc-out-"));
}

test("integration: Playwright checks selectors against local server", async () => {
  const { server, baseUrl } = await startServer();
  const outDir = mkTmpDir();

  const env = {
    HEADLESS: true,
    CONCURRENCY: 1,
    NAV_TIMEOUT_MS: 15000,
    SEL_TIMEOUT_MS: 5000,
    RETRIES: 1,
    OUTPUT_DIR: outDir
  };

  const config = {
    jobs: [
      {
        name: "Local",
        url: `${baseUrl}/`,
        selectors: [
          { name: "OK", selector: "#ok", mustBeVisible: true },
          { name: "Missing", selector: "#missing", mustBeVisible: true }
        ]
      }
    ]
  };

  try {
    const report = await runChecks({ config, outDir, env });

    // summary checks
    assert.equal(report.summary.total, 2);
    assert.equal(report.summary.broken, 1);

    // files created
    assert.ok(fs.existsSync(report.reportJsonPath));
    assert.ok(fs.existsSync(report.reportCsvPath));

    // bonus: parse JSON and validate missing exists
    const json = JSON.parse(fs.readFileSync(report.reportJsonPath, "utf-8"));
    const missing = json.items.find((x) => x.selectorName === "Missing");
    assert.ok(missing);
    assert.equal(missing.status, "missing");
  } finally {
    await new Promise((r) => server.close(r));
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});