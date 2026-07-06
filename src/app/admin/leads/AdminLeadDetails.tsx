"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { LeadStatus, PortalEvent } from "@/lib/admin/leads";
import type { DashboardLead } from "./PipelineBoard";

const statusTabs: { label: string; value?: LeadStatus }[] = [
  { label: "All" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Archived", value: "archived" },
];

const PAGE_SIZE = 15;

function isLeadStatus(value: string | null): value is LeadStatus {
  return value === "new" || value === "contacted" || value === "qualified" || value === "archived";
}

function getPageNumber(value: string | null) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function clampPage(page: number, total: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(page, totalPages);
}

function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function sortNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function getReadablePagePath(value: string) {
  return value === "/" || value === "Unknown page" ? "" : value;
}

function getFeedbackMessage(updated: string | null, error: string | null) {
  if (updated === "1") return { tone: "success", text: "Lead status updated." };
  if (error === "invalid-status-update") return { tone: "error", text: "That status update was invalid." };
  if (error === "status-update-failed") return { tone: "error", text: "Could not update lead status." };
  return null;
}

function getStatusClass(status: LeadStatus) {
  if (status === "new") return "border-[#e6c767]/70 bg-[#e6c767]/20 text-[#161616]";
  if (status === "contacted") return "border-[#161616]/15 bg-white text-[#161616]";
  if (status === "qualified") return "border-[#161616] bg-[#161616] text-white";
  return "border-[#9e9d9d]/35 bg-[#efefec] text-[#6f6e6a]";
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize leading-none ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#161616]/10 bg-[#f6f4ef] p-6 text-center text-sm font-medium text-[#9e9d9d]">
      {label}
    </div>
  );
}

