import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AlertTriangle, LogOut, ShieldCheck } from "lucide-react";
import { AdminPendingSubmitButton, AdminShell } from "@/app/admin/_components";
import { getAdminAuthConfig, requireAdminSession } from "@/lib/admin/auth";
import { getAdminIdentityMigrationStatus } from "@/lib/admin/identity-migration";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin identity migration | AIXCO.Global", robots: { index: false, follow: false } };

type PageProps = { searchParams?: Promise<{ invited?: string; resent?: string; removed?: string; error?: string }> };

function inviteErrorMessage(error: string | undefined) {
  if (error === "invalid-email") return "Enter a valid administrator email address.";
  if (error === "source-unavailable") {
    return "The invitation was not sent because administrator identity status could not be verified.";
  }
  if (error === "migration-invite-closed") {
    return "Temporary migration access cannot invite more administrators. Sign in with a named administrator account.";
  }
  if (error === "invite-not-pending") {
    return "That administrator no longer has a pending invitation. Resend is available only before the first sign-in.";
  }
  if (error === "resend-failed") {
    return "The new invitation could not be sent. The original account was not deleted; check Supabase Auth URL configuration and email delivery, then try again.";
  }
  if (error === "remove-confirmation") return "To remove an administrator, retype their exact email and enter REMOVE.";
  if (error === "remove-failed") return "The administrator could not be removed. No account was changed; refresh the list and try again.";
  return "The invitation could not be completed. The address may already have an account.";
}

function LegacyMigrationShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#161616]">
      <header className="border-b border-[#161616]/10 bg-white px-4 py-3 sm:px-7">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">AIXCO Admin</p>
            <p className="mt-1 text-xs text-[#6f6e6a]">Temporary migration access</p>
          </div>
          <form action="/admin/logout" method="post">
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] border border-[#161616]/15 bg-white px-4 text-sm font-semibold">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}

export default async function AdminIdentityMigrationPage({ searchParams }: PageProps) {
  const adminPrincipal = await requireAdminSession();
  const config = getAdminAuthConfig();
  const status = await getAdminIdentityMigrationStatus(config.role);
  const params = searchParams ? await searchParams : {};
  const sourceAvailable = status.sourceStatus === "available";
  const accessReady = sourceAvailable && status.admins.length > 0;
  const legacyInviteClosed = adminPrincipal.authentication === "legacy-shared-password"
    && status.admins.length > 0;
  const canInvite = sourceAvailable && !legacyInviteClosed;
  const canResend = sourceAvailable && adminPrincipal.authentication !== "legacy-shared-password";

  const content = (
    <main className="admin-safe-page admin-safe-page--dashboard bg-[#f8f6f1] px-4 py-5 text-[#161616] sm:px-7 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Privacy & admins</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Administrative access</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6e6a]">Invite a named administrator and review the security state of every admin identity.</p>
        </header>

        {params.invited ? <p role="status" className="mt-5 border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">Invitation sent. The recipient must accept it and set a password. MFA is optional.</p> : null}
        {params.resent ? <p role="status" className="mt-5 border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">A fresh invitation link was sent. The previous link is no longer valid.</p> : null}
        {params.removed ? <p role="status" className="mt-5 border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">Administrator removed. Their admin access is no longer available.</p> : null}
        {params.error ? <p role="alert" className="mt-5 border border-red-700/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{inviteErrorMessage(params.error)}</p> : null}
        {!sourceAvailable ? (
          <div id="identity-source-warning" role="alert" className="mt-5 flex gap-3 border border-amber-700/25 bg-amber-50 px-4 py-3 text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">
                {status.sourceStatus === "unavailable"
                  ? "Administrator identity status is temporarily unavailable."
                  : "Administrator identity status is incomplete."}
              </p>
              <p className="mt-1 text-sm leading-6">
                Invitations and migration readiness are disabled. Keep ADMIN_AUTH_MODE set to migration and try again later.
              </p>
            </div>
          </div>
        ) : null}
        {legacyInviteClosed ? (
          <div id="legacy-invite-warning" role="alert" className="mt-5 flex gap-3 border border-amber-700/25 bg-amber-50 px-4 py-3 text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Temporary invitation access is closed.</p>
              <p className="mt-1 text-sm leading-6">
                A named administrator already exists. Sign in with that named administrator identity to invite another administrator.
              </p>
            </div>
          </div>
        ) : null}

        <section data-source-status={status.sourceStatus} className="mt-6 rounded-[12px] border border-[#161616]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#f4eddd] text-primary"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
            <h2 className="font-display text-xl font-semibold">Migration safety</h2>
          </div>
          <p className={`mt-4 rounded-[9px] border px-4 py-3 text-sm font-semibold ${accessReady ? "border-emerald-700/20 bg-emerald-50 text-emerald-900" : "border-amber-700/20 bg-amber-50 text-amber-950"}`}>
            {!sourceAvailable
              ? "Migration readiness could not be verified. Do not disable legacy migration access."
              : status.admins.length
                ? "A named administrator exists. After that administrator confirms a fresh password sign-in, ADMIN_AUTH_MODE can be changed to identity. MFA remains optional."
                : "Do not disable migration access yet. Create a named administrator first; MFA is optional."}
          </p>

          <form action="/admin/identity-migration/invite" method="post" aria-describedby={!sourceAvailable ? "identity-source-warning" : legacyInviteClosed ? "legacy-invite-warning" : undefined}>
            <fieldset disabled={!canInvite} className="mt-6 grid min-w-0 gap-3 border-0 p-0 disabled:opacity-50 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-2 text-sm font-semibold">
                Administrator email
                <input name="email" type="email" required maxLength={255} disabled={!canInvite} className="h-11 border border-[#161616]/20 px-3 text-base font-normal" />
              </label>
              <AdminPendingSubmitButton
                idleLabel="Send secure invite"
                pendingLabel="Sending secure invite…"
                icon="user-plus"
                disabled={!canInvite}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[9px] bg-[#161616] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </fieldset>
          </form>
        </section>

        <section className="mt-5 rounded-[12px] border border-[#161616]/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Named administrators</h2>
          <div className="mt-4 divide-y divide-[#161616]/10">
            {status.admins.length ? status.admins.map((admin) => (
              <article key={admin.id} className="grid gap-1 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold">{admin.email ?? "Email unavailable"}</p>
                  <p className="mt-1 text-xs text-[#6f6e6a]">Last sign-in: {admin.lastSignInAt ? `${new Date(admin.lastSignInAt).toLocaleString("en", { timeZone: "UTC" })} UTC` : "Never"}</p>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${admin.lastSignInAt === null ? "bg-amber-100 text-amber-950" : admin.verifiedTotpFactors ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"}`}>
                    {admin.verifiedTotpFactors === null
                      ? "MFA status unavailable"
                      : admin.lastSignInAt === null
                        ? "Invitation pending"
                        : admin.verifiedTotpFactors
                          ? "MFA enabled"
                          : "MFA optional"}
                  </span>
                  {canResend && admin.email && admin.invitedAt !== null && admin.lastSignInAt === null ? (
                    <form action="/admin/identity-migration/resend" method="post">
                      <input type="hidden" name="email" value={admin.email} />
                      <AdminPendingSubmitButton
                        idleLabel="Resend invitation"
                        pendingLabel="Resending invitation…"
                        icon="send"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] border border-[#161616]/20 bg-white px-3 text-xs font-semibold text-[#161616] hover:bg-[#f8f6f1]"
                      />
                    </form>
                  ) : null}
                  {sourceAvailable && adminPrincipal.authentication !== "legacy-shared-password" && admin.id !== adminPrincipal.id && status.admins.length > 1 ? (
                    <details className="w-full sm:w-auto">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-[9px] border border-red-700/30 bg-white px-3 text-xs font-semibold text-red-900 hover:bg-red-50 [&::-webkit-details-marker]:hidden">Remove administrator</summary>
                      <form action="/admin/identity-migration/remove" method="post" className="mt-3 grid gap-3 rounded-[9px] border border-red-700/20 bg-red-50 p-3 text-left sm:min-w-72">
                        <input type="hidden" name="targetUserId" value={admin.id} />
                        <p className="text-xs leading-5 text-red-950">This permanently removes <strong>{admin.email ?? "this identity"}</strong>. This cannot be undone.</p>
                        <label className="grid gap-1 text-xs font-semibold text-red-950">Retype email
                          <input name="confirmEmail" type="email" required autoComplete="off" className="h-11 border border-red-700/30 bg-white px-2 text-sm font-normal text-[#161616]" />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold text-red-950">Type REMOVE to confirm
                          <input name="confirmText" required pattern="REMOVE" autoComplete="off" className="h-11 border border-red-700/30 bg-white px-2 text-sm font-normal uppercase text-[#161616]" />
                        </label>
                        <AdminPendingSubmitButton
                          idleLabel="Remove administrator"
                          pendingLabel="Removing administrator…"
                          icon="trash"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] bg-red-900 px-3 text-xs font-semibold text-white hover:bg-red-950"
                        />
                      </form>
                    </details>
                  ) : admin.id === adminPrincipal.id ? <span className="rounded-full bg-[#f4eddd] px-3 py-1 text-xs font-semibold text-primary">You</span> : null}
                </div>
              </article>
            )) : <p className="py-4 text-sm text-[#6f6e6a]">{sourceAvailable ? "No named administrators exist yet." : "Administrator identities could not be fully loaded."}</p>}
          </div>
        </section>
      </div>
    </main>
  );

  return adminPrincipal.authentication === "legacy-shared-password"
    ? <LegacyMigrationShell>{content}</LegacyMigrationShell>
    : <AdminShell adminEmail={adminPrincipal.email}>{content}</AdminShell>;
}
