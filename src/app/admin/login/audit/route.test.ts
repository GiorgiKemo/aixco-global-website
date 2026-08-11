import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

const mocks = vi.hoisted(() => ({
  audit: vi.fn(),
  auth: vi.fn(),
  distributedGuard: vi.fn(),
  serverSignOut: vi.fn(),
}));

vi.mock("@/lib/admin/audit", () => ({ auditAdminLoginAttempt: mocks.audit }));
vi.mock("@/lib/admin/auth", () => ({ getAdminAuthDecision: mocks.auth }));
vi.mock("@/lib/backend/lead-capture-abuse", () => ({
  checkDistributedLeadCaptureLimit: mocks.distributedGuard,
}));
vi.mock("@/lib/supabase/auth-server", () => ({
  getSupabaseAuthServerClient: () => Promise.resolve({ auth: { signOut: mocks.serverSignOut } }),
}));

import { POST } from "./route";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://www.aixco.global/admin/login/audit", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://www.aixco.global",
      "x-forwarded-for": "203.0.113.77",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("admin login audit route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    mocks.audit.mockReset().mockResolvedValue(true);
    mocks.distributedGuard.mockReset().mockResolvedValue({ allowed: true });
    mocks.serverSignOut.mockReset().mockResolvedValue({ error: null });
    mocks.auth.mockReset().mockResolvedValue({
      ok: true,
      principal: {
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        email: "admin@aixco.global",
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    });
  });

  it("records a failed credential attempt without requiring an authenticated session", async () => {
    const response = await POST(request({
      email: "admin@aixco.global",
      outcome: "failure",
      phase: "credentials",
      reason: "invalid_credentials",
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true, stored: true });
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      email: "admin@aixco.global",
      outcome: "failure",
      phase: "credentials",
      reason: "invalid_credentials",
      headers: expect.any(Headers),
    }));
  });

  it("requires real admin authentication before accepting client-reported MFA success", async () => {
    mocks.auth.mockResolvedValueOnce({ ok: false, reason: "not-authenticated" });
    const denied = await POST(request({
      email: "admin@aixco.global",
      outcome: "success",
      phase: "mfa",
    }));
    expect(denied.status).toBe(401);
    expect(mocks.audit).not.toHaveBeenCalled();

    const accepted = await POST(request({
      email: "admin@aixco.global",
      outcome: "success",
      phase: "session",
    }, { "x-forwarded-for": "203.0.113.78" }));
    expect(accepted.status).toBe(202);
    expect(mocks.auth).toHaveBeenCalledTimes(2);
    expect(mocks.audit).toHaveBeenCalledTimes(1);
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      principal: expect.objectContaining({
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        authentication: "supabase-mfa",
        aal: "aal2",
      }),
    }));
    expect(mocks.distributedGuard).not.toHaveBeenCalled();
  });

  it("authenticates a verified password-only success before anonymous abuse controls", async () => {
    mocks.auth.mockResolvedValueOnce({
      ok: true,
      principal: {
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        email: "admin@aixco.global",
        authentication: "supabase-password",
        aal: "aal1",
      },
    });
    mocks.distributedGuard.mockResolvedValue({ allowed: false });

    const response = await POST(request({
      email: "admin@aixco.global",
      outcome: "success",
      phase: "session",
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true, stored: true });
    expect(mocks.auth).toHaveBeenCalledOnce();
    expect(mocks.distributedGuard).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      principal: expect.objectContaining({
        authentication: "supabase-password",
        aal: "aal1",
      }),
    }));
    expect(mocks.serverSignOut).not.toHaveBeenCalled();
  });

  it("does not let exhausted anonymous audit buckets block a verified success", async () => {
    const failure = { email: null, outcome: "failure" as const, phase: "credentials" as const };
    for (let index = 0; index < 20; index += 1) {
      expect((await POST(request(failure))).status).toBe(202);
    }

    const response = await POST(request({
      email: "admin@aixco.global",
      outcome: "success",
      phase: "session",
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true, stored: true });
    expect(mocks.auth).toHaveBeenCalledOnce();
    expect(mocks.audit).toHaveBeenCalledTimes(21);
  });

  it("fails closed for a verified login when its durable audit row is not stored", async () => {
    mocks.audit.mockResolvedValueOnce(false);

    const response = await POST(request({
      email: "admin@aixco.global",
      outcome: "success",
      phase: "mfa",
    }));

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("3");
    await expect(response.json()).resolves.toEqual({
      ok: false,
      stored: false,
      error: "audit_unavailable",
    });
    expect(mocks.serverSignOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("reports best-effort failure signals as unstored and unverified when persistence is unavailable", async () => {
    mocks.audit.mockResolvedValueOnce(false);

    const response = await POST(request({
      email: "admin@aixco.global",
      outcome: "failure",
      phase: "credentials",
      reason: "invalid_credentials",
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true, stored: false });
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      outcome: "failure",
      phase: "credentials",
    }));
    expect(mocks.audit.mock.calls[0]?.[0]).not.toHaveProperty("principal");
    expect(mocks.serverSignOut).not.toHaveBeenCalled();
  });

  it("returns a retryable failure instead of claiming storage when the audit helper rejects", async () => {
    mocks.audit.mockRejectedValueOnce(new Error("database unavailable"));

    const response = await POST(request({
      email: "admin@aixco.global",
      outcome: "success",
      phase: "session",
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      stored: false,
      error: "audit_unavailable",
    });
    expect(mocks.serverSignOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it.each(["credentials", "authorization", "mfa", "session"] as const)(
    "rejects unauthenticated client-reported success for %s",
    async (phase) => {
      mocks.auth.mockResolvedValueOnce({ ok: false, reason: "not-authenticated" });
      const response = await POST(request({
        email: "admin@aixco.global",
        outcome: "success",
        phase,
      }, { "x-forwarded-for": `203.0.113.${80 + phase.length}` }));
      expect(response.status).toBe(phase === "credentials" || phase === "authorization" ? 400 : 401);
      expect(mocks.audit).not.toHaveBeenCalled();
    },
  );

  it("rejects cross-origin, non-JSON, and unknown-field payloads", async () => {
    const crossOrigin = await POST(request({
      email: null,
      outcome: "failure",
      phase: "credentials",
    }, { origin: "https://attacker.example" }));
    expect(crossOrigin.status).toBe(403);

    const nonJson = await POST(request({}, {
      "content-type": "text/plain",
      "x-forwarded-for": "203.0.113.79",
    }));
    expect(nonJson.status).toBe(415);

    const unknownField = await POST(request({
      email: null,
      outcome: "failure",
      phase: "credentials",
      password: "must-never-be-accepted",
    }, { "x-forwarded-for": "203.0.113.80" }));
    expect(unknownField.status).toBe(400);
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it("bounds anonymous login-audit floods", async () => {
    const payload = { email: null, outcome: "failure", phase: "credentials" };
    for (let index = 0; index < 20; index += 1) {
      expect((await POST(request(payload))).status).toBe(202);
    }
    const blocked = await POST(request(payload));

    expect(blocked.status).toBe(202);
    await expect(blocked.json()).resolves.toEqual({ ok: true, stored: false });
    expect(mocks.audit).toHaveBeenCalledTimes(20);
    expect(mocks.distributedGuard).toHaveBeenCalledTimes(20);
  });
});
