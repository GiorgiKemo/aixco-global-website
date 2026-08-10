import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  config: vi.fn(),
  invite: vi.fn(),
  audit: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  getAdminAuthDecision: mocks.auth,
  getAdminAuthConfig: mocks.config,
}));
vi.mock("@/lib/admin/identity-migration", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin/identity-migration")>();
  return { ...actual, inviteAdminIdentity: mocks.invite };
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

describe("admin identity invitation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ ok: true, principal: { id: "admin-1" } });
    mocks.config.mockReturnValue({ role: "admin" });
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

  it("does not send an invite when the required pre-action audit cannot persist", async () => {
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));
    const response = await POST(request());
    expect(response.headers.get("location")).toContain("error=invite-failed");
    expect(mocks.invite).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "admin.identity.invite.requested",
    }), { required: true });
  });

  it("rejects cross-origin invite submissions", async () => {
    expect((await POST(request("https://evil.example"))).status).toBe(403);
    expect(mocks.invite).not.toHaveBeenCalled();
  });
});
