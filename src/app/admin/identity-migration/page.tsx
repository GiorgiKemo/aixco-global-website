import type { Metadata } from "next";
import { ShieldCheck, UserPlus } from "lucide-react";
import { AdminShell } from "@/app/admin/_components";
import { getAdminAuthConfig, requireAdminSession } from "@/lib/admin/auth";
import { getAdminIdentityMigrationStatus } from "@/lib/admin/identity-migration";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin identity migration | AIXCO.Global", robots: { index: false, follow: false } };

type PageProps = { searchParams?: Promise<{ invited?: string; error?: string }> };

export default async function AdminIdentityMigrationPage({ searchParams }: PageProps) {
  const adminPrincipal = await requireAdminSession();
  const config = getAdminAuthConfig();
  const status = await getAdminIdentityMigrationStatus(config.role);
  const params = searchParams ? await searchParams : {};
  const passwordOnlyAccess = !config.mfaRequired;
  const hasNamedAdministrator = status.admins.length > 0;
  const accessReady = passwordOnlyAccess ? hasNamedAdministrator : status.safeToDisableLegacyAccess;

  const content = (
    <main className="admin-safe-page admin-safe-page--dashboard bg-[#f8f6f1] px-4 py-5 text-[#161616] sm:px-7 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Privacy & admins</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Administrative access</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6e6a]">Invite a named administrator and review the security state of every admin identity.</p>
        </header>

        {params.invited ? <p role="status" className="mt-5 border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">{passwordOnlyAccess ? "Invitation sent. The recipient can sign in after accepting it and setting a password." : "Invitation sent. The recipient must accept it and enroll an authenticator."}</p> : null}
        {params.error ? <p role="alert" className="mt-5 border border-red-700/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">The invitation could not be completed. The address may already have an account.</p> : null}

        <section className="mt-6 rounded-[12px] border border-[#161616]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#f4eddd] text-primary"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
            <h2 className="font-display text-xl font-semibold">Migration safety</h2>
          </div>
          <p className={`mt-4 rounded-[9px] border px-4 py-3 text-sm font-semibold ${accessReady ? "border-emerald-700/20 bg-emerald-50 text-emerald-900" : "border-amber-700/20 bg-amber-50 text-amber-950"}`}>
            {passwordOnlyAccess
              ? hasNamedAdministrator
                ? "Password-only admin access is active. Verify that a named administrator can sign in before removing any legacy migration credentials."
                : "Create a named administrator before removing any legacy migration credentials."
              : status.safeToDisableLegacyAccess
                ? "At least one named administrator has verified TOTP. After that administrator confirms a fresh login, ADMIN_AUTH_MODE can be changed to identity."
                : "Do not disable migration access yet. No named administrator has a verified TOTP factor."}
          </p>

          <form action="/admin/identity-migration/invite" method="post" className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-2 text-sm font-semibold">
              Administrator email
              <input name="email" type="email" required maxLength={255} className="h-11 border border-[#161616]/20 px-3 text-base font-normal" />
            </label>
            <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-[9px] bg-[#161616] px-5 text-sm font-semibold text-white">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Send secure invite
            </button>
          </form>
        </section>

        <section className="mt-5 rounded-[12px] border border-[#161616]/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Named administrators</h2>
          <div className="mt-4 divide-y divide-[#161616]/10">
            {status.admins.length ? status.admins.map((admin) => (
              <article key={admin.id} className="grid gap-1 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                <div><p className="font-semibold">{admin.email ?? "Email unavailable"}</p><p className="mt-1 text-xs text-[#6f6e6a]">Last sign-in: {admin.lastSignInAt ? new Date(admin.lastSignInAt).toLocaleString("en") : "Never"}</p></div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${passwordOnlyAccess || admin.verifiedTotpFactors ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"}`}>{passwordOnlyAccess ? "Password access active" : admin.verifiedTotpFactors ? "TOTP verified" : "TOTP pending"}</span>
              </article>
            )) : <p className="py-4 text-sm text-[#6f6e6a]">No named administrators exist yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );

  return adminPrincipal.authentication === "legacy-shared-password" ? content : (
    <AdminShell adminEmail={adminPrincipal.email}>{content}</AdminShell>
  );
}
