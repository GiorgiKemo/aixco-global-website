"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { hasAdminRole } from "@/lib/admin/policy";
import { getSupabaseAuthBrowserClient } from "@/lib/supabase/auth-browser";

type AdminLoginFormProps = {
  config: {
    configured: boolean;
    missing: string[];
    mode: "identity" | "migration";
    role: string;
    identityAvailable: boolean;
    legacyAvailable: boolean;
    trustedDeviceAvailable?: boolean;
  };
  passwordRecoveryNotice?: boolean;
  onAuthenticated?: () => void;
};

type SignInStage = "credentials" | "set-password";

type SuccessfulAuditPhase = "mfa" | "session";

const AUDIT_UNAVAILABLE_MESSAGE =
  "Your admin sign-in could not be completed because the required security record was unavailable. For your protection, the authenticated session was signed out. Please sign in again.";

function navigateToOperations() {
  window.location.assign("/admin");
}

function getErrorMessage(error: string | null) {
  if (error === "invalid") return "The sign-in details are incorrect.";
  if (error === "config") return "Admin authentication is not configured.";
  if (error === "rate-limited") return "Too many sign-in attempts. Please try again shortly.";
  if (error === "not-authorized") return "This identity is not assigned the AIXCO admin role.";
  if (error === "mfa-required") return "Sign in with your individual admin account to continue.";
  if (error === "not-authenticated") return "Sign in to continue to the admin dashboard.";
  if (error === "invite-invalid") return "The invitation is invalid or has expired. Request a new invitation.";
  return "";
}

function readableAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "The email or password is incorrect.";
  return "Admin sign-in could not be completed. Please try again.";
}

async function reportAdminLogin(
  email: string | null,
  phase: "credentials" | "authorization" | "mfa" | "session",
  outcome: "success" | "failure",
  reason?: string,
): Promise<boolean> {
  const payload = JSON.stringify({
    email: email && email.includes("@") ? email : null,
    phase,
    outcome,
    ...(reason ? { reason } : {}),
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch("/admin/login/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        keepalive: true,
        body: payload,
      });
      const result = await response.json().catch(() => null) as { stored?: unknown } | null;
      if (response.ok && result?.stored === true) return true;

      // The browser client can finish writing the refreshed auth cookie just
      // after sign-in resolves (most visible in Safari). A 401 is therefore
      // retryable once while the server still validates the admin identity.
      if (response.status !== 401 || attempt > 0) return false;
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    } catch {
      return false;
    }
  }

  return false;
}

async function revokeIncompleteAdminSignIn() {
  // Start the server-side cookie revocation before clearing the browser client.
  // Promise.allSettled makes both independent safeguards run even if one fails.
  const serverSignOut = fetch("/admin/logout", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  });
  const localSignOut = getSupabaseAuthBrowserClient().auth.signOut({ scope: "local" });
  await Promise.allSettled([serverSignOut, localSignOut]);
}

