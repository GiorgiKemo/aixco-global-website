import { z } from "zod";
import { getSupabaseAdminClient, getSupabaseAdminConfig } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export const leadStatusSchema = z.enum(["new", "contacted", "qualified", "archived"]);
export const leadResourceSchema = z.enum(["contact", "chat"]);

export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type LeadResource = z.infer<typeof leadResourceSchema>;
export type ContactLead = Pick<
  Database["public"]["Tables"]["contact_submissions"]["Row"],
  "id" | "request_reference" | "created_at" | "name" | "email" | "interest" | "message" | "locale" | "page_path" | "status"
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
  stats: {
    newContacts: number;
    newChats: number;
    totalContacts: number;
    totalChats: number;
    totalPortalEvents: number;
  };
};

export type AdminLeadDashboardResult =
  | { ok: true; data: AdminLeadDashboard }
  | { ok: false; reason: string; missing?: string[] };

type LeadFilters = {
  status?: LeadStatus;
};
type StatusUpdateBuilder = {
  update: (payload: { status: LeadStatus }) => {
    eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
  };
};

const CONTACT_COLUMNS = "id, request_reference, created_at, name, email, interest, message, locale, page_path, status";
const CHAT_COLUMNS = "id, created_at, interest, transcript, message_count, locale, page_path, status";
const PORTAL_COLUMNS = "id, created_at, mode, role_title, action, portal_url, locale, page_path";
const ADMIN_QUERY_PAGE_SIZE = 500;

type AdminClient = Awaited<ReturnType<typeof getSupabaseAdminClient>>;

function applyStatusFilter<T extends { eq: (column: "status", value: LeadStatus) => T }>(query: T, status?: LeadStatus) {
  return status ? query.eq("status", status) : query;
}

async function countRows(table: "contact_submissions" | "chat_transcripts" | "portal_click_events", status?: LeadStatus) {
  const supabase = await getSupabaseAdminClient();
  const query = supabase.from(table).select("id", { count: "exact", head: true });
  const { count, error } = status ? await query.eq("status", status) : await query;

  if (error) throw new Error(error.message);

  return count ?? 0;
}

async function fetchAllContacts(client: AdminClient, status?: LeadStatus) {
  const rows: ContactLead[] = [];

  for (let from = 0; ; from += ADMIN_QUERY_PAGE_SIZE) {
    const query = client
      .from("contact_submissions")
      .select(CONTACT_COLUMNS)
      .order("created_at", { ascending: false })
      .range(from, from + ADMIN_QUERY_PAGE_SIZE - 1);
    const { data, error } = await applyStatusFilter(query, status);

    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < ADMIN_QUERY_PAGE_SIZE) return rows;
  }
}

async function fetchAllChats(client: AdminClient, status?: LeadStatus) {
  const rows: ChatLead[] = [];

  for (let from = 0; ; from += ADMIN_QUERY_PAGE_SIZE) {
    const query = client
      .from("chat_transcripts")
      .select(CHAT_COLUMNS)
      .order("created_at", { ascending: false })
      .range(from, from + ADMIN_QUERY_PAGE_SIZE - 1);
    const { data, error } = await applyStatusFilter(query, status);

    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < ADMIN_QUERY_PAGE_SIZE) return rows;
  }
}

async function fetchAllPortalEvents(client: AdminClient) {
  const rows: PortalEvent[] = [];

  for (let from = 0; ; from += ADMIN_QUERY_PAGE_SIZE) {
    const { data, error } = await client
      .from("portal_click_events")
      .select(PORTAL_COLUMNS)
      .order("created_at", { ascending: false })
      .range(from, from + ADMIN_QUERY_PAGE_SIZE - 1);

    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < ADMIN_QUERY_PAGE_SIZE) return rows;
  }
}

export function parseLeadStatus(value: unknown): LeadStatus | undefined {
  const parsed = leadStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
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
    const [contactsResult, chatsResult, portalEventsResult, newContacts, newChats, totalContacts, totalChats, totalPortalEvents] =
      await Promise.all([
        fetchAllContacts(supabase, filters.status),
        fetchAllChats(supabase, filters.status),
        fetchAllPortalEvents(supabase),
        countRows("contact_submissions", "new"),
        countRows("chat_transcripts", "new"),
        countRows("contact_submissions"),
        countRows("chat_transcripts"),
        countRows("portal_click_events"),
      ]);

    return {
      ok: true,
      data: {
        contacts: contactsResult,
        chats: chatsResult,
        portalEvents: portalEventsResult,
        stats: {
          newContacts,
          newChats,
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
  const table =
    resource === "contact"
      ? (supabase.from("contact_submissions") as unknown as StatusUpdateBuilder)
      : (supabase.from("chat_transcripts") as unknown as StatusUpdateBuilder);
  const result = await table.update({ status }).eq("id", id);

  if (result.error) throw new Error(result.error.message);
}
