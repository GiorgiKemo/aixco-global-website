import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), audit: vi.fn(), requeue: vi.fn() }));
vi.mock("@/lib/admin/auth", () => ({ getAal2AdminAuthDecision: mocks.auth }));
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/admin/leads", () => ({ requeueContactEmailDeliveries: mocks.requeue }));

import { POST } from "./route";

function request(origin = "https://www.aixco.global") {
  const body = new FormData();
  body.set("contactId", "11111111-1111-4111-8111-111111111111");
  return new Request("https://www.aixco.global/admin/leads/requeue-email", {
    method: "POST",
    headers: { origin },
    body,
  });
}

describe("failed email requeue route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: { id: "admin-1", email: "admin@example.com", authentication: "supabase-mfa", aal: "aal2" },
    });
  });

  it("requires a verified AAL2 admin and same-origin form", async () => {
    mocks.auth.mockResolvedValue({ ok: false, reason: "mfa-required" });
    expect((await POST(request())).status).toBe(303);

    mocks.auth.mockResolvedValue({ ok: true, principal: { id: "admin-1" } });
    expect((await POST(request("https://evil.example"))).status).toBe(403);
    expect(mocks.requeue).not.toHaveBeenCalled();
  });

  it("audits and redirects after requeueing only eligible failed deliveries", async () => {
    mocks.requeue.mockResolvedValue(1);
    const response = await POST(request());
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("requeued=1");
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "contact.email.requeue.requested",
    }), { required: true });
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ outcome: "success", details: { deliveries: 1 } }));
  });

  it("does not requeue deliveries when the required pre-action audit cannot persist", async () => {
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));
    const response = await POST(request());
    expect(response.headers.get("location")).toContain("error=email-requeue-failed");
    expect(mocks.requeue).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "contact.email.requeue.requested",
    }), { required: true });
  });

  it("does not report success when no failed delivery is eligible", async () => {
    mocks.requeue.mockResolvedValue(0);
    const response = await POST(request());
    expect(response.headers.get("location")).toContain("error=no-email-to-requeue");
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ outcome: "failure" }));
  });
});
