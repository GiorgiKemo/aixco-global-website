import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Archive,
  BarChart3,
  CheckCircle2,
  Inbox,
  Mail,
  MessageCircle,
  MousePointerClick,
  UserCheck,
} from "lucide-react";
import { AdminShell } from "@/app/admin/_components";
import { requireAal2AdminSession } from "@/lib/admin/auth";
import {
  fetchAdminLeadDashboard,
  parseLeadStatus,
  type AdminLeadPage,
  type ChatLead,
  type ContactLead,
  type LeadStatus,
  type PortalEvent,
} from "@/lib/admin/leads";
import { AdminLeadDetails } from "./AdminLeadDetails";
import { LeadFeedback } from "./LeadFeedback";
import { sanitizeAdminLeadsReturnTo } from "./navigation";
import { PipelineBoard, type DashboardLead } from "./PipelineBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Leads | AIXCO.Global",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminView = "overview" | "new" | "pipeline" | "records" | "portal";

const adminViews: { label: string; value: AdminView }[] = [
  { label: "Overview", value: "overview" },
  { label: "Inbox", value: "new" },
  { label: "Pipeline", value: "pipeline" },
  { label: "Active records", value: "records" },
  { label: "Portal handoffs", value: "portal" },
];

function trimText(value: string | null, maxLength = 210) {
  if (!value) return "No message recorded.";
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

function toContactLead(lead: ContactLead): DashboardLead {
  return {
    id: lead.id,
    reference: lead.request_reference,
    resource: "contact",
    status: lead.status,
    createdAt: lead.created_at,
    title: lead.name,
    contactLabel: lead.email,
    contactHref: `mailto:${lead.email}`,
    interest: lead.interest ?? "General inquiry",
    body: trimText(lead.message),
    pagePath: lead.page_path ?? "Unknown page",
    meta: "Contact form",
    requestType: lead.request_type,
    phone: lead.phone,
    preferredCallAt: lead.preferred_call_at,
    preferredCallTimezone: lead.preferred_call_timezone,
    emailDeliveryStatus: lead.email_delivery_status,
    emailDeliveryUpdatedAt: lead.email_delivery_updated_at,
  };
}

function toChatLead(lead: ChatLead): DashboardLead {
  return {
    id: lead.id,
    resource: "chat",
    status: lead.status,
    createdAt: lead.created_at,
    title: lead.interest ?? "Live chat visitor",
    contactLabel: formatChatMessageCount(lead.message_count),
    interest: lead.interest ?? "Unclassified",
    body: trimText(lead.transcript, 320),
    pagePath: lead.page_path ?? "Unknown page",
    meta: "Live chat transcript",
  };
}

export function formatChatMessageCount(count: number) {
  return `${count} ${count === 1 ? "message" : "messages"}`;
}

function sortNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
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
  if (status === "new") return "bg-[#e6c767]/20 text-[#161616]";
  if (status === "contacted") return "bg-[#161616]/10 text-[#161616]";
  if (status === "qualified") return "bg-[#161616] text-white";
  return "bg-[#efefec] text-[#6f6e6a]";
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusClass(status)}`}>{status}</span>;
}

function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getActiveView(value: string | string[] | undefined): AdminView {
  const tab = getQueryParam(value);
  return adminViews.some((item) => item.value === tab) ? (tab as AdminView) : "overview";
}

function getPageNumber(value: string | string[] | undefined) {
  const page = Number.parseInt(getQueryParam(value) ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function tabHref(view: AdminView) {
  return view === "overview" ? "/admin/leads" : `/admin/leads?tab=${view}`;
}

function formatCountSuffix(count: number, hideWhenZero = false) {
  if (hideWhenZero && count === 0) return "";
  return ` (${count})`;
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
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-[#161616]/10 bg-[#f1efe8] px-3 text-sm font-medium text-[#9e9d9d] sm:flex-none";

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[#6f6e6a]">
        {total === 0 ? "Showing 0 of 0" : `Showing ${start}-${end} of ${total}`}
      </span>
      {totalPages > 1 ? (
        <nav className="flex w-full items-center gap-1 overflow-x-auto sm:w-auto sm:justify-end" aria-label={`${label} pagination`}>
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
              <span key={item} className="grid h-11 min-w-7 place-items-center text-xs text-[#9e9d9d]" aria-hidden="true">…</span>
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
        </nav>
      ) : null}
    </div>
  );
}

function AdminTabs({
  activeView,
  counts,
}: {
  activeView: AdminView;
  counts: Record<AdminView, number>;
}) {
  return (
    <nav className="mb-6 grid w-full grid-cols-2 gap-1 rounded-[10px] border border-[#161616]/10 bg-white p-1 shadow-sm sm:flex sm:w-fit" aria-label="Lead workspace views">
      {adminViews.map((view) => {
        const active = activeView === view.value;
        return (
          <Link
            key={view.value}
            href={tabHref(view.value)}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-[7px] px-3 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] sm:px-4 ${
              active
                ? "bg-[#161616] text-white"
                : "text-[#6f6e6a] hover:bg-[#f8f6f1] hover:text-[#161616]"
            }`}
          >
            {view.label}
            {view.value !== "overview" && formatCountSuffix(counts[view.value], view.value === "portal")}
          </Link>
        );
      })}
    </nav>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Inbox;
}) {
  return (
    <div className="rounded-lg border border-[#161616]/10 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-[#6f6e6a]" aria-hidden="true" />
        <span className="font-display text-2xl font-bold leading-none text-[#161616]">{value}</span>
      </div>
      <p className="text-xs text-[#6f6e6a]">{label}</p>
    </div>
  );
}

