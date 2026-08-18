"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, LoaderCircle, UsersRound, X } from "lucide-react";
import type {
  AnalyticsCountryBreakdownItem,
  AnalyticsCountryVisitor,
  AnalyticsRange,
  AnalyticsVisitorActivity,
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

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatDuration(value: number) {
  const seconds = Math.max(0, Math.round(value));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function compactIdentifier(value: string) {
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
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
    language_changed: "Changed language",
    visibility_changed: "Changed tab visibility",
    active_time: "Active time",
    heartbeat: "Active time",
    portal_handoff: "Opened portal",
  };
  return knownNames[name] ?? name.replaceAll("_", " ");
}

function reviewSignal(country: AnalyticsCountryBreakdownItem) {
  const lowEngagement = country.sessions > 0 && country.briefSessions / country.sessions >= 0.5;
  if (country.localOrQaSessions > 0) {
    return `${formatNumber(country.localOrQaSessions)} local / automated QA session${country.localOrQaSessions === 1 ? "" : "s"}`;
  }
  if (lowEngagement) {
    return `${formatNumber(country.briefSessions)} brief session${country.briefSessions === 1 ? "" : "s"}; may differ from Google Analytics`;
  }
  return "No obvious QA signal";
}

type CountryButtonProps = {
  country: AnalyticsCountryBreakdownItem;
  onClick: () => void;
};

function CountryButton({ country, onClick }: CountryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={`View visitors in ${country.countryName} (${country.countryCode})`}
      className="group grid min-h-11 w-full grid-cols-[minmax(0,1fr)_3rem_1.5rem] items-center gap-2 rounded-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] focus-visible:ring-offset-2"
    >
      <strong className="text-sm text-foreground group-hover:text-[#7c5d17]">{country.countryName}</strong>
      <span className="font-mono text-xs leading-5 tracking-[0.12em] text-[#6f6e6a]">{country.countryCode}</span>
      <ChevronRight className="h-4 w-4 justify-self-end text-[#7c5d17] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <p className="flex min-h-11 items-center gap-2 rounded-[9px] border border-[#161616]/10 bg-white px-4 py-3 text-xs text-[#55534f]" role="status">
      <LoaderCircle className="h-4 w-4 animate-spin text-[#7c5d17]" aria-hidden="true" />
      {label}
    </p>
  );
}

function VisitorRow({
  visitor,
  position,
  countryName,
  onClick,
}: {
  visitor: AnalyticsCountryVisitor;
  position: number;
  countryName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View activity for visitor ${position}`}
      className="grid min-h-16 w-full gap-3 rounded-[10px] border border-[#161616]/10 bg-white px-4 py-3 text-left transition-colors hover:border-[#a97d12]/40 hover:bg-[#fbfaf7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] sm:grid-cols-[minmax(180px,1.1fr)_repeat(4,minmax(70px,0.5fr))_auto] sm:items-center"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#161616]">Visitor {String(position).padStart(2, "0")}</span>
        <span className="mt-0.5 block truncate font-mono text-[11px] text-[#6f6e6a]" title={visitor.visitorId}>{compactIdentifier(visitor.visitorId)}</span>
        <span className="sr-only">Anonymous analytics visitor in {countryName}</span>
      </span>
      <span><span className="block text-[11px] uppercase tracking-[0.1em] text-[#6f6e6a]">Sessions</span><strong className="mt-1 block text-sm text-[#161616]">{formatNumber(visitor.sessions)}</strong></span>
      <span><span className="block text-[11px] uppercase tracking-[0.1em] text-[#6f6e6a]">Pages</span><strong className="mt-1 block text-sm text-[#161616]">{formatNumber(visitor.pageViews)}</strong></span>
      <span><span className="block text-[11px] uppercase tracking-[0.1em] text-[#6f6e6a]">Active</span><strong className="mt-1 block text-sm text-[#161616]">{formatDuration(visitor.activeSeconds)}</strong></span>
      <span><span className="block text-[11px] uppercase tracking-[0.1em] text-[#6f6e6a]">Last active</span><strong className="mt-1 block text-sm text-[#161616]">{formatDateTime(visitor.lastSeenAt)}</strong></span>
      <ChevronRight className="hidden h-4 w-4 justify-self-end text-[#7c5d17] sm:block" aria-hidden="true" />
    </button>
  );
}

function ActivityPanel({
  activity,
  onBack,
}: {
  activity: AnalyticsVisitorActivity;
  onBack: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-[8px] text-xs font-semibold text-[#7c5d17] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to visitors
          </button>
          <h5 ref={headingRef} tabIndex={-1} className="mt-3 text-base font-semibold text-[#161616] outline-none">Visitor activity</h5>
          <p className="mt-1 text-xs leading-5 text-[#6f6e6a]">
            Anonymous visitor {compactIdentifier(activity.visitorId)} · {formatNumber(activity.sessions.length)} session{activity.sessions.length === 1 ? "" : "s"} · {formatNumber(activity.events)} retained event{activity.events === 1 ? "" : "s"}.
          </p>
        </div>
        <span className="rounded-full border border-[#7c5d17]/25 bg-[#f8f3e7] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c5d17]">Pseudonymous</span>
      </div>
      <p className="rounded-[9px] border border-[#161616]/8 bg-white px-4 py-3 text-xs leading-5 text-[#55534f]">This is a bounded event timeline from consented analytics data, not a video replay or a named personal profile. Raw network identifiers are intentionally not included in this drill-down.</p>
      {activity.truncated ? <p className="rounded-[9px] border border-amber-800/20 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">This visitor has more retained events than the safe display limit; the timeline shows the earliest retained records in this window.</p> : null}
      {activity.sessions.length ? (
        <div className="space-y-3">
          {activity.sessions.map((session, sessionIndex) => (
            <details key={session.id} className="group overflow-hidden rounded-[10px] border border-[#161616]/10 bg-white" open={sessionIndex === 0}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7c5d17] [&::-webkit-details-marker]:hidden">
                <span className="min-w-0"><strong className="block text-sm text-[#161616]">Session {String(sessionIndex + 1).padStart(2, "0")}</strong><span className="mt-0.5 block text-xs text-[#6f6e6a]">{formatDateTime(session.startedAt)} · {formatDuration(session.activeSeconds)} · {formatNumber(session.events)} event{session.events === 1 ? "" : "s"}</span></span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7c5d17] transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <div className="border-t border-[#161616]/8 bg-[#fbfaf7] p-4">
                <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="text-[#6f6e6a]">Entry page</dt><dd className="mt-1 break-words font-semibold text-[#161616]">{session.landingPage}</dd></div>
                  <div><dt className="text-[#6f6e6a]">Last page</dt><dd className="mt-1 break-words font-semibold text-[#161616]">{session.exitPage ?? "Not recorded"}</dd></div>
                  <div><dt className="text-[#6f6e6a]">Device</dt><dd className="mt-1 break-words font-semibold text-[#161616]">{[session.device, session.browser, session.operatingSystem].filter(Boolean).join(" · ") || "Not recorded"}</dd></div>
                  <div><dt className="text-[#6f6e6a]">Location</dt><dd className="mt-1 break-words font-semibold text-[#161616]">{[session.city, session.region, session.countryCode].filter(Boolean).join(", ") || session.countryCode}</dd></div>
                </dl>
                {session.eventsTimeline.length ? (
                  <ol className="mt-4 space-y-1 border-l border-[#a97d12]/25 pl-5">
                    {session.eventsTimeline.map((event, eventIndex) => (
                      <li key={event.id} className="relative grid gap-1 border-b border-[#161616]/8 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                        <span className="absolute -left-[2.08rem] top-3 grid h-6 w-6 place-items-center rounded-full border border-[#a97d12]/25 bg-[#f4eddd] text-[10px] font-semibold text-[#7c5d17]" aria-hidden="true">{eventIndex + 1}</span>
                        <div className="min-w-0"><strong className="block text-sm text-[#161616]">{humanizeEventName(event.name)}</strong><p className="mt-0.5 break-words text-xs leading-5 text-[#6f6e6a]">{[event.pagePath, event.sectionId, event.targetLabel].filter(Boolean).join(" · ") || "No additional context recorded"}</p></div>
                        <time dateTime={event.occurredAt} className="text-xs text-[#6f6e6a]">{formatDateTime(event.occurredAt)}</time>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-4 rounded-[9px] border border-[#161616]/8 bg-white px-4 py-3 text-xs leading-5 text-[#6f6e6a]">No detailed interaction events were retained for this session.</p>}
              </div>
            </details>
          ))}
        </div>
      ) : <p className="rounded-[9px] border border-[#161616]/10 bg-white px-4 py-4 text-xs text-[#6f6e6a]">No sessions were found for this anonymous visitor in the selected window.</p>}
    </div>
  );
}

export function CountryExplorer({ items, range }: { items: AnalyticsCountryBreakdownItem[]; range: AnalyticsRange }) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [visitors, setVisitors] = useState<AnalyticsCountryVisitor[] | null>(null);
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorMeta, setVisitorMeta] = useState({ page: 1, pageSize: 20, totalVisitors: 0, hasNextPage: false, hasPreviousPage: false, truncated: false });
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [activity, setActivity] = useState<AnalyticsVisitorActivity | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const selectedCountry = useMemo(() => items.find((item) => item.countryCode === selectedCountryCode) ?? null, [items, selectedCountryCode]);

  useEffect(() => {
    if (selectedCountryCode && !selectedCountry) setSelectedCountryCode(null);
  }, [selectedCountry, selectedCountryCode]);

  useEffect(() => {
    if (!selectedCountryCode) return;
    const controller = new AbortController();
    let active = true;
    setLoadingVisitors(true);
    setVisitorError(null);
    setVisitors(null);
    setSelectedVisitorId(null);
    setActivity(null);
    void fetch(`/admin/analytics/visitors?range=${encodeURIComponent(range)}&country=${encodeURIComponent(selectedCountryCode)}&page=${visitorPage}&pageSize=20`, { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Visitors could not be loaded.");
        return payload as { visitors: AnalyticsCountryVisitor[]; page?: number; pageSize?: number; totalVisitors?: number; hasNextPage?: boolean; hasPreviousPage?: boolean; truncated?: boolean };
      })
      .then((payload) => {
        const pageSize = Number.isFinite(payload.pageSize) && payload.pageSize ? payload.pageSize : 20;
        const page = Number.isFinite(payload.page) && payload.page ? payload.page : visitorPage;
        const visitorRows = Array.isArray(payload.visitors) ? payload.visitors : [];
        setVisitors(visitorRows);
        setVisitorMeta({
          page,
          pageSize,
          totalVisitors: Number.isFinite(payload.totalVisitors) ? Math.max(0, payload.totalVisitors ?? 0) : visitorRows.length,
          hasNextPage: payload.hasNextPage === true,
          hasPreviousPage: payload.hasPreviousPage === true || page > 1,
          truncated: payload.truncated === true,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (active) setVisitorError(error instanceof Error ? error.message : "Visitors could not be loaded.");
      })
      .finally(() => { if (active) setLoadingVisitors(false); });
    return () => { active = false; controller.abort(); };
  }, [range, selectedCountryCode, visitorPage]);

  useEffect(() => {
    if (!selectedCountryCode || !selectedVisitorId) return;
    const controller = new AbortController();
    let active = true;
    setLoadingActivity(true);
    setActivityError(null);
    setActivity(null);
    void fetch(`/admin/analytics/visitors?range=${encodeURIComponent(range)}&country=${encodeURIComponent(selectedCountryCode)}&visitor=${encodeURIComponent(selectedVisitorId)}`, { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Visitor activity could not be loaded.");
        return payload as { activity: AnalyticsVisitorActivity };
      })
      .then((payload) => setActivity(payload.activity ?? null))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (active) setActivityError(error instanceof Error ? error.message : "Visitor activity could not be loaded.");
      })
      .finally(() => { if (active) setLoadingActivity(false); });
    return () => { active = false; controller.abort(); };
  }, [range, selectedCountryCode, selectedVisitorId]);

  useEffect(() => {
    if (!selectedCountryCode) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedCountryCode(null);
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])") ?? []);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    };
  }, [selectedCountryCode]);

  if (!items.length) return <p className="rounded-[10px] border border-[#161616]/10 bg-white px-4 py-4 text-xs text-[#6f6e6a]">No country data recorded.</p>;

  const openCountry = (code: string) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setVisitorPage(1);
    setSelectedVisitorId(null);
    setActivity(null);
    setSelectedCountryCode(code);
  };
  const closeCountry = () => {
    setSelectedCountryCode(null);
    setSelectedVisitorId(null);
    setActivity(null);
  };
  const activeVisitor = Boolean(selectedVisitorId);
  const totalPages = Math.max(1, Math.ceil(visitorMeta.totalVisitors / visitorMeta.pageSize));
  const canGoPrevious = visitorMeta.hasPreviousPage || visitorPage > 1;
  const canGoNext = visitorMeta.hasNextPage;

  return (
    <article className="overflow-hidden rounded-xl border border-[#161616]/10 bg-white shadow-sm md:col-span-2 xl:col-span-3">
      <div className="border-b border-[#161616]/10 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-[#161616]">Countries</h3>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-[#6f6e6a]">Country totals are aggregated across cities and regions. Select a country to open a full visitor list and inspect one pseudonymous visitor&apos;s retained consented activity. No names, email addresses, or raw network identifiers are shown in this drill-down.</p>
          </div>
          <span className="rounded-full border border-[#7c5d17]/25 bg-[#f8f3e7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7c5d17]">Vercel IP location</span>
        </div>
      </div>
      <div className="divide-y divide-[#161616]/8 md:hidden">
        {items.map((country) => (
          <section key={country.countryCode} className="space-y-3 px-5 py-5">
            <CountryButton country={country} onClick={() => openCountry(country.countryCode)} />
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-[#6f6e6a]">Visitors</dt><dd className="mt-1 text-base font-semibold text-foreground">{formatNumber(country.visitors)}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-[#6f6e6a]">Engaged</dt><dd className="mt-1 text-base font-semibold text-[#7c5d17]">{formatNumber(country.engagedVisitors)}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-[#6f6e6a]">Sessions</dt><dd className="mt-1 text-base font-semibold text-foreground">{formatNumber(country.sessions)}</dd></div>
            </dl>
            <p className="rounded-lg bg-background px-3 py-2 text-xs leading-5 text-[#55534f]">{reviewSignal(country)}</p>
          </section>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block" role="region" tabIndex={0} aria-label="Country analytics comparison">
        <table className="w-full border-collapse text-left text-xs" style={{ minWidth: "760px" }}>
          <thead className="bg-background text-xs uppercase tracking-[0.14em] text-[#6f6e6a]"><tr><th scope="col" className="px-5 py-3 font-semibold sm:px-6">Country / ISO</th><th scope="col" className="px-4 py-3 text-right font-semibold">Unique visitors</th><th scope="col" className="px-4 py-3 text-right font-semibold">Engaged visitors</th><th scope="col" className="px-4 py-3 text-right font-semibold">Sessions</th><th scope="col" className="px-5 py-3 font-semibold sm:px-6">Review signal</th></tr></thead>
          <tbody>{items.map((country) => <tr key={country.countryCode} className="border-t border-[#161616]/8"><td className="px-5 py-2 sm:px-6"><CountryButton country={country} onClick={() => openCountry(country.countryCode)} /></td><td className="px-4 py-4 text-right font-semibold text-foreground">{formatNumber(country.visitors)}</td><td className="px-4 py-4 text-right"><span className="font-semibold text-[#7c5d17]">{formatNumber(country.engagedVisitors)}</span><span className="ml-1 text-xs text-[#6f6e6a]">({formatNumber(country.engagedSessions)} {country.engagedSessions === 1 ? "session" : "sessions"})</span></td><td className="px-4 py-4 text-right font-semibold text-foreground">{formatNumber(country.sessions)}</td><td className="px-5 py-4 text-[#55534f] sm:px-6">{reviewSignal(country)}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="border-t border-[#161616]/10 bg-background px-5 py-3 text-xs leading-5 text-[#6f6e6a] sm:px-6">VPNs, corporate gateways, carrier routing, Apple Private Relay, and different geolocation databases can change the detected country. This dashboard does not claim to identify VPN usage. Only visitors who permitted website analytics appear here.</p>

      {selectedCountry ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#161616]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCountry(); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="country-visitors-title" aria-describedby="country-visitors-description" className="flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-[#161616]/15 bg-[#f8f6f1] shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#161616]/10 bg-white px-5 py-5 sm:px-7">
              <div className="min-w-0">
                <p className="eyebrow">Country visitors</p>
                <h2 id="country-visitors-title" className="mt-2 truncate font-display text-2xl font-semibold tracking-[-0.025em] text-[#161616]">{selectedCountry.countryName}</h2>
                <p id="country-visitors-description" className="mt-1 text-xs leading-5 text-[#6f6e6a]">ISO <span className="font-mono font-semibold tracking-[0.14em] text-[#7c5d17]">{selectedCountry.countryCode}</span> · {range} window · anonymous visitor identifiers only</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeCountry} aria-label={`Close ${selectedCountry.countryName} visitors`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#161616]/10 bg-[#fbfaf7] text-[#7c5d17] hover:border-[#a97d12]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] focus-visible:ring-offset-2"><X className="h-5 w-5" aria-hidden="true" /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {activeVisitor && loadingActivity ? <LoadingState label="Loading the visitor activity timeline…" /> : null}
              {activeVisitor && activityError ? <div className="space-y-3"><p className="rounded-[9px] border border-amber-800/20 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900" role="alert">{activityError}</p><button type="button" onClick={() => { setSelectedVisitorId(null); setActivity(null); }} className="inline-flex min-h-11 items-center gap-2 rounded-[8px] px-2 text-xs font-semibold text-[#7c5d17] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to visitors</button></div> : null}
              {activeVisitor && activity ? <ActivityPanel activity={activity} onBack={() => { setSelectedVisitorId(null); setActivity(null); }} /> : null}
              {!activeVisitor ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="flex items-center gap-2 text-base font-semibold text-[#161616]"><UsersRound className="h-4 w-4 text-[#a97d12]" aria-hidden="true" /> Visitors in {selectedCountry.countryName}</h3><p className="mt-1 text-xs leading-5 text-[#6f6e6a]">Select a visitor to view their session-by-session activity timeline.</p></div><span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c5d17]">{formatNumber(selectedCountry.visitors)} in summary</span></div>
                  {loadingVisitors ? <LoadingState label="Loading visitors for this country…" /> : null}
                  {visitorError ? <p className="rounded-[9px] border border-amber-800/20 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900" role="alert">{visitorError}</p> : null}
                  {visitorMeta.truncated ? <p className="rounded-[9px] border border-amber-800/20 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">This country has more retained sessions than the safe scan limit. Pagination covers all visitors found in the bounded window.</p> : null}
                  {visitors && !loadingVisitors ? <>
                    {visitors.length ? <div className="space-y-3">{visitors.map((visitor, index) => <VisitorRow key={visitor.visitorId} visitor={visitor} position={(visitorMeta.page - 1) * visitorMeta.pageSize + index + 1} countryName={selectedCountry.countryName} onClick={() => setSelectedVisitorId(visitor.visitorId)} />)}</div> : <p className="rounded-[9px] border border-[#161616]/10 bg-white px-4 py-4 text-xs text-[#6f6e6a]">No pseudonymous visitors were found in this window.</p>}
                    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-[#161616]/10 pt-4" aria-label={`${selectedCountry.countryName} visitor pagination`}><p className="text-xs text-[#6f6e6a]">{visitorMeta.totalVisitors ? `Showing ${(visitorMeta.page - 1) * visitorMeta.pageSize + 1}–${Math.min(visitorMeta.page * visitorMeta.pageSize, visitorMeta.totalVisitors)} of ${visitorMeta.totalVisitors} visitors` : "No visitors"}{visitorMeta.truncated ? " · bounded scan" : ""}</p><div className="flex items-center gap-2"><button type="button" disabled={!canGoPrevious || loadingVisitors} onClick={() => setVisitorPage((page) => Math.max(1, page - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#161616]/15 bg-white px-3 text-xs font-semibold text-[#161616] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous</button><span className="px-2 text-xs font-semibold text-[#6f6e6a]">Page {visitorMeta.page}{visitorMeta.totalVisitors ? ` of ${totalPages}` : ""}</span><button type="button" disabled={!canGoNext || loadingVisitors} onClick={() => setVisitorPage((page) => page + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#161616]/15 bg-white px-3 text-xs font-semibold text-[#161616] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]">Next <ChevronRight className="h-4 w-4" aria-hidden="true" /></button></div></nav>
                  </> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
