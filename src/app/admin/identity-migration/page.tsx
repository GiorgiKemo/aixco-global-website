import type { Metadata } from "next";
import Link from "next/link";
import { getAdminAuthConfig, requireAdminSession } from "@/lib/admin/auth";
import { getAdminIdentityMigrationStatus } from "@/lib/admin/identity-migration";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin identity migration | AIXCO.Global", robots: { index: false, follow: false } };

type PageProps = { searchParams?: Promise<{ invited?: string; error?: string }> };

export default async function AdminIdentityMigrationPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const config = getAdminAuthConfig();
  const status = await getAdminIdentityMigrationStatus(config.role);
  const params = searchParams ? await searchParams : {};

  return (
    <main className="admin-safe-page admin-safe-page--roomy min-h-screen bg-[#f6f4ef] px-4 py-8 text-[#161616] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/leads" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#6f5112] underline-offset-4 hover:underline">Back to lead center</Link>
        <header className="mt-5 bg-[#161616] px-6 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e6c767]">Secure migration</p>
          <h1 className="mt-2 font-display text-2xl font-bold">Individual admin identities</h1>
          <p className="mt-2 text-sm leading-6 text-white/70">Invite a named administrator, complete TOTP enrollment, and only then disable shared migration access.</p>
        </header>

        {params.invited ? <p role="status" className="mt-5 border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">Invitation sent. The recipient must accept it and enroll an authenticator.</p> : null}
        {params.error ? <p role="alert" className="mt-5 border border-red-700/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">The invitation could not be completed. The address may already have an account.</p> : null}

        <section className="mt-6 border border-[#161616]/10 bg-white p-6">
          <h2 className="font-display text-xl font-bold">Migration safety</h2>
          <p className={`mt-3 border px-4 py-3 text-sm font-semibold ${status.safeToDisableLegacyAccess ? "border-emerald-700/20 bg-emerald-50 text-emerald-900" : "border-amber-700/20 bg-amber-50 text-amber-950"}`}>
            {status.safeToDisableLegacyAccess
              ? "At least one named administrator has verified TOTP. After that administrator confirms a fresh login, ADMIN_AUTH_MODE can be changed to identity."
              : "Do not disable migration access yet. No named administrator has a verified TOTP factor."}
          </p>

          <form action="/admin/identity-migration/invite" method="post" className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-2 text-sm font-semibold">
              Administrator email
              <input name="email" type="email" required maxLength={255} className="h-11 border border-[#161616]/20 px-3 text-base font-normal" />
            </label>
            <button type="submit" className="h-11 bg-[#161616] px-5 text-sm font-semibold text-white">Send secure invite</button>
          </form>
        </section>

        <section className="mt-6 border border-[#161616]/10 bg-white p-6">
          <h2 className="font-display text-xl font-bold">Named administrators</h2>
          <div className="mt-4 divide-y divide-[#161616]/10">
            {status.admins.length ? status.admins.map((admin) => (
              <article key={admin.id} className="grid gap-1 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                <div><p className="font-semibold">{admin.email ?? "Email unavailable"}</p><p className="mt-1 text-xs text-[#6f6e6a]">Last sign-in: {admin.lastSignInAt ? new Date(admin.lastSignInAt).toLocaleString("en") : "Never"}</p></div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${admin.verifiedTotpFactors ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"}`}>{admin.verifiedTotpFactors ? "TOTP verified" : "TOTP pending"}</span>
              </article>
            )) : <p className="py-4 text-sm text-[#6f6e6a]">No named administrators exist yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
