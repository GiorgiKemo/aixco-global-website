import {
  browserContextSchema,
  chatTranscriptSchema,
  contactSubmissionSchema,
  portalEventSchema,
  type BrowserContextInput,
  type CaptureResult,
  type ChatMessageInput,
  type ContactSubmissionInput,
  type PortalEventInput,
} from "@/lib/backend/lead-capture-contracts";
import { isSafePortalUrl } from "@/lib/security/urls";
import { getSupabaseAdminClient, getSupabaseAdminConfig } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";

type ContactInsert = Database["public"]["Tables"]["contact_submissions"]["Insert"];
type ChatInsert = Database["public"]["Tables"]["chat_transcripts"]["Insert"];
type PortalEventInsert = Database["public"]["Tables"]["portal_click_events"]["Insert"];

type CaptureTable = "contact_submissions" | "chat_transcripts" | "portal_click_events";
type CaptureInsert = ContactInsert | ChatInsert | PortalEventInsert;
type InsertResult = Promise<{ error: { message: string } | null }>;
type InsertBuilder = { insert: (payload: CaptureInsert) => InsertResult };
type ChatTranscriptBuilder = {
  insert: (payload: ChatInsert) => InsertResult;
  upsert: (payload: ChatInsert, options: { onConflict: "session_id" }) => InsertResult;
};
type LeadCaptureClient = { from: (table: CaptureTable) => unknown };

type LeadCaptureOptions = {
  client?: LeadCaptureClient;
  headers?: Headers;
  hasServerConfig?: boolean;
};
type CaptureFailure = Extract<CaptureResult, { ok: false }>;

type ServerContext = {
  locale: string | null;
  page_path: string | null;
  user_agent: string | null;
  metadata: Json;
};

