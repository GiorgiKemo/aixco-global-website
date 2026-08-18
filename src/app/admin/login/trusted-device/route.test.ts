import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  currentMfa: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  getAdminAuthDecision: mocks.auth,
  getCurrentSupabaseMfaAdminAuthDecision: mocks.currentMfa,
}));

import { POST } from "./route";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://www.aixco.global/admin/login/trusted-device", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://www.aixco.global",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("trusted-device route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_TRUSTED_DEVICE_SECRET = "trusted-device-route-secret-01234567890123456789";
    mocks.auth.mockResolvedValue({ ok: false, reason: "mfa-required" });
    mocks.currentMfa.mockResolvedValue({
      ok: true,
      principal: {
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        email: "admin@aixco.global",
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    });
  });

  it("rejects cross-origin requests", async () => {
    const response = await POST(request({ action: "check" }, { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it("checks the signed device state without issuing a token", async () => {
    mocks.auth.mockResolvedValueOnce({
      ok: true,
      principal: {
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        email: "admin@aixco.global",
        authentication: "supabase-trusted-device",
        aal: "aal2",
      },
    });

    const response = await POST(request({ action: "check" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, trusted: true });
    expect(mocks.currentMfa).not.toHaveBeenCalled();
  });

  it("issues a secure thirty-day cookie only for a real AAL2 session", async () => {
    const response = await POST(request({ action: "enable" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, trusted: true });
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("aixco_admin_trusted_device=");
    expect(setCookie).toContain("Max-Age=2592000");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=lax");
    expect(setCookie).toContain("Path=/admin");
  });

  it("cannot renew a device from a trusted-device or password-only session", async () => {
    mocks.currentMfa.mockResolvedValueOnce({
      ok: true,
      principal: {
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        email: "admin@aixco.global",
        authentication: "supabase-trusted-device",
        aal: "aal2",
      },
    });
    const trustedResponse = await POST(request({ action: "enable" }));
    expect(trustedResponse.status).toBe(401);

    mocks.currentMfa.mockResolvedValueOnce({ ok: false, reason: "mfa-required" });
    const passwordResponse = await POST(request({ action: "enable" }));
    expect(passwordResponse.status).toBe(401);
  });

  it("clears a device cookie on explicit disable", async () => {
    const response = await POST(request({ action: "disable" }));
    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("aixco_admin_trusted_device=");
    expect(setCookie).toContain("Max-Age=0");
  });
});
