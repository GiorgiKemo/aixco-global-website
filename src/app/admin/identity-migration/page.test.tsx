import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  config: vi.fn(),
  status: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  requireAdminSession: mocks.auth,
  getAdminAuthConfig: mocks.config,
}));
vi.mock("@/lib/admin/identity-migration", () => ({
  getAdminIdentityMigrationStatus: mocks.status,
}));
vi.mock("@/app/admin/_components", () => ({
  AdminShell: ({ children, adminEmail }: { children: ReactNode; adminEmail?: string | null }) => (
    <div data-testid="admin-shell" data-admin-email={adminEmail ?? ""}>{children}</div>
  ),
  AdminPendingSubmitButton: ({
    idleLabel,
    disabled,
  }: {
    idleLabel: string;
    disabled?: boolean;
  }) => <button type="submit" disabled={disabled}>{idleLabel}</button>,
}));

import AdminIdentityMigrationPage from "./page";

const availableStatus = {
  admins: [{
    id: "admin-1",
    email: "admin@example.com",
    isOwner: true,
    invitedAt: "2026-08-01T00:00:00.000Z",
    lastSignInAt: "2026-08-17T10:00:00.000Z",
    verifiedTotpFactors: 1,
  }],
  safeToDisableLegacyAccess: true,
  sourceStatus: "available" as const,
  sourceIssues: [],
};

describe("admin identity migration page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      authentication: "supabase-mfa",
      aal: "aal2",
    });
    mocks.config.mockReturnValue({ role: "admin" });
    mocks.status.mockResolvedValue(availableStatus);
  });

  it("uses the full admin shell and enables invitations only for a complete source", async () => {
    render(await AdminIdentityMigrationPage({}));

    expect(screen.getByTestId("admin-shell")).toHaveAttribute("data-admin-email", "admin@example.com");
    expect(screen.getByText(/a named administrator exists.*mfa remains optional/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Administrator email")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Send secure invite" })).toBeEnabled();
    expect(screen.getByText("MFA enabled")).toBeInTheDocument();
    expect(screen.queryByText("Temporary migration access")).not.toBeInTheDocument();
  });

  it("renders a minimal sign-out shell and disables migration controls when the source is unavailable", async () => {
    mocks.auth.mockResolvedValue({
      id: "legacy-shared-password",
      email: null,
      authentication: "legacy-shared-password",
      aal: null,
    });
    mocks.status.mockResolvedValue({
      admins: [],
      safeToDisableLegacyAccess: false,
      sourceStatus: "unavailable",
      sourceIssues: ["user-list"],
    });

    render(await AdminIdentityMigrationPage({}));

    expect(screen.queryByTestId("admin-shell")).not.toBeInTheDocument();
    expect(screen.getByText("Temporary migration access")).toBeInTheDocument();
    const signOut = screen.getByRole("button", { name: "Sign out" });
    expect(signOut.closest("form")).toHaveAttribute("action", "/admin/logout");
    expect(signOut.closest("form")).toHaveAttribute("method", "post");
    expect(screen.getByRole("alert")).toHaveTextContent(/identity status is temporarily unavailable/i);
    expect(screen.getByText(/migration readiness could not be verified/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Administrator email")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send secure invite" })).toBeDisabled();
    expect(screen.getByText("Administrator identities could not be fully loaded.")).toBeInTheDocument();
  });

  it("prevents a legacy principal from inviting after a named admin exists", async () => {
    mocks.auth.mockResolvedValue({
      id: "legacy-shared-password",
      email: null,
      authentication: "legacy-shared-password",
      aal: null,
    });

    render(await AdminIdentityMigrationPage({}));

    expect(screen.getByRole("alert")).toHaveTextContent(/temporary invitation access is closed/i);
    expect(screen.getByLabelText("Administrator email")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send secure invite" })).toBeDisabled();
  });

  it("shows resend only for a pending invitation under a named MFA session", async () => {
    mocks.status.mockResolvedValue({
      admins: [{
        id: "pending-admin",
        email: "pending@example.com",
        invitedAt: "2026-08-17T10:00:00.000Z",
        lastSignInAt: null,
        verifiedTotpFactors: 0,
      }],
      safeToDisableLegacyAccess: false,
      sourceStatus: "available",
      sourceIssues: [],
    });

    render(await AdminIdentityMigrationPage({ searchParams: Promise.resolve({ resent: "1" }) }));

    expect(screen.getByText("Invitation pending")).toBeInTheDocument();
    const resend = screen.getByRole("button", { name: "Resend invitation" });
    expect(resend).toBeEnabled();
    expect(resend.closest("form")).toHaveAttribute("action", "/admin/identity-migration/resend");
    expect(screen.getByRole("status")).toHaveTextContent(/fresh invitation link was sent/i);
  });

  it("shows partial MFA results as unknown and keeps readiness fail-closed", async () => {
    mocks.status.mockResolvedValue({
      admins: [{
        id: "admin-1",
        email: "admin@example.com",
        invitedAt: null,
        lastSignInAt: null,
        verifiedTotpFactors: null,
      }],
      safeToDisableLegacyAccess: false,
      sourceStatus: "partial",
      sourceIssues: ["mfa-factors"],
    });

    render(await AdminIdentityMigrationPage({}));

    expect(screen.getByRole("alert")).toHaveTextContent(/identity status is incomplete/i);
    expect(screen.getByText("MFA status unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send secure invite" })).toBeDisabled();
  });

  it("shows a guarded removal form for another admin but never for the current admin", async () => {
    mocks.status.mockResolvedValue({
      ...availableStatus,
      admins: [
        ...availableStatus.admins,
        {
          id: "admin-2",
          email: "other@example.com",
          isOwner: false,
          invitedAt: "2026-08-01T00:00:00.000Z",
          lastSignInAt: "2026-08-17T10:00:00.000Z",
          verifiedTotpFactors: 0,
        },
      ],
    });

    render(await AdminIdentityMigrationPage({}));

    expect(screen.getByText("Owner · You")).toBeInTheDocument();
    const remove = screen.getAllByText("Remove administrator")[0];
    expect(remove).toBeInTheDocument();
    const form = remove.closest("details")?.querySelector("form");
    expect(form).toHaveAttribute("action", "/admin/identity-migration/remove");
    expect(form?.querySelector('input[name="targetUserId"]')).toHaveAttribute("value", "admin-2");
    expect(screen.getByLabelText("Retype email")).toBeRequired();
    expect(screen.getByLabelText("Type REMOVE to confirm")).toHaveAttribute("pattern", "REMOVE");
  });
});
