const excludedAnalyticsRoots = ["/admin", "/api", "/portal"] as const;

export function isAnalyticsExcludedPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  return excludedAnalyticsRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}
