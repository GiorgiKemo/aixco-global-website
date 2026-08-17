import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PortalEvent } from "@/lib/admin/leads";
import { AdminLeadDetails } from "./AdminLeadDetails";
import type { DashboardLead } from "./PipelineBoardTypes";

const singlePage = { page: 1, pageSize: 15, total: 1, totalPages: 1, start: 1, end: 1 };
const emptyPage = { page: 1, pageSize: 15, total: 0, totalPages: 1, start: 0, end: 0 };

const navigation = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.searchParams,
}));

const callLead: DashboardLead = {
  id: "11111111-1111-4111-8111-111111111111",
  reference: "AIX-2026-000018",
  resource: "contact",
  status: "new",
  createdAt: "2026-07-16T09:00:00.000Z",
  title: "Michael Thompson",
  contactLabel: "michael@example.com",
  contactHref: "mailto:michael@example.com",
  interest: "Schedule a Call",
  body: "Please call me about the current project.",
  pagePath: "/current-project",
  meta: "Contact form",
  requestType: "call",
  phone: "+995 555 123 456",
  preferredCallAt: "2026-07-17T10:30:00.000Z",
  preferredCallTimezone: "Asia/Tbilisi",
  emailDeliveryStatus: "delivery_issue",
  emailDeliveryUpdatedAt: "2026-07-16T09:01:00.000Z",
};

const portalEvent: PortalEvent = {
  id: "33333333-3333-4333-8333-333333333333",
  created_at: "2026-07-16T09:00:00.000Z",
  mode: "login",
  role_title: "Customer portal",
  action: "Customer Login",
  portal_url: "https://customer.aixco.global/",
  locale: "en",
  page_path: "/",
};

describe("admin lead details", () => {
  beforeEach(() => {
    navigation.searchParams = new URLSearchParams();
  });

  it("shows structured call and delivery state with an audited retry action", () => {
    render(
      <AdminLeadDetails
        contactLeads={[callLead]}
        chatLeads={[]}
        portalEvents={[]}
        contactPagination={singlePage}
        chatPagination={emptyPage}
        portalPagination={emptyPage}
        section="records"
      />,
    );

    expect(screen.getByText("call", { exact: true })).toBeInTheDocument();
    const phoneLink = screen.getByRole("link", { name: "+995 555 123 456" });
    expect(phoneLink).toHaveAttribute("href", "tel:+995 555 123 456");
    expect(phoneLink).toHaveClass("min-h-11");
    expect(screen.getByText(/Asia\/Tbilisi/)).toBeInTheDocument();
    expect(screen.getByText("delivery issue")).toBeInTheDocument();
    const retry = screen.getByRole("button", { name: "Retry failed email" });
    expect(retry.closest("form")).toHaveAttribute("action", "/admin/leads/requeue-email");
    expect(retry.closest("form")).toHaveFormValues({
      contactId: callLead.id,
      returnTo: "/admin/leads?tab=records",
    });
    expect(retry).toHaveClass("min-h-11");
    expect(screen.getByText("Showing 1-1 of 1")).toBeInTheDocument();
    expect(screen.getByText("Showing 0 of 0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Active" })).toHaveAttribute("aria-current", "page");
  });

  it("renders server-side page counts and resource-specific navigation", () => {
    render(
      <AdminLeadDetails
        contactLeads={[callLead]}
        chatLeads={[]}
        portalEvents={[]}
        contactPagination={{ page: 1, pageSize: 15, total: 16, totalPages: 2, start: 1, end: 15 }}
        chatPagination={emptyPage}
        portalPagination={emptyPage}
        section="records"
      />,
    );

    expect(screen.getByText("Showing 1-15 of 16")).toBeInTheDocument();
    const pagination = screen.getByRole("navigation", { name: "Contact form requests pagination" });
    expect(pagination).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact form requests, page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Contact form requests, page 2" })).toHaveAttribute("href", "/admin/leads?contactPage=2");
    const nextLink = screen.getByRole("link", { name: "Next contact form requests page" });
    expect(nextLink).toHaveAttribute("href", "/admin/leads?contactPage=2");
    expect(nextLink).toHaveClass("min-h-11");
  });

  it("reopens archived contacts and chats from server-rendered records after a reload", () => {
    const archivedContact: DashboardLead = { ...callLead, status: "archived" };
    const archivedChat: DashboardLead = {
      ...callLead,
      id: "22222222-2222-4222-8222-222222222222",
      resource: "chat",
      status: "archived",
      title: "Archived live chat",
      contactLabel: "4 messages",
      contactHref: undefined,
      meta: "Live chat transcript",
    };
    navigation.searchParams = new URLSearchParams(
      "tab=records&status=archived&contactPage=2&chatPage=3&updated=1",
    );

    render(
      <AdminLeadDetails
        contactLeads={[archivedContact]}
        chatLeads={[archivedChat]}
        portalEvents={[]}
        contactPagination={{ ...singlePage, page: 2, total: 16, totalPages: 2, start: 16, end: 16 }}
        chatPagination={{ ...singlePage, page: 3, total: 31, totalPages: 3, start: 31, end: 31 }}
        portalPagination={emptyPage}
        section="records"
      />,
    );

    const expectedReturnTo = "/admin/leads?tab=records&status=archived&contactPage=2&chatPage=3";
    for (const lead of [archivedContact, archivedChat]) {
      const row = document.getElementById(`${lead.resource}-${lead.id}`);
      expect(row).not.toBeNull();
      const reopen = within(row as HTMLElement).getByRole("button", { name: "Reopen lead" });
      expect(reopen.closest("form")).toHaveAttribute("action", "/admin/leads/status");
      expect(reopen.closest("form")).toHaveFormValues({
        resource: lead.resource,
        id: lead.id,
        status: "new",
        returnTo: expectedReturnTo,
      });
    }
    expect(screen.getByRole("link", { name: "Archived" })).toHaveAttribute("aria-current", "page");
  });

  it("names detailed portal links with their destination and new-tab behavior", () => {
    navigation.searchParams = new URLSearchParams("tab=portal");
    render(
      <AdminLeadDetails
        contactLeads={[]}
        chatLeads={[]}
        portalEvents={[portalEvent]}
        contactPagination={emptyPage}
        chatPagination={emptyPage}
        portalPagination={singlePage}
        section="portal"
      />,
    );

    const portalLink = screen.getByRole("link", {
      name: "Open Customer Login for Customer portal in a new tab",
    });
    expect(portalLink).toHaveAttribute("href", "https://customer.aixco.global/");
    expect(portalLink).toHaveAttribute("target", "_blank");
    expect(portalLink).toHaveAttribute("rel", "noreferrer");
  });
});
