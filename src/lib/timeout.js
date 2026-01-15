export async function withTimeout(promise, ms, label = "operation") {
    const timeout = new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(`Timeout after ${ms}ms (${label})`));
      }, ms);
    });
  
    return await Promise.race([promise, timeout]);
  }