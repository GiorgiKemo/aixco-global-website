export function isAdminAnalyticsExcludedPath(pathname: string | null | undefined) {
  return pathname === "/admin" || Boolean(pathname?.startsWith("/admin/"));
}
