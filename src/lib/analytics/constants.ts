/**
 * Browser-safe analytics constants.
 *
 * Keep this module free of validation libraries so client components do not
 * pull the server-side Zod schemas into every public route.
 */
export const ANALYTICS_CONSENT_STORAGE_KEY = "aixco-analytics-consent-v1";
export const ANALYTICS_VISITOR_STORAGE_KEY = "aixco-analytics-visitor-v1";
export const ANALYTICS_SESSION_STORAGE_KEY = "aixco-analytics-session-v1";
export const ANALYTICS_OUTBOX_STORAGE_KEY = "aixco-analytics-outbox-v1";
export const ANALYTICS_CONSENT_EVENT = "aixco:analytics-consent";
export const ANALYTICS_TRACK_EVENT = "aixco:analytics-track";
export const ANALYTICS_PREFERENCES_EVENT = "aixco:analytics-preferences";
export const ANALYTICS_CONSENT_VERSION = "2026-08-07";
