import fs from "node:fs";
import path from "node:path";
import { checkJob } from "./checks/checkPage.js";

export async function runChecks({ config, outDir, env }) {
  const jobs = config.jobs ?? [];

  const results = [];
  for (const job of jobs) {
    const r = await checkJob(job, { env });
    results.push(r);
  }

  const items = results.flatMap((r) => r.items);
  const broken = items.filter((x) => x.status !== "ok").length;

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: items.length,
      broken
    },
    items
  };

  const reportJsonPath = path.join(outDir, "report.json");
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), "utf-8");

  return { summary: report.summary, reportJsonPath };
}