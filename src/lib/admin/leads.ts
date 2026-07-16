import { z } from "zod";
import { getSupabaseAdminClient, getSupabaseAdminConfig } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export const leadStatusSchema = z.enum(["new", "contacted", "qualified", "archived"]);
export const leadResourceSchema = z.enum(["contact", "chat"]);

export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type LeadResource = z.infer<typeof leadResourceSchema>;
export type ContactLead = Pick<
  Database["public"]["Tables"]["contact_submissions"]["Row"],
  | "id"
  | "request_reference"
  | "created_at"
  | "name"
  | "email"
  | "interest"
  | "message"
  | "request_type"
  | "phone"
  | "preferred_call_at"
  | "preferred_call_timezone"
  | "locale"
  | "page_path"
  | "status"
  | "email_delivery_status"
  | "email_delivery_updated_at"
>;
export type ChatLead = Pick<
  Database["public"]["Tables"]["chat_transcripts"]["Row"],
  "id" | "created_at" | "interest" | "transcript" | "message_count" | "locale" | "page_path" | "status"
>;
export type PortalEvent = Pick<
  Database["public"]["Tables"]["portal_click_events"]["Row"],
  "id" | "created_at" | "mode" | "role_title" | "action" | "portal_url" | "locale" | "page_path"
>;

export type AdminLeadDashboard = {
  contacts: ContactLead[];
  chats: ChatLead[];
  portalEvents: PortalEvent[];
  pagination: {
    contacts: AdminLeadPage;
    chats: AdminLeadPage;
    portalEvents: AdminLeadPage;
  };
  window: {
    mode: "paged" | "pipeline";
    perResourceLimit: number | null;
  };
  stats: {
    newContacts: number;
    newChats: number;
    qualifiedContacts: number;
    qualifiedChats: number;
    totalContacts: number;
    totalChats: number;
    totalPortalEvents: number;
  };
};

export type AdminLeadDashboardResult =
  | { ok: true; data: AdminLeadDashboard }
  | { ok: false; reason: string; missing?: string[] };

export type AdminLeadPage = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  start: number;
  end: number;
};