function StatusActionForm({
  lead,
  status,
  label,
  returnTo,
  variant = "primary",
}: {
  lead: DashboardLead;
  status: LeadStatus;
  label: string;
  returnTo: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <form action="/admin/leads/status" method="post">
      <input type="hidden" name="resource" value={lead.resource} />
      <input type="hidden" name="id" value={lead.id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className={
          variant === "primary"
            ? "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md bg-[#161616] px-3 text-xs font-semibold text-white transition-colors hover:bg-black"
            : "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md border border-[#161616]/10 bg-white px-3 text-xs font-semibold text-[#6f6e6a] transition-colors hover:bg-[#f6f4ef] hover:text-[#161616]"
        }
      >
        {variant === "primary" ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
        {label}
      </button>
    </form>
  );
}

function LeadRows({
  leads,
  emptyLabel,
  showActions = false,
  returnTo = "/admin/leads?tab=new",
}: {
  leads: DashboardLead[];
  emptyLabel: string;
  showActions?: boolean;
  returnTo?: string;
}) {
  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-[#161616]/10 bg-white p-8 text-center text-sm text-[#6f6e6a]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#161616]/10 bg-white divide-y divide-[#161616]/10">
      {leads.map((lead) => (
        <article id={`${lead.resource}-${lead.id}`} key={`${lead.resource}-${lead.id}`} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="break-words text-sm font-semibold text-[#161616]">{lead.title}</p>
              <span className="rounded-full bg-[#f1efe8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6e6a]">
                {lead.resource === "contact" ? "Form" : "Chat"}
              </span>
              {lead.reference ? (
                <span className="rounded border border-[#e6c767]/70 bg-[#e6c767]/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] text-[#6f5112]">
                  {lead.reference}
                </span>
              ) : null}
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-xs text-[#6f6e6a]">{lead.interest}</p>
            <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-sm leading-6 text-[#55534f]">{lead.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6f6e6a]">
              {lead.contactHref ? (
                <a href={lead.contactHref} className="inline-flex min-h-11 items-center font-medium text-[#161616] underline-offset-4 hover:underline">
                  {lead.contactLabel}
                </a>
              ) : (
                <span className="font-medium text-[#161616]">{lead.contactLabel}</span>
              )}
              {getReadablePagePath(lead.pagePath) && <span>{getReadablePagePath(lead.pagePath)}</span>}
              <time dateTime={lead.createdAt}>{formatDate(lead.createdAt)}</time>
            </div>
          </div>

          {showActions && (
            <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:w-56 lg:grid-cols-1">
              <StatusActionForm lead={lead} status="contacted" label="Mark contacted" returnTo={returnTo} />
              <StatusActionForm lead={lead} status="archived" label="Archive" returnTo={returnTo} variant="secondary" />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function PortalRows({ events, limit }: { events: PortalEvent[]; limit?: number }) {
  const visibleEvents = typeof limit === "number" ? events.slice(0, limit) : events;

  if (visibleEvents.length === 0) {
    return (
      <div className="rounded-lg border border-[#161616]/10 bg-white p-8 text-center text-sm text-[#6f6e6a]">
        No portal events yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#161616]/10 bg-white divide-y divide-[#161616]/10">
      {visibleEvents.map((event) => (
        <article key={event.id} className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold capitalize text-[#161616]">{event.mode}</p>
              <span className="rounded-full bg-[#f1efe8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6e6a]">
                Portal
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-[#6f6e6a]">{event.role_title}</p>
            <p className="mt-1 text-xs text-[#6f6e6a]">{formatDate(event.created_at)}</p>
          </div>
          <a
            href={event.portal_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${event.action} for ${event.role_title} in a new tab`}
            title={`Open ${event.action} for ${event.role_title} in a new tab`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-[#161616]/10 px-3 text-xs font-semibold text-[#161616] transition-colors hover:bg-[#f6f4ef]"
          >
            Open
          </a>
        </article>
      ))}
    </div>
  );
}

function SectionHeading({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-base font-semibold text-[#161616]">
        {title}
        {typeof count === "number" && <span className="ml-2 text-sm font-normal text-[#6f6e6a]">({count})</span>}
      </h2>
      {action}
    </div>
  );
}

function OverviewSection({
  leads,
  portalEvents,
  stats,
}: {
  leads: DashboardLead[];
  portalEvents: PortalEvent[];
  stats: {
    newContacts: number;
    newChats: number;
    qualifiedContacts: number;
    qualifiedChats: number;
    totalContacts: number;
    totalChats: number;
    totalPortalEvents: number;
  };
}) {
  const totalLeads = stats.totalContacts + stats.totalChats;
  const openQueue = stats.newContacts + stats.newChats;
  const qualifiedCount = stats.qualifiedContacts + stats.qualifiedChats;

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#161616]">
        <BarChart3 className="h-4 w-4" aria-hidden="true" />
        Platform Overview
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active Leads" value={totalLeads} icon={BarChart3} />
        <StatCard label="Open Queue" value={openQueue} icon={Inbox} />
        <StatCard label="Contacts" value={stats.totalContacts} icon={Mail} />
        <StatCard label="Live Chats" value={stats.totalChats} icon={MessageCircle} />
        <StatCard label="Qualified" value={qualifiedCount} icon={UserCheck} />
        <StatCard label="Portal Clicks" value={stats.totalPortalEvents} icon={MousePointerClick} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <SectionHeading
            title="Newest Leads"
            count={Math.min(leads.length, 5)}
            action={
              <Link href="/admin/leads?tab=records" className="inline-flex min-h-11 items-center text-xs font-semibold text-[#8b6a18] underline-offset-4 hover:underline">
                View records
              </Link>
            }
          />
          <LeadRows leads={leads.slice(0, 5)} emptyLabel="No leads captured yet." />
        </section>

        <section>
          <SectionHeading
            title="Portal Activity"
            count={Math.min(portalEvents.length, 5)}
            action={
              <Link href="/admin/leads?tab=portal" className="inline-flex min-h-11 items-center text-xs font-semibold text-[#8b6a18] underline-offset-4 hover:underline">
                View portal
              </Link>
            }
          />
          <PortalRows events={portalEvents} limit={5} />
        </section>
      </div>
    </div>
  );
}

function NewLeadQueue({
  contactLeads,
  chatLeads,
  contactPagination,
  chatPagination,
}: {
  contactLeads: DashboardLead[];
  chatLeads: DashboardLead[];
  contactPagination: AdminLeadPage;
  chatPagination: AdminLeadPage;
}) {
  const total = contactPagination.total + chatPagination.total;
  const returnQuery = new URLSearchParams({ tab: "new" });
  if (contactPagination.page > 1) returnQuery.set("contactPage", String(contactPagination.page));
  if (chatPagination.page > 1) returnQuery.set("chatPage", String(chatPagination.page));
  const returnTo = sanitizeAdminLeadsReturnTo(`/admin/leads?${returnQuery.toString()}`);
  const hrefForPage = (resource: "contact" | "chat", page: number) => {
    const query = new URLSearchParams({ tab: "new" });
    if (resource === "contact" && page > 1) query.set("contactPage", String(page));
    if (resource === "chat" && page > 1) query.set("chatPage", String(page));
    if (resource !== "contact" && contactPagination.page > 1) query.set("contactPage", String(contactPagination.page));
    if (resource !== "chat" && chatPagination.page > 1) query.set("chatPage", String(chatPagination.page));
    return `/admin/leads?${query.toString()}`;
  };

  return (
    <section className="space-y-6">
      <SectionHeading title="New Leads" count={total} />
      <section>
        <SectionHeading title="Contact form requests" count={contactPagination.total} />
        <LeadRows leads={contactLeads} emptyLabel="No new contact requests right now." showActions returnTo={returnTo} />
        <Pagination
          pagination={contactPagination}
          hrefForPage={(page) => hrefForPage("contact", page)}
          label="New contact requests"
        />
      </section>
      <section>
        <SectionHeading title="Live chat transcripts" count={chatPagination.total} />
        <LeadRows leads={chatLeads} emptyLabel="No new chat transcripts right now." showActions returnTo={returnTo} />
        <Pagination
          pagination={chatPagination}
          hrefForPage={(page) => hrefForPage("chat", page)}
          label="New chat transcripts"
        />
      </section>
    </section>
  );
}

type AdminLeadsPageProps = {
  searchParams?: Promise<{
    tab?: string | string[];
    status?: string | string[];
    contactPage?: string | string[];
    chatPage?: string | string[];
    portalPage?: string | string[];
    updated?: string | string[];
    requeued?: string | string[];
    error?: string | string[];
  }>;
};

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  const adminPrincipal = await requireAal2AdminSession();

  const params = searchParams ? await searchParams : {};
  const activeView = getActiveView(params.tab);
  const requestedStatus = parseLeadStatus(getQueryParam(params.status));
  const result = await fetchAdminLeadDashboard({
    status: activeView === "new" ? "new" : activeView === "records" ? requestedStatus : undefined,
    contactPage: getPageNumber(params.contactPage),
    chatPage: getPageNumber(params.chatPage),
    portalPage: getPageNumber(params.portalPage),
    mode: activeView === "pipeline" ? "pipeline" : "paged",
  });

  return (
    <AdminShell adminEmail={adminPrincipal.email}>
      <main data-admin-scrollbar="true" className="admin-safe-page admin-safe-page--dashboard bg-[#f8f6f1] px-4 py-5 text-[#161616] sm:px-7 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <header className="mb-7 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Leads</p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Lead workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6e6a]">Review new requests, move qualified leads through the pipeline, and open complete paginated records without mixing unrelated tools.</p>
          </header>

        {result.ok === false ? (
          <section className="rounded-lg border border-[#161616]/10 bg-white p-6">
            <h2 className="font-display text-2xl">Dashboard is not ready</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6f6e6a]">{result.reason}</p>
            {result.missing && (
              <ul className="mt-4 space-y-2 text-sm">
                {result.missing.map((item) => (
                  <li key={item} className="rounded-md bg-[#f6f4ef] px-3 py-2 font-mono text-xs">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/leads" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[9px] bg-[#161616] px-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]">
              Retry lead dashboard
            </Link>
          </section>
        ) : (
          (() => {
            const contactLeads = result.data.contacts.map(toContactLead);
            const chatLeads = result.data.chats.map(toChatLead);
            const allLeads = sortNewest([...contactLeads, ...chatLeads]);
            const totalLeads = result.data.stats.totalContacts + result.data.stats.totalChats;
            const totalNewLeads = result.data.stats.newContacts + result.data.stats.newChats;
            const counts: Record<AdminView, number> = {
              overview: totalLeads,
              new: totalNewLeads,
              pipeline: totalLeads,
              records: totalLeads,
              portal: result.data.stats.totalPortalEvents,
            };

            return (
              <>
                <AdminTabs activeView={activeView} counts={counts} />
                <LeadFeedback
                  updated={getQueryParam(params.updated)}
                  requeued={getQueryParam(params.requeued)}
                  error={getQueryParam(params.error)}
                />

                {activeView === "overview" && (
                  <OverviewSection
                    leads={allLeads}
                    portalEvents={result.data.portalEvents}
                    stats={result.data.stats}
                  />
                )}

                {activeView === "new" && (
                  <NewLeadQueue
                    contactLeads={contactLeads}
                    chatLeads={chatLeads}
                    contactPagination={result.data.pagination.contacts}
                    chatPagination={result.data.pagination.chats}
                  />
                )}

                {activeView === "pipeline" && (
                  <section className="space-y-4">
                    <div className="rounded-lg border border-[#8b6a18]/25 bg-[#e6c767]/15 px-4 py-3 text-sm leading-relaxed text-[#55534f]">
                      Pipeline shows the {result.data.window.perResourceLimit} most recent contact requests and the {result.data.window.perResourceLimit} most recent chat transcripts
                      ({allLeads.length} of {totalLeads} active leads). Older active leads remain available in Active records.
                    </div>
                    <PipelineBoard leads={allLeads} returnTo="/admin/leads?tab=pipeline" />
                  </section>
                )}

                {activeView === "records" && (
                  <AdminLeadDetails
                    contactLeads={contactLeads}
                    chatLeads={chatLeads}
                    portalEvents={result.data.portalEvents}
                    contactPagination={result.data.pagination.contacts}
                    chatPagination={result.data.pagination.chats}
                    portalPagination={result.data.pagination.portalEvents}
                    section="records"
                  />
                )}

                {activeView === "portal" && (
                  <AdminLeadDetails
                    contactLeads={contactLeads}
                    chatLeads={chatLeads}
                    portalEvents={result.data.portalEvents}
                    contactPagination={result.data.pagination.contacts}
                    chatPagination={result.data.pagination.chats}
                    portalPagination={result.data.pagination.portalEvents}
                    section="portal"
                  />
                )}
              </>
            );
          })()
        )}
        </div>
      </main>
    </AdminShell>
  );
}
