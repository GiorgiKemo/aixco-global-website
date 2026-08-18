import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminClient: vi.fn(),
  getUserById: vi.fn(),
  generateLink: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: mocks.getAdminClient,
}));

import { resendAdminIdentityInvite } from "./identity-invite-email";

describe("resendAdminIdentityInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.LEAD_NOTIFICATION_FROM = "AIXCO Admin <admin@example.com>";
    mocks.getAdminClient.mockResolvedValue({
      auth: {
        admin: {
          getUserById: mocks.getUserById,
          generateLink: mocks.generateLink,
        },
      },
    });
    mocks.getUserById.mockResolvedValue({
      data: {
        user: {
          id: "pending-admin",
          email: "pending@example.com",
          last_sign_in_at: null,
        },
      },
      error: null,
    });
    mocks.generateLink.mockResolvedValue({
      data: {
        user: { id: "pending-admin" },
        properties: { action_link: "https://zrgcrfyxokxcjpdabaoi.supabase.co/auth/v1/verify?token=secret&redirect_to=https%3A%2F%2Fwww.aixco.global%2Fadmin%2Fauth%2Fcomplete", hashed_token: "hashed-secret-value" },
      },
      error: null,
    });
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_NOTIFICATION_FROM;
  });

  it("rotates the pending Supabase invite and sends the new link through Resend", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "msg-1" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));

    const result = await resendAdminIdentityInvite(" Pending@Example.com ", {
      expectedUserId: "pending-admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
      fetchImpl,
    });

    expect(result).toEqual({ email: "pending@example.com", providerMessageId: "msg-1" });
    expect(mocks.generateLink).toHaveBeenCalledWith({
      type: "invite",
      email: "pending@example.com",
      options: { redirectTo: "https://www.aixco.global/admin/auth/complete" },
    });
    expect(fetchImpl).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        Authorization: "Bearer test-resend-key",
      }),
    }));
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string) as { to: string[]; text: string; html: string };
    expect(body.to).toEqual(["pending@example.com"]);
    expect(body.text).toContain("AIXCO administrator invitation");
    expect(body.html).toContain("Accept invitation");
    expect(body.html).toContain("/admin/auth/callback");
    expect(body.html).toContain("hashed-secret-value");
  });

  it("refuses to rotate an invitation after the user has signed in", async () => {
    mocks.getUserById.mockResolvedValue({
      data: { user: { id: "pending-admin", email: "pending@example.com", last_sign_in_at: "2026-08-18T10:00:00Z" } },
      error: null,
    });

    await expect(resendAdminIdentityInvite("pending@example.com", {
      expectedUserId: "pending-admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
      fetchImpl: vi.fn(),
    })).rejects.toThrow("no longer has a pending invitation");
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });

  it("does not send when the generated link belongs to another user", async () => {
    mocks.generateLink.mockResolvedValue({
      data: {
        user: { id: "different-user" },
        properties: { action_link: "https://example.com/link", hashed_token: "hashed-secret-value" },
      },
      error: null,
    });
    const fetchImpl = vi.fn();

    await expect(resendAdminIdentityInvite("pending@example.com", {
      expectedUserId: "pending-admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
      fetchImpl,
    })).rejects.toThrow("could not be generated");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("does not send a link when Supabase falls back to a non-public redirect", async () => {
    mocks.generateLink.mockResolvedValue({
      data: {
        user: { id: "pending-admin" },
        properties: { action_link: "https://zrgcrfyxokxcjpdabaoi.supabase.co/auth/v1/verify?token=secret&redirect_to=http%3A%2F%2Flocalhost%3A3000", hashed_token: "hashed-secret-value" },
      },
      error: null,
    });
    const fetchImpl = vi.fn();

    await expect(resendAdminIdentityInvite("pending@example.com", {
      expectedUserId: "pending-admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
      fetchImpl,
    })).rejects.toThrow("redirect URL is not configured");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed when the email provider rejects the message", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "rate limited" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    }));

    await expect(resendAdminIdentityInvite("pending@example.com", {
      expectedUserId: "pending-admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
      fetchImpl,
    })).rejects.toThrow("could not be sent");
  });
});
