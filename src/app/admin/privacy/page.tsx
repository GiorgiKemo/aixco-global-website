import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, UserRoundCog } from "lucide-react";
import { AdminShell } from "@/app/admin/_components";
import { PrivacyControls } from "@/app/admin/privacy/PrivacyControls";
import { requireAal2AdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Requests | AIXCO.Global",
  robots: { index: false, follow: false },
};

type PrivacyPageProps = {
  searchParams?: Promise<{ deleted?: string; error?: string }>;
};

export default async function AdminPrivacyPage({ searchParams }: PrivacyPageProps) {
  const adminPrincipal = await requireAal2AdminSession();
  const params = searchParams ? await searchParams : {};
  const deletedCount = /^\d+$/.test(params.deleted ?? "")
    ? Number.parseInt(params.deleted ?? "", 10)
    : Number.NaN;
  const deletedLabel = Number.isSafeInteger(deletedCount) && deletedCount >= 0
    ? `${deletedCount.toLocaleString("en-US")} primary ${deletedCount === 1 ? "record" : "records"}`
    : null;

  return (
    <AdminShell adminEmail={adminPrincipal.email}>
      <main className="admin-safe-page admin-safe-page--dashboard bg-[#f8f6f1] px-4 py-5 text-[#161616] sm:px-7 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-7 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Privacy & admins</p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Privacy controls</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6e6a]">Export or erase subject data only after verifying the requester’s identity. Administrative access is managed separately below.</p>
          </header>

        {deletedLabel ? (
          <p role="status" className="mt-5 border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Deleted {deletedLabel} attributable to the exact email. Complete any required manual chat review separately.
          </p>
        ) : null}
        {params.error ? (
          <p role="alert" className="mt-5 border border-red-700/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
            The privacy operation could not be completed. Check the email and try again.
          </p>
        ) : null}

        <PrivacyControls />

        <section className="mt-5 flex flex-col gap-4 rounded-[12px] border border-[#161616]/10 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-[#f4eddd] text-primary">
              <UserRoundCog className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Administrative access</h2>
              <p className="mt-1 text-sm leading-6 text-[#6f6e6a]">Review named administrators and secure identity migration status.</p>
            </div>
          </div>
          <Link href="/admin/identity-migration" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[9px] bg-[#161616] px-4 text-sm font-semibold text-white transition-colors hover:bg-black">
            Manage admins
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
        </div>
      </main>
    </AdminShell>
  );
}
