import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ExternalLink, Inbox, Mail, MessageCircle, MousePointerClick, ShieldCheck } from "lucide-react";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  fetchAdminLeadDashboard,
  parseLeadStatus,
  type ChatLead,
  type ContactLead,
  type LeadResource,
  type LeadStatus,
  type PortalEvent,
} from "@/lib/admin/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Leads | AIXCO.Global",
};

type AdminLeadsPageProps = {
  searchParams?: Promise<{ status?: string; updated?: string; error?: string }>;
};

type DashboardLead = {
  id: string;
  resource: LeadResource;
  status: LeadStatus;
  createdAt: string;
  title: string;
  contactLabel: string;
  contactHref?: string;
  interest: string;
  body: string;
  pagePath: string;
  meta: string;
};

const statusTabs: { label: string; value?: LeadStatus }[] = [
  { label: "All" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Archived", value: "archived" },
];

const pipelineStages: { label: string; value: LeadStatus; headerClass: string; dotClass: string }[] = [
  {
    label: "New",
    value: "new",
    headerClass: "border-amber-200 bg-amber-50 text-amber-900",
    dotClass: "bg-amber-500",
  },
  {
    label: "Contacted",
    value: "contacted",
    headerClass: "border-blue-200 bg-blue-50 text-blue-900",
    dotClass: "bg-blue-500",
  },
  {
    label: "Qualified",
    value: "qualified",
    headerClass: "border-emerald-200 bg-emerald-50 text-emerald-900",
    dotClass: "bg-emerald-500",
  },
  {
    label: "Archived",
    value: "archived",
    headerClass: "border-slate-200 bg-slate-100 text-slate-700",
    dotClass: "bg-slate-400",
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function trimText(value: string | null, maxLength = 210) {
  if (!value) return "No message recorded.";
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

function getFeedbackMessage(params: { updated?: string; error?: string }) {
  if (params.updated === "1") return { tone: "success", text: "Lead status updated." };
  if (params.error === "invalid-status-update") return { tone: "error", text: "That status update was invalid." };
  if (params.error === "status-update-failed") return { tone: "error", text: "Could not update lead status." };
  return null;
}

function getStatusClass(status: LeadStatus) {
  if (status === "new") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "contacted") return "border-blue-200 bg-blue-50 text-blue-800";
  if (status === "qualified") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-slate-200 bg-slate-100 text-slate-600";
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

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

function StatusForm({ resource, id, status }: { resource: LeadResource; id: string; status: LeadStatus }) {
  return (
    <form action="/admin/leads/status" method="post" className="grid grid-cols-[1fr_auto] gap-2">
      <input type="hidden" name="resource" value={resource} />
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`${resource}-${id}-status`}>
        Status
      </label>
      <select
        id={`${resource}-${id}-status`}
        name="status"
        defaultValue={status}
        className="h-9 min-w-0 rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none transition-colors focus:border-primary"
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="archived">Archived</option>
      </select>
      <button
        type="submit"
        className="h-9 rounded-md border border-primary/30 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Save
      </button>
    </form>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Inbox;
}) {
  return (
    <article className="rounded-lg border border-border/70 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </article>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white/70 p-5 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function PipelineLeadCard({ lead }: { lead: DashboardLead }) {
  return (
    <article id={`${lead.resource}-${lead.id}`} className="rounded-lg border border-border/70 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="break-words text-sm font-semibold leading-tight text-foreground">{lead.title}</p>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                lead.resource === "contact" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {lead.resource === "contact" ? "Contact" : "Chat"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{lead.interest}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <p className="mt-3 whitespace-pre-line break-words text-xs leading-6 text-foreground/75">{lead.body}</p>

      <div className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        {lead.contactHref ? (
          <a href={lead.contactHref} className="block truncate text-primary">
            {lead.contactLabel}
          </a>
        ) : (
          <p>{lead.contactLabel}</p>
        )}
        <p className="truncate">{lead.pagePath}</p>
        <p>{formatDate(lead.createdAt)}</p>
      </div>

      <div className="mt-3">
        <StatusForm resource={lead.resource} id={lead.id} status={lead.status} />
      </div>
    </article>
  );
}

function PipelineBoard({ leads }: { leads: DashboardLead[] }) {
  return (
    <section className="rounded-xl border border-border/70 bg-surface-elevated p-4 shadow-elegant md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Pipeline</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground">Lead pipeline</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Move contact forms and live chat transcripts through the same qualification flow.
          </p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{leads.length} total lead records</p>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="grid min-w-[980px] grid-cols-4 gap-3">
          {pipelineStages.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.status === stage.value);

            return (
              <section key={stage.value} aria-label={`${stage.label} leads`} className="min-w-0">
                <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${stage.headerClass}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${stage.dotClass}`} aria-hidden="true" />
                    <h3 className="text-sm font-semibold">{stage.label}</h3>
                  </div>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">{stageLeads.length}</span>
                </div>

                <div className="mt-2 grid max-h-[34rem] gap-2 overflow-y-auto rounded-lg border border-border/60 bg-background/60 p-2">
                  {stageLeads.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border bg-white/70 px-3 py-6 text-center text-xs text-muted-foreground">
                      Empty
                    </div>
                  ) : (
                    stageLeads.map((lead) => <PipelineLeadCard key={`${lead.resource}-${lead.id}`} lead={lead} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LeadList({ title, leads, emptyLabel }: { title: string; leads: DashboardLead[]; emptyLabel: string }) {
  return (
    <section className="rounded-xl border border-border/70 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="mt-4 grid gap-3">
        {leads.length === 0 ? (
          <EmptyState label={emptyLabel} />
        ) : (
          leads.map((lead) => (
            <article key={`${lead.resource}-${lead.id}`} className="rounded-lg border border-border/70 bg-background/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-base font-semibold leading-tight">{lead.title}</h3>
                    <StatusBadge status={lead.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{lead.interest}</p>
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-foreground/75">{lead.body}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{formatDate(lead.createdAt)}</span>
                    <span>{lead.pagePath}</span>
                    <span>{lead.meta}</span>
                  </div>
                </div>
                <div className="w-full shrink-0 sm:w-64">
                  <StatusForm resource={lead.resource} id={lead.id} status={lead.status} />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function PortalActivity({ events }: { events: PortalEvent[] }) {
  return (
    <section className="rounded-xl border border-border/70 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Portal handoff activity</h2>
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{events.length}</span>
      </div>

      <div className="mt-4 grid gap-3">
        {events.length === 0 ? (
          <EmptyState label="No portal handoff events have been captured yet." />
        ) : (
          events.map((event) => (
            <article key={event.id} className="rounded-lg border border-border/70 bg-background/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold capitalize">{event.mode}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.role_title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(event.created_at)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.page_path ?? "Unknown page"}</p>
                </div>
                <a
                  href={event.portal_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {event.action}
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

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const activeStatus = parseLeadStatus(params.status);
  const feedback = getFeedbackMessage(params);
  const result = await fetchAdminLeadDashboard();

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-foreground md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-xl border border-[#312719]/20 bg-[#11100e] p-5 text-white shadow-elegant md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">AIXCO Admin</p>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">Lead dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
                Review captured website contacts, live chat transcripts, and portal handoff activity from one operating view.
              </p>
            </div>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-md border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-primary hover:text-primary"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {feedback && (
          <p
            role="status"
            className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.text}
          </p>
        )}

        {result.ok === false ? (
          <section className="mt-6 rounded-xl border border-border/70 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl">Dashboard is not ready</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.reason}</p>
            {result.missing && (
              <ul className="mt-4 space-y-2 text-sm">
                {result.missing.map((item) => (
                  <li key={item} className="rounded-md bg-background/70 px-3 py-2 font-mono text-xs">
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
            const focusedContacts = activeStatus ? contactLeads.filter((lead) => lead.status === activeStatus) : contactLeads;
            const focusedChats = activeStatus ? chatLeads.filter((lead) => lead.status === activeStatus) : chatLeads;
            const focusedCount = focusedContacts.length + focusedChats.length;

            return (
              <>
                <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard
                    label="Open queue"
                    value={result.data.stats.newContacts + result.data.stats.newChats}
                    detail="New records waiting for review"
                    icon={Inbox}
                  />
                  <StatCard label="Contacts" value={result.data.stats.totalContacts} detail="Contact form submissions" icon={Mail} />
                  <StatCard label="Live chats" value={result.data.stats.totalChats} detail="Saved visitor transcripts" icon={MessageCircle} />
                  <StatCard label="Portal clicks" value={result.data.stats.totalPortalEvents} detail="Portal handoff events" icon={MousePointerClick} />
                  <StatCard label="Total leads" value={allLeads.length} detail="Contacts and chats combined" icon={BarChart3} />
                </section>

                <div className="mt-6">
                  <PipelineBoard leads={allLeads} />
                </div>

                <section className="mt-6 rounded-xl border border-border/70 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                        Detail filter
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activeStatus ? `${focusedCount} records in ${activeStatus}.` : `${focusedCount} records across every status.`}
                      </p>
                    </div>
                    <nav className="flex flex-wrap gap-2" aria-label="Lead status filter">
                      {statusTabs.map((tab) => {
                        const active = tab.value === activeStatus || (!tab.value && !activeStatus);
                        return (
                          <Link
                            key={tab.label}
                            href={tab.value ? `/admin/leads?status=${tab.value}` : "/admin/leads"}
                            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-white text-foreground hover:border-primary/40"
                            }`}
                          >
                            {tab.label}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.55fr)]">
                  <div className="grid gap-6">
                    <LeadList title="Contact submissions" leads={sortNewest(focusedContacts)} emptyLabel="No contact leads match this filter." />
                    <LeadList title="Live chat transcripts" leads={sortNewest(focusedChats)} emptyLabel="No chat transcripts match this filter." />
                  </div>
                  <PortalActivity events={result.data.portalEvents} />
                </section>
              </>
            );
          })()
        )}
      </div>
    </main>
  );
}
