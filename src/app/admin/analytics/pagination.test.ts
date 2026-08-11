import { describe, expect, it } from "vitest";
import {
  ADMIN_ANALYTICS_PAGE_SIZE,
  buildAnalyticsPaginationHref,
  createAnalyticsListPagination,
  createAnalyticsPaginationState,
  parseAnalyticsPage,
  sliceAnalyticsPage,
} from "./pagination";

describe("admin analytics pagination", () => {
  it("accepts positive whole-number query values and rejects malformed values", () => {
    expect(parseAnalyticsPage("3")).toBe(3);
    expect(parseAnalyticsPage(["4", "7"])).toBe(4);
    expect(parseAnalyticsPage(undefined)).toBe(1);
    expect(parseAnalyticsPage("0")).toBe(1);
    expect(parseAnalyticsPage("-2")).toBe(1);
    expect(parseAnalyticsPage("2.5")).toBe(1);
    expect(parseAnalyticsPage("2abc")).toBe(1);
  });

  it("clamps oversized page requests and exposes an exact server-rendered range", () => {
    const pagination = createAnalyticsListPagination(13, 99);

    expect(pagination).toEqual({
      page: 3,
      pageSize: ADMIN_ANALYTICS_PAGE_SIZE,
      total: 13,
      totalPages: 3,
      start: 13,
      end: 13,
      startIndex: 12,
      endIndex: 13,
    });
    expect(sliceAnalyticsPage(Array.from({ length: 13 }, (_, index) => index + 1), pagination)).toEqual([13]);
  });

  it("keeps empty lists on a stable first page without inventing a visible range", () => {
    expect(createAnalyticsListPagination(0, 8)).toEqual({
      page: 1,
      pageSize: ADMIN_ANALYTICS_PAGE_SIZE,
      total: 0,
      totalPages: 1,
      start: 0,
      end: 0,
      startIndex: 0,
      endIndex: 0,
    });
  });

  it("builds independent list pages from the same six-item page size", () => {
    const state = createAnalyticsPaginationState({
      totals: { sessions: 24, errors: 7, audit: 5 },
      requestedPages: { sessions: 2, errors: 9, audit: 3 },
    });

    expect(state.sessions).toMatchObject({ page: 2, totalPages: 4, start: 7, end: 12 });
    expect(state.errors).toMatchObject({ page: 2, totalPages: 2, start: 7, end: 7 });
    expect(state.audit).toMatchObject({ page: 1, totalPages: 1, start: 1, end: 5 });
  });

  it("preserves focus, range, and the other focused-list pages in pagination links", () => {
    expect(buildAnalyticsPaginationHref({
      range: "30d",
      focus: "reliability",
      pages: { sessions: 3, errors: 2, audit: 4 },
      target: "errors",
      page: 1,
    })).toBe("/admin/analytics?range=30d&focus=reliability&sessionsPage=3&auditPage=4");
  });
});
