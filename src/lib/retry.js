const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function withRetry(fn, retries = 2, delayMs = 500, shouldRetry = () => true) {
  let lastErr;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn(attempt);
    } catch (e) {
      lastErr = e;
      if (attempt === retries + 1) break;
      if (!shouldRetry(e)) break;
      await sleep(delayMs);
    }
  }

  throw lastErr;
}