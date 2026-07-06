import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Archive,
  BarChart3,
  CheckCircle2,
  Inbox,
  LogOut,
  Mail,
  MessageCircle,
  MousePointerClick,
  UserCheck,
} from "lucide-react";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  fetchAdminLeadDashboard,
  type ChatLead,
  type ContactLead,
  type LeadStatus,
  type PortalEvent,
} from "@/lib/admin/leads";
import { AdminLeadDetails } from "./AdminLeadDetails";
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
  { label: "New Leads", value: "new" },
  { label: "Pipeline", value: "pipeline" },
  { label: "Records", value: "records" },
  { label: "Portal", value: "portal" },
];

const PAGE_SIZE = 15;

function trimText(value: string | null, maxLength = 210) {
  if (!value) return "No message recorded.";
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

function toContactLead(lead: ContactLead): DashboardLead {
  return {
    id: lead.id,
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
  };
}

function toChatLead(lead: ChatLead): DashboardLead {
  return {
    id: lead.id,
    resource: "chat",
    status: lead.status,
    createdAt: lead.created_at,
    title: lead.interest ?? "Live chat visitor",
    contactLabel: `${lead.message_count} messages`,
    interest: lead.interest ?? "Unclassified",
    body: trimText(lead.transcript, 320),
    pagePath: lead.page_path ?? "Unknown page",
    meta: "Live chat transcript",
  };
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

function clampPage(page: number, total: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(page, totalPages);
}

function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function tabHref(view: AdminView) {
  return view === "overview" ? "/admin/leads" : `/admin/leads?tab=${view}`;
}

function formatCountSuffix(count: number, hideWhenZero = false) {
  if (hideWhenZero && count === 0) return "";
  return ` (${count})`;
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

function AdminTabs({
  activeView,
  counts,
}: {
  activeView: AdminView;
  counts: Record<AdminView, number>;
}) {
  return (
    <nav className="-mx-4 mb-6 flex overflow-x-auto border-b border-[#161616]/10 px-4 sm:mx-0 sm:px-0" aria-label="Admin dashboard tabs">
      {adminViews.map((view) => {
        const active = activeView === view.value;
        return (
          <Link
            key={view.value}
            href={tabHref(view.value)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              active
                ? "border-[#8b6a18] text-[#8b6a18]"
                : "border-transparent text-[#6f6e6a] hover:border-[#161616]/20 hover:text-[#161616]"
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
  variant = "primary",
}: {
  lead: DashboardLead;
  status: LeadStatus;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <form action="/admin/leads/status" method="post">
      <input type="hidden" name="resource" value={lead.resource} />
      <input type="hidden" name="id" value={lead.id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={
          variant === "primary"
            ? "inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-[#161616] px-3 text-xs font-semibold text-white transition-colors hover:bg-black"
            : "inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-[#161616]/10 bg-white px-3 text-xs font-semibold text-[#6f6e6a] transition-colors hover:bg-[#f6f4ef] hover:text-[#161616]"
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
}: {
  leads: DashboardLead[];
  emptyLabel: string;
  showActions?: boolean;
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
        <article key={`${lead.resource}-${lead.id}`} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="break-words text-sm font-semibold text-[#161616]">{lead.title}</p>
              <span className="rounded-full bg-[#f1efe8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6e6a]">
                {lead.resource === "contact" ? "Form" : "Chat"}
              </span>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-xs text-[#6f6e6a]">{lead.interest}</p>
            <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-sm leading-6 text-[#55534f]">{lead.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6f6e6a]">
              {lead.contactHref ? (
                <a href={lead.contactHref} className="font-medium text-[#161616] underline-offset-4 hover:underline">
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
              <StatusActionForm lead={lead} status="contacted" label="Mark contacted" />
              <StatusActionForm lead={lead} status="archived" label="Archive" variant="secondary" />
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
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#161616]/10 px-3 text-xs font-semibold text-[#161616] transition-colors hover:bg-[#f6f4ef]"
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
  newLeads,
  portalEvents,
  stats,
}: {
  leads: DashboardLead[];
  newLeads: DashboardLead[];
  portalEvents: PortalEvent[];
  stats: { totalContacts: number; totalChats: number; totalPortalEvents: number };
}) {
  const qualifiedCount = leads.filter((lead) => lead.status === "qualified").length;

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#161616]">
        <BarChart3 className="h-4 w-4" aria-hidden="true" />
        Platform Overview
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Leads" value={leads.length} icon={BarChart3} />
        <StatCard label="Open Queue" value={newLeads.length} icon={Inbox} />
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
              <Link href="/admin/leads?tab=records" className="text-xs font-semibold text-[#8b6a18] underline-offset-4 hover:underline">
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
              <Link href="/admin/leads?tab=portal" className="text-xs font-semibold text-[#8b6a18] underline-offset-4 hover:underline">
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

function NewLeadQueue({ leads, page }: { leads: DashboardLead[]; page: number }) {
  const activePage = clampPage(page, leads.length);
  const pageLeads = paginateItems(leads, activePage);

  return (
    <section>
      <SectionHeading title="New Leads" count={leads.length} />
      <LeadRows leads={pageLeads} emptyLabel="No new leads right now." showActions />
      <Pagination page={activePage} total={leads.length} hrefForPage={(nextPage) => `/admin/leads?tab=new&page=${nextPage}`} />
    </section>
  );
}

type AdminLeadsPageProps = {
  searchParams?: Promise<{ tab?: string | string[]; page?: string | string[] }>;
};

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  await requireAdminSession();

  const params = searchParams ? await searchParams : {};
  const activeView = getActiveView(params.tab);
  const currentPage = getPageNumber(params.page);
  const result = await fetchAdminLeadDashboard();

  return (
    <main data-admin-scrollbar="true" className="min-h-screen bg-[#f6f4ef] px-4 py-4 text-[#161616] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1400px]">
        <section className="mb-6 border border-[#161616]/10 bg-[#161616] px-5 py-4 text-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-lg font-bold leading-tight">Admin Panel</h1>
              <p className="mt-0.5 text-sm text-white/70">AIXCO lead center</p>
            </div>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-xs font-semibold text-white transition-colors hover:border-[#e6c767] hover:text-[#e6c767]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </section>

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
          </section>
        ) : (
          (() => {
            const contactLeads = result.data.contacts.map(toContactLead);
            const chatLeads = result.data.chats.map(toChatLead);
            const allLeads = sortNewest([...contactLeads, ...chatLeads]);
            const newLeads = allLeads.filter((lead) => lead.status === "new");
            const counts: Record<AdminView, number> = {
              overview: allLeads.length,
              new: newLeads.length,
              pipeline: allLeads.length,
              records: allLeads.length,
              portal: result.data.portalEvents.length,
            };

            return (
              <>
                <AdminTabs activeView={activeView} counts={counts} />

                {activeView === "overview" && (
                  <OverviewSection
                    leads={allLeads}
                    newLeads={newLeads}
                    portalEvents={result.data.portalEvents}
                    stats={result.data.stats}
                  />
                )}

                {activeView === "new" && <NewLeadQueue leads={newLeads} page={currentPage} />}

                {activeView === "pipeline" && <PipelineBoard leads={allLeads} />}

                {activeView === "records" && (
                  <AdminLeadDetails contactLeads={contactLeads} chatLeads={chatLeads} portalEvents={result.data.portalEvents} section="records" />
                )}

                {activeView === "portal" && (
                  <AdminLeadDetails contactLeads={contactLeads} chatLeads={chatLeads} portalEvents={result.data.portalEvents} section="portal" />
                )}
              </>
            );
          })()
        )}
      </div>
    </main>
  );
}
