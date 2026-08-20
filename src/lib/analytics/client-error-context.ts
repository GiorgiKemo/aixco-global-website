type ClientErrorContext = {
  buildId?: string;
  browserFamily?: string;
  online?: boolean;
  viewportClass?: "mobile" | "tablet" | "desktop";
  viewportHeight?: number;
  viewportWidth?: number;
};

function readBrowserFamily(userAgent: string) {
  if (/Edg\//u.test(userAgent)) return "Edge";
  if (/Firefox\//u.test(userAgent)) return "Firefox";
  if (/Chrome\//u.test(userAgent)) return "Chrome";
  if (/Safari\//u.test(userAgent)) return "Safari";
  return "Other";
}

export function getClientErrorContext(): ClientErrorContext {
  if (typeof window === "undefined" || typeof navigator === "undefined") return {};

  const viewportWidth = Math.max(1, Math.round(window.innerWidth));
  return {
    buildId: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 120),
    browserFamily: readBrowserFamily(navigator.userAgent),
    online: navigator.onLine,
    viewportClass: viewportWidth < 640 ? "mobile" : viewportWidth < 1024 ? "tablet" : "desktop",
    viewportHeight: Math.max(1, Math.round(window.innerHeight)),
    viewportWidth,
  };
}

export function createClientErrorEventId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
