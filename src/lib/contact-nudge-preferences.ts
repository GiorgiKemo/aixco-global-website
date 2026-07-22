const CONTACT_NUDGE_STORAGE_KEY = "aixco-contact-nudge-preferences-v1";
const CONTACT_NUDGE_SESSION_OPENED_KEY = "aixco-contact-nudge-form-opened";

export const CONTACT_NUDGE_INITIAL_DELAY_MS = 20_000;
export const CONTACT_NUDGE_REMINDER_DELAY_MS = 4 * 60_000;
export const CONTACT_NUDGE_SECOND_DISMISSAL_MS = 7 * 24 * 60 * 60_000;
export const CONTACT_NUDGE_CONVERSION_SUPPRESSION_MS = 90 * 24 * 60 * 60_000;

type StoredContactNudgePreferences = {
  dismissalCount?: number;
  nextEligibleAt?: number;
  convertedUntil?: number;
};

export type ContactNudgePreferences = {
  dismissalCount: 0 | 1 | 2;
  nextEligibleAt: number;
  convertedUntil: number;
  openedThisSession: boolean;
};

function asTimestamp(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function readStoredPreferences(): StoredContactNudgePreferences {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CONTACT_NUDGE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredContactNudgePreferences) : {};
  } catch {
    return {};
  }
}

function writeStoredPreferences(value: StoredContactNudgePreferences) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CONTACT_NUDGE_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // The cadence still works for the current component lifecycle when storage is unavailable.
  }
}

function wasOpenedThisSession() {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(CONTACT_NUDGE_SESSION_OPENED_KEY) === "true";
  } catch {
    return false;
  }
}

export function getContactNudgePreferences(now = Date.now()): ContactNudgePreferences {
  const stored = readStoredPreferences();
  const convertedUntil = asTimestamp(stored.convertedUntil);
  const nextEligibleAt = asTimestamp(stored.nextEligibleAt);
  const storedDismissals = stored.dismissalCount === 1 ? 1 : stored.dismissalCount === 2 ? 2 : 0;
  const dismissalCount = storedDismissals === 2 && nextEligibleAt <= now ? 0 : storedDismissals;

  return {
    dismissalCount,
    nextEligibleAt: dismissalCount === 0 ? 0 : nextEligibleAt,
    convertedUntil,
    openedThisSession: wasOpenedThisSession(),
  };
}

export function getContactNudgeDelay(now = Date.now()) {
  const preferences = getContactNudgePreferences(now);
  if (
    preferences.openedThisSession ||
    preferences.convertedUntil > now ||
    (preferences.dismissalCount === 2 && preferences.nextEligibleAt > now)
  ) {
    return null;
  }

  if (preferences.dismissalCount === 1) {
    return Math.max(CONTACT_NUDGE_INITIAL_DELAY_MS, preferences.nextEligibleAt - now);
  }

  return CONTACT_NUDGE_INITIAL_DELAY_MS;
}

export function recordContactNudgeDismissal(now = Date.now()) {
  const preferences = getContactNudgePreferences(now);
  const isFirstDismissal = preferences.dismissalCount === 0;
  const nextEligibleAt = now + (isFirstDismissal ? CONTACT_NUDGE_REMINDER_DELAY_MS : CONTACT_NUDGE_SECOND_DISMISSAL_MS);

  writeStoredPreferences({
    dismissalCount: isFirstDismissal ? 1 : 2,
    nextEligibleAt,
    convertedUntil: preferences.convertedUntil,
  });

  return {
    shouldRemind: isFirstDismissal,
    delayMs: isFirstDismissal ? CONTACT_NUDGE_REMINDER_DELAY_MS : null,
  };
}

export function markContactNudgeOpenedThisSession() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(CONTACT_NUDGE_SESSION_OPENED_KEY, "true");
  } catch {
    // The prompt is still hidden for the current component lifecycle.
  }
}

export function markContactNudgeConverted(now = Date.now()) {
  const convertedUntil = now + CONTACT_NUDGE_CONVERSION_SUPPRESSION_MS;
  writeStoredPreferences({ dismissalCount: 2, nextEligibleAt: convertedUntil, convertedUntil });
  markContactNudgeOpenedThisSession();
}

export function resetContactNudgePreferencesForTests() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONTACT_NUDGE_STORAGE_KEY);
  window.sessionStorage.removeItem(CONTACT_NUDGE_SESSION_OPENED_KEY);
}
