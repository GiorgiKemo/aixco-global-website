import { describe, expect, it } from "vitest";
import {
  buildAdminLeadsFeedbackRedirect,
  sanitizeAdminLeadsReturnTo,
} from "./navigation";

describe("admin leads return navigation", () => {
  it("preserves only the validated tab, filter, and independent page context", () => {
    expect(sanitizeAdminLeadsReturnTo(
      "/admin/leads?tab=records&status=archived&contactPage=3&chatPage=2&portalPage=9&updated=1#old",
    )).toBe("/admin/leads?tab=records&status=archived&contactPage=3&chatPage=2");

    expect(sanitizeAdminLeadsReturnTo(
      "/admin/leads?tab=portal&portalPage=4&contactPage=8",
    )).toBe("/admin/leads?tab=portal&portalPage=4");
  });

  it("rejects external, near-match, malformed, and oversized return destinations", () => {
    expect(sanitizeAdminLeadsReturnTo("https://evil.example/admin/leads", "/admin/leads?tab=new")).toBe(
      "/admin/leads?tab=new",
    );
    expect(sanitizeAdminLeadsReturnTo("//evil.example/admin/leads")).toBe("/admin/leads");
    expect(sanitizeAdminLeadsReturnTo("/admin/leads/delete?tab=records")).toBe("/admin/leads");
    expect(sanitizeAdminLeadsReturnTo(`/admin/leads?tab=${"x".repeat(2050)}`)).toBe("/admin/leads");
  });

  it("adds one fresh feedback state and a bounded lead-row anchor", () => {
    expect(buildAdminLeadsFeedbackRedirect(
      "/admin/leads?tab=records&status=archived&error=stale",
      { updated: "1" },
      "chat-11111111-1111-4111-8111-111111111111",
    )).toBe(
      "/admin/leads?tab=records&status=archived&updated=1#chat-11111111-1111-4111-8111-111111111111",
    );

    expect(buildAdminLeadsFeedbackRedirect("/admin/leads?tab=new", { error: "status-update-failed" }, "bad"))
      .toBe("/admin/leads?tab=new&error=status-update-failed");
  });
});
