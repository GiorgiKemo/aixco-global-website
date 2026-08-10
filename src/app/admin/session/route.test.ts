import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  audit: vi.fn(),
  checkDistributed: vi.fn(),
  checkLocal: vi.fn(),
  cookieValue: vi.fn(),
  getAuthConfig: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  ADMIN_SESSION_COOKIE_NAME: "aixco_admin_session",
  ADMIN_SESSION_COOKIE_PATH: "/admin",
  createAdminSessionCookieValue: mocks.cookieValue,
  getAdminAuthConfig: mocks.getAuthConfig,
}));
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/admin/login-rate-limit", () => ({
  ADMIN_LOGIN_RATE_LIMIT: { limit: 8, windowSeconds: 900 },
  checkDistributedAdminLoginRateLimit: mocks.checkDistributed,
}));
vi.mock("@/lib/admin/session-token", () => ({
  DEFAULT_ADMIN_SESSION_TTL_SECONDS: 28_800,
  verifyAdminPassword: mocks.verifyPassword,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: mocks.checkLocal,
  getRateLimitClientId: () => "test-client",
}));

import { POST } from "./route";

function request(password = "correct-password") {
  const body = new FormData();
  body.set("password", password);
  return new Request("https://www.aixco.global/admin/session", {
    method: "POST",
    headers: {
      origin: "https://www.aixco.global",
      "x-vercel-forwarded-for": "203.0.113.50",
    },
    body,
  });
}

describe("legacy admin session distributed rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthConfig.mockReturnValue({
      configured: true,
      legacy: {
        enabled: true,
        configured: true,
        password: "correct-password",
        sessionSecret: "0123456789abcdef0123456789abcdef",
      },
    });
    mocks.checkLocal.mockReturnValue({ allowed: true });
    mocks.checkDistributed.mockResolvedValue({ allowed: true });
    mocks.verifyPassword.mockReturnValue(true);
    mocks.cookieValue.mockReturnValue("signed-cookie");
    mocks.audit.mockResolvedValue(undefined);
  });

  it("runs the distributed guard after the local guard and before credential checks", async () => {
    const order: string[] = [];
    mocks.checkLocal.mockImplementation(() => {
      order.push("local");
      return { allowed: true };
    });
    mocks.checkDistributed.mockImplementation(async () => {
      order.push("distributed");
      return { allowed: true };
    });
    mocks.verifyPassword.mockImplementation(() => {
      order.push("password");
      return true;
    });

    const response = await POST(request());

    expect(order).toEqual(["local", "distributed", "password"]);
    expect(mocks.checkLocal).toHaveBeenCalledWith({
      key: "admin-login:test-client",
      limit: 8,
      windowMs: 900_000,
    });
    expect(mocks.checkDistributed).toHaveBeenCalledWith(expect.any(Headers));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://www.aixco.global/admin/identity-migration");
    expect(response.headers.get("set-cookie")).toContain("aixco_admin_session=signed-cookie");
  });

  it("does not call the database when the local limiter already blocks", async () => {
    mocks.checkLocal.mockReturnValueOnce({ allowed: false });

    const response = await POST(request());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("error=rate-limited");
    expect(mocks.checkDistributed).not.toHaveBeenCalled();
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
  });

  it("returns the rate-limited login state when the distributed limit is exceeded", async () => {
    mocks.checkDistributed.mockResolvedValueOnce({
      allowed: false,
      retryAfterSeconds: 321,
      reason: "rate_limit",
    });

    const response = await POST(request());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("error=rate-limited");
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
    expect(mocks.cookieValue).not.toHaveBeenCalled();
  });

  it.each(["configuration", "database"])(
    "fails closed with a bounded service response on %s errors",
    async (reason) => {
      mocks.checkDistributed.mockResolvedValueOnce({
        allowed: false,
        retryAfterSeconds: 60,
        reason,
      });

      const response = await POST(request());

      expect(response.status).toBe(503);
      expect(response.headers.get("retry-after")).toBe("60");
      await expect(response.text()).resolves.toBe("Admin sign-in is temporarily unavailable.");
      expect(mocks.verifyPassword).not.toHaveBeenCalled();
      expect(mocks.cookieValue).not.toHaveBeenCalled();
    },
  );
});
