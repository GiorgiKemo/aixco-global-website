import type { Metadata } from "next";
import { CheckCircle2, MailCheck, Send, TriangleAlert } from "lucide-react";
import { AdminShell } from "@/app/admin/_components";
import { requireAal2AdminSession } from "@/lib/admin/auth";
import { getLeadNotificationConfig } from "@/lib/backend/lead-notification-email";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Email Test | AIXCO.Global",
  robots: {
    index: false,
    follow: false,
  },
};

type EmailTestPageProps = {
  searchParams?: Promise<{
    status?: string | string[];
    error?: string | string[];
    detail?: string | string[];
    id?: string | string[];
  }>;
};

const DEFAULT_TEST_MESSAGE =
  "This is a delivery test from the AIXCO admin dashboard. If this message arrived, the website email notification path is working.";

function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(code: string | undefined, detail: string | undefined) {
  if (detail) return detail;
  if (code === "rate-limited") return "Too many test emails were requested. Wait 15 minutes and try again.";
  if (code === "config") return "The production email configuration is incomplete.";
  if (code === "send") return "Resend rejected the test email.";
  if (code === "invalid") return "Enter a valid reply email and a message of at least 10 characters.";
  return code ? "The test email could not be sent." : "";
}

export default async function EmailTestPage({ searchParams }: EmailTestPageProps) {
  const adminPrincipal = await requireAal2AdminSession();

  const params = searchParams ? await searchParams : {};
  const status = getQueryParam(params.status);
  const errorCode = getQueryParam(params.error);
  const detail = getQueryParam(params.detail);
  const messageId = getQueryParam(params.id);
  const config = getLeadNotificationConfig();
  const sendsToInfo = config.to.some((recipient) => recipient.toLowerCase() === "info@aixco.global");
  const ready = config.configured && sendsToInfo;
  const errorMessage = getErrorMessage(errorCode, detail);

  return (
    <AdminShell adminEmail={adminPrincipal.email}>
      <main data-admin-scrollbar="true" className="admin-safe-page admin-safe-page--dashboard bg-[#f8f6f1] px-4 py-5 text-[#161616] sm:px-7 sm:py-8 lg:px-10">
        <div className="mx-auto w-full max-w-4xl">
          <header className="mb-7 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Email delivery</p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Delivery controls</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6e6a]">Verify the configured notification path and send a controlled inbox test without creating a lead record.</p>
          </header>

        {status === "sent" && (
          <section className="mb-6 border border-emerald-700/20 bg-emerald-50 px-5 py-4 text-emerald-950" aria-live="polite">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold">Resend accepted the test email</h2>
                <p className="mt-1 text-sm leading-6">Check the inbox and spam folder for info@aixco.global.</p>
                {messageId && <p className="mt-2 break-all font-mono text-xs text-emerald-800">Message ID: {messageId}</p>}
              </div>
            </div>
          </section>
        )}

        {errorMessage && (
          <section className="mb-6 border border-red-700/20 bg-red-50 px-5 py-4 text-red-950" aria-live="assertive">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold">Email test failed</h2>
                <p className="mt-1 break-words text-sm leading-6">{errorMessage}</p>
              </div>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-[12px] border border-[#161616]/10 bg-white shadow-sm">
          <div className="border-b border-[#161616]/10 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <MailCheck className="h-5 w-5 text-[#8b6a18]" aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg font-semibold">Send inbox test</h2>
                <p className="mt-0.5 text-sm text-[#6f6e6a]">Recipient is fixed by the production notification configuration.</p>
              </div>
            </div>
          </div>

          <dl className="grid border-b border-[#161616]/10 bg-[#fbfaf7] text-sm sm:grid-cols-2">
            <div className="border-b border-[#161616]/10 px-5 py-4 sm:border-b-0 sm:border-r sm:px-6">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6a18]">From</dt>
              <dd className="mt-1 break-words text-[#161616]">{config.from || "Not configured"}</dd>
            </div>
            <div className="px-5 py-4 sm:px-6">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6a18]">To</dt>
              <dd className="mt-1 break-words text-[#161616]">{config.to.join(", ") || "Not configured"}</dd>
            </div>
          </dl>

          {!ready && (
            <div className="border-b border-amber-700/20 bg-amber-50 px-5 py-4 text-sm text-amber-950 sm:px-6">
              {config.missing.length > 0
                ? `Missing: ${config.missing.join(", ")}.`
                : "LEAD_NOTIFICATION_TO must include info@aixco.global before this test can run."}
            </div>
          )}

          <form action="/admin/email-test/send" method="post" className="grid gap-5 px-5 py-6 sm:px-6">
            <label className="grid gap-2 text-sm font-medium">
              Reply email
              <input
                type="email"
                name="replyTo"
                maxLength={255}
                autoComplete="email"
                placeholder="Optional"
                className="h-11 rounded-md border border-[#161616]/15 bg-white px-3 text-base outline-none transition-colors placeholder:text-[#9e9d9d] focus:border-[#8b6a18]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Test message
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={1500}
                rows={6}
                defaultValue={DEFAULT_TEST_MESSAGE}
                className="min-h-36 resize-y rounded-md border border-[#161616]/15 bg-white px-3 py-3 text-base leading-6 outline-none transition-colors focus:border-[#8b6a18]"
              />
            </label>

            <div className="flex flex-col gap-3 border-t border-[#161616]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[#6f6e6a]">No lead record is created by this test.</p>
              <button
                type="submit"
                disabled={!ready}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#161616] px-4 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#c7c5bf]"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Send test email
              </button>
            </div>
          </form>
        </section>
        </div>
      </main>
    </AdminShell>
  );
}
