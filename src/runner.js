import fs from "node:fs";
import path from "node:path";
import { checkJob } from "./checks/checkPage.js";
import { writeJsonReport, writeCsvReport } from "./lib/report.js";
import { withConcurrencyLimit } from "./lib/concurrency.js";

export async function runChecks({ config, outDir, env }) {
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = config.jobs ?? [];

  const limit = withConcurrencyLimit(env.CONCURRENCY);

  const results = await Promise.all(
    jobs.map((job) => limit(() => checkJob(job, { env })))
  );

  const items = results.flatMap((r) => r.items);
  const brokenItems = items.filter((x) => x.status !== "ok");
  const broken = brokenItems.length;

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: items.length,
      broken
    },
    items
  };

  const reportJsonPath = path.join(outDir, "report.json");
  const reportCsvPath = path.join(outDir, "report.csv");

  writeJsonReport(reportJsonPath, report);
  writeCsvReport(reportCsvPath, items);

  return {
    summary: report.summary,
    reportJsonPath,
    reportCsvPath,
    brokenPreview: brokenItems.slice(0, 5)
  };
}