const ADMIN_LEADS_PATH = "/admin/leads";
const ADMIN_LEADS_RETURN_BASE = "https://admin-return.invalid";

const leadTabs = new Set(["new", "pipeline", "records", "portal"]);
const leadStatuses = new Set(["new", "contacted", "qualified", "archived"]);
const pageKeys = ["contactPage", "chatPage", "portalPage"] as const;

type LeadFeedback =
  | { updated: "1" }
  | { requeued: number }
  | { error: string };

function parsePositivePage(value: string | null) {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}

function validateAdminLeadsReturnTo(value: unknown) {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/")) return null;

  let url: URL;
  try {
    url = new URL(value, ADMIN_LEADS_RETURN_BASE);
  } catch {
    return null;
  }

  if (url.origin !== ADMIN_LEADS_RETURN_BASE || url.pathname !== ADMIN_LEADS_PATH) return null;

  const tab = url.searchParams.get("tab");
  const normalizedTab = tab && leadTabs.has(tab) ? tab : null;
  const query = new URLSearchParams();
  if (normalizedTab) query.set("tab", normalizedTab);

  if (normalizedTab === "records") {
    const status = url.searchParams.get("status");
    if (status && leadStatuses.has(status)) query.set("status", status);
  }

  const allowedPageKeys = normalizedTab === "new"
    ? new Set(["contactPage", "chatPage"])
    : normalizedTab === "records"
      ? new Set(["contactPage", "chatPage"])
      : normalizedTab === "portal"
        ? new Set(["portalPage"])
        : new Set<string>();

  for (const key of pageKeys) {
    if (!allowedPageKeys.has(key)) continue;
    const page = parsePositivePage(url.searchParams.get(key));
    if (page && page > 1) query.set(key, String(page));
  }

  const suffix = query.toString();
  return suffix ? `${ADMIN_LEADS_PATH}?${suffix}` : ADMIN_LEADS_PATH;
}

export function sanitizeAdminLeadsReturnTo(
  value: unknown,
  fallback = ADMIN_LEADS_PATH,
) {
  return validateAdminLeadsReturnTo(value)
    ?? validateAdminLeadsReturnTo(fallback)
    ?? ADMIN_LEADS_PATH;
}

export function buildAdminLeadsFeedbackRedirect(
  returnTo: unknown,
  feedback: LeadFeedback,
  anchor?: string,
) {
  const safeReturnTo = sanitizeAdminLeadsReturnTo(returnTo);
  const url = new URL(safeReturnTo, ADMIN_LEADS_RETURN_BASE);

  if ("updated" in feedback) url.searchParams.set("updated", feedback.updated);
  if ("requeued" in feedback) url.searchParams.set("requeued", String(feedback.requeued));
  if ("error" in feedback) url.searchParams.set("error", feedback.error);
  if (anchor && /^[a-z]+-[0-9a-f-]{36}$/i.test(anchor)) url.hash = anchor;

  return `${url.pathname}${url.search}${url.hash}`;
}
