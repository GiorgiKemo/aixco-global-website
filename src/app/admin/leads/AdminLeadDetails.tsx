"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink, RotateCcw } from "lucide-react";
import type { AdminLeadPage, LeadStatus, PortalEvent } from "@/lib/admin/leads";
import type { DashboardLead } from "./PipelineBoard";
import { sanitizeAdminLeadsReturnTo } from "./navigation";

const statusTabs: { label: string; value?: LeadStatus }[] = [
  { label: "Active" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Archived", value: "archived" },
];

function isLeadStatus(value: string | null): value is LeadStatus {
  return value === "new" || value === "contacted" || value === "qualified" || value === "archived";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getReadablePagePath(value: string) {
  return value === "/" || value === "Unknown page" ? "" : value;
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
    <div className="rounded-lg border border-dashed border-[#161616]/10 bg-[#f6f4ef] p-6 text-center text-sm font-medium text-[#6f6e6a]">
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

function Pagination({
  pagination,
  hrefForPage,
  label,
}: {
  pagination: AdminLeadPage;
  hrefForPage: (page: number) => string;
  label: string;
}) {
  const { page, total, totalPages, start, end } = pagination;
  const buttonClass =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-[#161616]/10 bg-white px-3 text-sm font-medium text-[#161616] transition-colors hover:bg-[#f6f4ef] sm:flex-none";
  const disabledClass =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-[#161616]/10 bg-[#f1efe8] px-3 text-sm font-medium text-[#6f6e6a] sm:flex-none";

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[#6f6e6a]">
        {total === 0 ? "Showing 0 of 0" : `Showing ${start}-${end} of ${total}`}
      </span>
      {totalPages > 1 ? <nav className="flex w-full items-center gap-1 overflow-x-auto sm:w-auto sm:justify-end" aria-label={`${label} pagination`}>
        {page > 1 ? (
          <Link href={hrefForPage(page - 1)} className={buttonClass} aria-label={`Previous ${label.toLowerCase()} page`}>
            Previous
          </Link>
        ) : (
          <span className={disabledClass} aria-disabled="true">
            Previous
          </span>
        )}
        <div className="flex items-center gap-1 px-1">
          {getPaginationItems(page, totalPages).map((item) => item === "ellipsis-start" || item === "ellipsis-end" ? (
            <span key={item} className="grid h-11 min-w-7 place-items-center text-xs text-[#6f6e6a]" aria-hidden="true">…</span>
          ) : (
            <Link
              key={item}
              href={hrefForPage(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`${label}, page ${item}`}
              className={`grid h-11 min-w-11 place-items-center rounded-md border text-xs font-semibold transition-colors ${item === page ? "border-[#161616] bg-[#161616] text-white" : "border-[#161616]/10 bg-white text-[#6f6e6a] hover:border-primary hover:text-primary"}`}
            >
              {item}
            </Link>
          ))}
        </div>
        {page < totalPages ? (
          <Link href={hrefForPage(page + 1)} className={buttonClass} aria-label={`Next ${label.toLowerCase()} page`}>
            Next
          </Link>
        ) : (
          <span className={disabledClass} aria-disabled="true">
            Next
          </span>
        )}
      </nav> : null}
    </div>
  );
}

function LeadRecords({ leads, returnTo }: { leads: DashboardLead[]; returnTo: string }) {
  return (
    <div className="divide-y divide-[#161616]/10">
      {leads.length === 0 ? (
        <div className="p-4">
          <EmptyState label="No records match this filter." />
        </div>
      ) : (
        leads.map((lead) => (
          <article id={`${lead.resource}-${lead.id}`} key={`${lead.resource}-${lead.id}`} className="grid gap-3 px-4 py-4 transition-colors hover:bg-[#f8f7f3] lg:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.5fr)_150px_120px] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-sm font-semibold leading-tight text-[#161616]">{lead.title}</h3>
                <span className="rounded border border-[#161616]/10 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6e6a]">
                  {lead.resource === "contact" ? "Form" : "Chat"}
                </span>
                {lead.reference ? (
                  <span className="rounded border border-[#e6c767]/70 bg-[#e6c767]/15 px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] text-[#6f5112]">
                    {lead.reference}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-[#6f6e6a]">{lead.interest}</p>
              <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-xs leading-5 text-[#55534f]">{lead.body}</p>
            </div>

            <div className="min-w-0 text-xs font-medium text-[#161616]">
              {lead.contactHref ? (
                <a href={lead.contactHref} className="inline-flex min-h-11 max-w-full items-center truncate underline-offset-4 hover:underline">
                  {lead.contactLabel}
                </a>
              ) : (
                <p className="truncate">{lead.contactLabel}</p>
              )}
              {getReadablePagePath(lead.pagePath) && <p className="mt-1 truncate font-normal text-[#6f6e6a]">{getReadablePagePath(lead.pagePath)}</p>}
              {lead.resource === "contact" ? (
                <div className="mt-2 grid gap-1 font-normal text-[#6f6e6a]">
                  <p>
                    Request: <span className="font-semibold capitalize text-[#161616]">{lead.requestType ?? "message"}</span>
                  </p>
                  {lead.phone ? <a href={`tel:${lead.phone}`} className="inline-flex min-h-11 items-center font-semibold text-[#161616] underline-offset-4 hover:underline">{lead.phone}</a> : null}
                  {lead.preferredCallAt ? (
                    <p>
                      Call: {formatDate(lead.preferredCallAt)}{lead.preferredCallTimezone ? ` (${lead.preferredCallTimezone})` : ""}
                    </p>
                  ) : null}
                  <p>
                    Email: <span className="font-semibold text-[#161616]">{lead.emailDeliveryStatus?.replaceAll("_", " ") ?? "unknown"}</span>
                  </p>
                  {lead.emailDeliveryStatus === "failed" || lead.emailDeliveryStatus === "delivery_issue" ? (
                    <form action="/admin/leads/requeue-email" method="post" className="pt-1">
                      <input type="hidden" name="contactId" value={lead.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <button type="submit" className="inline-flex min-h-11 items-center rounded border border-[#8b6a18]/30 bg-[#e6c767]/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f5112] hover:bg-[#e6c767]/25">
                        Retry failed email
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-start gap-2">
              <StatusBadge status={lead.status} />
              {lead.status === "archived" ? (
                <form action="/admin/leads/status" method="post">
                  <input type="hidden" name="resource" value={lead.resource} />
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="status" value="new" />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded border border-[#8b6a18]/30 bg-[#e6c767]/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f5112] hover:bg-[#e6c767]/25">
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reopen lead
                  </button>
                </form>
              ) : null}
            </div>

            <time dateTime={lead.createdAt} className="text-xs font-medium uppercase tracking-[0.08em] text-[#6f6e6a]">
              {formatDate(lead.createdAt)}
            </time>
          </article>
        ))
      )}
    </div>
  );
}

function LeadRecordGroup({
  title,
  eyebrow,
  leads,
  pagination,
  hrefForPage,
  returnTo,
}: {
  title: string;
  eyebrow: string;
  leads: DashboardLead[];
  pagination: AdminLeadPage;
  hrefForPage: (page: number) => string;
  returnTo: string;
}) {
  return (
    <section>
      <div className="rounded-lg border border-[#161616]/10 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#161616]/10 px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6a18]">{eyebrow}</p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.03em] text-[#161616]">{title}</h2>
          </div>
          <span className="rounded-full border border-[#161616]/10 px-2.5 py-1 text-xs font-semibold text-[#6f6e6a]">{pagination.total}</span>
        </div>
        <LeadRecords leads={leads} returnTo={returnTo} />
      </div>
      <Pagination pagination={pagination} hrefForPage={hrefForPage} label={title} />
    </section>
  );
}

function PortalActivity({ events, total }: { events: PortalEvent[]; total: number }) {
  return (
    <section className="rounded-lg border border-[#161616]/10 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#161616]/10 px-4 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6a18]">Portal</p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.03em] text-[#161616]">Handoffs</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/analytics?focus=overview"
            className="inline-flex min-h-10 items-center rounded-md border border-[#161616]/10 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6e6a] transition-colors hover:border-[#e6c767] hover:bg-[#e6c767]/15 hover:text-[#161616]"
          >
            View click details
          </Link>
          <span className="rounded-full border border-[#161616]/10 px-2.5 py-1 text-xs font-semibold text-[#6f6e6a]">{total}</span>
        </div>
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
                  <p className="mt-1 break-words text-xs text-[#6f6e6a]">{event.action}{event.page_path ? ` · ${event.page_path}` : ""}</p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[#6f6e6a]">{formatDate(event.created_at)}</p>
                </div>
                <a
                  href={event.portal_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#161616]/10 text-[#161616] transition-colors hover:border-[#e6c767] hover:bg-[#e6c767]/15"
                  aria-label={`Open ${event.action} for ${event.role_title} in a new tab`}
                  title={`Open ${event.action} for ${event.role_title} in a new tab`}
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
  contactPagination,
  chatPagination,
  portalPagination,
  section = "all",
}: {
  contactLeads: DashboardLead[];
  chatLeads: DashboardLead[];
  portalEvents: PortalEvent[];
  contactPagination: AdminLeadPage;
  chatPagination: AdminLeadPage;
  portalPagination: AdminLeadPage;
  section?: "all" | "records" | "portal";
}) {
  const params = useSearchParams();
  const requestedStatus = params?.get("status") ?? null;
  const requestedTab = params?.get("tab") ?? null;
  const activeStatus = isLeadStatus(requestedStatus) ? requestedStatus : undefined;
  const showRecords = section === "all" || section === "records";
  const showPortal = section === "all" || section === "portal";
  const returnFallback = showRecords ? "/admin/leads?tab=records" : "/admin/leads?tab=portal";
  const search = params?.toString() ?? "";
  const returnTo = sanitizeAdminLeadsReturnTo(
    search ? `/admin/leads?${search}` : returnFallback,
    returnFallback,
  );
  const filterBaseHref = requestedTab ? `/admin/leads?tab=${requestedTab}` : "/admin/leads";
  const createPageHref = (key: "contactPage" | "chatPage" | "portalPage", page: number) => {
    const query = new URLSearchParams();
    if (requestedTab) query.set("tab", requestedTab);
    if (showRecords && activeStatus) query.set("status", activeStatus);
    const pages = {
      contactPage: contactPagination.page,
      chatPage: chatPagination.page,
      portalPage: portalPagination.page,
    };
    pages[key] = page;
    for (const [pageKey, pageValue] of Object.entries(pages)) {
      if (pageValue > 1 && (showRecords || pageKey === "portalPage")) query.set(pageKey, String(pageValue));
    }
    const suffix = query.toString();
    return suffix ? `/admin/leads?${suffix}` : "/admin/leads";
  };
  const totalRecords = contactPagination.total + chatPagination.total;

  return (
    <>
      <section className="grid gap-6">
        {showRecords && (
          <>
            <section className="rounded-lg border border-[#161616]/10 bg-white">
              <div className="flex flex-col gap-4 border-b border-[#161616]/10 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6a18]">Records</p>
                  <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.03em] text-[#161616]">
                    {totalRecords} {totalRecords === 1 ? "lead" : "leads"}
                  </h2>
                </div>
                <nav className="flex flex-wrap gap-2" aria-label="Lead status filter">
                  {statusTabs.map((tab) => {
                    const active = tab.value === activeStatus || (!tab.value && !activeStatus);
                    return (
                      <Link
                        key={tab.label}
                        href={tab.value ? `${filterBaseHref}${requestedTab ? "&" : "?"}status=${tab.value}` : filterBaseHref}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex min-h-11 items-center rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                          active ? "border-[#161616] bg-[#161616] text-white" : "border-[#161616]/10 bg-white text-[#6f6e6a] hover:border-[#e6c767] hover:text-[#161616]"
                        }`}
                      >
                        {tab.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </section>
            <LeadRecordGroup
              title="Contact form requests"
              eyebrow="Forms"
              leads={contactLeads}
              pagination={contactPagination}
              hrefForPage={(page) => createPageHref("contactPage", page)}
              returnTo={returnTo}
            />
            <LeadRecordGroup
              title="Live chat transcripts"
              eyebrow="Chat"
              leads={chatLeads}
              pagination={chatPagination}
              hrefForPage={(page) => createPageHref("chatPage", page)}
              returnTo={returnTo}
            />
          </>
        )}

        {showPortal && (
          <>
            <PortalActivity events={portalEvents} total={portalPagination.total} />
            <Pagination
              pagination={portalPagination}
              hrefForPage={(page) => createPageHref("portalPage", page)}
              label="Portal handoffs"
            />
          </>
        )}
      </section>
    </>
  );
}
