import fs from "node:fs";

function assert(cond, msg) {
  if (!cond) throw new Error(`Config error: ${msg}`);
}

export function loadConfig(configPath) {
  assert(fs.existsSync(configPath), `config file not found: ${configPath}`);

  const raw = fs.readFileSync(configPath, "utf-8");
  const cfg = JSON.parse(raw);

  assert(cfg && typeof cfg === "object", "config must be an object");
  assert(Array.isArray(cfg.jobs), "`jobs` must be an array");

  for (const [i, job] of cfg.jobs.entries()) {
    assert(typeof job.name === "string" && job.name.trim(), `jobs[${i}].name must be non-empty string`);
    assert(typeof job.url === "string" && job.url.startsWith("http"), `jobs[${i}].url must be http(s) url`);
    assert(Array.isArray(job.selectors), `jobs[${i}].selectors must be an array`);

    for (const [j, s] of job.selectors.entries()) {
      assert(typeof s.name === "string" && s.name.trim(), `jobs[${i}].selectors[${j}].name must be string`);
      assert(typeof s.selector === "string" && s.selector.trim(), `jobs[${i}].selectors[${j}].selector must be string`);
      if (s.mustBeVisible !== undefined) {
        assert(typeof s.mustBeVisible === "boolean", `jobs[${i}].selectors[${j}].mustBeVisible must be boolean`);
      }
    }
  }

  return cfg;
}

export function summarizeConfig(cfg) {
  const jobCount = cfg.jobs.length;
  const selectorCount = cfg.jobs.reduce((sum, job) => sum + job.selectors.length, 0);
  return { jobCount, selectorCount };
}