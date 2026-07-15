import { describe, expect, it, vi } from "vitest";
import { checkDistributedLeadCaptureLimit } from "./lead-capture-abuse";

const payload = {
  name: "Rate Limit User",
  email: "Recipient@Example.com",
  interest: "Send an Email",
  message: "Please send more information about this AIXCO project.",
};

const headers = new Headers({ "x-forwarded-for": "203.0.113.12, 10.0.0.1" });
const env = {
  NODE_ENV: "production",
  LEAD_CAPTURE_HASH_SECRET: "0123456789abcdef0123456789abcdef",
};

function createGuardClient(result: {
  data: { allowed: boolean; reason: string | null; retry_after_seconds: number }[] | null;
  error: { message: string; code?: string } | null;
}) {
  return { rpc: vi.fn(async (_functionName: string, _args: Record<string, unknown>) => result) };
}

describe("distributed lead capture abuse guard", () => {
  it("stores only HMAC identities and applies contact recipient cooldown rules", async () => {
    const client = createGuardClient({
      data: [{ allowed: true, reason: null, retry_after_seconds: 0 }],
      error: null,
    });

    await expect(
      checkDistributedLeadCaptureLimit("contact", payload, headers, { client, env }),
    ).resolves.toEqual({ allowed: true });

    const args = client.rpc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(args).toMatchObject({
      p_resource: "contact",
      p_client_limit: 5,
      p_client_window_seconds: 600,
      p_recipient_limit: 2,
      p_recipient_window_seconds: 3600,
    });
    expect(args.p_client_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(args.p_recipient_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(args)).not.toContain("203.0.113.12");
    expect(JSON.stringify(args)).not.toContain("recipient@example.com");
  });

  it("returns the database recipient cooldown and retry time", async () => {
    const client = createGuardClient({
      data: [{ allowed: false, reason: "recipient_cooldown", retry_after_seconds: 1234 }],
      error: null,
    });

    await expect(
      checkDistributedLeadCaptureLimit("contact", payload, headers, { client, env }),
    ).resolves.toEqual({
      allowed: false,
      reason: "recipient_cooldown",
      retryAfterSeconds: 1234,
    });
  });

  it("fails closed in production without a strong hashing secret", async () => {
    const client = createGuardClient({ data: [], error: null });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(
        checkDistributedLeadCaptureLimit("contact", payload, headers, {
          client,
          env: { NODE_ENV: "production", LEAD_CAPTURE_HASH_SECRET: "short" },
        }),
      ).resolves.toEqual({
        allowed: false,
        reason: "configuration",
        retryAfterSeconds: 60,
      });
      expect(client.rpc).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("does not consume recipient cooldown for schema-invalid contacts", async () => {
    const client = createGuardClient({ data: [], error: null });

    await expect(
      checkDistributedLeadCaptureLimit("contact", { email: "not-an-email" }, headers, {
        client,
        env,
      }),
    ).resolves.toEqual({ allowed: true });
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("fails closed when the distributed database call throws", async () => {
    const client = { rpc: vi.fn(async () => { throw new Error("network down"); }) };
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(
        checkDistributedLeadCaptureLimit("contact", payload, headers, { client, env }),
      ).resolves.toEqual({
        allowed: false,
        reason: "database",
        retryAfterSeconds: 60,
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
