import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Eye,
  FileCheck2,
  Globe2,
  Inbox,
  Mail,
  MessageCircle,
  MousePointerClick,
  ShieldCheck,
  Users,
} from "lucide-react";
import type {
  AdminAnalyticsDashboard,
  AdminOperationsSnapshotResult,
  AnalyticsBreakdownItem,
  AnalyticsDailyPoint,
  AnalyticsFunnelStep,
} from "@/lib/admin/analytics";

const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});
const shortDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const journeyTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
});

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatPercent(value: number) {
  return `${numberFormatter.format(value)}%`;
}

function formatDuration(value: number) {
  const seconds = Math.max(0, Math.round(value));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function formatAuditDetail(value: string | number | boolean | null) {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function getConversionRate(converted: number, sessions: number) {
  return sessions > 0 ? (converted / sessions) * 100 : 0;
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "dark",
  onClick,
  active = false,
  ariaControls,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Users;
  tone?: "dark" | "gold" | "light";
  onClick?: () => void;
  active?: boolean;
  ariaControls?: string;
}) {
  const toneClass = tone === "dark"
    ? "border-[#161616] bg-[#161616] text-white"
    : tone === "gold"
      ? "border-primary bg-primary text-white"
      : "border-[#161616]/10 bg-white text-[#161616]";
  const mutedClass = tone === "light" ? "text-[#6f6e6a]" : "text-white/65";

  const className = `group w-full rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 ${toneClass} ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" : ""} ${active ? "ring-2 ring-primary ring-offset-2" : ""}`;

  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${mutedClass}`}>{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl transition-transform group-hover:scale-105 ${tone === "light" ? "bg-background text-primary" : "bg-white/10 text-white"}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-tight">{value}</p>
      <p className={`mt-3 text-xs leading-5 ${mutedClass}`}>{note}</p>
    </>
  );

  return onClick ? (
    <button type="button" className={className} style={{ minHeight: "10rem" }} onClick={onClick} aria-pressed={active} aria-controls={ariaControls}>
      {content}
    </button>
  ) : (
    <article className={className} style={{ minHeight: "10rem" }}>{content}</article>
  );
}

export type DashboardFocus = "overview" | "operations" | "traffic" | "journey" | "sessions" | "reliability";

const focusCopy: Record<DashboardFocus, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "At a glance",
    title: "Website performance",
    description: "A compact read of the selected reporting window. Choose another card to open its focused workspace.",
  },
  operations: {
    eyebrow: "Applications & operations",
    title: "Lead and portal activity",
    description: "Contact, chat, queue, qualification, and outbound portal records retained by the site.",
  },
  traffic: {
    eyebrow: "Movement & acquisition",
    title: "How visitors arrive and move",
    description: "Daily activity and the pages, referrers, countries, and devices contributing to it.",
  },
  journey: {
    eyebrow: "Journey",
    title: "Conversion funnel",
    description: "Intent signals are kept separate from confirmed contact requests and completed applications.",
  },
  sessions: {
    eyebrow: "Live operations",
    title: "Recent visitor sessions",
    description: "A bounded, admin-only session view with journey, device, location, and network context.",
  },
  reliability: {
    eyebrow: "Reliability & security",
    title: "Errors and admin activity",
    description: "Review recent application errors and the durable audit trail for sensitive admin actions.",
  },
};

function FocusCard({
  title,
  value,
  note,
  icon: Icon,
  active,
  href,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof Users;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${active ? "border-primary ring-2 ring-primary/20" : "border-[#161616]/10"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">{title}</p>
          <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#161616]">{value}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-background text-primary transition-transform group-hover:scale-105">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#6f6e6a]">{note}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
        {active ? "Viewing details" : "Open details"}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function SectionHeader({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.035em] text-[#161616] sm:text-3xl">{title}</h2>
      </div>
      {detail ? <p className="max-w-xl text-xs leading-5 text-[#6f6e6a] sm:text-right">{detail}</p> : null}
    </div>
  );
}

function TrendChart({ points }: { points: AnalyticsDailyPoint[] | null }) {
  if (points === null) {
    return <UnavailablePanel label="Trend data could not be loaded from the analytics source." />;
  }
  if (!points.length) {
    return <PanelEmpty label="No daily activity has been recorded in this window." />;
  }

  const width = 900;
  const height = 260;
  const insetX = 24;
  const insetTop = 22;
  const insetBottom = 38;
  const plotHeight = height - insetTop - insetBottom;
  const maximum = Math.max(1, ...points.flatMap((point) => [point.pageViews, point.sessions]));
  const xFor = (index: number) => points.length === 1
    ? width / 2
    : insetX + index * ((width - insetX * 2) / (points.length - 1));
  const yFor = (value: number) => insetTop + plotHeight - (value / maximum) * plotHeight;
  const sessionPoints = points.map((point, index) => `${xFor(index)},${yFor(point.sessions)}`).join(" ");
  const pageViewPoints = points.map((point, index) => `${xFor(index)},${yFor(point.pageViews)}`).join(" ");
  const labelIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return (
    <div className="overflow-hidden rounded-xl border border-[#161616]/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6f6e6a]">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#161616]" />Sessions</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Page views</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily sessions and page views" className="h-auto w-full overflow-visible">
        {[0, 0.5, 1].map((ratio) => {
          const y = insetTop + plotHeight * ratio;
          return <line key={ratio} x1={insetX} x2={width - insetX} y1={y} y2={y} stroke="rgba(22,22,22,.09)" strokeWidth="1" />;
        })}
        <polyline points={pageViewPoints} fill="none" stroke="#b7923a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={sessionPoints} fill="none" stroke="#161616" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {points.length === 1 ? (
          <>
            <circle cx={width / 2} cy={yFor(points[0].pageViews)} r="7" fill="#b7923a" />
            <circle cx={width / 2} cy={yFor(points[0].sessions)} r="7" fill="#161616" />
          </>
        ) : null}
        {labelIndexes.map((index) => (
          <text key={index} x={xFor(index)} y={height - 8} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} fill="#6f6e6a" fontSize="14">
            {formatShortDate(points[index].date)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function BreakdownBars({ items, emptyLabel }: { items: AnalyticsBreakdownItem[]; emptyLabel: string }) {
  if (!items.length) return <PanelEmpty label={emptyLabel} compact />;
  const maximum = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-start justify-between gap-4 text-xs">
            <span className="min-w-0 break-words font-medium text-foreground">{item.label}</span>
            <span className="shrink-0 font-semibold text-[#161616]">{formatNumber(item.count)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#161616]/7">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(3, (item.count / maximum) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BreakdownCard({ title, items, emptyLabel }: { title: string; items: AnalyticsBreakdownItem[]; emptyLabel: string }) {
  return (
    <article className="rounded-xl border border-[#161616]/10 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-5 font-display text-lg font-semibold tracking-[-0.02em] text-[#161616]">{title}</h3>
      <BreakdownBars items={items} emptyLabel={emptyLabel} />
    </article>
  );
}

function Funnel({ steps }: { steps: AnalyticsFunnelStep[] }) {
  if (!steps.length) return <PanelEmpty label="No funnel activity has been recorded in this window." />;
  const maximum = Math.max(1, steps[0]?.count ?? 0, ...steps.map((step) => step.count));

  return (
    <div className="grid gap-3 lg:grid-cols-4">
      {steps.map((step, index) => (
        <article key={`${step.label}-${index}`} className="relative overflow-hidden rounded-xl border border-[#161616]/10 bg-white p-5 shadow-sm">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#161616]/5">
            <div className="h-full bg-primary" style={{ width: `${(step.count / maximum) * 100}%` }} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-background text-[10px] font-bold text-primary">{index + 1}</span>
            {step.ratePercent !== null ? <span className="text-[10px] font-semibold text-[#6f6e6a]">{formatPercent(step.ratePercent)}</span> : null}
          </div>
          <p className="mt-5 font-display text-3xl font-semibold tracking-tight text-[#161616]">{formatNumber(step.count)}</p>
          <p className="mt-2 text-xs leading-5 text-[#6f6e6a]">{step.label}</p>
        </article>
      ))}
    </div>
  );
}

function PanelEmpty({ label, compact = false }: { label: string; compact?: boolean }) {
  return <div className="grid place-items-center rounded-xl border border-dashed border-[#161616]/15 bg-background px-5 text-center text-xs leading-5 text-muted-foreground" style={{ minHeight: compact ? "7rem" : "12rem" }}>{label}</div>;
}

function UnavailablePanel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-amber-800/20 bg-amber-50 px-6 text-center text-sm leading-6 text-amber-950" style={{ minHeight: "12rem" }}>
      <AlertTriangle className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </div>
  );
}

function OperationStat({ label, value, note, icon: Icon }: { label: string; value: number; note: string; icon: typeof Users }) {
  return (
    <article className="rounded-xl border border-[#161616]/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#161616]">{formatNumber(value)}</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-background text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#6f6e6a]">{note}</p>
    </article>
  );
}

export function OperationsOverview({
  result,
  windowPortalHandoffs,
}: {
  result: AdminOperationsSnapshotResult;
  windowPortalHandoffs: number | null;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Applications & operations"
        title="Lead and portal activity"
        detail="These are currently retained operational records: contacts up to 730 days, chats 365 days, and portal handoffs 180 days. Portal handoffs are outbound website clicks, not completed portal applications."
      />
      {result.ok ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <OperationStat label="Contact requests" value={result.data.totalContacts} note={`${formatNumber(result.data.newContacts)} currently new`} icon={Mail} />
            <OperationStat label="Chat conversations" value={result.data.totalChats} note={`${formatNumber(result.data.newChats)} currently new`} icon={MessageCircle} />
            <OperationStat label="Open queue" value={result.data.newContacts + result.data.newChats} note="New contacts and chats awaiting follow-up" icon={Inbox} />
            <OperationStat label="Qualified records" value={result.data.qualifiedContacts + result.data.qualifiedChats} note="Qualified contacts and chat leads" icon={FileCheck2} />
            <OperationStat
              label="Portal handoffs"
              value={windowPortalHandoffs ?? result.data.totalPortalHandoffs}
              note={windowPortalHandoffs === null
                ? "Retained outbound clicks; selected-window analytics unavailable"
                : `Selected window · ${formatNumber(result.data.totalPortalHandoffs)} currently retained`}
              icon={MousePointerClick}
            />
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-800/20 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p><strong>WorkW completion telemetry is not connected.</strong> Successful portal logins, profile/onboarding status, and completed applications cannot be verified until WorkW provides a signed webhook or API integration.</p>
          </div>
        </>
      ) : (
        <UnavailablePanel label={`Operational lead totals could not be loaded. ${result.reason}`} />
      )}
    </section>
  );
}

function RecentSessions({ data }: { data: AdminAnalyticsDashboard["recentSessions"] }) {
  if (data === null) return <UnavailablePanel label="Recent sessions could not be loaded from the analytics source." />;
  if (!data.length) return <PanelEmpty label="No sessions have been recorded in this window." />;

  return (
    <div className="overflow-hidden rounded-xl border border-[#161616]/10 bg-white shadow-sm">
      <div className="overflow-x-auto" role="region" tabIndex={0} aria-label="Recent analytics sessions table">
        <table className="w-full border-collapse text-left text-xs" style={{ minWidth: "1120px" }}>
          <thead className="bg-background text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Timing</th>
              <th scope="col" className="px-5 py-3 font-semibold">Journey</th>
              <th scope="col" className="px-5 py-3 font-semibold">Engagement</th>
              <th scope="col" className="px-5 py-3 font-semibold">Location / device</th>
              <th scope="col" className="px-5 py-3 font-semibold">Network</th>
              <th scope="col" className="px-5 py-3 font-semibold">Visitor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((session) => (
              <tr key={session.id} className="align-top transition-colors hover:bg-background">
                <td className="px-5 py-4 font-medium text-[#161616]">
                  <time dateTime={session.startedAt}>{formatDateTime(session.startedAt)}</time>
                  <p className="mt-1 text-[10px] text-muted-foreground">Last seen {formatDateTime(session.lastSeenAt)}</p>
                  {session.endedAt ? <p className="mt-1 text-[10px] text-muted-foreground">Ended {formatDateTime(session.endedAt)}</p> : null}
                  <p className="mt-1 font-mono text-[10px] text-[#9e9d9d]">{session.id.slice(0, 12)}</p>
                </td>
                <td className="max-w-64 px-5 py-4 text-[#55534f]">
                  <p className="break-all font-semibold text-[#161616]">{session.landingPage}</p>
                  <p className="mt-1 truncate">Exit: {session.exitPage ?? "active / unknown"}</p>
                  <p className="mt-1 truncate">From: {session.referrer ?? "direct"}</p>
                  {session.journey.length ? (
                    <details className="group mt-3 rounded-lg border border-[#161616]/10 bg-background px-3 py-2">
                      <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-widest text-primary">
                        View journey · {session.journey.length} events
                      </summary>
                      <ol className="mt-2 space-y-2 overflow-y-auto border-l border-primary/25 pl-3" style={{ maxHeight: "16rem" }}>
                        {session.journey.map((event) => (
                          <li key={event.id} className="relative text-[10px] leading-4 text-[#6f6e6a]">
                            <span className="absolute top-1.5 h-1.5 w-1.5 rounded-full bg-primary" style={{ left: "-0.94rem" }} aria-hidden="true" />
                            <div className="flex items-start justify-between gap-2">
                              <strong className="font-semibold text-[#161616]">{event.name.replaceAll("_", " ")}</strong>
                              <time dateTime={event.occurredAt} className="shrink-0 text-[#9e9d9d]">
                                {journeyTimeFormatter.format(new Date(event.occurredAt))}
                              </time>
                            </div>
                            <p className="break-all">
                              {[event.pagePath, event.sectionId, event.targetLabel].filter(Boolean).join(" · ") || event.type}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </details>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-[#55534f]">
                  <p>{formatDuration(session.activeSeconds)} active</p>
                  <p className="mt-1">{formatNumber(session.pageViews)} pages · {formatNumber(session.events)} events</p>
                </td>
                <td className="px-5 py-4 text-[#55534f]">
                  <p>{[session.city, session.region, session.country].filter(Boolean).join(", ") || "Unknown location"}</p>
                  <p className="mt-1">{[session.device, session.browser, session.operatingSystem].filter(Boolean).join(" · ") || "Unknown device"}</p>
                  {session.locale || session.timezone ? <p className="mt-1">{[session.locale, session.timezone].filter(Boolean).join(" · ")}</p> : null}
                  {session.viewportWidth && session.viewportHeight ? <p className="mt-1">{session.viewportWidth}×{session.viewportHeight} viewport</p> : null}
                </td>
                <td className="px-5 py-4 font-mono text-[11px] text-foreground">
                  <p>{session.ipAddress ?? "Raw IP expired / unavailable"}</p>
                  {session.ipHash ? <p className="mt-1 text-[10px] text-[#9e9d9d]">hash:{session.ipHash.slice(0, 16)}</p> : null}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${session.isReturning ? "bg-background text-primary" : "bg-emerald-100 text-emerald-900"}`}>
                    {session.isReturning ? "Returning visitor" : "New visitor"}
                  </span>
                  {session.visitorId ? <p className="mt-2 font-mono text-[10px] text-[#9e9d9d]">visitor:{session.visitorId.slice(0, 12)}</p> : null}
                  {session.userAgent ? <p className="mt-2 max-w-56 truncate text-[10px] font-normal text-muted-foreground" title={session.userAgent}>{session.userAgent}</p> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[#161616]/10 bg-background px-5 py-3 text-[10px] leading-4 text-muted-foreground">
        Raw network addresses are admin-only and subject to short retention; a one-way hash remains for abuse and session correlation.
      </p>
    </div>
  );
}

function ErrorsAndAudit({ data }: { data: AdminAnalyticsDashboard }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section>
        <SectionHeader eyebrow="Reliability" title="Recent errors" />
        {data.recentErrors === null ? <UnavailablePanel label="Recent errors could not be loaded." /> : data.recentErrors.length ? (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-[#161616]/10 bg-white shadow-sm">
            {data.recentErrors.map((error) => (
              <article key={error.id} className="flex items-start gap-4 px-5 py-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-50 text-red-700"><AlertTriangle className="h-4 w-4" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-words text-sm font-semibold text-[#161616]">{error.name}</p>
                    <time dateTime={error.occurredAt} className="text-[10px] text-[#9e9d9d]">{formatDateTime(error.occurredAt)}</time>
                  </div>
                  <p className="mt-1 truncate text-xs text-[#6f6e6a]">{error.pagePath ?? "Unknown page"}{error.sectionId ? ` · ${error.sectionId}` : ""}</p>
                  {error.targetLabel || error.eventType ? <p className="mt-1 truncate text-[10px] text-muted-foreground">{[error.eventType, error.targetLabel].filter(Boolean).join(" · ")}</p> : null}
                  {error.sessionId ? <p className="mt-1 truncate font-mono text-[10px] text-[#9e9d9d]">session:{error.sessionId}</p> : null}
                  {error.fingerprint ? <p className="mt-1 truncate font-mono text-[10px] text-[#9e9d9d]">fingerprint:{error.fingerprint}</p> : null}
                  {error.message ? <p className="mt-2 line-clamp-2 break-words font-mono text-[10px] leading-4 text-[#55534f]">{error.message}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : <PanelEmpty label="No application errors were recorded in this window." />}
      </section>

      <section>
        <SectionHeader eyebrow="Security" title="Admin audit trail" />
        {data.auditEvents === null ? <UnavailablePanel label="Admin audit history could not be loaded." /> : data.auditEvents.length ? (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-[#161616]/10 bg-white shadow-sm">
            {data.auditEvents.map((event) => (
              <article key={event.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words text-sm font-semibold text-[#161616]">{event.action}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${event.outcome === "success" ? "bg-emerald-100 text-emerald-900" : event.outcome === "denied" ? "bg-amber-100 text-amber-950" : "bg-red-100 text-red-900"}`}>{event.outcome}</span>
                    {event.provenance === "client-reported-unverified" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-950">
                        Unverified client signal
                      </span>
                    ) : null}
                  </div>
                  {event.provenance === "client-reported-unverified" ? (
                    <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[10px] leading-4 text-amber-950">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                      Client-reported sign-in failure; this was not verified by the authentication provider.
                    </p>
                  ) : null}
                  <p className="mt-1 truncate text-xs text-[#6f6e6a]">Actor: {event.actorId} · {event.authentication}</p>
                  {event.actorEmailHash ? <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">actor-hash:{event.actorEmailHash}</p> : null}
                  {event.targetType || event.targetId ? <p className="mt-1 truncate text-[10px] text-muted-foreground">Target: {[event.targetType, event.targetId].filter(Boolean).join(":")}</p> : null}
                  <p className="mt-1 truncate font-mono text-[10px] text-[#9e9d9d]">{event.ipAddress ?? (event.ipHash ? `hash:${event.ipHash.slice(0, 12)}` : "network unavailable")}</p>
                  {event.requestId ? <p className="mt-1 truncate font-mono text-[10px] text-[#9e9d9d]">request:{event.requestId}</p> : null}
                  {Object.keys(event.details).length ? (
                    <dl className="mt-3 grid gap-x-4 gap-y-1 rounded-lg border border-[#161616]/10 bg-background px-3 py-2 text-[10px] leading-4 sm:grid-cols-2">
                      {Object.entries(event.details).map(([key, value]) => (
                        <div key={key} className="min-w-0">
                          <dt className="font-semibold text-[#6f6e6a]">{key}</dt>
                          <dd className="break-words font-mono text-foreground">{formatAuditDetail(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
                <time dateTime={event.occurredAt} className="text-[10px] text-[#9e9d9d]">{formatDateTime(event.occurredAt)}</time>
              </article>
            ))}
          </div>
        ) : <PanelEmpty label="No admin actions were recorded in this window." />}
      </section>
    </div>
  );
}

export function AnalyticsDashboard({
  data,
  operations,
  focus,
  range,
}: {
  data: AdminAnalyticsDashboard;
  operations: AdminOperationsSnapshotResult;
  focus: DashboardFocus;
  range: string;
}) {
  const { summary } = data;
  const conversionRate = getConversionRate(summary.convertedSessions, summary.sessions);
  const pageDepth = summary.sessions > 0 ? summary.pageViews / summary.sessions : 0;
  const engagedRate = summary.sessions > 0 ? (summary.engagedSessions / summary.sessions) * 100 : 0;
  const focusDetails = focusCopy[focus];
  const focusCards: Array<{ key: DashboardFocus; title: string; value: string; note: string; icon: typeof Users }> = [
    { key: "overview", title: "Overview", value: formatNumber(summary.sessions), note: `${formatNumber(summary.visitors)} unique visitors · ${formatPercent(engagedRate)} engaged`, icon: Users },
    { key: "operations", title: "Operations", value: operations.ok ? formatNumber(operations.data.totalContacts) : "—", note: operations.ok ? `${formatNumber(operations.data.newContacts)} new contact requests` : "Operational source unavailable", icon: Inbox },
    { key: "traffic", title: "Traffic", value: formatNumber(summary.pageViews), note: `${formatNumber(pageDepth)} pages per session · ${formatNumber(summary.uniqueCountries)} countries`, icon: Eye },
    { key: "journey", title: "Journey", value: formatPercent(conversionRate), note: `${formatNumber(summary.formSubmissions)} confirmed contact requests`, icon: FileCheck2 },
    { key: "sessions", title: "Sessions", value: data.recentSessions === null ? "—" : formatNumber(data.recentSessions.length), note: "Recent visitor journeys with device and network context", icon: Activity },
    { key: "reliability", title: "Reliability", value: formatNumber(summary.errorEvents), note: summary.errorEvents === 0 ? "No captured application errors" : "Errors and security audit to review", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-10">
      {data.warnings.length ? (
        <aside className="flex items-start gap-3 rounded-xl border border-amber-800/20 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950" role="status">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div><p className="font-semibold">Some panels are temporarily unavailable.</p><p className="mt-1">{data.warnings.join(" ")}</p></div>
        </aside>
      ) : null}

      <section aria-labelledby="analytics-workspaces-title">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Operations workspace</p>
            <h2 id="analytics-workspaces-title" className="mt-2 font-display text-2xl font-semibold tracking-[-0.035em] text-[#161616] sm:text-3xl">Choose a view</h2>
          </div>
          <p className="max-w-xl text-xs leading-5 text-[#6f6e6a] sm:text-right">Each card opens one focused surface, so sessions, conversions, errors, and operations stay easy to scan.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {focusCards.map((card) => (
            <FocusCard key={card.key} title={card.title} value={card.value} note={card.note} icon={card.icon} active={focus === card.key} href={`/admin/analytics?range=${encodeURIComponent(range)}&focus=${card.key}`} />
          ))}
        </div>
      </section>

      <section id="analytics-focus-panel" aria-labelledby="analytics-focus-title" aria-live="polite" className="scroll-mt-6 rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeader eyebrow={focusDetails.eyebrow} title={focusDetails.title} detail={focusDetails.description} />
      {focus === "overview" ? <section aria-labelledby="analytics-overview-title">
        <div className="sr-only" id="analytics-overview-title">Analytics overview</div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Sessions" value={formatNumber(summary.sessions)} note={`${formatPercent(engagedRate)} engaged · ${formatNumber(summary.visitors)} unique visitors`} icon={Users} tone="dark" />
          <MetricCard label="Page views" value={formatNumber(summary.pageViews)} note={`${formatNumber(pageDepth)} pages per session · ${formatNumber(summary.interactions)} interactions`} icon={Eye} tone="gold" />
          <MetricCard label="Average active time" value={formatDuration(summary.averageActiveSeconds)} note={`Foreground engagement · ${formatPercent(summary.bounceRatePercent)} bounce rate`} icon={Clock3} tone="light" />
          <MetricCard label="Conversion rate" value={formatPercent(conversionRate)} note={`${formatNumber(summary.formSubmissions)} confirmed contact requests · ${formatNumber(summary.portalHandoffs)} portal handoffs`} icon={FileCheck2} tone="light" />
          <MetricCard label="Interactions" value={formatNumber(summary.interactions)} note={`${formatNumber(summary.events)} total events · ${formatNumber(summary.webVitalEvents)} web vitals`} icon={MousePointerClick} tone="light" />
          <MetricCard label="Countries" value={formatNumber(summary.uniqueCountries)} note="Unique known country codes in this window" icon={Globe2} tone="light" />
          <MetricCard label="Errors" value={formatNumber(summary.errorEvents)} note={summary.errorEvents === 0 ? "No captured client or server errors" : "Review the reliability panel below"} icon={AlertTriangle} tone="light" />
          <MetricCard label="Converted sessions" value={formatNumber(summary.convertedSessions)} note="Sessions with a confirmed contact request" icon={ShieldCheck} tone="light" />
        </div>
      </section> : null}

      {focus === "operations" ? <OperationsOverview result={operations} windowPortalHandoffs={summary.portalHandoffs} /> : null}

      {focus === "traffic" ? <div className="space-y-8">
      <section>
        <SectionHeader eyebrow="Movement" title="Traffic over time" detail="Session creation and server-received activity are grouped into the selected UTC reporting window." />
        <TrendChart points={data.daily} />
      </section>

      <section>
        <SectionHeader eyebrow="Acquisition & mix" title="What is driving activity" detail="Only first-party, consent-aware session data is included. Unknown values remain explicit." />
        {data.breakdowns ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <BreakdownCard title="Top pages" items={data.breakdowns.topPages} emptyLabel="No page views recorded." />
            <BreakdownCard title="Referrers" items={data.breakdowns.topReferrers} emptyLabel="No referral sources recorded." />
            <BreakdownCard title="Countries" items={data.breakdowns.countries} emptyLabel="No country data recorded." />
            <BreakdownCard title="Devices" items={data.breakdowns.devices} emptyLabel="No device data recorded." />
          </div>
        ) : <UnavailablePanel label="Traffic breakdowns could not be loaded from the analytics source." />}
      </section>
      </div> : null}

      {focus === "journey" ? <section>
        <SectionHeader eyebrow="Journey" title="Conversion funnel" detail="Stages distinguish attempts and intent clicks from confirmed contact requests. Portal handoffs are not completed applications." />
        {data.breakdowns ? <Funnel steps={data.breakdowns.funnel} /> : <UnavailablePanel label="Conversion funnel data could not be loaded." />}
      </section>
      : null}

      {focus === "sessions" ? <section>
        <SectionHeader eyebrow="Live operations" title="Recent sessions" detail="A bounded view of the most recent sessions. Raw IP addresses disappear automatically after the approved short retention window." />
        <RecentSessions data={data.recentSessions} />
      </section>
      : null}

      {focus === "reliability" ? <ErrorsAndAudit data={data} /> : null}
      </section>

      <details className="rounded-xl border border-[#161616]/10 bg-white px-5 py-4 text-xs text-[#55534f]">
        <summary className="flex cursor-pointer items-center font-semibold text-[#161616]">Metric definitions and coverage</summary>
        <div className="mt-3 grid gap-3 leading-5 sm:grid-cols-2 xl:grid-cols-4">
          <p><strong>Visitor:</strong> one privacy-preserving anonymous identifier in the selected window.</p>
          <p><strong>Session:</strong> a bounded period of activity for one anonymous visitor.</p>
          <p><strong>Active time:</strong> foreground time with visible, recent interaction—not elapsed wall-clock time.</p>
          <p><strong>Conversion:</strong> a contact request confirmed by the website backend. Chat, call, WhatsApp, and portal actions remain separate intent signals.</p>
        </div>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#161616]/10 pt-5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Window: {data.window.label}</span>
        <span className="inline-flex items-center gap-1.5">
          {summary.latestEventAt ? <><Activity className="h-3 w-3" aria-hidden="true" /> Latest event {formatDateTime(summary.latestEventAt)}</> : "No captured events yet"}
        </span>
        <span>Snapshot {formatDateTime(data.generatedAt)}</span>
      </div>
    </div>
  );
}
