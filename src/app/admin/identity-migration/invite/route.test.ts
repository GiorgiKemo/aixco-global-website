import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  config: vi.fn(),
  status: vi.fn(),
  claimBootstrap: vi.fn(),
  completeBootstrap: vi.fn(),
  releaseBootstrap: vi.fn(),
  invite: vi.fn(),
  audit: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  getAdminAuthDecision: mocks.auth,
  getAdminAuthConfig: mocks.config,
}));
vi.mock("@/lib/admin/identity-migration", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin/identity-migration")>();
  return {
    ...actual,
    claimAdminIdentityBootstrap: mocks.claimBootstrap,
    completeAdminIdentityBootstrap: mocks.completeBootstrap,
    getAdminIdentityMigrationStatus: mocks.status,
    inviteAdminIdentity: mocks.invite,
    releaseAdminIdentityBootstrap: mocks.releaseBootstrap,
  };
});
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/admin/privacy", () => ({ privacySubjectAuditTarget: () => "email-hash" }));

import { POST } from "./route";

function request(origin = "https://www.aixco.global") {
  const body = new FormData();
  body.set("email", "named.admin@example.com");
  return new Request("https://www.aixco.global/admin/identity-migration/invite", {
    method: "POST",
    headers: { origin },
    body,
  });
}

function localDevelopmentRequest() {
  const body = new FormData();
  body.set("email", "named.admin@example.com");
  return new Request("http://localhost:3000/admin/identity-migration/invite", {
    method: "POST",
    headers: { origin: "http://localhost:3000" },
    body,
  });
}

describe("admin identity invitation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ ok: true, principal: { id: "admin-1" } });
    mocks.config.mockReturnValue({ role: "admin" });
    mocks.status.mockResolvedValue({
      admins: [],
      safeToDisableLegacyAccess: false,
      sourceStatus: "available",
      sourceIssues: [],
    });
    mocks.claimBootstrap.mockResolvedValue(true);
    mocks.completeBootstrap.mockResolvedValue(true);
    mocks.releaseBootstrap.mockResolvedValue(true);
    mocks.invite.mockResolvedValue({ id: "admin-2", email: "named.admin@example.com" });
  });

  it("uses the fragment-capable completion page for default Supabase invites", async () => {
    const response = await POST(request());
    expect(response.status).toBe(303);
    expect(mocks.invite).toHaveBeenCalledWith("named.admin@example.com", {
      role: "admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
    });
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "admin.identity.invite.requested",
    }), { required: true });
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ outcome: "success" }));
  });

  it("never sends a local development callback URL to an invite recipient", async () => {
    const response = await POST(localDevelopmentRequest());

    expect(response.status).toBe(303);
    expect(mocks.invite).toHaveBeenCalledWith("named.admin@example.com", {
      role: "admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
    });
  });

  it("does not send an invite when the required pre-action audit cannot persist", async () => {
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));
    const response = await POST(request());
    expect(response.headers.get("location")).toContain("error=invite-failed");
    expect(mocks.invite).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "admin.identity.invite.requested",
    }), { required: true });
  });

  it.each(["partial", "unavailable"] as const)(
    "blocks invitations when identity status is %s",
    async (sourceStatus) => {
      mocks.status.mockResolvedValue({
        admins: [],
        safeToDisableLegacyAccess: false,
        sourceStatus,
        sourceIssues: [sourceStatus === "partial" ? "mfa-factors" : "user-list"],
      });

      const response = await POST(request());

      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toContain("error=source-unavailable");
      expect(mocks.audit).not.toHaveBeenCalled();
      expect(mocks.invite).not.toHaveBeenCalled();
    },
  );

  it("closes shared-password invitations after the first named admin exists", async () => {
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: {
        id: "legacy-shared-password",
        email: null,
        authentication: "legacy-shared-password",
        aal: null,
      },
    });
    mocks.status.mockResolvedValue({
      admins: [{
        id: "admin-1",
        email: "existing@example.com",
        invitedAt: "2026-08-01T00:00:00.000Z",
        lastSignInAt: null,
        verifiedTotpFactors: 0,
      }],
      safeToDisableLegacyAccess: false,
      sourceStatus: "available",
      sourceIssues: [],
    });

    const response = await POST(request());

    expect(response.headers.get("location")).toContain("error=migration-invite-closed");
    expect(mocks.audit).not.toHaveBeenCalled();
    expect(mocks.claimBootstrap).not.toHaveBeenCalled();
    expect(mocks.invite).not.toHaveBeenCalled();
  });

  it("atomically allows only one parallel shared-password bootstrap invitation", async () => {
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: {
        id: "legacy-shared-password",
        email: null,
        authentication: "legacy-shared-password",
        aal: null,
      },
    });
    mocks.claimBootstrap
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const [first, second] = await Promise.all([POST(request()), POST(request())]);
    const locations = [first.headers.get("location"), second.headers.get("location")];

    expect(locations.filter((location) => location?.includes("invited=1"))).toHaveLength(1);
    expect(locations.filter((location) => location?.includes("migration-invite-closed"))).toHaveLength(1);
    expect(mocks.invite).toHaveBeenCalledTimes(1);
    expect(mocks.completeBootstrap).toHaveBeenCalledTimes(1);
  });

  it("releases an unused bootstrap claim when the required audit fails", async () => {
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: {
        id: "legacy-shared-password",
        email: null,
        authentication: "legacy-shared-password",
        aal: null,
      },
    });
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));

    const response = await POST(request());

    expect(response.headers.get("location")).toContain("error=invite-failed");
    expect(mocks.invite).not.toHaveBeenCalled();
    expect(mocks.releaseBootstrap).toHaveBeenCalledWith(expect.any(String));
  });

  it("rejects cross-origin invite submissions", async () => {
    expect((await POST(request("https://evil.example"))).status).toBe(403);
    expect(mocks.invite).not.toHaveBeenCalled();
  });
});
