export const CONTACT_SUBMIT_ERROR_MESSAGES = {
  invalidForm: "Please check the form details and try again.",
  rateLimited: "Too many requests were sent. Please wait a moment and try again.",
  unavailable:
    "The contact service is temporarily unavailable. Please try again shortly or email info@aixco.global.",
  connection: "We could not reach the contact service. Check your connection and try again.",
  generic: "We could not send your request. Please try again or email info@aixco.global.",
} as const;

export function getContactSubmitErrorMessage(reason: string) {
  const normalized = reason.trim().toLowerCase();

  if (
    normalized.includes("too many") ||
    normalized.includes("rate limit") ||
    normalized.includes("submitted too quickly")
  ) {
    return CONTACT_SUBMIT_ERROR_MESSAGES.rateLimited;
  }

  if (
    normalized.startsWith("invalid ") ||
    normalized.includes("must be application/json") ||
    normalized.includes("body is too large")
  ) {
    return CONTACT_SUBMIT_ERROR_MESSAGES.invalidForm;
  }

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("load failed") ||
    normalized.includes("unreadable response")
  ) {
    return CONTACT_SUBMIT_ERROR_MESSAGES.connection;
  }

  if (
    normalized.includes("temporarily unavailable") ||
    normalized.includes("is unavailable") ||
    normalized.includes("configuration is not available") ||
    normalized.includes("schema is not available") ||
    normalized.includes("could not be stored") ||
    normalized.includes("database did not return") ||
    normalized.includes("status 5")
  ) {
    return CONTACT_SUBMIT_ERROR_MESSAGES.unavailable;
  }

  return CONTACT_SUBMIT_ERROR_MESSAGES.generic;
}
