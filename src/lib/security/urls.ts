type HostRule = string | { host: string; includeSubdomains?: boolean };

const SIMPLE_EMAIL_PATTERN = /^[^\s@<>()"']+@[^\s@<>()"']+\.[^\s@<>()"']+$/;

function hasControlCharacter(value: string) {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 0x1f || codePoint === 0x7f;
  });
}

function normalizeHostRule(rule: HostRule) {
  return typeof rule === "string" ? { host: rule, includeSubdomains: false } : rule;
}

function isAllowedHost(hostname: string, allowedHosts: readonly HostRule[]) {
  const host = hostname.toLowerCase();

  return allowedHosts.some((rule) => {
    const normalizedRule = normalizeHostRule(rule);
    const allowedHost = normalizedRule.host.toLowerCase();

    return host === allowedHost || (normalizedRule.includeSubdomains === true && host.endsWith(`.${allowedHost}`));
  });
}

export function getSafeHttpsUrl(value: unknown, fallback: string, allowedHosts: readonly HostRule[]) {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed || hasControlCharacter(trimmed)) return fallback;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return fallback;
    if (!isAllowedHost(url.hostname, allowedHosts)) return fallback;

    return url.toString();
  } catch {
    return fallback;
  }
}

export function getSafeEmail(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed || hasControlCharacter(trimmed) || !SIMPLE_EMAIL_PATTERN.test(trimmed)) {
    return fallback;
  }

  return trimmed.toLowerCase();
}

export function getSafePortalUrl(value: unknown, fallback: string) {
  const safeUrl = getSafeHttpsUrl(value, fallback, ["workw.com"]);

  try {
    const url = new URL(safeUrl);

    return url.hostname === "workw.com" && url.pathname.startsWith("/realestate/") ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function isSafePortalUrl(value: unknown) {
  return getSafePortalUrl(value, "") !== "";
}

export function getSafeAixcoNewsUrl(value: unknown, fallback: string) {
  const safeUrl = getSafeHttpsUrl(value, fallback, ["aixco.global", "www.aixco.global"]);

  try {
    const url = new URL(safeUrl);

    return url.pathname.startsWith("/op2/") ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function getSafePublicAssetHref(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed || hasControlCharacter(trimmed)) return fallback;
  if (trimmed.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return fallback;
  if (!trimmed.startsWith("/") || !trimmed.includes("/aixco-global-op2/")) return fallback;

  return trimmed;
}

export function getSafeAssetKey(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  return /^[a-z0-9-]{1,64}$/i.test(trimmed) ? trimmed : fallback;
}
