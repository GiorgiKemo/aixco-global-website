import {
  type BrowserContextInput,
  type CaptureResult,
  type ChatMessageInput,
  type ChatTranscriptInput,
  type ContactSubmissionInput,
  type PortalEventInput,
} from "@/lib/backend/lead-capture-contracts";
import { isSafePortalUrl } from "@/lib/security/urls";

type CaptureEndpoint = "contact" | "chat" | "portal-event";
type ChatTranscriptOptions = Pick<ChatTranscriptInput, "reason" | "sessionId">;

const CAPTURE_ENDPOINTS: Record<CaptureEndpoint, string> = {
  contact: "/api/lead-capture/contact",
  chat: "/api/lead-capture/chat",
  "portal-event": "/api/lead-capture/portal-event",
};

function shouldSkipNetworkCapture() {
  return typeof window === "undefined" || process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}

function getBrowserContext(): BrowserContextInput {
  if (typeof window === "undefined") {
    return {
      locale: null,
      page_path: null,
      metadata: {},
    };
  }

  return {
    locale: window.navigator.language || null,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    metadata: {
      referrer: document.referrer || null,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    },
  };
}

async function readCaptureResponse(response: Response): Promise<CaptureResult> {
  try {
    const payload = (await response.json()) as Partial<{ ok: boolean; skipped: boolean; reason: string }>;

    if (payload.ok === true) return { ok: true };

    return {
      ok: false,
      skipped: payload.skipped,
      reason: typeof payload.reason === "string" ? payload.reason : "Lead capture request failed.",
    };
  } catch {
    return { ok: false, reason: "Lead capture returned an unreadable response." };
  }
}

async function postCapture(endpoint: CaptureEndpoint, payload: unknown): Promise<CaptureResult> {
  if (shouldSkipNetworkCapture()) {
    return { ok: false, skipped: true, reason: "Lead capture API is not available in this environment." };
  }

  try {
    const response = await fetch(CAPTURE_ENDPOINTS[endpoint], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, context: getBrowserContext() }),
      keepalive: true,
    });
    const result = await readCaptureResponse(response);

    if (!response.ok && result.ok) {
      return { ok: false, reason: `Lead capture failed with status ${response.status}.` };
    }

    return result;
  } catch (error) {
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

  return postCapture("chat", { ...options, messages: normalizedMessages });
}

export async function recordContactSubmission(input: ContactSubmissionInput): Promise<CaptureResult> {
  return postCapture("contact", input);
}

export async function recordPortalEvent(input: PortalEventInput): Promise<CaptureResult> {
  if (!isSafePortalUrl(input.portalUrl)) {
    return { ok: false, skipped: true, reason: "Portal URL is not allowed." };
  }

  return postCapture("portal-event", input);
}
