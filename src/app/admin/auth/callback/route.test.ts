import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
}));
const cookieStore = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/lib/supabase/auth-server", () => ({
  getSupabaseAuthServerClient: async () => ({ auth }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

import { GET, POST } from "./route";

describe("admin invite callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore.get.mockReturnValue(undefined);
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

  it("stages a hashed invite token without consuming it", async () => {
    const response = await GET(new Request(
      "https://www.aixco.global/admin/auth/callback?token_hash=hashed-secret-value&type=invite",
    ));

    expect(auth.verifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://www.aixco.global/admin/auth/accept");
    expect(response.headers.get("set-cookie")).toContain("aixco_admin_invite_token=hashed-secret-value");
  });

  it("verifies a staged invite only after the recipient submits Continue", async () => {
    cookieStore.get.mockReturnValue({ value: "hashed-secret-value" });
    auth.verifyOtp.mockResolvedValue({ data: { session: {} }, error: null });
    const response = await POST(new Request(
      "https://www.aixco.global/admin/auth/callback",
      { method: "POST", headers: { origin: "https://www.aixco.global" } },
    ));

    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "hashed-secret-value", type: "invite" });
    expect(response.headers.get("location")).toBe("https://www.aixco.global/admin/login?setup=1");
    expect(response.headers.get("set-cookie")).toContain("aixco_admin_invite_token=;");
  });

  it("rejects a staged invite without the same-origin confirmation", async () => {
    cookieStore.get.mockReturnValue({ value: "hashed-secret-value" });
    const response = await POST(new Request(
      "https://www.aixco.global/admin/auth/callback",
      { method: "POST", headers: { origin: "https://evil.example" } },
    ));

    expect(response.status).toBe(403);
    expect(auth.verifyOtp).not.toHaveBeenCalled();
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
