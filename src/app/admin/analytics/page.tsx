import type { Metadata } from "next";
import { headers } from "next/headers";
import { after } from "next/server";
import Link from "next/link";
import {
  BarChart3,
  DatabaseZap,
  ShieldCheck,
} from "lucide-react";
import { AdminShell } from "@/app/admin/_components";
import { AnalyticsDashboard, OperationsOverview } from "./AnalyticsDashboard";
import type { DashboardFocus } from "./AnalyticsDashboard";
import { AnalyticsRangeControls } from "./AnalyticsRangeControls";
import {
  createAnalyticsPaginationState,
  parseAnalyticsPage,
} from "./pagination";
import type { AnalyticsPaginationPages } from "./pagination";
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
  searchParams?: Promise<{
    range?: string | string[];
    focus?: string | string[];
    sessionsPage?: string | string[];
    errorsPage?: string | string[];
    auditPage?: string | string[];
  }>;
};

function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDashboardFocus(value: string | undefined): DashboardFocus {
  return value === "operations" || value === "traffic" || value === "journey" || value === "sessions" || value === "reliability"
    ? value
    : "overview";
}

const analyticsFocusLinks = [
  { focus: "overview", label: "Overview" },
  { focus: "traffic", label: "Traffic" },
  { focus: "journey", label: "Conversion" },
] as const;

const pageCopy: Record<DashboardFocus, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "Website analytics",
    title: "Website performance",
    description: "First-party traffic, engagement, and confirmed contact activity in one focused view.",
  },
  traffic: {
    eyebrow: "Website analytics",
    title: "Traffic and acquisition",
    description: "Understand where visitors arrive from and which pages contribute to meaningful activity.",
  },
  journey: {
    eyebrow: "Website analytics",
    title: "Conversion journey",
    description: "Review the steps from a visit to a backend-confirmed contact request.",
  },
  sessions: {
    eyebrow: "Visitor sessions",
    title: "Recent visitor journeys",
    description: "Inspect bounded session records with device, location, and interaction context.",
  },
  reliability: {
    eyebrow: "Errors & security",
    title: "Reliability and admin activity",
    description: "Review recent application errors and verified administrative actions.",
  },
  operations: {
    eyebrow: "Operations",
    title: "Lead and portal activity",
    description: "Review retained operational totals without mixing them into website analytics.",
  },
};

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const adminPrincipal = await requireAal2AdminSession();
  const params = searchParams ? await searchParams : {};
  const range = parseAnalyticsRange(getQueryParam(params.range));
  const focus = parseDashboardFocus(getQueryParam(params.focus));
  const requestedPages: AnalyticsPaginationPages = {
    sessions: parseAnalyticsPage(params.sessionsPage),
    errors: parseAnalyticsPage(params.errorsPage),
    audit: parseAnalyticsPage(params.auditPage),
  };
  const requestHeaders = await headers();
  after(() => auditAdminAction({
    action: "admin.analytics.view",
    actor: adminPrincipal,
    outcome: "success",
    target: "website-analytics",
    details: { range, focus },
    headers: requestHeaders,
  }));
  const [result, operations] = await Promise.all([
    fetchAdminAnalyticsDashboard(range),
    focus === "operations"
      ? fetchAdminOperationsSnapshot()
      : Promise.resolve({ ok: false as const, reason: "Operational totals were not requested for this view." }),
  ]);
  const pagination = result.ok ? createAnalyticsPaginationState({
    totals: {
      sessions: result.data.recentSessions?.length ?? 0,
      errors: result.data.recentErrors?.length ?? 0,
      audit: result.data.auditEvents?.length ?? 0,
    },
    requestedPages,
  }) : null;
  const copy = pageCopy[focus];
  const showAnalyticsTabs = focus === "overview" || focus === "traffic" || focus === "journey";

  return (
    <AdminShell adminEmail={adminPrincipal.email}>
      <main data-admin-scrollbar="true" className="admin-safe-page admin-safe-page--dashboard bg-[#f8f6f1] px-4 py-5 text-[#161616] sm:px-7 sm:py-8 lg:px-10">
        <div className="mx-auto w-full max-w-[1280px]">
          <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">{copy.eyebrow}</p>
              <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{copy.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6e6a]">{copy.description}</p>
            </div>
            {showAnalyticsTabs ? (
              <nav aria-label="Website analytics views" className="flex w-fit rounded-[10px] border border-[#161616]/10 bg-white p-1 shadow-sm">
                {analyticsFocusLinks.map((item) => {
                  const active = item.focus === focus;
                  return (
                    <Link
                      key={item.focus}
                      href={`/admin/analytics?range=${range}&focus=${item.focus}`}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center justify-center rounded-[7px] px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] ${active ? "bg-[#161616] text-white" : "text-[#6f6e6a] hover:bg-[#f8f6f1] hover:text-[#161616]"}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </header>

          <section className="mb-6 rounded-[12px] border border-[#161616]/10 bg-white p-4 shadow-sm sm:p-5" aria-label="Analytics controls">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#f4eddd] text-primary">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">Reporting window</h2>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-[#6f6e6a]">All information uses one bounded UTC reporting window.</p>
                </div>
              </div>
              <AnalyticsRangeControls
                focus={focus}
                range={range}
                options={ANALYTICS_RANGE_OPTIONS.map((option) => ({
                  label: option.value === "24h" ? "24 hours" : option.value,
                  value: option.value,
                }))}
              />
            </div>
          </section>

          {result.ok ? (
            <AnalyticsDashboard
              data={result.data}
              operations={operations}
              focus={focus}
              range={range}
              pagination={pagination!}
            />
          ) : (
            <div className="space-y-6">
              <section className="rounded-[12px] border border-amber-800/20 bg-white p-6 shadow-sm sm:p-8" aria-live="polite">
                <div className="flex max-w-3xl items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-amber-50 text-amber-800">
                    <DatabaseZap className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Source unavailable</p>
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
                    <Link
                      href={`/admin/analytics?range=${range}&focus=${focus}`}
                      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[9px] bg-[#161616] px-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]"
                    >
                      Retry analytics
                    </Link>
                  </div>
                </div>
              </section>
              {focus === "operations" ? <OperationsOverview result={operations} windowPortalHandoffs={null} /> : null}
            </div>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
