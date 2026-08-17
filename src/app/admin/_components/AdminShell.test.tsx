import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShell, adminNavigationItems, getActiveAdminNavigationItem } from "./AdminShell";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/admin",
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
  useSearchParams: () => navigationMocks.searchParams,
}));

beforeEach(() => {
  navigationMocks.pathname = "/admin";
  navigationMocks.searchParams = new URLSearchParams();
});

describe("AdminShell navigation", () => {
  it("maps every focused admin surface to one active navigation item", () => {
    expect(getActiveAdminNavigationItem("/admin", null)).toBe("operations");
    expect(getActiveAdminNavigationItem("/admin/leads", null)).toBe("leads");
    expect(getActiveAdminNavigationItem("/admin/analytics", "overview")).toBe("analytics");
    expect(getActiveAdminNavigationItem("/admin/analytics", "sessions")).toBe("sessions");
    expect(getActiveAdminNavigationItem("/admin/analytics", "reliability")).toBe("security");
    expect(getActiveAdminNavigationItem("/admin/email-test", null)).toBe("email");
    expect(getActiveAdminNavigationItem("/admin/privacy", null)).toBe("privacy");
    expect(getActiveAdminNavigationItem("/admin/identity-migration", null)).toBe("privacy");
  });

  it("exposes the complete production navigation with working route targets", () => {
    expect(adminNavigationItems.map((item) => item.label)).toEqual([
      "Operations",
      "Leads",
      "Website analytics",
      "Visitor sessions",
      "Errors & security",
      "Email delivery",
      "Privacy & admins",
    ]);
    expect(adminNavigationItems.every((item) => item.href.startsWith("/admin"))).toBe(true);
  });

  it("marks the current desktop rail item and renders the authenticated profile", () => {
    navigationMocks.pathname = "/admin/analytics";
    navigationMocks.searchParams = new URLSearchParams("focus=sessions");

    render(
      <AdminShell adminName="AIXCO Keeper" adminEmail="admin@aixco.global">
        <div>Focused workspace</div>
      </AdminShell>,
    );

    expect(screen.getByText("Focused workspace")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to admin content" })).toHaveAttribute(
      "href",
      "#admin-main-content",
    );
    expect(document.getElementById("admin-main-content")).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("link", { name: "Visitor sessions" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText("Signed-in administrator")).toHaveTextContent("AIXCO Keeper");
    expect(screen.getByLabelText("Signed-in administrator")).toHaveTextContent("admin@aixco.global");
  });

  it("opens a labeled mobile drawer, supports Escape, and retains sign-out", async () => {
    render(
      <AdminShell adminName="AIXCO Keeper" adminEmail="admin@aixco.global">
        <div>Workspace</div>
      </AdminShell>,
    );

    const menuButton = screen.getByRole("button", { name: "Open admin navigation" });
    const background = document.querySelector(".admin-shell__background");
    expect(background).not.toHaveAttribute("inert");
    expect(background).not.toHaveAttribute("aria-hidden");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(menuButton);

    const drawer = screen.getByRole("dialog", { name: "Admin navigation" });
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(menuButton).toHaveAttribute("aria-label", "Close admin navigation");
    expect(background).toHaveAttribute("inert");
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("link", { name: "Skip to admin content" })).not.toBeInTheDocument();
    expect(within(drawer).getByRole("navigation", { name: "Mobile admin navigation" })).toBeInTheDocument();
    const firstDrawerLink = within(drawer).getByRole("link", { name: /Operations/ });
    expect(firstDrawerLink).toHaveFocus();
    expect(within(drawer).getByRole("link", { name: /Website analytics/ })).toHaveAttribute(
      "href",
      "/admin/analytics?focus=overview",
    );
    const signOut = within(drawer).getByRole("button", { name: "Sign out" });
    expect(signOut.closest("form")).toHaveAttribute("action", "/admin/logout");
    expect(signOut.closest("form")).toHaveAttribute("method", "post");

    fireEvent.keyDown(drawer, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Admin navigation" })).not.toBeInTheDocument());
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveAccessibleName("Open admin navigation");
    expect(background).not.toHaveAttribute("inert");
    expect(background).not.toHaveAttribute("aria-hidden");
    await waitFor(() => expect(menuButton).toHaveFocus());
  });

  it("closes the mobile drawer when a destination is selected", async () => {
    render(<AdminShell><div>Workspace</div></AdminShell>);
    fireEvent.click(screen.getByRole("button", { name: "Open admin navigation" }));
    const drawer = screen.getByRole("dialog", { name: "Admin navigation" });
    const leadsLink = within(drawer).getByRole("link", { name: /Leads/ });
    leadsLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(leadsLink);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Admin navigation" })).not.toBeInTheDocument());
  });
});
