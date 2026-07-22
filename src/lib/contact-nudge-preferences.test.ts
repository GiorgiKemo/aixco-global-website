import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONTACT_NUDGE_CONVERSION_SUPPRESSION_MS,
  CONTACT_NUDGE_INITIAL_DELAY_MS,
  CONTACT_NUDGE_REMINDER_DELAY_MS,
  CONTACT_NUDGE_SECOND_DISMISSAL_MS,
  getContactNudgeDelay,
  getContactNudgePreferences,
  markContactNudgeConverted,
  recordContactNudgeDismissal,
  resetContactNudgePreferencesForTests,
} from "./contact-nudge-preferences";

describe("contact nudge preferences", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00Z"));
    resetContactNudgePreferencesForTests();
  });

  it("allows one four-minute reminder before applying a seven-day cooldown", () => {
    const now = Date.now();
    expect(getContactNudgeDelay(now)).toBe(CONTACT_NUDGE_INITIAL_DELAY_MS);

    expect(recordContactNudgeDismissal(now)).toEqual({
      shouldRemind: true,
      delayMs: CONTACT_NUDGE_REMINDER_DELAY_MS,
    });
    expect(getContactNudgePreferences(now).dismissalCount).toBe(1);

    expect(recordContactNudgeDismissal(now + CONTACT_NUDGE_REMINDER_DELAY_MS)).toEqual({
      shouldRemind: false,
      delayMs: null,
    });
    expect(getContactNudgeDelay(now + CONTACT_NUDGE_REMINDER_DELAY_MS)).toBeNull();
    expect(getContactNudgeDelay(now + CONTACT_NUDGE_REMINDER_DELAY_MS + CONTACT_NUDGE_SECOND_DISMISSAL_MS)).toBe(
      CONTACT_NUDGE_INITIAL_DELAY_MS,
    );
  });

  it("suppresses prompts for 90 days after a successful conversion", () => {
    const now = Date.now();
    markContactNudgeConverted(now);

    expect(getContactNudgeDelay(now + CONTACT_NUDGE_CONVERSION_SUPPRESSION_MS - 1)).toBeNull();
    expect(getContactNudgeDelay(now + CONTACT_NUDGE_CONVERSION_SUPPRESSION_MS)).toBeNull();
  });
});
