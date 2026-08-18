import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  config: vi.fn(),
  status: vi.fn(),
  resend: vi.fn(),
  audit: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  getAal2AdminAuthDecision: mocks.auth,
  getAdminAuthConfig: mocks.config,
}));
vi.mock("@/lib/admin/identity-migration", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin/identity-migration")>();
  return {
    ...actual,
    getAdminIdentityMigrationStatus: mocks.status,
  };
});
vi.mock("@/lib/admin/identity-invite-email", () => ({
  resendAdminIdentityInvite: mocks.resend,
}));
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/admin/privacy", () => ({ privacySubjectAuditTarget: () => "email-hash" }));

import { POST } from "./route";

function request(email = "pending@example.com", origin = "https://www.aixco.global") {
  const body = new FormData();
  body.set("email", email);
  return new Request("https://www.aixco.global/admin/identity-migration/resend", {
    method: "POST",
    headers: { origin },
    body,
  });
}

describe("admin identity invitation resend route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: { id: "admin-1", email: "admin@example.com", authentication: "supabase-mfa", aal: "aal2" },
    });
    mocks.config.mockReturnValue({ role: "admin" });
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
    mocks.resend.mockResolvedValue({ email: "pending@example.com", providerMessageId: "msg-1" });
  });

  it("rotates and sends a fresh link for a pending administrator", async () => {
    const response = await POST(request());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("resent=1");
    expect(mocks.resend).toHaveBeenCalledWith("pending@example.com", {
      expectedUserId: "pending-admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
    });
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "admin.identity.invite.resend.requested",
    }), { required: true });
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      action: "admin.identity.invite.resend",
      outcome: "success",
    }));
  });

  it("does not resend after the administrator has signed in", async () => {
    mocks.status.mockResolvedValue({
      admins: [{
        id: "pending-admin",
        email: "pending@example.com",
        invitedAt: "2026-08-17T10:00:00.000Z",
        lastSignInAt: "2026-08-18T10:00:00.000Z",
        verifiedTotpFactors: 1,
      }],
      safeToDisableLegacyAccess: true,
      sourceStatus: "available",
      sourceIssues: [],
    });

    const response = await POST(request());

    expect(response.headers.get("location")).toContain("error=invite-not-pending");
    expect(mocks.resend).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it("requires a named MFA session", async () => {
    mocks.auth.mockResolvedValue({ ok: false, reason: "mfa-required" });

    const response = await POST(request());

    expect(response.headers.get("location")).toContain("/admin/login");
    expect(mocks.resend).not.toHaveBeenCalled();
  });

  it("fails closed when the source is unavailable", async () => {
    mocks.status.mockResolvedValue({
      admins: [],
      safeToDisableLegacyAccess: false,
      sourceStatus: "unavailable",
      sourceIssues: ["user-list"],
    });

    const response = await POST(request());

    expect(response.headers.get("location")).toContain("error=source-unavailable");
    expect(mocks.resend).not.toHaveBeenCalled();
  });

  it("reports provider or redirect configuration failures without deleting the account", async () => {
    mocks.resend.mockRejectedValue(new Error("Supabase Auth redirect URL is not configured"));

    const response = await POST(request());

    expect(response.headers.get("location")).toContain("error=resend-failed");
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      action: "admin.identity.invite.resend",
      outcome: "failure",
    }));
  });

  it("rejects cross-origin submissions", async () => {
    const response = await POST(request("pending@example.com", "https://evil.example"));

    expect(response.status).toBe(403);
    expect(mocks.resend).not.toHaveBeenCalled();
  });
});
