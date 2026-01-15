export function withConcurrencyLimit(max) {
    let active = 0;
    const queue = [];
  
    const runNext = () => {
      if (active >= max) return;
      const task = queue.shift();
      if (!task) return;
  
      active++;
      task()
        .finally(() => {
          active--;
          runNext();
        });
    };
  
    return (fn) =>
      new Promise((resolve, reject) => {
        queue.push(async () => {
          try {
            resolve(await fn());
          } catch (e) {
            reject(e);
          }
        });
        runNext();
      });
  }