import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/database.types";
import { isSafePortalUrl } from "@/lib/security/urls";

type CaptureResult =
  | { ok: true }
  | { ok: false; skipped?: boolean; reason: string };

type ContactSubmissionInput = {
  name: string;
  email: string;
  interest?: string;
  message: string;
};

type ChatMessageInput = {
  role: "aixco" | "visitor";
  text: string;
};

type PortalEventInput = {
  mode: "login" | "register";
  roleTitle: string;
  action: string;
  portalUrl: string;
  source?: "access_modal" | "chat_widget";
};

type BrowserContext = {
  locale: string | null;
  page_path: string | null;
  user_agent: string | null;
  metadata: Json;
};

type ContactInsert = Database["public"]["Tables"]["contact_submissions"]["Insert"];
type ChatInsert = Database["public"]["Tables"]["chat_transcripts"]["Insert"];
type PortalEventInsert = Database["public"]["Tables"]["portal_click_events"]["Insert"];
type SupabaseInsertBuilder = {
  insert: (payload: ContactInsert | ChatInsert | PortalEventInsert) => Promise<{ error: { message: string } | null }>;
};

function cleanOptionalText(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function getBrowserContext(): BrowserContext {
  if (typeof window === "undefined") {
    return {
      locale: null,
      page_path: null,
      user_agent: null,
      metadata: {},
    };
  }

  return {
    locale: window.navigator.language || null,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    user_agent: window.navigator.userAgent || null,
    metadata: {
      referrer: document.referrer || null,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    },
  };
}

function getInterestFromMessages(messages: ChatMessageInput[]) {
  const visitorText = messages
    .filter((message) => message.role === "visitor")
    .map((message) => message.text.toLowerCase())
    .join(" ");

  if (visitorText.includes("bond") || visitorText.includes("6%")) return "AIXCO 6% Bond";
  if (visitorText.includes("broker")) return "Broker partnership";
  if (visitorText.includes("developer")) return "Developer partnership";
  if (visitorText.includes("batumi") || visitorText.includes("apartment") || visitorText.includes("property")) {
    return "Batumi apartments";
  }

  return null;
}

async function insertRow(
  table: "contact_submissions" | "chat_transcripts" | "portal_click_events",
  payload: ContactInsert | ChatInsert | PortalEventInsert,
): Promise<CaptureResult> {
  if (!hasSupabaseBrowserConfig()) {
    return { ok: false, skipped: true, reason: "Supabase browser configuration is not available." };
  }

  const client = await getSupabaseBrowserClient();
  const { error } = await (client.from(table) as unknown as SupabaseInsertBuilder).insert(payload);

  if (error) {
    return { ok: false, reason: error.message };
  }

  return { ok: true };
}

export async function submitContactSubmission(input: ContactSubmissionInput): Promise<CaptureResult> {
  const context = getBrowserContext();
  const payload: ContactInsert = {
    source: "contact_form",
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    interest: cleanOptionalText(input.interest),
    message: input.message.trim(),
    ...context,
  };

  return insertRow("contact_submissions", payload);
}

export async function recordChatTranscript(messages: ChatMessageInput[]): Promise<CaptureResult> {
  const normalizedMessages = messages.map((message) => ({
    role: message.role,
    text: message.text.trim(),
  }));
  const transcript = normalizedMessages
    .map((message) => `${message.role === "visitor" ? "Visitor" : "AIXCO"}: ${message.text}`)
    .join("\n");

  const context = getBrowserContext();
  const payload: ChatInsert = {
    source: "live_chat",
    interest: getInterestFromMessages(normalizedMessages),
    transcript,
    messages: normalizedMessages as Json,
    message_count: normalizedMessages.length,
    ...context,
  };

  return insertRow("chat_transcripts", payload);
}

export async function recordPortalEvent(input: PortalEventInput): Promise<CaptureResult> {
  if (!isSafePortalUrl(input.portalUrl)) {
    return { ok: false, skipped: true, reason: "Portal URL is not allowed." };
  }

  const context = getBrowserContext();
  const payload: PortalEventInsert = {
    source: input.source ?? "access_modal",
    mode: input.mode,
    role_title: input.roleTitle.trim(),
    action: input.action.trim(),
    portal_url: input.portalUrl,
    ...context,
  };

  return insertRow("portal_click_events", payload);
}
