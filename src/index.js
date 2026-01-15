import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./lib/env.js";
import { loadConfig, summarizeConfig } from "./config.js";
import { runChecks } from "./runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function hasFlag(flag) {
  return process.argv.slice(2).includes(flag);
}

function getArgValue(flag, defaultValue = null) {
  const args = process.argv.slice(2);
  const idx = args.indexOf(flag);
  if (idx === -1) return defaultValue;
  return args[idx + 1] ?? defaultValue;
}

function printHelp() {
  console.log(`
Selector Health Checker

Usage:
  npm run check -- [options]

Options:
  --config <path>         Path to selectors.json (default: ./selectors.json)
  --out <dir>             Output directory (default: from .env OUTPUT_DIR or ./output)
  --headless <true|false> Run browser headless (default: from .env HEADLESS or true)
  --concurrency <n>       Max parallel jobs (default: from .env CONCURRENCY or 3)
  --nav-timeout <ms>      Navigation timeout ms (default: from .env NAV_TIMEOUT_MS or 15000)
  --sel-timeout <ms>      Selector timeout ms (default: from .env SEL_TIMEOUT_MS or 5000)
  --retries <n>           Retries count (default: from .env RETRIES or 2)
  --help                  Show help
  `);
}

try {
  if (hasFlag("--help")) {
    printHelp();
    process.exitCode = 0;
  }
  const env = loadEnv();

  const runtime = {
    HEADLESS: getArgValue("--headless", String(env.HEADLESS)) === "true",
    CONCURRENCY: Number(getArgValue("--concurrency", String(env.CONCURRENCY))),
    NAV_TIMEOUT_MS: Number(
      getArgValue("--nav-timeout", String(env.NAV_TIMEOUT_MS))
    ),
    SEL_TIMEOUT_MS: Number(
      getArgValue("--sel-timeout", String(env.SEL_TIMEOUT_MS))
    ),
    RETRIES: Number(getArgValue("--retries", String(env.RETRIES))),
    OUTPUT_DIR: getArgValue("--out", env.OUTPUT_DIR),
  };

  const configPath = getArgValue(
    "--config",
    path.join(__dirname, "..", "selectors.json")
  );
  const outDir = path.join(__dirname, "..", runtime.OUTPUT_DIR);

  const cfg = loadConfig(configPath);
  const summary = summarizeConfig(cfg);

  console.log("Config loaded:");
  console.log(`- jobs: ${summary.jobCount}`);
  console.log(`- selectors: ${summary.selectorCount}`);
  console.log("Runtime settings:");
  console.log(`- headless: ${runtime.HEADLESS}`);
  console.log(`- concurrency: ${runtime.CONCURRENCY}`);
  console.log(`- outDir: ${outDir}`);

  fs.mkdirSync(outDir, { recursive: true });

  const report = await runChecks({ config: cfg, outDir, env: runtime });

  console.log("Report:");
  console.log(`- total checks: ${report.summary.total}`);
  console.log(`- broken: ${report.summary.broken}`);
  console.log(`- report.json: ${report.reportJsonPath}`);
  console.log(`- report.csv: ${report.reportCsvPath}`);

  if (report.brokenPreview.length > 0) {
    console.log("Broken preview (up to 5):");
    for (const it of report.brokenPreview) {
      console.log(
        `- [${it.status}] ${it.job} ${it.selectorName} (${it.selector})`
      );
    }
  }
  process.exitCode = report.summary.broken > 0 ? 1 : 0;
} catch (e) {
  console.error(e?.message ?? e);
  process.exitCode = 1;
}
