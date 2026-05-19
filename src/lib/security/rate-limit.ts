type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const STORE_KEY = "__AIXCO_RATE_LIMIT_STORE__";

type RateLimitGlobal = typeof globalThis & {
  [STORE_KEY]?: Map<string, RateLimitEntry>;
};

function getStore() {
  const globalStore = globalThis as RateLimitGlobal;

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = new Map<string, RateLimitEntry>();
  }

  return globalStore[STORE_KEY];
}

function normalizeForwardedIp(value: string | null) {
  return value?.split(",")[0]?.trim().slice(0, 80) || "";
}

export function getRateLimitClientId(headers: Headers) {
  return (
    normalizeForwardedIp(headers.get("x-forwarded-for")) ||
    headers.get("cf-connecting-ip")?.trim().slice(0, 80) ||
    headers.get("x-real-ip")?.trim().slice(0, 80) ||
    "anonymous"
  );
}

export function checkRateLimit({ key, limit, windowMs, now = Date.now() }: RateLimitOptions): RateLimitResult {
  const store = getStore();

  for (const [entryKey, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(entryKey);
    }
  }

  const existing = store.get(key);
  const entry =
    existing && existing.resetAt > now
      ? existing
      : {
          count: 0,
          resetAt: now + windowMs,
        };

  entry.count += 1;
  store.set(key, entry);

  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed: entry.count <= limit,
    remaining,
    resetAt: entry.resetAt,
    retryAfterSeconds,
  };
}

export function resetRateLimitStore() {
  getStore().clear();
}
