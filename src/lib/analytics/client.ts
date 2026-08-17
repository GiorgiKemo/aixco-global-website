import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  ANALYTICS_CONSENT_VERSION,
  ANALYTICS_OUTBOX_STORAGE_KEY,
  ANALYTICS_PREFERENCES_EVENT,
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_TRACK_EVENT,
  ANALYTICS_VISITOR_STORAGE_KEY,
} from "./constants";
import type {
  AnalyticsConsentStatus,
  AnalyticsEventInput,
  AnalyticsEventType,
} from "./contracts";

type StoredAnalyticsConsent = Exclude<AnalyticsConsentStatus, "unset">;

// A privacy-restricted browser can throw for both localStorage reads and
// writes. Keep the current-page choice in memory so the banner can still close
// and the user’s choice still governs collection until the document closes.
let inMemoryConsent: StoredAnalyticsConsent | null = null;
let inMemoryConsentIsFallback = false;

export type AnalyticsTrackDetail = {
  type: AnalyticsEventType;
  name: AnalyticsEventInput["name"];
  sectionId?: string | null;
  targetLabel?: string | null;
  value?: number | null;
  durationMs?: number | null;
  scrollDepth?: number | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export function hasBrowserPrivacySignal() {
  if (typeof navigator === "undefined") return false;
  const globalPrivacyControl = (navigator as Navigator & { globalPrivacyControl?: boolean })
    .globalPrivacyControl;
  const doNotTrack = navigator.doNotTrack
    || (window as Window & { doNotTrack?: string }).doNotTrack;
  return globalPrivacyControl === true || doNotTrack === "1" || doNotTrack === "yes";
}

export function readAnalyticsConsent(): AnalyticsConsentStatus {
  if (typeof window === "undefined") return "unset";
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  } catch {
    // Analytics remains optional when storage is unavailable. The current-page
    // choice still applies through the in-memory fallback.
    return inMemoryConsent ?? "unset";
  }
  if (!raw) {
    if (inMemoryConsentIsFallback) return inMemoryConsent ?? "unset";
    inMemoryConsent = null;
    return "unset";
  }
  try {
    const value = JSON.parse(raw) as { status?: unknown; version?: unknown };
    if (
      value.version === ANALYTICS_CONSENT_VERSION
      && (value.status === "granted" || value.status === "denied")
    ) {
      inMemoryConsent = value.status;
      inMemoryConsentIsFallback = false;
      return value.status;
    }
  } catch {
    // Treat malformed consent as unset rather than inheriting an old choice.
  }
  inMemoryConsent = null;
  inMemoryConsentIsFallback = false;
  return "unset";
}

export function analyticsCollectionAllowed() {
  return readAnalyticsConsent() === "granted" && !hasBrowserPrivacySignal();
}

export function writeAnalyticsConsent(status: Exclude<AnalyticsConsentStatus, "unset">) {
  if (typeof window === "undefined") return;
  inMemoryConsent = status;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, JSON.stringify({
      status,
      version: ANALYTICS_CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }));
    inMemoryConsentIsFallback = false;
    if (status === "denied") window.localStorage.removeItem(ANALYTICS_VISITOR_STORAGE_KEY);
  } catch {
    // Consent still applies in memory when optional storage is blocked.
    inMemoryConsentIsFallback = true;
  }
  if (status === "denied") {
    try {
      window.sessionStorage.removeItem(ANALYTICS_SESSION_STORAGE_KEY);
      window.sessionStorage.removeItem(ANALYTICS_OUTBOX_STORAGE_KEY);
    } catch {
      // Identifiers may already be inaccessible in privacy-restricted storage.
    }
  }
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: { status } }));
}

export function openAnalyticsPreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ANALYTICS_PREFERENCES_EVENT));
}

export function recordAnalyticsEvent(detail: AnalyticsTrackDetail) {
  if (typeof window === "undefined" || !analyticsCollectionAllowed()) return;
  window.dispatchEvent(new CustomEvent<AnalyticsTrackDetail>(ANALYTICS_TRACK_EVENT, { detail }));
}
