import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminLeadDetails } from "./AdminLeadDetails";
import type { DashboardLead } from "./PipelineBoardTypes";

const singlePage = { page: 1, pageSize: 15, total: 1, totalPages: 1, start: 1, end: 1 };
const emptyPage = { page: 1, pageSize: 15, total: 0, totalPages: 1, start: 0, end: 0 };

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
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

describe("admin lead details", () => {
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
    expect(retry).toHaveClass("min-h-11");
    expect(screen.getByText("Showing 1-1 of 1")).toBeInTheDocument();
    expect(screen.getByText("Showing 0 of 0")).toBeInTheDocument();
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
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    const nextLink = screen.getByRole("link", { name: "Next" });
    expect(nextLink).toHaveAttribute("href", "/admin/leads?contactPage=2");
    expect(nextLink).toHaveClass("min-h-11");
  });
});
