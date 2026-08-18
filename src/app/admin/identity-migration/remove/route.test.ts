import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  config: vi.fn(),
  audit: vi.fn(),
  remove: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ getAal2AdminAuthDecision: mocks.auth, getAdminAuthConfig: mocks.config }));
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/admin/identity-migration", () => ({ removeAdminIdentity: mocks.remove }));
vi.mock("@/lib/admin/privacy", () => ({ privacySubjectAuditTarget: () => "email-hash" }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdminClient: async () => ({ auth: { admin: { getUserById: mocks.getUserById } } }) }));

import { POST } from "./route";

function request(fields: Record<string, string>, origin = "https://www.aixco.global") {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return new Request("https://www.aixco.global/admin/identity-migration/remove", { method: "POST", headers: { origin }, body });
}

describe("admin identity removal route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ ok: true, principal: { id: "5dca2a80-7ddb-4e12-8f39-01fb72c0ac50", email: "owner@example.com", authentication: "supabase-password", aal: "aal1" } });
    mocks.config.mockReturnValue({ role: "admin" });
    mocks.getUserById.mockResolvedValue({ data: { user: { id: "74f0c177-cb85-4d38-b151-e8f51c36a329", email: "remove@example.com" } }, error: null });
    mocks.audit.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue({ id: "74f0c177-cb85-4d38-b151-e8f51c36a329", email: "remove@example.com", remainingAdminCount: 1 });
  });

  it("requires the exact email and REMOVE confirmation", async () => {
    const response = await POST(request({ targetUserId: "74f0c177-cb85-4d38-b151-e8f51c36a329", confirmEmail: "wrong@example.com", confirmText: "REMOVE" }));
    expect(response.headers.get("location")).toContain("error=remove-confirmation");
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it("removes the confirmed target and records pre/post audits", async () => {
    const response = await POST(request({ targetUserId: "74f0c177-cb85-4d38-b151-e8f51c36a329", confirmEmail: "REMOVE@EXAMPLE.COM", confirmText: "remove" }));
    expect(response.headers.get("location")).toContain("removed=1");
    expect(mocks.remove).toHaveBeenCalledWith("74f0c177-cb85-4d38-b151-e8f51c36a329", "5dca2a80-7ddb-4e12-8f39-01fb72c0ac50", "admin");
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({ action: "admin.identity.remove.requested" }), { required: true });
    expect(mocks.audit).toHaveBeenNthCalledWith(2, expect.objectContaining({ action: "admin.identity.remove", outcome: "success" }));
  });

  it("rejects cross-origin submissions before reading the form", async () => {
    const response = await POST(request({ targetUserId: "74f0c177-cb85-4d38-b151-e8f51c36a329", confirmEmail: "remove@example.com", confirmText: "REMOVE" }, "https://evil.example"));
    expect(response.status).toBe(403);
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});
