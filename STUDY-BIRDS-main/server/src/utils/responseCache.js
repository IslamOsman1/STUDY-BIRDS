const cacheStore = new Map();

const buildCacheKey = (req) => `${req.originalUrl}`;

const getCachedResponse = (key) => {
  const cached = cacheStore.get(key);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }

  return cached.payload;
};

const setCachedResponse = (key, payload, ttlMs) => {
  cacheStore.set(key, {
    payload,
    expiresAt: Date.now() + ttlMs,
  });
};

const cacheRoute = (ttlMs = 60_000) => (req, res, next) => {
  if (req.method !== "GET") {
    next();
    return;
  }

  const key = buildCacheKey(req);
  const cached = getCachedResponse(key);

  if (cached) {
    res.set("X-Cache", "HIT");
    Object.entries(cached.headers).forEach(([header, value]) => {
      res.set(header, value);
    });
    res.status(cached.statusCode).send(cached.body);
    return;
  }

  const originalSend = res.send.bind(res);

  res.send = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const cacheControl = `public, max-age=${Math.floor(ttlMs / 1000)}, stale-while-revalidate=${Math.floor(ttlMs / 2000)}`;
      res.set("Cache-Control", cacheControl);
      const payload = {
        statusCode: res.statusCode,
        body,
        headers: {
          "Content-Type": res.get("Content-Type") || "application/json; charset=utf-8",
          "Cache-Control": cacheControl,
        },
      };
      setCachedResponse(key, payload, ttlMs);
      res.set("X-Cache", "MISS");
    }

    return originalSend(body);
  };

  next();
};

const clearResponseCache = () => {
  cacheStore.clear();
};

module.exports = {
  cacheRoute,
  clearResponseCache,
};
