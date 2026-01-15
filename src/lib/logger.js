export function log(level, message, meta = {}) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      message,
      ...meta
    };
    console.log(JSON.stringify(entry));
  }
  
  export const logger = {
    info: (msg, meta) => log("info", msg, meta),
    warn: (msg, meta) => log("warn", msg, meta),
    error: (msg, meta) => log("error", msg, meta)
  };