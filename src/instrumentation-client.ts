import { getClientErrorContext } from "@/lib/analytics/client-error-context";

const consentKey = "aixco-analytics-consent-v1";
const consentVersion = "2026-08-13-google-analytics-policy-refresh";
const sessionKey = "aixco-analytics-session-v1";
const duplicateReportWindowMs = 30_000;
const recentReports = new Map<string, number>();

function analyticsAllowed() {
  try {
    const privacyControl = (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl;
    if (privacyControl || navigator.doNotTrack === "1") return false;
    const consent = JSON.parse(localStorage.getItem(consentKey) ?? "null") as {
      status?: unknown;
      version?: unknown;
    } | null;
    return consent?.status === "granted" && consent.version === consentVersion;
  } catch {
    return false;
  }
}

function fingerprint(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `client-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function sessionId() {
  try {
    const session = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as { id?: unknown } | null;
    return typeof session?.id === "string" ? session.id : undefined;
  } catch {
    return undefined;
  }
}

function report(
  eventName: "window_error" | "unhandled_rejection",
  sourceValue: string,
  component?: string,
) {
  if (!analyticsAllowed()) return;
  const reportKey = `${eventName}:${window.location.pathname}:${sourceValue.slice(0, 2_000)}`;
  const now = Date.now();
  const previousReportAt = recentReports.get(reportKey);
  if (previousReportAt && now - previousReportAt < duplicateReportWindowMs) return;
  recentReports.set(reportKey, now);
  if (recentReports.size > 100) {
    const oldestKey = recentReports.keys().next().value;
    if (oldestKey) recentReports.delete(oldestKey);
  }
  const payload = JSON.stringify({
    eventName,
    eventId: fingerprint(sourceValue.slice(0, 2_000)),
    pagePath: window.location.pathname,
    metadata: {
      ...getClientErrorContext(),
      source: "instrumentation_client",
      component: component?.slice(0, 120),
      sessionId: sessionId(),
    },
  });
  if (navigator.sendBeacon?.(
    "/api/client-errors",
    new Blob([payload], { type: "application/json" }),
  )) return;
  void fetch("/api/client-errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => undefined);
}

window.addEventListener("error", (event) => {
  const filePath = (() => {
    try {
      return event.filename ? new URL(event.filename, window.location.href).pathname : "unknown";
    } catch {
      return "unknown";
    }
  })();
  report(
    "window_error",
    `${event.message}:${filePath}:${event.lineno}:${event.colno}`,
    `${filePath}:${event.lineno}:${event.colno}`,
  );
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const signature = reason instanceof Error
    ? `${reason.name}:${reason.message}`
    : `${typeof reason}:${String(reason)}`;
  report("unhandled_rejection", signature);
});
