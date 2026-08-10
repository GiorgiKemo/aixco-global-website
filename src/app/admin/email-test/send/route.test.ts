import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  audit: vi.fn(),
  send: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ getAal2AdminAuthDecision: mocks.auth }));
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/backend/lead-notification-email", () => ({
  sendLeadNotificationTestEmail: mocks.send,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true }),
  getRateLimitClientId: () => "test-client",
}));

import { POST } from "./route";

function request() {
  const body = new FormData();
  body.set("replyTo", "recipient@example.com");
  body.set("message", "This is a production email delivery test.");
  return new Request("https://www.aixco.global/admin/email-test/send", {
    method: "POST",
    headers: { origin: "https://www.aixco.global" },
    body,
  });
}

describe("admin test-email audit gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: {
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        email: "admin@aixco.global",
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    });
  });

  it("does not send without a verified AAL2 admin session", async () => {
    mocks.auth.mockResolvedValue({ ok: false, reason: "mfa-required" });
    const response = await POST(request());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://www.aixco.global/admin/login");
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it("does not send when the required pre-action audit cannot persist", async () => {
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));
    const response = await POST(request());

    expect(response.headers.get("location")).toContain("error=send");
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledTimes(1);
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      action: "email.delivery.test.requested",
      details: { hasReplyTo: true },
    }), { required: true });
  });
});
