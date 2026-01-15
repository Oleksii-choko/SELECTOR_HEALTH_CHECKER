import fs from "node:fs";

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function writeJsonReport(filePath, report) {
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), "utf-8");
}

export function writeCsvReport(filePath, items) {
  const header = [
    "job",
    "url",
    "selectorName",
    "selector",
    "mustBeVisible",
    "status",
    "navMs",
    "checkMs",
    "error"
  ];

  const lines = [];
  lines.push(header.join(","));

  for (const it of items) {
    const row = [
      it.job,
      it.url,
      it.selectorName,
      it.selector,
      it.mustBeVisible,
      it.status,
      it.navMs,
      it.checkMs,
      it.error
    ].map(csvEscape);

    lines.push(row.join(","));
  }

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
}