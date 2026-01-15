import { chromium } from "playwright";
import { withRetry } from "../lib/retry.js";
import { withTimeout } from "../lib/timeout.js";
import { logger } from "../lib/logger.js";

export async function checkJob(job, { env }) {
  const browser = await chromium.launch({ headless: env.HEADLESS });
  const page = await browser.newPage();

  const items = [];

  try {
    logger.info("job_start", { job: job.name, url: job.url });

    const navStart = Date.now();

    await withRetry(
      async (attempt) => {
        logger.info("nav_attempt", { job: job.name, url: job.url, attempt });

        await withTimeout(
          page.goto(job.url, { waitUntil: "domcontentloaded", timeout: env.NAV_TIMEOUT_MS }),
          env.NAV_TIMEOUT_MS + 2000,
          "page.goto"
        );
      },
      env.RETRIES,
      700
    );

    const navMs = Date.now() - navStart;
    logger.info("nav_ok", { job: job.name, url: job.url, navMs });

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
        const handle = await withRetry(
          async (attempt) => {
            logger.info("selector_attempt", {
              job: job.name,
              url: job.url,
              selector: s.selector,
              attempt
            });

            return await withTimeout(page.$(s.selector), env.SEL_TIMEOUT_MS, "page.$");
          },
          1,
          200,
          () => true
        );

        if (!handle) {
          row.status = "missing";
        } else if (s.mustBeVisible) {
          const visible = await withTimeout(page.isVisible(s.selector), env.SEL_TIMEOUT_MS, "page.isVisible");
          if (!visible) row.status = "not_visible";
        }

        logger.info("selector_ok", {
          job: job.name,
          url: job.url,
          selector: s.selector,
          status: row.status
        });
      } catch (e) {
        row.status = "error";
        row.error = e?.message ?? String(e);

        logger.error("selector_error", {
          job: job.name,
          url: job.url,
          selector: s.selector,
          error: row.error
        });
      } finally {
        row.checkMs = Date.now() - startedAt;
        items.push(row);
      }
    }

    logger.info("job_done", { job: job.name, url: job.url, checks: items.length });
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  return { job: job.name, items };
}