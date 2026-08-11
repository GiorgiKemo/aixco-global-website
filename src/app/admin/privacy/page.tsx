import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, Trash2, UserRoundCog } from "lucide-react";
import { AdminShell } from "@/app/admin/_components";
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

  return (
    <AdminShell adminEmail={adminPrincipal.email}>
      <main className="admin-safe-page admin-safe-page--dashboard bg-[#f8f6f1] px-4 py-5 text-[#161616] sm:px-7 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-7 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Privacy & admins</p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Privacy controls</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6e6a]">Export or erase subject data only after verifying the requester’s identity. Administrative access is managed separately below.</p>
          </header>

        {params.deleted ? (
          <p role="status" className="mt-5 border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Deleted {params.deleted} matching subject record(s).
          </p>
        ) : null}
        {params.error ? (
          <p role="alert" className="mt-5 border border-red-700/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
            The privacy operation could not be completed. Check the email and try again.
          </p>
        ) : null}

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <form action="/admin/privacy/export" method="post" className="rounded-[12px] border border-[#161616]/10 bg-white p-6 shadow-sm">
            <Download className="h-5 w-5 text-[#8b6a18]" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-bold">Export subject data</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6e6a]">Creates a paginated JSON export of matching forms, delivery events, short-lived abuse-control records, and chats containing the verified address.</p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Verified email address
              <input name="email" type="email" required maxLength={255} className="h-11 border border-[#161616]/20 px-3 text-base font-normal" />
            </label>
            <button type="submit" className="mt-5 inline-flex min-h-11 items-center justify-center bg-[#161616] px-4 text-sm font-semibold text-white">
              Download export
            </button>
          </form>

          <form action="/admin/privacy/delete" method="post" className="rounded-[12px] border border-red-900/15 bg-white p-6 shadow-sm">
            <Trash2 className="h-5 w-5 text-red-800" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-bold">Erase subject data</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6e6a]">Permanently deletes matching submissions, delivery records, abuse-control records, and chats containing the verified address.</p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Verified email address
              <input name="email" type="email" required maxLength={255} className="h-11 border border-[#161616]/20 px-3 text-base font-normal" />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Type DELETE to confirm
              <input name="confirmation" required pattern="DELETE" className="h-11 border border-[#161616]/20 px-3 text-base font-normal" />
            </label>
            <button type="submit" className="mt-5 inline-flex min-h-11 items-center justify-center bg-red-900 px-4 text-sm font-semibold text-white">
              Permanently erase data
            </button>
          </form>
        </section>

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
