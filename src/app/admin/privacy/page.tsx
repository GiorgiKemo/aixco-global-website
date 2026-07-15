import type { Metadata } from "next";
import Link from "next/link";
import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { requireAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Requests | AIXCO.Global",
  robots: { index: false, follow: false },
};

type PrivacyPageProps = {
  searchParams?: Promise<{ deleted?: string; error?: string }>;
};

export default async function AdminPrivacyPage({ searchParams }: PrivacyPageProps) {
  await requireAdminSession();
  const params = searchParams ? await searchParams : {};

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-4 py-8 text-[#161616] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/leads" className="text-sm font-semibold text-[#6f5112] underline-offset-4 hover:underline">
          Back to lead center
        </Link>
        <header className="mt-5 border border-[#161616]/10 bg-[#161616] px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[#e6c767]" aria-hidden="true" />
            <div>
              <h1 className="font-display text-2xl font-bold">Privacy requests</h1>
              <p className="mt-1 text-sm text-white/70">Export or erase contact-form data after verifying the requester’s identity.</p>
            </div>
          </div>
        </header>

        {params.deleted ? (
          <p role="status" className="mt-5 border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Deleted {params.deleted} matching contact submission(s).
          </p>
        ) : null}
        {params.error ? (
          <p role="alert" className="mt-5 border border-red-700/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
            The privacy operation could not be completed. Check the email and try again.
          </p>
        ) : null}

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <form action="/admin/privacy/export" method="post" className="border border-[#161616]/10 bg-white p-6">
            <Download className="h-5 w-5 text-[#8b6a18]" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-bold">Export subject data</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6e6a]">Creates a JSON export of every matching contact submission.</p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Verified email address
              <input name="email" type="email" required maxLength={255} className="h-11 border border-[#161616]/20 px-3 font-normal" />
            </label>
            <button type="submit" className="mt-5 inline-flex h-10 items-center justify-center bg-[#161616] px-4 text-sm font-semibold text-white">
              Download export
            </button>
          </form>

          <form action="/admin/privacy/delete" method="post" className="border border-red-900/15 bg-white p-6">
            <Trash2 className="h-5 w-5 text-red-800" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-bold">Erase subject data</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6e6a]">Permanently deletes matching submissions and their email-delivery records.</p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Verified email address
              <input name="email" type="email" required maxLength={255} className="h-11 border border-[#161616]/20 px-3 font-normal" />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Type DELETE to confirm
              <input name="confirmation" required pattern="DELETE" className="h-11 border border-[#161616]/20 px-3 font-normal" />
            </label>
            <button type="submit" className="mt-5 inline-flex h-10 items-center justify-center bg-red-900 px-4 text-sm font-semibold text-white">
              Permanently erase data
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
