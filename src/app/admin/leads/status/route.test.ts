import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  audit: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ getAdminAuthDecision: mocks.auth }));
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

describe("admin lead status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: { id: "admin-1", email: "admin@example.com", authentication: "supabase-mfa", aal: "aal2" },
    });
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
  });
});
