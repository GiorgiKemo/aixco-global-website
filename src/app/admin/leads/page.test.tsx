import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchDashboard: vi.fn(),
  requireAdmin: vi.fn(),
}));

vi.mock("@/app/admin/_components", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/lib/admin/auth", () => ({ requireAal2AdminSession: mocks.requireAdmin }));
vi.mock("@/lib/admin/leads", () => ({
  fetchAdminLeadDashboard: mocks.fetchDashboard,
  parseLeadStatus: (value: unknown) =>
    ["new", "contacted", "qualified", "archived"].includes(String(value)) ? value : undefined,
}));

import AdminLeadsPage, { formatChatMessageCount } from "./page";

const emptyPage = { page: 1, pageSize: 15, total: 0, totalPages: 1, start: 0, end: 0 };

describe("admin leads page feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-1", email: "admin@example.com" });
    mocks.fetchDashboard.mockResolvedValue({
      ok: true,
      data: {
        contacts: [],
        chats: [],
        portalEvents: [],
        pagination: { contacts: emptyPage, chats: emptyPage, portalEvents: emptyPage },
        window: { mode: "paged", perResourceLimit: null },
        stats: {
          newContacts: 0,
          newChats: 0,
          qualifiedContacts: 0,
          qualifiedChats: 0,
          totalContacts: 0,
          totalChats: 0,
          totalPortalEvents: 0,
        },
      },
    });
  });

  it("shows status and requeue success feedback on every lead tab after PRG", async () => {
    const statusView = render(await AdminLeadsPage({
      searchParams: Promise.resolve({ tab: "new", updated: "1" }),
    }));
    expect(screen.getByRole("status")).toHaveTextContent("Lead status updated.");

    statusView.unmount();
    render(await AdminLeadsPage({
      searchParams: Promise.resolve({ tab: "records", requeued: "2" }),
    }));
    expect(screen.getByRole("status")).toHaveTextContent("2 failed email delivery attempt(s) requeued.");
  });

  it("shows a visible error alert after a failed form redirect", async () => {
    render(await AdminLeadsPage({
      searchParams: Promise.resolve({ tab: "records", error: "status-update-failed" }),
    }));

    expect(screen.getByRole("alert")).toHaveTextContent("Could not update lead status.");
  });

  it("uses the singular message label for a one-message chat", () => {
    expect(formatChatMessageCount(1)).toBe("1 message");
    expect(formatChatMessageCount(0)).toBe("0 messages");
    expect(formatChatMessageCount(2)).toBe("2 messages");
  });

  it("keeps every lead destination visible and 44px tall on a direct mobile tab", async () => {
    render(await AdminLeadsPage({
      searchParams: Promise.resolve({ tab: "portal" }),
    }));

    const navigation = screen.getByRole("navigation", { name: "Lead workspace views" });
    expect(navigation).toHaveClass("grid", "grid-cols-2");
    const links = within(navigation).getAllByRole("link");
    expect(links).toHaveLength(5);
    links.forEach((link) => expect(link).toHaveClass("min-h-11"));
    expect(within(navigation).getByRole("link", { name: /^Portal/ })).toHaveAttribute("aria-current", "page");
  });

  it("names overview portal links with their destination and new-tab behavior", async () => {
    mocks.fetchDashboard.mockResolvedValue({
      ok: true,
      data: {
        contacts: [],
        chats: [],
        portalEvents: [{
          id: "33333333-3333-4333-8333-333333333333",
          created_at: "2026-07-16T09:00:00.000Z",
          mode: "login",
          role_title: "Customer portal",
          action: "Customer Login",
          portal_url: "https://customer.aixco.global/",
          locale: "en",
          page_path: "/",
        }],
        pagination: {
          contacts: emptyPage,
          chats: emptyPage,
          portalEvents: { ...emptyPage, total: 1, start: 1, end: 1 },
        },
        window: { mode: "paged", perResourceLimit: null },
        stats: {
          newContacts: 0,
          newChats: 0,
          qualifiedContacts: 0,
          qualifiedChats: 0,
          totalContacts: 0,
          totalChats: 0,
          totalPortalEvents: 1,
        },
      },
    });

    render(await AdminLeadsPage({ searchParams: Promise.resolve({}) }));

    const portalLink = screen.getByRole("link", {
      name: "Open Customer Login for Customer portal in a new tab",
    });
    expect(portalLink).toHaveAttribute("href", "https://customer.aixco.global/");
    expect(portalLink).toHaveAttribute("target", "_blank");
  });
});