function Pagination({
  page,
  total,
  pageSize = PAGE_SIZE,
  hrefForPage,
}: {
  page: number;
  total: number;
  pageSize?: number;
  hrefForPage: (page: number) => string;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const buttonClass =
    "inline-flex h-9 flex-1 items-center justify-center rounded-md border border-[#161616]/10 bg-white px-3 text-sm font-medium text-[#161616] transition-colors hover:bg-[#f6f4ef] sm:flex-none";
  const disabledClass =
    "inline-flex h-9 flex-1 items-center justify-center rounded-md border border-[#161616]/10 bg-[#f1efe8] px-3 text-sm font-medium text-[#9e9d9d] sm:flex-none";

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[#6f6e6a]">
        Showing {start}-{end} of {total}
      </span>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        {page > 1 ? (
          <Link href={hrefForPage(page - 1)} className={buttonClass}>
            Previous
          </Link>
        ) : (
          <span className={disabledClass} aria-disabled="true">
            Previous
          </span>
        )}
        <span className="min-w-14 text-center text-xs text-[#6f6e6a]">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={hrefForPage(page + 1)} className={buttonClass}>
            Next
          </Link>
        ) : (
          <span className={disabledClass} aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </div>
  );
}

function LeadRecords({ leads }: { leads: DashboardLead[] }) {
  return (
    <div className="divide-y divide-[#161616]/10">
      {leads.length === 0 ? (
        <div className="p-4">
          <EmptyState label="No records match this filter." />
        </div>
      ) : (
        leads.map((lead) => (
          <article key={`${lead.resource}-${lead.id}`} className="grid gap-3 px-4 py-4 transition-colors hover:bg-[#f8f7f3] lg:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.5fr)_120px_120px] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-sm font-semibold leading-tight text-[#161616]">{lead.title}</h3>
                <span className="rounded border border-[#161616]/10 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6e6a]">
                  {lead.resource === "contact" ? "Form" : "Chat"}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-[#6f6e6a]">{lead.interest}</p>
              <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-xs leading-5 text-[#55534f]">{lead.body}</p>
            </div>

            <div className="min-w-0 text-xs font-medium text-[#161616]">
              {lead.contactHref ? (
                <a href={lead.contactHref} className="truncate underline-offset-4 hover:underline">
                  {lead.contactLabel}
                </a>
              ) : (
                <p className="truncate">{lead.contactLabel}</p>
              )}
              {getReadablePagePath(lead.pagePath) && <p className="mt-1 truncate font-normal text-[#9e9d9d]">{getReadablePagePath(lead.pagePath)}</p>}
            </div>

            <StatusBadge status={lead.status} />

            <time dateTime={lead.createdAt} className="text-xs font-medium uppercase tracking-[0.08em] text-[#6f6e6a]">
              {formatDate(lead.createdAt)}
            </time>
          </article>
        ))
      )}
    </div>
  );
}

function PortalActivity({ events }: { events: PortalEvent[] }) {
  return (
    <section className="rounded-lg border border-[#161616]/10 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#161616]/10 px-4 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6a18]">Portal</p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.03em] text-[#161616]">Handoffs</h2>
        </div>
        <span className="rounded-full border border-[#161616]/10 px-2.5 py-1 text-xs font-semibold text-[#6f6e6a]">{events.length}</span>
      </div>

      <div className="divide-y divide-[#161616]/10">
        {events.length === 0 ? (
          <div className="p-4">
            <EmptyState label="No portal events yet." />
          </div>
        ) : (
          events.map((event) => (
            <article key={event.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold capitalize text-[#161616]">{event.mode}</p>
                  <p className="mt-1 truncate text-xs text-[#6f6e6a]">{event.role_title}</p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9e9d9d]">{formatDate(event.created_at)}</p>
                </div>
                <a
                  href={event.portal_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#161616]/10 text-[#161616] transition-colors hover:border-[#e6c767] hover:bg-[#e6c767]/15"
                  aria-label={event.action}
                  title={event.action}
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function AdminLeadDetails({
  contactLeads,
  chatLeads,
  portalEvents,
  section = "all",
}: {
  contactLeads: DashboardLead[];
  chatLeads: DashboardLead[];
  portalEvents: PortalEvent[];
  section?: "all" | "records" | "portal";
}) {
  const params = useSearchParams();
  const requestedStatus = params?.get("status") ?? null;
  const requestedTab = params?.get("tab") ?? null;
  const requestedPage = getPageNumber(params?.get("page") ?? null);
  const activeStatus = isLeadStatus(requestedStatus) ? requestedStatus : undefined;
  const feedback = getFeedbackMessage(params?.get("updated") ?? null, params?.get("error") ?? null);
  const allLeads = useMemo(() => sortNewest([...contactLeads, ...chatLeads]), [chatLeads, contactLeads]);
  const focusedLeads = useMemo(
    () => (activeStatus ? allLeads.filter((lead) => lead.status === activeStatus) : allLeads),
    [activeStatus, allLeads],
  );
  const showRecords = section === "all" || section === "records";
  const showPortal = section === "all" || section === "portal";
  const filterBaseHref = requestedTab ? `/admin/leads?tab=${requestedTab}` : "/admin/leads";
  const recordsPage = clampPage(requestedPage, focusedLeads.length);
  const pageLeads = paginateItems(focusedLeads, recordsPage);
  const portalPage = clampPage(requestedPage, portalEvents.length);
  const pagePortalEvents = paginateItems(portalEvents, portalPage);
  const createPageHref = (page: number, options?: { includeStatus?: boolean }) => {
    const query = new URLSearchParams();
    if (requestedTab) query.set("tab", requestedTab);
    if (options?.includeStatus && activeStatus) query.set("status", activeStatus);
    if (page > 1) query.set("page", String(page));
    const suffix = query.toString();
    return suffix ? `/admin/leads?${suffix}` : "/admin/leads";
  };

  return (
    <>
      {feedback && (
        <p
          role="status"
          className={`mt-5 rounded-lg border px-4 py-3 text-sm font-medium ${
            feedback.tone === "success"
              ? "border-[#e6c767]/60 bg-[#e6c767]/15 text-[#161616]"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <section className="grid gap-6">
        {showRecords && (
          <>
            <section className="rounded-lg border border-[#161616]/10 bg-white">
              <div className="flex flex-col gap-4 border-b border-[#161616]/10 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6a18]">Records</p>
                  <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.03em] text-[#161616]">
                    {focusedLeads.length} {focusedLeads.length === 1 ? "lead" : "leads"}
                  </h2>
                </div>
                <nav className="flex flex-wrap gap-2" aria-label="Lead status filter">
                  {statusTabs.map((tab) => {
                    const active = tab.value === activeStatus || (!tab.value && !activeStatus);
                    return (
                      <Link
                        key={tab.label}
                        href={tab.value ? `${filterBaseHref}${requestedTab ? "&" : "?"}status=${tab.value}` : filterBaseHref}
                        className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                          active ? "border-[#161616] bg-[#161616] text-white" : "border-[#161616]/10 bg-white text-[#6f6e6a] hover:border-[#e6c767] hover:text-[#161616]"
                        }`}
                      >
                        {tab.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <LeadRecords leads={pageLeads} />
            </section>
            <Pagination
              page={recordsPage}
              total={focusedLeads.length}
              hrefForPage={(nextPage) => createPageHref(nextPage, { includeStatus: true })}
            />
          </>
        )}

        {showPortal && (
          <>
            <PortalActivity events={pagePortalEvents} />
            <Pagination page={portalPage} total={portalEvents.length} hrefForPage={(nextPage) => createPageHref(nextPage)} />
          </>
        )}
      </section>
    </>
  );
}
