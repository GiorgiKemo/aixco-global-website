import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileCheck2,
  Globe2,
  Inbox,
  Mail,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  MousePointerClick,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type {
  AdminAnalyticsDashboard,
  AdminOperationsSnapshotResult,
  AnalyticsBreakdownItem,
  AnalyticsDailyPoint,
  AnalyticsFunnelStep,
  RecentAnalyticsSession,
  RecentSessionJourneyEvent,
} from "@/lib/admin/analytics";
import {
  buildAnalyticsPaginationHref,
  sliceAnalyticsPage,
} from "./pagination";
import type {
  AnalyticsListPagination,
  AnalyticsPaginationKey,
  AnalyticsPaginationState,
} from "./pagination";

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

function formatJourneyElapsed(startedAt: string, occurredAt: string) {
  const elapsedSeconds = Math.max(
    0,
    Math.round((new Date(occurredAt).getTime() - new Date(startedAt).getTime()) / 1000),
  );
  return elapsedSeconds < 1 ? "Start" : `+${formatDuration(elapsedSeconds)}`;
}

function humanizeEventName(name: string) {
  const knownNames: Record<string, string> = {
    page_view: "Viewed page",
    section_view: "Viewed section",
    click: "Clicked",
    download: "Downloaded a file",
    outbound: "Opened an external link",
    outbound_click: "Opened an external link",
    whatsapp_click: "Opened WhatsApp",
    phone_click: "Tapped phone number",
    scroll_depth: "Reached page depth",
    form_started: "Started a form",
    form_submit_attempted: "Tried to submit a form",
    form_submitted: "Submitted a form",
    form_failed: "Form error",
    active_time: "Active time",
    heartbeat: "Active time",
    language_changed: "Changed language",
    visibility_changed: "Changed tab visibility",
    portal_handoff: "Opened portal",
    session_start: "Session started",
    session_end: "Session ended",
  };
  return knownNames[name] ?? name.replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase());
}

function getEventContext(event: RecentSessionJourneyEvent) {
  const location = [event.pagePath, event.sectionId, event.targetLabel].filter(Boolean).join(" · ");
  const metrics = [
    event.scrollDepth === null ? null : `${numberFormatter.format(event.scrollDepth)}% depth`,
    event.durationMs === null ? null : formatDuration(event.durationMs / 1000),
    event.value === null ? null : `value ${numberFormatter.format(event.value)}`,
  ].filter(Boolean).join(" · ");
  const context = location || (event.type === "engagement" ? "Recorded active engagement" : event.type);
  return [context, metrics].filter(Boolean).join(" · ");
}

function maskIpAddress(value: string | null) {
  if (!value) return "Raw address expired or unavailable";
  if (value.includes(":")) {
    const groups = value.split(":").filter(Boolean);
    return `${groups.slice(0, 2).join(":") || "IPv6"}:…`;
  }
  const octets = value.split(".");
  return octets.length === 4 ? `${octets[0]}.${octets[1]}.x.x` : "Address retained";
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
  const className = `group w-full rounded-[12px] border border-[#161616]/10 bg-white p-5 text-left text-[#161616] shadow-sm transition-all duration-200 ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" : ""} ${active ? "ring-2 ring-primary ring-offset-2" : ""}`;

  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#77746d]">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#f4eddd] text-primary transition-transform group-hover:scale-105">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-tight">{value}</p>
      <p className="mt-3 text-xs leading-5 text-[#6f6e6a]">{note}</p>
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
    description: "A compact read of the selected reporting window, with verified first-party activity only.",
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
    eyebrow: "Session intelligence",
    title: "Sessions",
    description: "Scan recent visits, then open one record for its event timeline and supporting context.",
  },
  reliability: {
    eyebrow: "Reliability & security",
    title: "Errors and admin activity",
    description: "Review recent application errors and the durable audit trail for sensitive admin actions.",
  },
};

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

function getPaginationItems(page: number, totalPages: number): Array<number | "ellipsis-start" | "ellipsis-end"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const items: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("ellipsis-start");
  for (let value = start; value <= end; value += 1) items.push(value);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);
  return items;
}

