import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./lib/env.js";
import { loadConfig, summarizeConfig } from "./config.js";
import { runChecks } from "./runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getArgValue(flag, defaultValue = null) {
  const args = process.argv.slice(2);
  const idx = args.indexOf(flag);
  if (idx === -1) return defaultValue;
  return args[idx + 1] ?? defaultValue;
}

try {
  const env = loadEnv();

  const configPath = getArgValue(
    "--config",
    path.join(__dirname, "..", "selectors.json")
  );
  const outDir = getArgValue(
    "--out",
    path.join(__dirname, "..", env.OUTPUT_DIR)
  );

  const cfg = loadConfig(configPath);
  const summary = summarizeConfig(cfg);

  console.log("Config loaded:");
  console.log(`- jobs: ${summary.jobCount}`);
  console.log(`- selectors: ${summary.selectorCount}`);
  console.log("Runtime settings:");
  console.log(`- headless: ${env.HEADLESS}`);
  console.log(`- concurrency: ${env.CONCURRENCY}`);
  console.log(`- outDir: ${outDir}`);

  fs.mkdirSync(outDir, { recursive: true });

  const report = await runChecks({ config: cfg, outDir, env });

  console.log("Report:");
  console.log(`- total checks: ${report.summary.total}`);
  console.log(`- broken: ${report.summary.broken}`);
  console.log(`- report.json: ${report.reportJsonPath}`);
  console.log(`- report.csv: ${report.reportCsvPath}`);

  if (report.brokenPreview.length > 0) {
    console.log("Broken preview (up to 5):");
    for (const it of report.brokenPreview) {
      console.log(`- [${it.status}] ${it.job} ${it.selectorName} (${it.selector})`);
    }
  }
  process.exitCode = report.summary.broken > 0 ? 1 : 0;
} catch (e) {
  console.error(e?.message ?? e);
  process.exitCode = 1;
}
