import { chromium } from "playwright";

export async function checkJob(job, { env }) {
  const browser = await chromium.launch({ headless: env.HEADLESS });
  const page = await browser.newPage();

  const items = [];

  try {
    const navStart = Date.now();
    await page.goto(job.url, { waitUntil: "domcontentloaded", timeout: env.NAV_TIMEOUT_MS });
    const navMs = Date.now() - navStart;

    for (const s of job.selectors ?? []) {
      const startedAt = Date.now();

      const row = {
        job: job.name,
        url: job.url,
        selectorName: s.name,
        selector: s.selector,
        mustBeVisible: Boolean(s.mustBeVisible),
        status: "ok",
        navMs,
        checkMs: null,
        error: null
      };

      try {
        // 1) existence
        const handle = await page.$(s.selector);
        if (!handle) {
          row.status = "missing";
        } else if (s.mustBeVisible) {
          // 2) visibility (optional)
          const visible = await page.isVisible(s.selector);
          if (!visible) row.status = "not_visible";
        }
      } catch (e) {
        row.status = "error";
        row.error = e?.message ?? String(e);
      } finally {
        row.checkMs = Date.now() - startedAt;
        items.push(row);
      }
    }
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  return { job: job.name, items };
}