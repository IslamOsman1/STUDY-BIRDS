const now = () => process.hrtime.bigint();

const elapsedMs = (start) => Number(process.hrtime.bigint() - start) / 1_000_000;

const timedOperation = async (label, operation) => {
  const start = now();
  try {
    return await operation();
  } finally {
    console.log(`[perf] ${label}: ${elapsedMs(start).toFixed(2)}ms`);
  }
};

module.exports = {
  elapsedMs,
  now,
  timedOperation,
};
