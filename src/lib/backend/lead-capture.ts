import {
  type BrowserContextInput,
  type CaptureResult,
  type ChatMessageInput,
  type ChatTranscriptInput,
  type ContactSubmissionInput,
  type LeadCaptureAntiAbuseInput,
  type PortalEventInput,
} from "@/lib/backend/lead-capture-contracts";
import { analyticsCollectionAllowed, recordAnalyticsEvent } from "@/lib/analytics/client";
import { ANALYTICS_SESSION_STORAGE_KEY } from "@/lib/analytics/constants";
import { isSafePortalUrl } from "@/lib/security/urls";

type CaptureEndpoint = "contact" | "chat" | "portal-event";
type ChatTranscriptOptions = Pick<ChatTranscriptInput, "reason" | "sessionId"> & { locale?: string };
type ContactSubmissionOptions = { antiAbuse?: LeadCaptureAntiAbuseInput; locale?: string };

const contactExperienceStartedAt = Date.now();

const CAPTURE_ENDPOINTS: Record<CaptureEndpoint, string> = {
  contact: "/api/lead-capture/contact",
  chat: "/api/lead-capture/chat",
  "portal-event": "/api/lead-capture/portal-event",
};

function shouldSkipNetworkCapture() {
  return typeof window === "undefined" || process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}

function getBrowserContext(locale?: string): BrowserContextInput {
  if (typeof window === "undefined") {
    return {
      locale: null,
      page_path: null,
      metadata: {},
    };
  }

  let analyticsSessionId: string | null = null;
  let analyticsSessionToken: string | null = null;
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY) ?? "null") as {
      id?: unknown;
      linkToken?: unknown;
    } | null;
    analyticsSessionId = analyticsCollectionAllowed()
      && typeof stored?.id === "string"
      && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored.id)
      ? stored.id
      : null;
    analyticsSessionToken = analyticsSessionId
      && typeof stored?.linkToken === "string"
      && /^[a-f0-9]{64}$/.test(stored.linkToken)
      ? stored.linkToken
      : null;
  } catch {
    analyticsSessionId = null;
    analyticsSessionToken = null;
  }

  const safeHash = /^#[a-z0-9][a-z0-9_-]{0,119}$/i.test(window.location.hash)
    ? window.location.hash
    : "";

  return {
    locale: locale?.trim() || window.navigator.language || null,
    page_path: `${window.location.pathname}${safeHash}`,
    metadata: {
      referrer: document.referrer || null,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      analytics_session_id: analyticsSessionId,
      analytics_session_token: analyticsSessionToken,
    },
  };
}

async function readCaptureResponse(response: Response): Promise<CaptureResult> {
  try {
    const payload = (await response.json()) as Partial<{
      ok: boolean;
      skipped: boolean;
      reason: string;
      reference: string;
      emailDelivery: {
        status: "queued" | "processing" | "retrying" | "provider_accepted" | "failed";
        internal: "queued" | "processing" | "retrying" | "provider_accepted" | "failed";
        confirmation: "queued" | "processing" | "retrying" | "provider_accepted" | "failed";
      };
    }>;

    if (payload.ok === true) {
      return {
        ok: true,
        ...(typeof payload.reference === "string" ? { reference: payload.reference } : {}),
        ...(payload.emailDelivery && typeof payload.emailDelivery === "object"
          ? { emailDelivery: payload.emailDelivery }
          : {}),
      };
    }

    return {
      ok: false,
      skipped: payload.skipped,
      reason: typeof payload.reason === "string" ? payload.reason : "Lead capture request failed.",
    };
  } catch {
    return { ok: false, reason: "Lead capture returned an unreadable response." };
  }
}

async function postCapture(
  endpoint: CaptureEndpoint,
  payload: unknown,
  antiAbuse?: LeadCaptureAntiAbuseInput,
  locale?: string,
): Promise<CaptureResult> {
  if (shouldSkipNetworkCapture()) {
    return { ok: false, skipped: true, reason: "Lead capture API is not available in this environment." };
  }

  try {
    const response = await fetch(CAPTURE_ENDPOINTS[endpoint], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, context: getBrowserContext(locale), ...(antiAbuse ? { antiAbuse } : {}) }),
      keepalive: true,
    });
    const result = await readCaptureResponse(response);

    if (!response.ok && result.ok) {
      recordAnalyticsEvent({
        type: "form_error",
        name: "form_failed",
        targetLabel: endpoint,
        metadata: { source: "lead_capture", status: `http_${response.status}` },
      });
      return { ok: false, reason: `Lead capture failed with status ${response.status}.` };
    }

    if (result.ok) {
      const event = endpoint === "contact"
        ? { type: "form_submit" as const, name: "contact_request_acknowledged" as const }
        : endpoint === "chat"
          ? { type: "click" as const, name: "chat_message" as const }
          : { type: "portal_handoff" as const, name: "portal_handoff" as const };
      recordAnalyticsEvent({
        ...event,
        targetLabel: endpoint,
        metadata: { source: "lead_capture", status: "stored" },
      });
    } else {
      recordAnalyticsEvent({
        type: "form_error",
        name: "form_failed",
        targetLabel: endpoint,
        metadata: { source: "lead_capture", status: `http_${response.status}` },
      });
    }

    return result;
  } catch (error) {
    recordAnalyticsEvent({
      type: "form_error",
      name: "form_failed",
      targetLabel: endpoint,
      metadata: { source: "lead_capture", status: "network_error" },
    });
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown lead capture request error.",
    };
  }
}

export async function recordChatTranscript(
  messages: ChatMessageInput[],
  options: ChatTranscriptOptions = {},
): Promise<CaptureResult> {
  const normalizedMessages = messages.map((message) => ({
    role: message.role,
    text: message.text,
  }));

  const { locale, ...transcript } = options;
  return postCapture("chat", { ...transcript, messages: normalizedMessages }, undefined, locale);
}

export async function recordContactSubmission(
  input: ContactSubmissionInput,
  options: ContactSubmissionOptions = {},
): Promise<CaptureResult> {
  return postCapture("contact", input, options.antiAbuse ?? {
    website: "",
    startedAt: contactExperienceStartedAt,
  }, options.locale);
}

export async function recordPortalEvent(input: PortalEventInput): Promise<CaptureResult> {
  if (!isSafePortalUrl(input.portalUrl)) {
    return { ok: false, skipped: true, reason: "Portal URL is not allowed." };
  }

  return postCapture("portal-event", input);
}
