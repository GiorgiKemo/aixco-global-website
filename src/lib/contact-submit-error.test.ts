import { describe, expect, it } from "vitest";
import {
  CONTACT_SUBMIT_ERROR_MESSAGES,
  getContactSubmitErrorMessage,
} from "./contact-submit-error";

describe("contact submission error messages", () => {
  it("separates rate limits, invalid forms, service failures, and network failures", () => {
    expect(getContactSubmitErrorMessage("Too many lead capture requests.")).toBe(
      CONTACT_SUBMIT_ERROR_MESSAGES.rateLimited,
    );
    expect(getContactSubmitErrorMessage("Invalid contact submission payload.")).toBe(
      CONTACT_SUBMIT_ERROR_MESSAGES.invalidForm,
    );
    expect(getContactSubmitErrorMessage("The contact request could not be stored right now.")).toBe(
      CONTACT_SUBMIT_ERROR_MESSAGES.unavailable,
    );
    expect(getContactSubmitErrorMessage("Failed to fetch")).toBe(
      CONTACT_SUBMIT_ERROR_MESSAGES.connection,
    );
  });

  it("uses the safe generic message for an unknown failure", () => {
    expect(getContactSubmitErrorMessage("Unexpected provider response.")).toBe(
      CONTACT_SUBMIT_ERROR_MESSAGES.generic,
    );
  });
});
