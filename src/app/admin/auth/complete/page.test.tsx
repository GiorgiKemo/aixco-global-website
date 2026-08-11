import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  setSession: vi.fn(),
  getUser: vi.fn(),
}));
const router = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));

vi.mock("@/lib/supabase/auth-browser", () => ({
  getSupabaseAuthBrowserClient: () => ({ auth }),
}));

import AdminAuthCompletePage from "./page";

describe("default Supabase admin invite completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/admin/auth/complete");
  });

  it("scrubs fragment credentials before restoring and validating the session", async () => {
    window.history.replaceState(null, "", "/admin/auth/complete#access_token=access-secret&refresh_token=refresh-secret&type=invite");
    auth.setSession.mockResolvedValue({ data: { session: {} }, error: null });
    auth.getUser.mockResolvedValue({ data: { user: { id: "admin-1" } }, error: null });
    render(<AdminAuthCompletePage />);

    expect(screen.getByText("You will continue to finish your administrator account setup.")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/authenticator/i);
    expect(window.location.hash).toBe("");
    expect(window.location.pathname).toBe("/admin/auth/complete");
    await waitFor(() => expect(auth.setSession).toHaveBeenCalledWith({
      access_token: "access-secret",
      refresh_token: "refresh-secret",
    }));
    await waitFor(() => expect(auth.getUser).toHaveBeenCalled());
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/admin/login?setup=1"));
  });

  it("fails closed and keeps the URL clean when the fragment is invalid", async () => {
    window.history.replaceState(null, "", "/admin/auth/complete#access_token=rejected-secret&refresh_token=refresh-secret");
    auth.setSession.mockResolvedValue({ data: { session: null }, error: new Error("Rejected") });
    render(<AdminAuthCompletePage />);

    expect(await screen.findByRole("heading", { name: "Invitation could not be verified" })).toBeInTheDocument();
    expect(window.location.hash).toBe("");
    expect(document.body.textContent).not.toContain("rejected-secret");
  });
});
