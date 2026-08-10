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
export const RATE_LIMIT_MAX_KEYS = 5_000;
const RATE_LIMIT_PRUNE_BATCH_SIZE = 32;

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

  // Amortize expiry cleanup so a unique-IP flood cannot turn every request
  // into an O(max keys) scan. Map order is maintained as a lightweight LRU.
  let inspected = 0;
  for (const [entryKey, entry] of store) {
    if (inspected >= RATE_LIMIT_PRUNE_BATCH_SIZE) break;
    inspected += 1;
    if (entry.resetAt <= now) store.delete(entryKey);
  }

  const candidate = store.get(key);
  const existing = candidate && candidate.resetAt > now ? candidate : undefined;
  if (candidate && !existing) store.delete(key);
  if (!existing && store.size >= RATE_LIMIT_MAX_KEYS) {
    const oldestKey = store.keys().next().value as string | undefined;
    if (oldestKey) store.delete(oldestKey);
  }
  const entry =
    existing && existing.resetAt > now
      ? existing
      : {
          count: 0,
          resetAt: now + windowMs,
        };

  entry.count += 1;
  if (existing) store.delete(key);
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
