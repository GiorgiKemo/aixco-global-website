import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminPasswordRecoveryForm } from "./AdminPasswordRecoveryForm";

const mocks = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  setSession: vi.fn(),
  getSession: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/lib/supabase/auth-browser", () => ({
  getSupabaseAuthBrowserClient: () => ({
    auth: {
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      setSession: mocks.setSession,
      getSession: mocks.getSession,
      updateUser: mocks.updateUser,
      signOut: mocks.signOut,
    },
  }),
}));

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
  mocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  mocks.setSession.mockResolvedValue({ data: { session: { user: { id: "admin-1" } } }, error: null });
  mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "admin-1" } } }, error: null });
  mocks.updateUser.mockResolvedValue({ data: { user: { id: "admin-1" } }, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  window.history.replaceState(null, "", "/admin/auth/recovery");
});

describe("AdminPasswordRecoveryForm", () => {
  it("requests a reset without revealing whether the email exists", async () => {
    render(<AdminPasswordRecoveryForm mode="request" redirectTo="https://www.aixco.global/admin/auth/recovery" />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "Admin@AIXCO.Global" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reset email" }));

    await waitFor(() => expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith("Admin@AIXCO.Global", {
      redirectTo: "https://www.aixco.global/admin/auth/recovery",
    }));
    expect(await screen.findByRole("status")).toHaveTextContent(/if that address belongs to an administrator/i);
  });

  it("updates the password, clears the recovery session, and returns to sign in", async () => {
    window.history.pushState(null, "", "/admin/auth/recovery#access_token=access&refresh_token=refresh&type=recovery");
    render(<AdminPasswordRecoveryForm mode="update" />);

    expect(await screen.findByRole("heading", { name: "Create a new password" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "a-new-admin-password" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "a-new-admin-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ password: "a-new-admin-password" }));
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(mocks.replace).toHaveBeenCalledWith("/admin/login?recovered=1");
  });

  it("rejects a mismatched password before calling Supabase", async () => {
    render(<AdminPasswordRecoveryForm mode="update" />);
    expect(await screen.findByRole("heading", { name: "Create a new password" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "a-new-admin-password" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "different-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/passwords do not match/i);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
