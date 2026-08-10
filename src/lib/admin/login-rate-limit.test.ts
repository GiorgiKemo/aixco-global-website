import { describe, expect, it, vi } from "vitest";
import {
  ADMIN_LOGIN_RATE_LIMIT,
  checkDistributedAdminLoginRateLimit,
  getTrustedAdminLoginClientIdentity,
} from "./login-rate-limit";

const productionEnv = {
  NODE_ENV: "production",
  VERCEL: "1",
  LEAD_CAPTURE_HASH_SECRET: "0123456789abcdef0123456789abcdef",
};

function createClient(result: {
  data: { allowed: boolean; retry_after_seconds: number }[] | null;
  error: { message: string; code?: string } | null;
}) {
  return {
    rpc: vi.fn(async (_fn: string, _args: Record<string, unknown>) => result),
  };
}

describe("distributed admin login rate limit", () => {
  it("sends only a HMAC identity to the service-role RPC", async () => {
    const client = createClient({
      data: [{ allowed: true, retry_after_seconds: 0 }],
      error: null,
    });
    const headers = new Headers({
      "x-vercel-forwarded-for": "203.0.113.44, 10.0.0.1",
      "x-forwarded-for": "198.51.100.123",
    });

    await expect(
      checkDistributedAdminLoginRateLimit(headers, { client, env: productionEnv }),
    ).resolves.toEqual({ allowed: true });

    expect(client.rpc).toHaveBeenCalledWith("consume_admin_login_rate_limit", {
      p_client_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_limit: ADMIN_LOGIN_RATE_LIMIT.limit,
      p_window_seconds: ADMIN_LOGIN_RATE_LIMIT.windowSeconds,
    });
    expect(JSON.stringify(client.rpc.mock.calls)).not.toContain("203.0.113.44");
    expect(JSON.stringify(client.rpc.mock.calls)).not.toContain("198.51.100.123");
  });

  it("uses the trusted edge identity instead of spoofable forwarded headers", async () => {
    const firstClient = createClient({
      data: [{ allowed: true, retry_after_seconds: 0 }],
      error: null,
    });
    const secondClient = createClient({
      data: [{ allowed: true, retry_after_seconds: 0 }],
      error: null,
    });

    await checkDistributedAdminLoginRateLimit(new Headers({
      "x-vercel-forwarded-for": "203.0.113.45",
      "x-forwarded-for": "198.51.100.1",
    }), { client: firstClient, env: productionEnv });
    await checkDistributedAdminLoginRateLimit(new Headers({
      "x-vercel-forwarded-for": "203.0.113.45",
      "x-forwarded-for": "198.51.100.250",
    }), { client: secondClient, env: productionEnv });

    const firstHash = firstClient.rpc.mock.calls[0]?.[1]?.p_client_hash;
    const secondHash = secondClient.rpc.mock.calls[0]?.[1]?.p_client_hash;
    expect(firstHash).toBe(secondHash);
  });

  it("shares a fail-safe production bucket when no trusted edge identity exists", () => {
    const first = getTrustedAdminLoginClientIdentity(
      new Headers({
        "x-forwarded-for": "198.51.100.1",
        "cf-connecting-ip": "198.51.100.2",
      }),
      productionEnv,
    );
    const second = getTrustedAdminLoginClientIdentity(
      new Headers({ "x-forwarded-for": "198.51.100.250" }),
      productionEnv,
    );

    expect(first).toBe("trusted-edge:unavailable");
    expect(second).toBe(first);
  });

  it("returns the bounded database retry window when the limit is exceeded", async () => {
    const client = createClient({
      data: [{ allowed: false, retry_after_seconds: 99_999 }],
      error: null,
    });

    await expect(checkDistributedAdminLoginRateLimit(
      new Headers({ "x-vercel-forwarded-for": "203.0.113.46" }),
      { client, env: productionEnv },
    )).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: ADMIN_LOGIN_RATE_LIMIT.windowSeconds,
      reason: "rate_limit",
    });
  });

  it("fails closed when the HMAC secret is unavailable", async () => {
    const client = createClient({ data: [], error: null });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(checkDistributedAdminLoginRateLimit(
        new Headers({ "x-vercel-forwarded-for": "203.0.113.47" }),
        { client, env: { NODE_ENV: "production", VERCEL: "1" } },
      )).resolves.toEqual({
        allowed: false,
        retryAfterSeconds: 60,
        reason: "configuration",
      });
      expect(client.rpc).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it.each([
    { data: null, error: { message: "details", code: "42501" } },
    { data: [], error: null },
    { data: [{ allowed: false, retry_after_seconds: Number.NaN }], error: null },
  ])("fails closed on a database or malformed response", async (result) => {
    const client = createClient(result);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(checkDistributedAdminLoginRateLimit(
        new Headers({ "x-vercel-forwarded-for": "203.0.113.48" }),
        { client, env: productionEnv },
      )).resolves.toEqual({
        allowed: false,
        retryAfterSeconds: 60,
        reason: "database",
      });
    } finally {
      consoleError.mockRestore();
    }
  });

  it("fails closed when the service-role client throws", async () => {
    const client = { rpc: vi.fn(async () => { throw new Error("network unavailable"); }) };
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(checkDistributedAdminLoginRateLimit(
        new Headers({ "x-vercel-forwarded-for": "203.0.113.49" }),
        { client, env: productionEnv },
      )).resolves.toEqual({
        allowed: false,
        retryAfterSeconds: 60,
        reason: "database",
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
