import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  ANALYTICS_CONSENT_VERSION,
  ANALYTICS_PREFERENCES_EVENT,
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_TRACK_EVENT,
  ANALYTICS_VISITOR_STORAGE_KEY,
} from "./contracts";
import {
  analyticsCollectionAllowed,
  hasBrowserPrivacySignal,
  openAnalyticsPreferences,
  readAnalyticsConsent,
  recordAnalyticsEvent,
  writeAnalyticsConsent,
} from "./client";

function setPrivacySignals({ gpc = false, dnt = null }: { gpc?: boolean; dnt?: string | null } = {}) {
  Object.defineProperty(navigator, "globalPrivacyControl", {
    configurable: true,
    value: gpc,
  });
  Object.defineProperty(navigator, "doNotTrack", {
    configurable: true,
    value: dnt,
  });
  Object.defineProperty(window, "doNotTrack", {
    configurable: true,
    value: dnt,
  });
}

describe("analytics client consent", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    setPrivacySignals();
  });

  it("persists versioned consent and notifies the tracker", () => {
    const listener = vi.fn();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, listener);

    writeAnalyticsConsent("granted");

    expect(readAnalyticsConsent()).toBe("granted");
    expect(analyticsCollectionAllowed()).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)!)).toMatchObject({
      status: "granted",
      version: ANALYTICS_CONSENT_VERSION,
    });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, listener);
  });

  it("treats malformed and stale stored consent as unset", () => {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "not-json");
    expect(readAnalyticsConsent()).toBe("unset");
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, JSON.stringify({
      status: "granted",
      version: "old-version",
    }));
    expect(readAnalyticsConsent()).toBe("unset");
  });

  it("honors GPC and DNT even after the visitor granted consent", () => {
    writeAnalyticsConsent("granted");
    setPrivacySignals({ gpc: true });
    expect(hasBrowserPrivacySignal()).toBe(true);
    expect(analyticsCollectionAllowed()).toBe(false);

    setPrivacySignals({ dnt: "1" });
    expect(hasBrowserPrivacySignal()).toBe(true);
    expect(analyticsCollectionAllowed()).toBe(false);
  });

  it("clears analytics identifiers when consent is denied", () => {
    window.localStorage.setItem(ANALYTICS_VISITOR_STORAGE_KEY, "visitor");
    window.sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, "session");

    writeAnalyticsConsent("denied");

    expect(readAnalyticsConsent()).toBe("denied");
    expect(window.localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("dispatches only consented analytics events and opens preferences explicitly", () => {
    const trackListener = vi.fn();
    const preferencesListener = vi.fn();
    window.addEventListener(ANALYTICS_TRACK_EVENT, trackListener);
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, preferencesListener);
    const event = { type: "click" as const, name: "button_click" as const, targetLabel: "Register" };

    recordAnalyticsEvent(event);
    expect(trackListener).not.toHaveBeenCalled();
    writeAnalyticsConsent("granted");
    recordAnalyticsEvent(event);
    openAnalyticsPreferences();

    expect(trackListener).toHaveBeenCalledTimes(1);
    expect((trackListener.mock.calls[0]?.[0] as CustomEvent).detail).toEqual(event);
    expect(preferencesListener).toHaveBeenCalledTimes(1);
    window.removeEventListener(ANALYTICS_TRACK_EVENT, trackListener);
    window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, preferencesListener);
  });
});
