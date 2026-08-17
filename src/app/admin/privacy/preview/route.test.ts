import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  audit: vi.fn(),
  preview: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ getAal2AdminAuthDecision: mocks.auth }));
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/admin/privacy", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin/privacy")>();
  return {
    ...actual,
    previewContactSubjectData: mocks.preview,
    privacySubjectAuditTarget: () => "email-hmac:subject",
  };
});

import { POST } from "./route";

function request(email = "Subject@Example.com") {
  return new Request("https://www.aixco.global/admin/privacy/preview", {
    method: "POST",
    headers: {
      origin: "https://www.aixco.global",
      "content-type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
}

describe("privacy preview route", () => {
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
    mocks.preview.mockResolvedValue({
      subject: "subject@example.com",
      contactSubmissions: 1,
      chatTranscripts: 0,
      emailDeliveries: 1,
      emailEvents: 1,
      abuseAttempts: 0,
      total: 3,
    });
  });

  it("returns an exact no-store preview after the required audit", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual(expect.objectContaining({
      subject: "subject@example.com",
      total: 3,
      previewToken: expect.stringMatching(/^v1\.\d{13}\.\d{13}\.[a-f0-9]{64}$/),
    }));
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      action: "privacy.subject.preview.requested",
      target: "email-hmac:subject",
    }), { required: true });
    expect(mocks.preview).toHaveBeenCalledWith("subject@example.com");
  });

  it("fails closed before reading data when auth or the audit gate fails", async () => {
    mocks.auth.mockResolvedValueOnce({ ok: false, reason: "mfa-required" });
    expect((await POST(request())).status).toBe(401);
    expect(mocks.preview).not.toHaveBeenCalled();

    mocks.auth.mockResolvedValueOnce({
      ok: true,
      principal: {
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        email: "admin@aixco.global",
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    });
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));
    expect((await POST(request())).status).toBe(503);
    expect(mocks.preview).not.toHaveBeenCalled();
  });

  it("rejects cross-origin and invalid requests without touching subject data", async () => {
    const crossOrigin = request();
    const crossOriginResponse = await POST(new Request(crossOrigin.url, {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "subject@example.com" }),
    }));
    expect(crossOriginResponse.status).toBe(403);

    expect((await POST(request("not-an-email"))).status).toBe(400);
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });
});
