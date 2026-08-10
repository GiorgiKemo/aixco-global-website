import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  ANALYTICS_CONSENT_VERSION,
  ANALYTICS_OUTBOX_STORAGE_KEY,
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_VISITOR_STORAGE_KEY,
} from "../../src/lib/analytics/constants.ts";

const necessaryOnlyConsent = Object.freeze({
  status: "denied",
  version: ANALYTICS_CONSENT_VERSION,
  // A stable timestamp keeps screenshots and browser-smoke state deterministic.
  updatedAt: "2026-08-07T00:00:00.000Z",
});

/**
 * Keep general UI smoke gates focused on the underlying page by recording the
 * same current-version "Necessary only" choice a visitor can make in the UI.
 * No analytics identifiers survive this setup.
 */
export async function installNecessaryOnlyAnalyticsConsent(context) {
  await context.addInitScript(
    ({ consentKey, visitorKey, sessionKey, outboxKey, consent }) => {
      localStorage.setItem(consentKey, JSON.stringify(consent));
      localStorage.removeItem(visitorKey);
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem(outboxKey);
    },
    {
      consentKey: ANALYTICS_CONSENT_STORAGE_KEY,
      visitorKey: ANALYTICS_VISITOR_STORAGE_KEY,
      sessionKey: ANALYTICS_SESSION_STORAGE_KEY,
      outboxKey: ANALYTICS_OUTBOX_STORAGE_KEY,
      consent: necessaryOnlyConsent,
    },
  );
}

export const analyticsSmokeStorage = Object.freeze({
  consentKey: ANALYTICS_CONSENT_STORAGE_KEY,
  visitorKey: ANALYTICS_VISITOR_STORAGE_KEY,
  sessionKey: ANALYTICS_SESSION_STORAGE_KEY,
  outboxKey: ANALYTICS_OUTBOX_STORAGE_KEY,
  consentVersion: ANALYTICS_CONSENT_VERSION,
});
