import dotenv from "dotenv";

export function loadEnv() {
  dotenv.config(); 
  return {
    HEADLESS: (process.env.HEADLESS ?? "true") === "true",
    CONCURRENCY: Number(process.env.CONCURRENCY ?? "3"),
    NAV_TIMEOUT_MS: Number(process.env.NAV_TIMEOUT_MS ?? "15000"),
    SEL_TIMEOUT_MS: Number(process.env.SEL_TIMEOUT_MS ?? "5000"),
    RETRIES: Number(process.env.RETRIES ?? "2"),
    OUTPUT_DIR: process.env.OUTPUT_DIR ?? "output"
  };
}