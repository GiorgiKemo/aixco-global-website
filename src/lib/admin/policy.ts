export const DEFAULT_ADMIN_AUTH_ROLE = "admin";

type AppMetadata = Record<string, unknown> | null | undefined;

export function hasAdminRole(appMetadata: AppMetadata, requiredRole = DEFAULT_ADMIN_AUTH_ROLE) {
  if (!appMetadata || !requiredRole) return false;

  const directRole = typeof appMetadata.role === "string" ? appMetadata.role : "";
  const roles = Array.isArray(appMetadata.roles)
    ? appMetadata.roles.filter((value): value is string => typeof value === "string")
    : [];

  return directRole === requiredRole || roles.includes(requiredRole);
}
