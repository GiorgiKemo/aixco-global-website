import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  BarChart3,
  DatabaseZap,
  ListChecks,
  LogOut,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { AnalyticsDashboard, OperationsOverview } from "./AnalyticsDashboard";
import type { DashboardFocus } from "./AnalyticsDashboard";
import { auditAdminAction } from "@/lib/admin/audit";
import { requireAal2AdminSession } from "@/lib/admin/auth";
import {
  ANALYTICS_RANGE_OPTIONS,
  fetchAdminAnalyticsDashboard,
  fetchAdminOperationsSnapshot,
  parseAnalyticsRange,
} from "@/lib/admin/analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Analytics | AIXCO.Global",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminAnalyticsPageProps = {
  searchParams?: Promise<{ range?: string | string[]; focus?: string | string[] }>;
};

function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDashboardFocus(value: string | undefined): DashboardFocus {
  return value === "operations" || value === "traffic" || value === "journey" || value === "sessions" || value === "reliability"
    ? value
    : "overview";
}

const headerLinkClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#161616]/10 bg-white px-3 text-xs font-semibold text-[#161616] transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const adminPrincipal = await requireAal2AdminSession();
  const params = searchParams ? await searchParams : {};
  const range = parseAnalyticsRange(getQueryParam(params.range));
  const focus = parseDashboardFocus(getQueryParam(params.focus));
  const requestHeaders = await headers();
  await auditAdminAction({
    action: "admin.analytics.view",
    actor: adminPrincipal,
    outcome: "success",
    target: "website-analytics",
    details: { range },
    headers: requestHeaders,
  }, { required: true });
  const [result, operations] = await Promise.all([
    fetchAdminAnalyticsDashboard(range),
    fetchAdminOperationsSnapshot(),
  ]);

  return (
    <main data-admin-scrollbar="true" className="admin-safe-page admin-safe-page--dashboard min-h-screen bg-[#f6f4ef] px-4 py-4 text-[#161616] sm:px-6 sm:py-8">
      <div className="mx-auto w-full" style={{ maxWidth: "1500px" }}>
        <header className="sticky top-3 z-20 mb-6 rounded-2xl border border-[#161616]/10 bg-white/95 px-5 py-5 text-[#161616] shadow-sm backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">AIXCO Admin</p>
              <h1 className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">Website analytics</h1>
              <p className="mt-1 text-xs leading-5 text-[#6f6e6a]">
                First-party production activity · {adminPrincipal.email ?? "temporary migration access"}
              </p>
            </div>
            <nav aria-label="Admin tools" className="flex flex-wrap items-center gap-2">
              <Link href="/admin/leads" className={headerLinkClass}>
                <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                Lead center
              </Link>
              <Link href="/admin/email-test" className={headerLinkClass}>
                <MailCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Test email
              </Link>
              <Link href="/admin/privacy" className={headerLinkClass}>
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Privacy requests
              </Link>
              <Link href="/admin/identity-migration" className={headerLinkClass}>
                <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                Admin identities
              </Link>
              <form action="/admin/logout" method="post">
                <button type="submit" className={headerLinkClass}>
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </nav>
          </div>
        </header>

        <section className="mb-8 rounded-xl border border-[#161616]/10 bg-white p-4 shadow-sm sm:p-5" aria-label="Analytics controls">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-primary">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Reporting window</h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#6f6e6a]">
                  All cards, charts, session rows, errors, and audit records use one bounded UTC window. Refreshing never expands beyond the selected range.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap rounded-lg border border-[#161616]/10 bg-background p-1" aria-label="Select reporting window">
                {ANALYTICS_RANGE_OPTIONS.map((option) => {
                  const active = option.value === range;
                  return (
                    <Link
                      key={option.value}
                      href={`/admin/analytics?range=${option.value}&focus=${focus}`}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-10 items-center rounded-md px-3 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${active ? "bg-[#161616] text-white shadow-sm" : "text-muted-foreground hover:bg-white hover:text-[#161616]"}`}
                    >
                      {option.value === "24h" ? "24 hours" : option.value}
                    </Link>
                  );
                })}
              </div>
              <Link
                href={`/admin/analytics?range=${range}&focus=${focus}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#161616]/10 bg-white px-3 text-xs font-semibold text-[#161616] transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Refresh
              </Link>
            </div>
          </div>
        </section>

        {result.ok ? (
          <AnalyticsDashboard data={result.data} operations={operations} focus={focus} range={range} />
        ) : (
          <div className="space-y-8">
            <section className="rounded-xl border border-amber-800/20 bg-white p-6 shadow-sm sm:p-8" aria-live="polite">
              <div className="flex max-w-3xl items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-800">
                  <DatabaseZap className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Source unavailable</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">Analytics is not ready</h2>
                  <p className="mt-3 text-sm leading-6 text-[#6f6e6a]">{result.reason}</p>
                  {result.missing?.length ? (
                    <ul className="mt-4 space-y-2 text-xs">
                      {result.missing.map((item) => (
                        <li key={item} className="rounded-lg bg-[#f6f4ef] px-3 py-2 font-mono text-xs text-foreground">{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-5 inline-flex items-start gap-2 rounded-lg bg-[#f6f4ef] px-3 py-2 text-xs leading-5 text-[#55534f]">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    No placeholder or estimated metrics are shown when the production source cannot be verified.
                  </p>
                </div>
              </div>
            </section>
            <OperationsOverview result={operations} windowPortalHandoffs={null} />
          </div>
        )}
      </div>
    </main>
  );
}
