const DEFAULT_SITE_URL = "https://www.aixco.global";

function normalizeSiteUrl(value: string | undefined) {
  const candidate = value?.trim();

  if (!candidate) return null;

  try {
    const url = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);

    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.SITE_URL) ??
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    DEFAULT_SITE_URL
  );
}
