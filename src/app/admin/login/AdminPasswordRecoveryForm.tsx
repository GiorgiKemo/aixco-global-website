"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseAuthBrowserClient } from "@/lib/supabase/auth-browser";

type AdminPasswordRecoveryFormProps =
  | { mode: "request"; redirectTo: string }
  | { mode: "update" };

const MINIMUM_PASSWORD_LENGTH = 12;

async function clearRecoverySession() {
  const supabase = getSupabaseAuthBrowserClient();
  await Promise.allSettled([
    fetch("/admin/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    }),
    supabase.auth.signOut({ scope: "local" }),
  ]);
}

export function AdminPasswordRecoveryForm(props: AdminPasswordRecoveryFormProps) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [working, setWorking] = useState(props.mode === "update");
  const [ready, setReady] = useState(props.mode === "request");
  const [failed, setFailed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (props.mode !== "update") return;

    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseAuthBrowserClient();
      try {
        const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = fragment.get("access_token");
        const refreshToken = fragment.get("refresh_token");
        const fragmentError = fragment.get("error_description") || fragment.get("error");

        // Remove recovery credentials before awaiting any work. The fragment
        // must not remain in browser history, screenshots, or referrers.
        window.history.replaceState(null, "", "/admin/auth/recovery");
        if (fragmentError) throw new Error("This password reset link is invalid or expired.");

        if (accessToken && refreshToken) {
          const session = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (session.error || !session.data.session) throw session.error ?? new Error("Missing recovery session.");
        }

        const current = await supabase.auth.getSession();
        if (current.error || !current.data.session) throw current.error ?? new Error("Missing recovery session.");
        if (!cancelled) {
          setReady(true);
          setWorking(false);
        }
      } catch {
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        if (!cancelled) {
          setFailed(true);
          setWorking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [props.mode]);

  useEffect(() => {
    if (ready || failed) headingRef.current?.focus();
  }, [failed, ready]);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setErrorMessage("");
    try {
      const supabase = getSupabaseAuthBrowserClient();
      const result = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: props.mode === "request" ? props.redirectTo : undefined,
      });
      if (result.error) throw result.error;
      setSubmitted(true);
    } catch {
      // Keep the response intentionally generic so this form never reveals
      // whether an address belongs to an administrator.
      setSubmitted(true);
    } finally {
      setWorking(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < MINIMUM_PASSWORD_LENGTH) {
      setErrorMessage(`Use at least ${MINIMUM_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setWorking(true);
    setErrorMessage("");
    try {
      const supabase = getSupabaseAuthBrowserClient();
      const result = await supabase.auth.updateUser({ password: newPassword });
      if (result.error) throw result.error;
      await clearRecoverySession();
      router.replace("/admin/login?recovered=1");
    } catch {
      setErrorMessage("The password could not be updated. Request a new reset email and try again.");
      setWorking(false);
    }
  }

  if (props.mode === "update") {
    return (
      <section className="mt-8 rounded-lg border border-border/70 bg-surface-elevated p-6 shadow-elegant">
        <p className="eyebrow">AIXCO Admin</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-2xl outline-none">
          {failed ? "Password reset link unavailable" : ready ? "Create a new password" : "Verifying reset link…"}
        </h1>
        {failed ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">This link is invalid or expired. Request a new reset email to continue.</p>
            <Link href="/admin/login?recover=1" className="btn-gold mt-5 inline-flex min-h-11 items-center justify-center">Request a new reset email</Link>
          </>
        ) : ready ? (
          <form onSubmit={updatePassword} className="mt-6 grid gap-5">
            <p className="text-sm leading-relaxed text-muted-foreground">After changing your password, sign in again with your individual admin account. MFA remains optional.</p>
            {errorMessage ? <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p> : null}
            <p id="admin-recovery-password-requirements" className="text-xs text-muted-foreground">Use at least 12 characters.</p>
            <label className="grid gap-2 text-sm font-medium" htmlFor="admin-recovery-password">
              New password
              <input id="admin-recovery-password" type="password" autoComplete="new-password" minLength={MINIMUM_PASSWORD_LENGTH} required aria-describedby="admin-recovery-password-requirements" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="form-control" />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="admin-recovery-confirm-password">
              Confirm password
              <input id="admin-recovery-confirm-password" type="password" autoComplete="new-password" minLength={MINIMUM_PASSWORD_LENGTH} required aria-describedby="admin-recovery-password-requirements" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="form-control" />
            </label>
            <button type="submit" disabled={working} className="btn-gold min-h-11 justify-center disabled:cursor-wait disabled:opacity-60">{working ? "Updating password…" : "Update password"}</button>
          </form>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-lg border border-border/70 bg-surface-elevated p-6 shadow-elegant">
      <p className="eyebrow">AIXCO Admin</p>
      <h2 className="mt-3 font-display text-2xl">Reset your password</h2>
      {submitted ? (
        <>
          <p role="status" className="mt-4 rounded-md border border-emerald-700/20 bg-emerald-50 px-3 py-3 text-sm leading-relaxed text-emerald-900">If that address belongs to an administrator, a password reset email is on its way. Check your inbox and spam folder.</p>
          <Link href="/admin/login" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">Return to sign in</Link>
        </>
      ) : (
        <form onSubmit={requestReset} className="mt-6 grid gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">Enter your invited admin email. The reset link returns to AIXCO, and MFA remains optional for dashboard access.</p>
          {errorMessage ? <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p> : null}
          <label className="grid gap-2 text-sm font-medium" htmlFor="admin-recovery-email">
            Email
            <input id="admin-recovery-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="form-control" />
          </label>
          <button type="submit" disabled={working} className="btn-gold min-h-11 justify-center disabled:cursor-wait disabled:opacity-60">{working ? "Sending reset email…" : "Send reset email"}</button>
          <Link href="/admin/login" className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">Back to sign in</Link>
        </form>
      )}
    </section>
  );
}