export function AdminLoginForm({
  config,
  passwordRecoveryNotice = false,
  onAuthenticated = navigateToOperations,
}: AdminLoginFormProps) {
  const params = useSearchParams();
  const queryError = getErrorMessage(params?.get("error") ?? null);
  const setupRequested = params?.get("setup") === "1";
  const [stage, setStage] = useState<SignInStage>("credentials");
  const [identityEmail, setIdentityEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(queryError);
  const [working, setWorking] = useState(false);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousStageRef = useRef(stage);

  useEffect(() => {
    if (previousStageRef.current !== stage) stageHeadingRef.current?.focus();
    previousStageRef.current = stage;
  }, [stage]);

  const finalizeVerifiedSignIn = useCallback(
    async (email: string | null, phase: SuccessfulAuditPhase) => {
      const stored = await reportAdminLogin(email, phase, "success");
      if (stored) {
        onAuthenticated();
        return true;
      }

      await revokeIncompleteAdminSignIn();
      setStage("credentials");
      setIdentityEmail("");
      setErrorMessage(AUDIT_UNAVAILABLE_MESSAGE);
      return false;
    },
    [onAuthenticated],
  );

  const prepareAdminSession = useCallback(
    async (user: User) => {
      const supabase = getSupabaseAuthBrowserClient();
      if (!hasAdminRole(user.app_metadata, config.role)) {
        await reportAdminLogin(user.email ?? null, "authorization", "failure", "role_missing");
        await revokeIncompleteAdminSignIn();
        setStage("credentials");
        setErrorMessage("This identity is not assigned the AIXCO admin role.");
        return;
      }

      setIdentityEmail(user.email ?? "your admin account");
      const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const isAal2 = !assurance.error
        && assurance.data?.currentLevel === "aal2"
        && assurance.data?.nextLevel === "aal2";

      // MFA remains available to admins who have enabled it, but it is not a
      // prerequisite for entering the dashboard. A password-authenticated
      // admin session is sufficient after the server validates app_metadata.
      await finalizeVerifiedSignIn(user.email ?? null, isAal2 ? "mfa" : "session");
    },
    [config.role, finalizeVerifiedSignIn],
  );

  useEffect(() => {
    if (!config.identityAvailable) return;

    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseAuthBrowserClient();
      const currentUser = await supabase.auth.getUser();
      if (cancelled || currentUser.error || !currentUser.data.user) return;

      setWorking(true);
      try {
        if (setupRequested) {
          if (!hasAdminRole(currentUser.data.user.app_metadata, config.role)) {
            await revokeIncompleteAdminSignIn();
            setErrorMessage("This identity is not assigned the AIXCO admin role.");
          } else {
            setIdentityEmail(currentUser.data.user.email ?? "your admin account");
            setStage("set-password");
          }
        } else {
          await prepareAdminSession(currentUser.data.user);
        }
      } catch (error) {
        await revokeIncompleteAdminSignIn();
        if (!cancelled) {
          setStage("credentials");
          setIdentityEmail("");
          setErrorMessage(readableAuthError(error instanceof Error ? error.message : ""));
        }
      } finally {
        if (!cancelled) setWorking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config.identityAvailable, config.role, prepareAdminSession, setupRequested]);

  async function handleIdentityLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setWorking(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    let credentialsAccepted = false;

    try {
      const supabase = getSupabaseAuthBrowserClient();
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error || !result.data.user) throw result.error ?? new Error("Missing user");
      credentialsAccepted = true;
      await prepareAdminSession(result.data.user);
    } catch (error) {
      if (credentialsAccepted) await revokeIncompleteAdminSignIn();
      await reportAdminLogin(
        email || null,
        credentialsAccepted ? "authorization" : "credentials",
        "failure",
        credentialsAccepted ? "session_preparation_failed" : "invalid_credentials",
      );
      setErrorMessage(readableAuthError(error instanceof Error ? error.message : ""));
    } finally {
      setWorking(false);
    }
  }

  async function handlePasswordSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 12 || newPassword !== confirmPassword) {
      setErrorMessage(newPassword.length < 12 ? "Use at least 12 characters." : "The passwords do not match.");
      return;
    }

    setWorking(true);
    setErrorMessage("");
    try {
      const supabase = getSupabaseAuthBrowserClient();
      const updated = await supabase.auth.updateUser({ password: newPassword });
      if (updated.error || !updated.data.user) throw updated.error ?? new Error("Missing user");
      setNewPassword("");
      setConfirmPassword("");
      await prepareAdminSession(updated.data.user);
    } catch (error) {
      await revokeIncompleteAdminSignIn();
      setStage("credentials");
      setIdentityEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(readableAuthError(error instanceof Error ? error.message : ""));
    } finally {
      setWorking(false);
    }
  }

  async function resetIdentity() {
    setWorking(true);
    try {
      await getSupabaseAuthBrowserClient().auth.signOut({ scope: "local" });
    } finally {
      setStage("credentials");
      setIdentityEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage("");
      setWorking(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-border/70 bg-surface-elevated p-6 shadow-elegant">
      {!config.configured ? (
        <div>
          <h2 className="font-display text-xl">Admin access is not configured</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Add these server environment variables, then redeploy the app:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            {config.missing.map((item) => (
              <li key={item} className="rounded-md bg-background/70 px-3 py-2 font-mono text-xs">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid gap-6">
          {passwordRecoveryNotice ? (
            <p role="status" className="rounded-md border border-emerald-700/20 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Your password was updated. Sign in again to access the dashboard. MFA remains optional.
            </p>
          ) : null}
          {errorMessage && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          {config.identityAvailable && stage === "credentials" && (
            <form onSubmit={handleIdentityLogin} className="grid gap-5">
              <div>
                <h2 ref={stageHeadingRef} tabIndex={-1} className="font-display text-xl outline-none">Individual admin sign-in</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Use your invited AIXCO admin account and password to continue.
                </p>
              </div>
              <div>
                <label htmlFor="admin-email" className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Email
                </label>
                <input id="admin-email" name="email" type="email" autoComplete="username" required className="form-control" />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="form-control"
                />
              </div>
              <button type="submit" disabled={working} className="btn-gold justify-center disabled:cursor-wait disabled:opacity-60">
                {working ? "Checking account…" : "Continue securely"}
              </button>
              <Link href="/admin/login?recover=1" className="min-h-11 inline-flex items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </form>
          )}

          {config.identityAvailable && stage === "set-password" && (
            <form onSubmit={handlePasswordSetup} className="grid gap-5">
              <div>
                <p className="eyebrow">Invitation setup</p>
                <h2 ref={stageHeadingRef} tabIndex={-1} className="mt-2 font-display text-xl outline-none">Create your admin password</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  This password is required for future sign-ins.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Setting up {identityEmail}</p>
              <p id="admin-password-requirements" className="text-xs text-muted-foreground">Use at least 12 characters.</p>
              <div>
                <label htmlFor="admin-new-password" className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">New password</label>
                <input id="admin-new-password" type="password" autoComplete="new-password" minLength={12} required aria-describedby="admin-password-requirements" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="form-control" />
              </div>
              <div>
                <label htmlFor="admin-confirm-password" className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Confirm password</label>
                <input id="admin-confirm-password" type="password" autoComplete="new-password" minLength={12} required aria-describedby="admin-password-requirements" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="form-control" />
              </div>
              <button type="submit" disabled={working} className="btn-gold justify-center disabled:cursor-wait disabled:opacity-60">{working ? "Saving…" : "Save password and continue"}</button>
              <button type="button" disabled={working} onClick={resetIdentity} className="inline-flex min-h-11 items-center justify-center text-sm text-muted-foreground underline-offset-4 hover:underline">Cancel setup</button>
            </form>
          )}

          {config.mode === "migration" && config.legacyAvailable && (
            <div className={config.identityAvailable ? "border-t border-border/70 pt-6" : ""}>
              <div className="mb-4 rounded-md border border-amber-700/20 bg-amber-50 px-3 py-3 text-sm text-amber-950">
                Temporary migration access. Remove this shared-password path after every administrator has an individual account.
              </div>
              <form action="/admin/session" method="post" className="grid gap-5">
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value="migration-admin"
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                  className="sr-only"
                />
                <div>
                  <label htmlFor="migration-password" className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Migration password
                  </label>
                  <input
                    id="migration-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="form-control"
                  />
                </div>
                <button type="submit" className="btn-gold justify-center">
                  Use migration access
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
