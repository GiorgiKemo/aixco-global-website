import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminLoginForm } from "./AdminLoginForm";

const authMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getAssurance: vi.fn(),
  listFactors: vi.fn(),
  enroll: vi.fn(),
  unenroll: vi.fn(),
  challengeAndVerify: vi.fn(),
  updateUser: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => authMocks.searchParams,
}));

vi.mock("@/lib/supabase/auth-browser", () => ({
  getSupabaseAuthBrowserClient: () => ({
    auth: {
      getUser: authMocks.getUser,
      signInWithPassword: authMocks.signInWithPassword,
      signOut: authMocks.signOut,
      updateUser: authMocks.updateUser,
      mfa: {
        getAuthenticatorAssuranceLevel: authMocks.getAssurance,
        listFactors: authMocks.listFactors,
        enroll: authMocks.enroll,
        unenroll: authMocks.unenroll,
        challengeAndVerify: authMocks.challengeAndVerify,
      },
    },
  }),
}));

const identityConfig = {
  configured: true,
  missing: [],
  mode: "identity" as const,
  role: "admin",
  identityAvailable: true,
  legacyAvailable: false,
};

const fetchMock = vi.fn();

function auditResponse(stored: boolean, status = 202) {
  return new Response(JSON.stringify({ ok: stored, stored }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const adminUser = {
  id: "admin-id",
  email: "admin@aixco.global",
  app_metadata: { role: "admin" },
};

beforeEach(() => {
  Object.values(authMocks).forEach((value) => {
    if (typeof value === "function" && "mockReset" in value) value.mockReset();
  });
  authMocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
  authMocks.signOut.mockResolvedValue({ error: null });
  authMocks.unenroll.mockResolvedValue({ data: {}, error: null });
  authMocks.searchParams = new URLSearchParams();
  fetchMock.mockReset().mockResolvedValue(auditResponse(true));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AdminLoginForm", () => {
  it("shows individual identity fields in identity-only mode", async () => {
    render(<AdminLoginForm config={identityConfig} />);

    expect(screen.getByRole("heading", { name: "Individual admin sign-in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/admin/login?recover=1");
    expect(screen.queryByLabelText("Migration password")).not.toBeInTheDocument();
    await waitFor(() => expect(authMocks.getUser).toHaveBeenCalled());
  });

  it("shows the shared password only in explicit migration mode", () => {
    render(
      <AdminLoginForm
        config={{
          configured: true,
          missing: [],
          mode: "migration",
          role: "admin",
          identityAvailable: false,
          legacyAvailable: true,
        }}
      />,
    );

    expect(screen.getByLabelText("Migration password")).toBeInTheDocument();
    expect(screen.getByText(/temporary migration access/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  it("signs out locally when MFA preparation fails after accepting credentials", async () => {
    authMocks.signInWithPassword.mockResolvedValue({ data: { user: adminUser }, error: null });
    authMocks.getAssurance.mockResolvedValue({ data: null, error: new Error("MFA unavailable") });

    render(<AdminLoginForm config={identityConfig} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@aixco.global" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-password" } });
    fireEvent.submit(screen.getByRole("button", { name: "Continue securely" }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(/authenticator code could not be verified/i);
    expect(authMocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(fetchMock).toHaveBeenCalledWith("/admin/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("moves an authorized user with an enrolled factor to the TOTP challenge", async () => {
    authMocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { role: "admin" } } },
      error: null,
    });
    authMocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });
    authMocks.listFactors.mockResolvedValue({
      data: {
        all: [{ id: "factor-id", factor_type: "totp", status: "verified" }],
        totp: [{ id: "factor-id", factor_type: "totp", status: "verified" }],
        phone: [],
      },
      error: null,
    });

    render(<AdminLoginForm config={identityConfig} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@aixco.global" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-password" } });
    fireEvent.submit(screen.getByRole("button", { name: "Continue securely" }).closest("form")!);

    const challengeHeading = await screen.findByRole("heading", { name: "Authenticator code" });
    await waitFor(() => expect(challengeHeading).toHaveFocus());
    expect(screen.getByLabelText("Six-digit code")).toHaveAttribute("autocomplete", "one-time-code");
    expect(screen.getByText(/signed in as admin@aixco.global/i)).toBeInTheDocument();
  });

  it("requires first-time admins to enroll a TOTP factor", async () => {
    authMocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { roles: ["admin"] } } },
      error: null,
    });
    authMocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal1" },
      error: null,
    });
    authMocks.listFactors.mockResolvedValue({ data: { all: [], totp: [], phone: [] }, error: null });
    authMocks.enroll.mockResolvedValue({
      data: {
        id: "new-factor",
        totp: {
          qr_code: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
          secret: "AIXCO-TOTP-SECRET",
        },
      },
      error: null,
    });

    render(<AdminLoginForm config={identityConfig} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@aixco.global" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-password" } });
    fireEvent.submit(screen.getByRole("button", { name: "Continue securely" }).closest("form")!);

    expect(await screen.findByRole("heading", { name: "Protect your admin account" })).toBeInTheDocument();
    expect(screen.getByAltText("QR code for AIXCO admin authenticator setup")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cannot scan the QR code?"));
    expect(screen.getByText("AIXCO-TOTP-SECRET")).toBeInTheDocument();
  });

  it("requires an invited administrator to create a reusable password before MFA enrollment", async () => {
    authMocks.searchParams = new URLSearchParams("setup=1");
    const user = { id: "invited-admin", email: "invited@aixco.global", app_metadata: { role: "admin" } };
    authMocks.getUser.mockResolvedValue({ data: { user }, error: null });
    authMocks.updateUser.mockResolvedValue({ data: { user }, error: null });
    authMocks.getAssurance.mockResolvedValue({ data: { currentLevel: "aal1", nextLevel: "aal1" }, error: null });
    authMocks.listFactors.mockResolvedValue({ data: { all: [], totp: [], phone: [] }, error: null });
    authMocks.enroll.mockResolvedValue({
      data: { id: "factor-id", totp: { qr_code: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E", secret: "SETUP" } },
      error: null,
    });

    render(<AdminLoginForm config={identityConfig} />);
    expect(await screen.findByRole("heading", { name: "Create your admin password" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "long-secure-password" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "long-secure-password" } });
    fireEvent.submit(screen.getByRole("button", { name: "Save password and continue" }).closest("form")!);

    await waitFor(() => expect(authMocks.updateUser).toHaveBeenCalledWith({ password: "long-secure-password" }));
    const enrollmentHeading = await screen.findByRole("heading", { name: "Protect your admin account" });
    await waitFor(() => expect(enrollmentHeading).toHaveFocus());
  });

  it("signs out locally when invited-user password setup fails", async () => {
    authMocks.searchParams = new URLSearchParams("setup=1");
    authMocks.getUser.mockResolvedValue({ data: { user: adminUser }, error: null });
    authMocks.updateUser.mockResolvedValue({ data: { user: null }, error: new Error("Password update rejected") });

    render(<AdminLoginForm config={identityConfig} />);
    const passwordHeading = await screen.findByRole("heading", { name: "Create your admin password" });
    await waitFor(() => expect(passwordHeading).toHaveFocus());
    expect(screen.getByLabelText("New password")).toHaveAttribute("aria-describedby", "admin-password-requirements");
    expect(screen.getByText("Use at least 12 characters.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "long-secure-password" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "long-secure-password" } });
    fireEvent.submit(screen.getByRole("button", { name: "Save password and continue" }).closest("form")!);

    const credentialsHeading = await screen.findByRole("heading", { name: "Individual admin sign-in" });
    await waitFor(() => expect(credentialsHeading).toHaveFocus());
    expect(authMocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(fetchMock).toHaveBeenCalledWith("/admin/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("navigates only after an existing AAL2 session audit is durably stored", async () => {
    const onAuthenticated = vi.fn();
    authMocks.getUser.mockResolvedValue({ data: { user: adminUser }, error: null });
    authMocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal2", nextLevel: "aal2" },
      error: null,
    });
    fetchMock.mockResolvedValue(auditResponse(true));

    render(<AdminLoginForm config={identityConfig} onAuthenticated={onAuthenticated} />);

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/admin/login/audit", expect.objectContaining({
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({
        email: "admin@aixco.global",
        phase: "session",
        outcome: "success",
      }),
    }));
  });

  it("signs out an authenticated session when the required audit row is not stored", async () => {
    const onAuthenticated = vi.fn();
    authMocks.getUser.mockResolvedValue({ data: { user: adminUser }, error: null });
    authMocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal2", nextLevel: "aal2" },
      error: null,
    });
    fetchMock.mockResolvedValue(auditResponse(false));

    render(<AdminLoginForm config={identityConfig} onAuthenticated={onAuthenticated} />);

    expect(await screen.findByRole("heading", { name: "Individual admin sign-in" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/authenticated session was signed out/i);
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(authMocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(fetchMock).toHaveBeenCalledWith("/admin/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
    expect(screen.queryByRole("button", { name: /retry security record/i })).not.toBeInTheDocument();
  });

  it("signs out locally when both audit persistence and server logout are unreachable", async () => {
    const onAuthenticated = vi.fn();
    authMocks.getUser.mockResolvedValue({ data: { user: adminUser }, error: null });
    authMocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal2", nextLevel: "aal2" },
      error: null,
    });
    fetchMock.mockRejectedValue(new TypeError("network unavailable"));

    render(<AdminLoginForm config={identityConfig} onAuthenticated={onAuthenticated} />);

    expect(await screen.findByRole("heading", { name: "Individual admin sign-in" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/authenticated session was signed out/i);
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(authMocks.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("invalidates an MFA session when its required success audit is unavailable", async () => {
    const onAuthenticated = vi.fn();
    authMocks.signInWithPassword.mockResolvedValue({ data: { user: adminUser }, error: null });
    authMocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });
    authMocks.listFactors.mockResolvedValue({
      data: {
        all: [{ id: "factor-id", factor_type: "totp", status: "verified" }],
        totp: [{ id: "factor-id", factor_type: "totp", status: "verified" }],
        phone: [],
      },
      error: null,
    });
    authMocks.challengeAndVerify.mockResolvedValue({ data: {}, error: null });
    fetchMock
      .mockResolvedValueOnce(auditResponse(false))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<AdminLoginForm config={identityConfig} onAuthenticated={onAuthenticated} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@aixco.global" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-password" } });
    fireEvent.submit(screen.getByRole("button", { name: "Continue securely" }).closest("form")!);

    const code = await screen.findByLabelText("Six-digit code");
    fireEvent.change(code, { target: { value: "123456" } });
    fireEvent.submit(screen.getByRole("button", { name: "Verify and sign in" }).closest("form")!);

    expect(await screen.findByRole("heading", { name: "Individual admin sign-in" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/authenticated session was signed out/i);
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(authMocks.challengeAndVerify).toHaveBeenCalledTimes(1);
    expect(authMocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(screen.queryByLabelText("Six-digit code")).not.toBeInTheDocument();
  });
});
