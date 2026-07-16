import { beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => ({
  ranges: [] as Array<{ table: string; from: number; to: number }>,
}));

vi.mock("@/lib/supabase/admin", () => {
  const counts: Record<string, Record<string, number>> = {
    contact_submissions: { all: 250, new: 12, qualified: 30, contacted: 40, archived: 168 },
    chat_transcripts: { all: 80, new: 5, qualified: 10, contacted: 20, archived: 45 },
    portal_click_events: { all: 40 },
  };
  const response = <T,>(value: T) => ({
    then: (resolve: (result: T) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(value).then(resolve, reject),
  });
  const from = (table: string) => ({
    select: (_columns: string, options?: { head?: boolean }) => {
      if (options?.head) {
        const countResult = (status = "all") => ({ count: counts[table]?.[status] ?? 0, error: null });
        return {
          ...response(countResult()),
          eq: (_column: string, status: string) => Promise.resolve(countResult(status)),
        };
      }

      const dataResult = { data: [], error: null };
      const query = {
        ...response(dataResult),
        order: () => query,
        range: (from: number, to: number) => {
          adminMocks.ranges.push({ table, from, to });
          return query;
        },
        eq: () => Promise.resolve(dataResult),
      };
      return query;
    },
  });

  return {
    getSupabaseAdminConfig: () => ({ configured: true, missing: [] }),
    getSupabaseAdminClient: async () => ({ from }),
  };
});

import {
  ADMIN_LEAD_PAGE_SIZE,
  ADMIN_PIPELINE_RESOURCE_LIMIT,
  fetchAdminLeadDashboard,
  getAdminLeadPage,
  parseLeadStatus,
} from "./leads";

describe("admin leads", () => {
  beforeEach(() => {
    adminMocks.ranges.length = 0;
  });

  it("accepts supported lead status filters", () => {
    expect(parseLeadStatus("new")).toBe("new");
    expect(parseLeadStatus("contacted")).toBe("contacted");
    expect(parseLeadStatus("qualified")).toBe("qualified");
    expect(parseLeadStatus("archived")).toBe("archived");
  });

  it("ignores unsupported lead status filters", () => {
    expect(parseLeadStatus("deleted")).toBeUndefined();
    expect(parseLeadStatus(undefined)).toBeUndefined();
  });

  it("builds exact bounded page ranges and clamps out-of-range requests", () => {
    expect(getAdminLeadPage(46, 2)).toEqual({
      page: 2,
      pageSize: ADMIN_LEAD_PAGE_SIZE,
      total: 46,
      totalPages: 4,
      start: 16,
      end: 30,
    });
    expect(getAdminLeadPage(46, 999)).toMatchObject({ page: 4, start: 46, end: 46 });
    expect(getAdminLeadPage(0, -4)).toMatchObject({ page: 1, totalPages: 1, start: 0, end: 0 });
  });

  it("keeps the pipeline window explicitly bounded per resource", () => {
    expect(getAdminLeadPage(900, 1, ADMIN_PIPELINE_RESOURCE_LIMIT)).toEqual({
      page: 1,
      pageSize: 100,
      total: 900,
      totalPages: 9,
      start: 1,
      end: 100,
    });
  });

  it("queries only the requested server-side ranges", async () => {
    const result = await fetchAdminLeadDashboard({ contactPage: 2, chatPage: 3, portalPage: 2 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.pagination.contacts).toMatchObject({ page: 2, total: 250, start: 16, end: 30 });
    expect(result.data.pagination.chats).toMatchObject({ page: 3, total: 80, start: 31, end: 45 });
    expect(adminMocks.ranges).toEqual([
      { table: "contact_submissions", from: 15, to: 29 },
      { table: "chat_transcripts", from: 30, to: 44 },
      { table: "portal_click_events", from: 15, to: 29 },
    ]);
  });

  it("loads a fixed recent pipeline window instead of every lead", async () => {
    const result = await fetchAdminLeadDashboard({ mode: "pipeline" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.window).toEqual({ mode: "pipeline", perResourceLimit: 100 });
    expect(adminMocks.ranges).toEqual([
      { table: "contact_submissions", from: 0, to: 99 },
      { table: "chat_transcripts", from: 0, to: 99 },
      { table: "portal_click_events", from: 0, to: 14 },
    ]);
  });
});