function cleanOptionalText(value: string | null | undefined, maxLength: number) {
  const cleaned = value?.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function firstAcceptedLanguage(headers?: Headers) {
  return cleanOptionalText(headers?.get("accept-language")?.split(",")[0], 35);
}

function normalizeMetadata(context?: BrowserContextInput, headers?: Headers): Json {
  const metadata = context?.metadata ?? {};

  return {
    referrer: cleanOptionalText(metadata.referrer ?? headers?.get("referer"), 2048),
    viewport_width: metadata.viewport_width ?? null,
    viewport_height: metadata.viewport_height ?? null,
    timezone: cleanOptionalText(metadata.timezone, 80),
  };
}

function buildServerContext(context: unknown, headers?: Headers): ServerContext | CaptureFailure {
  const parsed = browserContextSchema.safeParse(context ?? {});

  if (!parsed.success) {
    return { ok: false, reason: "Invalid browser context." };
  }

  return {
    locale: cleanOptionalText(parsed.data.locale, 35) ?? firstAcceptedLanguage(headers),
    page_path: cleanOptionalText(parsed.data.page_path, 800),
    user_agent: cleanOptionalText(headers?.get("user-agent"), 500),
    metadata: normalizeMetadata(parsed.data, headers),
  };
}

function getInterestFromMessages(messages: ChatMessageInput[]) {
  const visitorText = messages
    .filter((message) => message.role === "visitor")
    .map((message) => message.text.toLowerCase())
    .join(" ");

  if (visitorText.includes("property administration") || visitorText.includes("handover")) return "Property administration";
  if (visitorText.includes("broker")) return "Broker partnership";
  if (visitorText.includes("developer")) return "Developer partnership";
  if (visitorText.includes("batumi") || visitorText.includes("apartment") || visitorText.includes("property")) {
    return "Batumi apartments";
  }

  return null;
}

function buildTranscript(messages: ChatMessageInput[]) {
  return messages
    .map((message) => `${message.role === "visitor" ? "Visitor" : "AIXCO"}: ${message.text}`)
    .join("\n");
}

function getMetadataObject(metadata: Json): { [key: string]: Json | undefined } {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
}

function validationFailure(resource: string): CaptureResult {
  return { ok: false, reason: `Invalid ${resource} payload.` };
}

function shouldFallbackToLegacyChatInsert(error: { message: string } | null) {
  const message = error?.message.toLowerCase() ?? "";
  return (
    message.includes("session_id") ||
    message.includes("on conflict") ||
    message.includes("unique or exclusion constraint")
  );
}

function omitChatSessionId(payload: ChatInsert): ChatInsert {
  const { session_id: _sessionId, ...legacyPayload } = payload;
  return legacyPayload;
}

async function insertRow(
  table: CaptureTable,
  payload: CaptureInsert,
  options: LeadCaptureOptions,
): Promise<CaptureResult> {
  if (!options.client && !(options.hasServerConfig ?? getSupabaseAdminConfig().configured)) {
    return { ok: false, skipped: true, reason: "Supabase admin configuration is not available." };
  }

  try {
    const client = (options.client ?? (await getSupabaseAdminClient())) as LeadCaptureClient;
    const tableClient = client.from(table) as InsertBuilder;
    const { error } = await tableClient.insert(payload);

    if (error) {
      return { ok: false, reason: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown lead capture error.",
    };
  }
}

async function writeChatTranscript(payload: ChatInsert, options: LeadCaptureOptions): Promise<CaptureResult> {
  if (!options.client && !(options.hasServerConfig ?? getSupabaseAdminConfig().configured)) {
    return { ok: false, skipped: true, reason: "Supabase admin configuration is not available." };
  }

  try {
    const client = (options.client ?? (await getSupabaseAdminClient())) as LeadCaptureClient;
    const tableClient = client.from("chat_transcripts") as ChatTranscriptBuilder;
    const result = payload.session_id
      ? await tableClient.upsert(payload, { onConflict: "session_id" })
      : await tableClient.insert(payload);
    let error = result.error;

    if (payload.session_id && shouldFallbackToLegacyChatInsert(error)) {
      const fallbackResult = await tableClient.insert(omitChatSessionId(payload));
      error = fallbackResult.error;
    }

    if (error) {
      return { ok: false, reason: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown lead capture error.",
    };
  }
}

export async function captureContactSubmission(
  input: unknown,
  context: unknown,
  options: LeadCaptureOptions = {},
): Promise<CaptureResult> {
  const parsed = contactSubmissionSchema.safeParse(input);
  if (!parsed.success) return validationFailure("contact submission");

  const serverContext = buildServerContext(context, options.headers);
  if ("ok" in serverContext) return serverContext;

  const payload: ContactInsert = {
    source: "contact_form",
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    interest: parsed.data.interest ?? null,
    message: parsed.data.message,
    ...serverContext,
  };

  return insertRow("contact_submissions", payload, options);
}

export async function captureChatTranscript(
  input: unknown,
  context: unknown,
  options: LeadCaptureOptions = {},
): Promise<CaptureResult> {
  const parsed = chatTranscriptSchema.safeParse(input);
  if (!parsed.success) return validationFailure("chat transcript");

  const messages = parsed.data.messages;
  const transcript = buildTranscript(messages);
  if (transcript.length > 10000) {
    return { ok: false, reason: "Chat transcript is too long." };
  }

  const serverContext = buildServerContext(context, options.headers);
  if ("ok" in serverContext) return serverContext;

  const sessionId = parsed.data.sessionId ?? null;
  const payload: ChatInsert = {
    session_id: sessionId,
    source: "live_chat",
    interest: getInterestFromMessages(messages),
    transcript,
    messages: messages as unknown as Json,
    message_count: messages.length,
    locale: serverContext.locale,
    page_path: serverContext.page_path,
    user_agent: serverContext.user_agent,
    metadata: {
      ...getMetadataObject(serverContext.metadata),
      capture_reason: parsed.data.reason ?? (sessionId ? "auto_sync" : "email_transcript"),
      chat_session_id: sessionId,
    },
  };

  return writeChatTranscript(payload, options);
}

export async function capturePortalEvent(
  input: unknown,
  context: unknown,
  options: LeadCaptureOptions = {},
): Promise<CaptureResult> {
  const parsed = portalEventSchema.safeParse(input);
  if (!parsed.success) return validationFailure("portal event");

  if (!isSafePortalUrl(parsed.data.portalUrl)) {
    return { ok: false, skipped: true, reason: "Portal URL is not allowed." };
  }

  const serverContext = buildServerContext(context, options.headers);
  if ("ok" in serverContext) return serverContext;

  const payload: PortalEventInsert = {
    source: parsed.data.source ?? "access_modal",
    mode: parsed.data.mode,
    role_title: parsed.data.roleTitle,
    action: parsed.data.action,
    portal_url: parsed.data.portalUrl,
    ...serverContext,
  };

  return insertRow("portal_click_events", payload, options);
}

export type { ContactSubmissionInput, ChatMessageInput, PortalEventInput };
