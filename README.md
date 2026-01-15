# Selector Health Checker

Playwright-based CLI tool that monitors selector health across public pages and detects broken selectors (missing / not visible / errors).  
Designed for reliable public web automation: retries, timeouts, concurrency limits, and clear JSON/CSV reporting.

---

## ✅ What it does
- Loads monitoring targets from `selectors.json` (**jobs**: URL + list of selectors)
- Opens pages in Playwright and checks selectors:
  - exists (`missing` if not found)
  - optional visibility check (`not_visible` if hidden)
- Reliability layer:
  - retries on failures
  - timeouts for navigation and selector operations
  - concurrency limit for parallel jobs
- Outputs reports:
  - `output/report.json` — full details
  - `output/report.csv` — flat table for spreadsheets
- Prints a short “broken preview” in console
- Exit code:
  - `0` — all checks OK
  - `1` — at least one broken selector (CI/monitoring friendly)

---

## ✨ Features
- ✅ Multi-job monitoring (many URLs)
- ✅ Retries / timeouts / concurrency limit
- ✅ Structured logging (JSON lines to stdout)
- ✅ JSON + CSV reports
- ✅ Unit tests + integration smoke test (local HTTP server)

---

## 🧩 Requirements
- Node.js (LTS recommended)
- npm
- Playwright browsers installed

---

## 🚀 Install
```bash
npm install
npx playwright install