type LeadFilters = {
  status?: LeadStatus;
  contactPage?: number;
  chatPage?: number;
  portalPage?: number;
  mode?: "paged" | "pipeline";
};
type StatusUpdateBuilder = {
  update: (payload: { status: LeadStatus }) => {
    eq: (column: "id", value: string) => {
      select: (column: "id") => {
        maybeSingle: () => Promise<{
          data: { id: string } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};
const CONTACT_COLUMNS = "id, request_reference, created_at, name, email, interest, message, request_type, phone, preferred_call_at, preferred_call_timezone, locale, page_path, status, email_delivery_status, email_delivery_updated_at";
const CHAT_COLUMNS = "id, created_at, interest, transcript, message_count, locale, page_path, status";
const PORTAL_COLUMNS = "id, created_at, mode, role_title, action, portal_url, locale, page_path";
export const ADMIN_LEAD_PAGE_SIZE = 15;
export const ADMIN_PIPELINE_RESOURCE_LIMIT = 100;

type AdminClient = Awaited<ReturnType<typeof getSupabaseAdminClient>>;

function applyStatusFilter<T extends { eq: (column: "status", value: LeadStatus) => T }>(query: T, status?: LeadStatus) {
  return status ? query.eq("status", status) : query;
}

async function countRows(
  client: AdminClient,
  table: "contact_submissions" | "chat_transcripts" | "portal_click_events",
  status?: LeadStatus,
) {
  const query = client.from(table).select("id", { count: "exact", head: true });
  const { count, error } = status ? await query.eq("status", status) : await query;

  if (error) throw new Error(error.message);

  return count ?? 0;
}

export function getAdminLeadPage(total: number, requestedPage = 1, pageSize = ADMIN_LEAD_PAGE_SIZE): AdminLeadPage {
  const safeTotal = Number.isSafeInteger(total) && total > 0 ? total : 0;
  const safePageSize = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : ADMIN_LEAD_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const normalizedRequestedPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const page = Math.min(normalizedRequestedPage, totalPages);
  const start = safeTotal === 0 ? 0 : (page - 1) * safePageSize + 1;
  const end = safeTotal === 0 ? 0 : Math.min(page * safePageSize, safeTotal);

  return { page, pageSize: safePageSize, total: safeTotal, totalPages, start, end };
}

function getRange(page: AdminLeadPage) {
  const from = (page.page - 1) * page.pageSize;
  return { from, to: from + page.pageSize - 1 };
}

async function fetchContacts(client: AdminClient, page: AdminLeadPage, status?: LeadStatus) {
  const { from, to } = getRange(page);
  const query = client
    .from("contact_submissions")
    .select(CONTACT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);
  const { data, error } = await applyStatusFilter(query, status);

  if (error) throw new Error(error.message);
  return (data ?? []) as ContactLead[];
}

async function fetchChats(client: AdminClient, page: AdminLeadPage, status?: LeadStatus) {
  const { from, to } = getRange(page);
  const query = client
    .from("chat_transcripts")
    .select(CHAT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);
  const { data, error } = await applyStatusFilter(query, status);

  if (error) throw new Error(error.message);
  return (data ?? []) as ChatLead[];
}

async function fetchPortalEvents(client: AdminClient, page: AdminLeadPage) {
  const { from, to } = getRange(page);
  const { data, error } = await client
    .from("portal_click_events")
    .select(PORTAL_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return (data ?? []) as PortalEvent[];
}

export function parseLeadStatus(value: unknown): LeadStatus | undefined {
  const parsed = leadStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export class LeadNotFoundError extends Error {
  constructor() {
    super("Lead not found.");
    this.name = "LeadNotFoundError";
  }
}

export async function fetchAdminLeadDashboard(filters: LeadFilters = {}): Promise<AdminLeadDashboardResult> {
  const config = getSupabaseAdminConfig();
  if (!config.configured) {
    return {
      ok: false,
      reason: "Supabase admin access is not configured.",
      missing: config.missing,
    };
  }

  try {
    const supabase = await getSupabaseAdminClient();
    const [newContacts, newChats, qualifiedContacts, qualifiedChats, totalContacts, totalChats, totalPortalEvents] =
      await Promise.all([
        countRows(supabase, "contact_submissions", "new"),
        countRows(supabase, "chat_transcripts", "new"),
        countRows(supabase, "contact_submissions", "qualified"),
        countRows(supabase, "chat_transcripts", "qualified"),
        countRows(supabase, "contact_submissions"),
        countRows(supabase, "chat_transcripts"),
        countRows(supabase, "portal_click_events"),
      ]);
    const [filteredContacts, filteredChats] = filters.status
      ? await Promise.all([
          filters.status === "new"
            ? newContacts
            : filters.status === "qualified"
              ? qualifiedContacts
              : countRows(supabase, "contact_submissions", filters.status),
          filters.status === "new"
            ? newChats
            : filters.status === "qualified"
              ? qualifiedChats
              : countRows(supabase, "chat_transcripts", filters.status),
        ])
      : [totalContacts, totalChats];
    const pipelineMode = filters.mode === "pipeline";
    const contactPage = getAdminLeadPage(
      filteredContacts,
      pipelineMode ? 1 : filters.contactPage,
      pipelineMode ? ADMIN_PIPELINE_RESOURCE_LIMIT : ADMIN_LEAD_PAGE_SIZE,
    );
    const chatPage = getAdminLeadPage(
      filteredChats,
      pipelineMode ? 1 : filters.chatPage,
      pipelineMode ? ADMIN_PIPELINE_RESOURCE_LIMIT : ADMIN_LEAD_PAGE_SIZE,
    );
    const portalPage = getAdminLeadPage(totalPortalEvents, filters.portalPage, ADMIN_LEAD_PAGE_SIZE);
    const [contactsResult, chatsResult, portalEventsResult] = await Promise.all([
      fetchContacts(supabase, contactPage, filters.status),
      fetchChats(supabase, chatPage, filters.status),
      fetchPortalEvents(supabase, portalPage),
    ]);

    return {
      ok: true,
      data: {
        contacts: contactsResult,
        chats: chatsResult,
        portalEvents: portalEventsResult,
        pagination: {
          contacts: contactPage,
          chats: chatPage,
          portalEvents: portalPage,
        },
        window: {
          mode: pipelineMode ? "pipeline" : "paged",
          perResourceLimit: pipelineMode ? ADMIN_PIPELINE_RESOURCE_LIMIT : null,
        },
        stats: {
          newContacts,
          newChats,
          qualifiedContacts,
          qualifiedChats,
          totalContacts,
          totalChats,
          totalPortalEvents,
        },
      },
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown admin lead dashboard error.",
    };
  }
}

export async function updateLeadStatus(resource: LeadResource, id: string, status: LeadStatus) {
  const supabase = await getSupabaseAdminClient();
  const table = (resource === "contact"
    ? supabase.from("contact_submissions")
    : supabase.from("chat_transcripts")) as unknown as StatusUpdateBuilder;
  const result = await table.update({ status }).eq("id", id).select("id").maybeSingle();

  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new LeadNotFoundError();
}

export async function requeueContactEmailDeliveries(contactSubmissionId: string) {
  const supabase = (await getSupabaseAdminClient()) as unknown as {
    rpc: (
      fn: "requeue_failed_contact_email_deliveries",
      args: { p_contact_submission_id: string },
    ) => Promise<{ data: number | null; error: { message: string } | null }>;
  };
  const { data, error } = await supabase.rpc("requeue_failed_contact_email_deliveries", {
    p_contact_submission_id: contactSubmissionId,
  });
  if (error) throw new Error(error.message);
  return data ?? 0;
}
