import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  audit: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ getAal2AdminAuthDecision: mocks.auth }));
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(async () => ({
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({ maybeSingle: mocks.maybeSingle }),
        }),
      }),
    }),
  })),
}));

import { POST } from "./route";

function request() {
  return new Request("https://www.aixco.global/admin/leads/status", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      origin: "https://www.aixco.global",
    },
    body: JSON.stringify({
      resource: "contact",
      id: "11111111-1111-4111-8111-111111111111",
      status: "contacted",
    }),
  });
}

function formRequest({
  returnTo = "/admin/leads?tab=records&status=archived&contactPage=2&chatPage=3",
  status = "new",
}: {
  returnTo?: string;
  status?: string;
} = {}) {
  const body = new FormData();
  body.set("resource", "contact");
  body.set("id", "11111111-1111-4111-8111-111111111111");
  body.set("status", status);
  body.set("returnTo", returnTo);
  return new Request("https://www.aixco.global/admin/leads/status", {
    method: "POST",
    headers: { origin: "https://www.aixco.global" },
    body,
  });
}

describe("admin lead status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: { id: "admin-1", email: "admin@example.com", authentication: "supabase-mfa", aal: "aal2" },
    });
  });

  it("rejects the mutation without a verified AAL2 admin session", async () => {
    mocks.auth.mockResolvedValue({ ok: false, reason: "mfa-required" });
    const response = await POST(request());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "unauthorized" });
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it("returns 404 instead of falsely reporting success when the lead does not exist", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    const response = await POST(request());
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "lead-not-found" });
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ outcome: "failure" }));
  });

  it("returns success only after the database returns the updated row", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: "11111111-1111-4111-8111-111111111111" }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "lead.status.update.requested",
    }), { required: true });
  });

  it("uses PRG while preserving validated record filters and pages when reopening", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: "11111111-1111-4111-8111-111111111111" }, error: null });

    const response = await POST(formRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://www.aixco.global/admin/leads?tab=records&status=archived&contactPage=2&chatPage=3&updated=1#contact-11111111-1111-4111-8111-111111111111",
    );
  });

  it("rejects unsafe return destinations and keeps form errors in the safe PRG context", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: "11111111-1111-4111-8111-111111111111" }, error: null });

    const unsafeResponse = await POST(formRequest({ returnTo: "https://evil.example/admin/leads" }));
    expect(unsafeResponse.status).toBe(303);
    expect(unsafeResponse.headers.get("location")).toBe(
      "https://www.aixco.global/admin/leads?tab=new&updated=1#contact-11111111-1111-4111-8111-111111111111",
    );

    const invalidResponse = await POST(formRequest({ status: "deleted" }));
    expect(invalidResponse.status).toBe(303);
    expect(invalidResponse.headers.get("location")).toBe(
      "https://www.aixco.global/admin/leads?tab=records&status=archived&contactPage=2&chatPage=3&error=invalid-status-update",
    );
  });

  it("does not update the lead when the required pre-action audit cannot persist", async () => {
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));
    const response = await POST(request());
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "status-update-failed" });
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "lead.status.update.requested",
    }), { required: true });
  });
});
