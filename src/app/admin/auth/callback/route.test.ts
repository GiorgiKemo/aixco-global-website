import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@/lib/supabase/auth-server", () => ({
  getSupabaseAuthServerClient: async () => ({ auth }),
}));

import { GET } from "./route";

describe("admin invite callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges a one-time code server-side and redirects to a clean setup URL", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    const response = await GET(new Request(
      "https://www.aixco.global/admin/auth/callback?code=one-time-secret&next=https://evil.example",
    ));

    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("one-time-secret");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://www.aixco.global/admin/login?setup=1");
    expect(response.headers.get("location")).not.toContain("one-time-secret");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
  });

  it("verifies a hashed invite token server-side", async () => {
    auth.verifyOtp.mockResolvedValue({ data: { session: {} }, error: null });
    const response = await GET(new Request(
      "https://www.aixco.global/admin/auth/callback?token_hash=hashed-secret&type=invite",
    ));

    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "hashed-secret", type: "invite" });
    expect(response.headers.get("location")).toBe("https://www.aixco.global/admin/login?setup=1");
  });

  it("fails closed without reflecting or retaining a rejected credential", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ data: { session: null }, error: new Error("Rejected") });
    const response = await GET(new Request(
      "https://www.aixco.global/admin/auth/callback?code=rejected-secret&next=https://evil.example",
    ));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://www.aixco.global/admin/login?error=invite-invalid");
    expect(response.headers.get("location")).not.toContain("rejected-secret");
    expect(response.headers.get("location")).not.toContain("evil.example");
  });
});