function ListPagination({
  pagination,
  label,
  hrefForPage,
}: {
  pagination: AnalyticsListPagination;
  label: string;
  hrefForPage: (page: number) => string;
}) {
  const { page, total, totalPages, start, end } = pagination;
  const buttonClass = "inline-flex min-h-11 flex-1 items-center justify-center rounded-[8px] border border-[#161616]/10 bg-white px-3 text-xs font-semibold text-[#161616] transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:flex-none";
  const disabledClass = "inline-flex min-h-11 flex-1 items-center justify-center rounded-[8px] border border-[#161616]/10 bg-[#f1efe8] px-3 text-xs font-semibold text-[#6f6e6a] sm:flex-none";

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-[#161616]/10 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[#6f6e6a]">Showing {start}-{end} of {total}</p>
      {totalPages > 1 ? (
        <nav className="flex w-full items-center gap-1 overflow-x-auto pb-1 sm:w-auto sm:justify-end sm:pb-0" aria-label={`${label} pagination`}>
          {page > 1 ? (
            <Link href={hrefForPage(page - 1)} scroll={false} className={buttonClass} aria-label={`Previous ${label.toLowerCase()} page`}>
              <ChevronLeft className="h-4 w-4 sm:hidden" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Previous</span>
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled="true">
              <ChevronLeft className="h-4 w-4 sm:hidden" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Previous</span>
            </span>
          )}
          <div className="flex items-center gap-1 px-1">
            {getPaginationItems(page, totalPages).map((item) => item === "ellipsis-start" || item === "ellipsis-end" ? (
              <span key={item} className="grid h-11 min-w-7 place-items-center text-xs text-[#6f6e6a]" aria-hidden="true">&hellip;</span>
            ) : (
              <Link
                key={item}
                href={hrefForPage(item)}
                scroll={false}
                aria-current={item === page ? "page" : undefined}
                aria-label={`${label}, page ${item}`}
                className={`grid h-11 min-w-11 place-items-center rounded-[8px] border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${item === page ? "border-[#161616] bg-[#161616] text-white" : "border-[#161616]/10 bg-white text-[#6f6e6a] hover:border-primary hover:text-primary"}`}
              >
                {item}
              </Link>
            ))}
          </div>
          {page < totalPages ? (
            <Link href={hrefForPage(page + 1)} scroll={false} className={buttonClass} aria-label={`Next ${label.toLowerCase()} page`}>
              <span className="sr-only sm:not-sr-only">Next</span>
              <ChevronRight className="h-4 w-4 sm:hidden" aria-hidden="true" />
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled="true">
              <span className="sr-only sm:not-sr-only">Next</span>
              <ChevronRight className="h-4 w-4 sm:hidden" aria-hidden="true" />
            </span>
          )}
        </nav>
      ) : null}
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

function RecentSessions({
  data,
  pagination,
  hrefForPage,
}: {
  data: AdminAnalyticsDashboard["recentSessions"];
  pagination: AnalyticsListPagination;
  hrefForPage: (page: number) => string;
}) {
  if (data === null) return <UnavailablePanel label="Recent sessions could not be loaded from the analytics source." />;
  if (!data.length) return <PanelEmpty label="No sessions have been recorded in this window." />;
  const pageData = sliceAnalyticsPage(data, pagination);
  const returningCount = pageData.filter((session) => session.isReturning).length;
  const pageViews = pageData.reduce((total, session) => total + session.pageViews, 0);
  const averageActiveSeconds = pageData.length
    ? pageData.reduce((total, session) => total + session.activeSeconds, 0) / pageData.length
    : 0;

  return (
    <div>
      <dl className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[#161616]/10 bg-[#dedbd3] sm:grid-cols-4" aria-label="Sessions on this page">
        <SessionMiniMetric label="Records shown" value={formatNumber(pageData.length)} />
        <SessionMiniMetric label="Returning" value={formatNumber(returningCount)} />
        <SessionMiniMetric label="Page views" value={formatNumber(pageViews)} />
        <SessionMiniMetric label="Average active" value={formatDuration(averageActiveSeconds)} />
      </dl>

      <div className="space-y-3" aria-label="Recent visitor sessions">
        {pageData.map((session, sessionIndex) => (
          <SessionCard
            key={session.id}
            session={session}
            visibleNumber={(pagination.page - 1) * pagination.pageSize + sessionIndex + 1}
          />
        ))}
        <p className="rounded-[10px] border border-[#161616]/8 bg-[#fbfaf7] px-4 py-3 text-xs leading-5 text-[#6f6e6a]">
          Technical identifiers stay collapsed by default. Raw network addresses are visible only to authorized administrators and disappear after the short retention window. Timelines show the latest 40 retained events.
        </p>
      </div>
      <ListPagination pagination={pagination} label="Visitor sessions" hrefForPage={hrefForPage} />
    </div>
  );
}
function SessionMiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#fbfaf7] px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f6e6a]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#161616]">{value}</dd>
    </div>
  );
}

function SessionCard({ session, visibleNumber }: { session: RecentAnalyticsSession; visibleNumber: number }) {
  const location = [session.city, session.region, session.country].filter(Boolean).join(", ") || "Location unavailable";
  const device = [session.device, session.browser, session.operatingSystem].filter(Boolean).join(" · ") || "Device unavailable";
  const source = session.referrer ? `${session.referrer}${session.referrerPath ?? ""}` : "Direct visit";
  const campaign = [session.utmSource, session.utmMedium, session.utmCampaign].filter(Boolean).join(" · ");
  const deepestScroll = session.journey.reduce((maximum, event) => Math.max(maximum, event.scrollDepth ?? 0), 0);
  const meaningfulEventNames = new Set([
    "click",
    "download",
    "form_failed",
    "form_started",
    "form_submit_attempted",
    "form_submitted",
    "language_changed",
    "outbound",
    "outbound_click",
    "phone_click",
    "portal_handoff",
    "whatsapp_click",
  ]);
  const meaningfulEvents = session.journey.filter((event) => meaningfulEventNames.has(event.name));
  const lastPage = session.exitPage ?? session.journey.at(-1)?.pagePath ?? "End page not recorded";

  return (
    <details className="group overflow-hidden rounded-[12px] border border-[#161616]/10 bg-white shadow-[0_8px_22px_rgba(22,22,22,0.04)] open:border-[#a97d12]/40 open:shadow-[0_14px_34px_rgba(22,22,22,0.07)]">
      <summary className="grid min-h-[92px] cursor-pointer list-none gap-4 px-4 py-4 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7c5d17] sm:px-5 lg:grid-cols-[minmax(190px,0.9fr)_minmax(260px,1.3fr)_auto_44px] lg:items-center [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[9px] bg-[#161616] text-xs font-semibold text-white" aria-hidden="true">
            {String(visibleNumber).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="break-words text-sm font-semibold text-[#161616]">{location}</strong>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${session.isReturning ? "bg-[#f4eddd] text-[#7c5d17]" : "bg-emerald-100 text-emerald-900"}`}>
                {session.isReturning ? "Returning visitor" : "New visitor"}
              </span>
            </div>
            <time dateTime={session.startedAt} className="mt-1 block text-xs text-[#6f6e6a]">Started {formatDateTime(session.startedAt)}</time>
          </div>
        </div>

        <div className="min-w-0 rounded-[9px] bg-[#fbfaf7] px-3 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6e6a]">Visitor path</span>
          <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-[#161616]">
            <span className="min-w-0 truncate font-semibold" title={session.landingPage}>{session.landingPage}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a97d12]" aria-hidden="true" />
            <span className="min-w-0 truncate" title={lastPage}>{lastPage}</span>
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-2 lg:min-w-[250px]">
          <CompactStat label="Active" value={formatDuration(session.activeSeconds)} />
          <CompactStat label="Pages" value={formatNumber(session.pageViews)} />
          <CompactStat label="Actions" value={formatNumber(meaningfulEvents.length)} />
        </dl>

        <span className="grid h-11 w-11 place-items-center justify-self-end rounded-full border border-[#161616]/10 bg-[#fbfaf7] text-[#7c5d17] transition group-hover:border-[#a97d12]/50 group-open:bg-[#161616] group-open:text-white" aria-hidden="true">
          <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        </span>
      </summary>

      <div className="border-t border-[#161616]/8 bg-[#fbfaf7] p-4 sm:p-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <section aria-labelledby={`session-timeline-${session.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[#7c5d17]">
                  <Route className="h-4 w-4" aria-hidden="true" />
                  <h3 id={`session-timeline-${session.id}`} className="text-xs font-semibold uppercase tracking-[0.16em]">Activity timeline</h3>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#6f6e6a]">Chronological events recorded during this visit. This is an event timeline, not a video replay.</p>
              </div>
              {deepestScroll > 0 ? <span className="rounded-full bg-[#f4eddd] px-3 py-1.5 text-xs font-semibold text-[#7c5d17]">Deepest scroll {formatNumber(deepestScroll)}%</span> : null}
            </div>

            {session.journey.length ? (
              <ol className="mt-4 border-l border-[#a97d12]/25 pl-5">
                {session.journey.map((event, eventIndex) => (
                  <li key={event.id} className="relative grid gap-1 border-b border-[#161616]/8 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                    <span className="absolute top-4 grid h-6 w-6 place-items-center rounded-full border border-[#a97d12]/25 bg-[#f4eddd] text-[10px] font-semibold text-[#7c5d17]" style={{ left: "-2.08rem" }} aria-hidden="true">{eventIndex + 1}</span>
                    <div className="min-w-0">
                      <strong className="block text-sm font-semibold text-[#161616]">{humanizeEventName(event.name)}</strong>
                      <p className="mt-0.5 break-words text-xs leading-5 text-[#6f6e6a]">{getEventContext(event)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:flex-col sm:items-end sm:gap-0">
                      <strong className="font-semibold text-[#7c5d17]">{formatJourneyElapsed(session.startedAt, event.occurredAt)}</strong>
                      <time dateTime={event.occurredAt} className="text-[#6f6e6a]">{journeyTimeFormatter.format(new Date(event.occurredAt))}</time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 rounded-[9px] border border-[#161616]/8 bg-white px-4 py-3 text-xs leading-5 text-[#6f6e6a]">No detailed interaction events were retained for this session.</p>
            )}
          </section>

          <aside className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-1" aria-label="Session context">
            <ContextCard icon={MapPin} label="Location" value={location} detail={[session.locale, session.timezone].filter(Boolean).join(" · ") || "Locale unavailable"} />
            <ContextCard icon={MonitorSmartphone} label="Device" value={device} detail={`${session.viewportWidth && session.viewportHeight ? `${session.viewportWidth}×${session.viewportHeight} viewport` : "Viewport unavailable"}${session.screenWidth && session.screenHeight ? ` · ${session.screenWidth}×${session.screenHeight} screen` : ""}`} />
            <ContextCard icon={Route} label="Route" value={session.landingPage} detail={`Last page: ${lastPage}`} />
            <ContextCard icon={CalendarClock} label="Timing" value={`Last seen ${formatDateTime(session.lastSeenAt)}`} detail={session.endedAt ? `Ended ${formatDateTime(session.endedAt)}` : "No explicit session end recorded"} />
            <ContextCard icon={Sparkles} label="Acquisition" value={source} detail={campaign ? `Campaign: ${campaign}` : "No campaign parameters recorded"} />

            <details className="group rounded-[10px] border border-[#161616]/10 bg-white sm:col-span-2 xl:col-span-1">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-[#161616] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7c5d17] [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#a97d12]" aria-hidden="true" /> Technical &amp; privacy details</span>
                <ChevronRight className="h-4 w-4 text-[#7c5d17] transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <dl className="space-y-3 border-t border-[#161616]/8 px-4 py-3 text-xs">
                <TechnicalRow label="Network" value={maskIpAddress(session.ipAddress)} />
                <TechnicalRow label="Session ID" value={session.id} mono />
                {session.visitorId ? <TechnicalRow label="Visitor ID" value={session.visitorId} mono /> : null}
                {session.ipHash ? <TechnicalRow label="IP hash" value={session.ipHash} mono /> : null}
                {session.userAgent ? <TechnicalRow label="User agent" value={session.userAgent} /> : null}
              </dl>
            </details>
          </aside>
        </div>
      </div>
    </details>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#161616]/8 bg-white px-2.5 py-2 text-center">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6e6a]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#161616]">{value}</dd>
    </div>
  );
}

function ContextCard({ icon: Icon, label, value, detail }: { icon: typeof MapPin; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[10px] border border-[#161616]/10 bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#a97d12]" aria-hidden="true" />
        <h4 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#6f6e6a]">{label}</h4>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-[#161616]">{value}</p>
      <p className="mt-1 break-words text-xs leading-5 text-[#6f6e6a]">{detail}</p>
    </div>
  );
}

function TechnicalRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="font-semibold text-[#6f6e6a]">{label}</dt>
      <dd className={`mt-1 break-words text-[#343330] ${mono ? "font-mono text-[11px]" : "leading-5"}`}>{value}</dd>
    </div>
  );
}

function ErrorsAndAudit({
  data,
  pagination,
  hrefForPage,
}: {
  data: AdminAnalyticsDashboard;
  pagination: AnalyticsPaginationState;
  hrefForPage: (target: AnalyticsPaginationKey, page: number) => string;
}) {
  const recentErrors = data.recentErrors ? sliceAnalyticsPage(data.recentErrors, pagination.errors) : data.recentErrors;
  const auditEvents = data.auditEvents ? sliceAnalyticsPage(data.auditEvents, pagination.audit) : data.auditEvents;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section>
        <SectionHeader eyebrow="Reliability" title="Recent errors" />
        {data.recentErrors === null ? <UnavailablePanel label="Recent errors could not be loaded." /> : data.recentErrors.length ? (
          <div>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-[#161616]/10 bg-white shadow-sm">
              {recentErrors?.map((error) => (
              <article key={error.id} className="flex items-start gap-4 px-5 py-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-50 text-red-700"><AlertTriangle className="h-4 w-4" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-words text-sm font-semibold text-[#161616]">{error.name}</p>
                    <time dateTime={error.occurredAt} className="text-[10px] text-[#6f6e6a]">{formatDateTime(error.occurredAt)}</time>
                  </div>
                  <p className="mt-1 truncate text-xs text-[#6f6e6a]">{error.pagePath ?? "Unknown page"}{error.sectionId ? ` · ${error.sectionId}` : ""}</p>
                  {error.targetLabel || error.eventType ? <p className="mt-1 truncate text-[10px] text-muted-foreground">{[error.eventType, error.targetLabel].filter(Boolean).join(" · ")}</p> : null}
                  {error.sessionId ? <p className="mt-1 truncate font-mono text-[10px] text-[#6f6e6a]">session:{error.sessionId}</p> : null}
                  {error.fingerprint ? <p className="mt-1 truncate font-mono text-[10px] text-[#6f6e6a]">fingerprint:{error.fingerprint}</p> : null}
                  {error.message ? <p className="mt-2 line-clamp-2 break-words font-mono text-[10px] leading-4 text-[#55534f]">{error.message}</p> : null}
                </div>
              </article>
              ))}
            </div>
            <ListPagination pagination={pagination.errors} label="Application errors" hrefForPage={(page) => hrefForPage("errors", page)} />
          </div>
        ) : <PanelEmpty label="No application errors were recorded in this window." />}
      </section>

      <section>
        <SectionHeader eyebrow="Security" title="Admin audit trail" />
        {data.auditEvents === null ? <UnavailablePanel label="Admin audit history could not be loaded." /> : data.auditEvents.length ? (
          <div>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-[#161616]/10 bg-white shadow-sm">
              {auditEvents?.map((event) => (
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
                  <p className="mt-1 truncate font-mono text-[10px] text-[#6f6e6a]">{event.ipAddress ?? (event.ipHash ? `hash:${event.ipHash.slice(0, 12)}` : "network unavailable")}</p>
                  {event.requestId ? <p className="mt-1 truncate font-mono text-[10px] text-[#6f6e6a]">request:{event.requestId}</p> : null}
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
                <time dateTime={event.occurredAt} className="text-[10px] text-[#6f6e6a]">{formatDateTime(event.occurredAt)}</time>
              </article>
              ))}
            </div>
            <ListPagination pagination={pagination.audit} label="Admin audit trail" hrefForPage={(page) => hrefForPage("audit", page)} />
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
  pagination,
}: {
  data: AdminAnalyticsDashboard;
  operations: AdminOperationsSnapshotResult;
  focus: DashboardFocus;
  range: string;
  pagination: AnalyticsPaginationState;
}) {
  const { summary } = data;
  const conversionRate = getConversionRate(summary.convertedSessions, summary.sessions);
  const pageDepth = summary.sessions > 0 ? summary.pageViews / summary.sessions : 0;
  const engagedRate = summary.sessions > 0 ? (summary.engagedSessions / summary.sessions) * 100 : 0;
  const focusDetails = focusCopy[focus];
  const pages = {
    sessions: pagination.sessions.page,
    errors: pagination.errors.page,
    audit: pagination.audit.page,
  };
  const hrefForPage = (target: AnalyticsPaginationKey, page: number) => buildAnalyticsPaginationHref({
    range,
    focus,
    pages,
    target,
    page,
  });

  return (
    <div className="space-y-8">
      {data.warnings.length ? (
        <aside className="flex items-start gap-3 rounded-xl border border-amber-800/20 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950" role="status">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div><p className="font-semibold">Some panels are temporarily unavailable.</p><p className="mt-1">{data.warnings.join(" ")}</p></div>
        </aside>
      ) : null}

      <section
        id="analytics-focus-panel"
        aria-labelledby={focus === "sessions" ? undefined : "analytics-focus-title"}
        aria-label={focus === "sessions" ? "Recent visitor sessions" : undefined}
        aria-live="polite"
        className="scroll-mt-6 rounded-[14px] border border-[#161616]/10 bg-white p-5 shadow-sm sm:p-7"
      >
        {focus === "sessions" ? null : (
          <SectionHeader eyebrow={focusDetails.eyebrow} title={focusDetails.title} detail={focusDetails.description} />
        )}
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
        <RecentSessions data={data.recentSessions} pagination={pagination.sessions} hrefForPage={(page) => hrefForPage("sessions", page)} />
      </section>
      : null}

      {focus === "reliability" ? <ErrorsAndAudit data={data} pagination={pagination} hrefForPage={hrefForPage} /> : null}
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
