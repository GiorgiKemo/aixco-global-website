import type { Metadata } from "next";
import Link from "next/link";
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

const statusTabs: { label: string; value?: LeadStatus }[] = [
  { label: "All" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Archived", value: "archived" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function trimText(value: string | null, maxLength = 180) {
  if (!value) return "None";
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

function getFeedbackMessage(params: { updated?: string; error?: string }) {
  if (params.updated === "1") return { tone: "success", text: "Lead status updated." };
  if (params.error === "invalid-status-update") return { tone: "error", text: "That status update was invalid." };
  if (params.error === "status-update-failed") return { tone: "error", text: "Could not update lead status." };
  return null;
}

function statusClass(status: LeadStatus) {
  if (status === "new") return "border-primary/30 bg-primary/10 text-primary";
  if (status === "qualified") return "border-success/30 bg-success/10 text-success";
  if (status === "archived") return "border-muted-foreground/20 bg-muted text-muted-foreground";
  return "border-secondary/30 bg-secondary/10 text-secondary";
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClass(status)}`}>
      {status}
    </span>
  );
}

function StatusForm({ resource, id, status }: { resource: LeadResource; id: string; status: LeadStatus }) {
  return (
    <form action="/admin/leads/status" method="post" className="flex min-w-[220px] items-center gap-2">
      <input type="hidden" name="resource" value={resource} />
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`${resource}-${id}-status`}>
        Status
      </label>
      <select
        id={`${resource}-${id}-status`}
        name="status"
        defaultValue={status}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="archived">Archived</option>
      </select>
      <button type="submit" className="h-10 rounded-md border border-primary/30 px-3 text-xs uppercase tracking-widest text-primary">
        Save
      </button>
    </form>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface-elevated p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-3xl">{value}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="rounded-lg border border-border/70 bg-surface-elevated p-5 text-sm text-muted-foreground">{label}</p>;
}

function ContactTable({ contacts }: { contacts: ContactLead[] }) {
  if (contacts.length === 0) return <EmptyState label="No contact leads match this filter." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/70 bg-surface-elevated">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="border-b border-border/70 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Lead</th>
            <th className="px-4 py-3">Interest</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {contacts.map((lead) => (
            <tr key={lead.id} id={`contact-${lead.id}`} className="align-top">
              <td className="px-4 py-4 text-muted-foreground">{formatDate(lead.created_at)}</td>
              <td className="px-4 py-4">
                <p className="font-medium">{lead.name}</p>
                <a href={`mailto:${lead.email}`} className="mt-1 block text-xs text-primary">
                  {lead.email}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{lead.page_path ?? "Unknown page"}</p>
              </td>
              <td className="px-4 py-4">{lead.interest ?? "None"}</td>
              <td className="max-w-sm px-4 py-4 leading-relaxed text-foreground/80">{trimText(lead.message)}</td>
              <td className="px-4 py-4">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-4">
                <StatusForm resource="contact" id={lead.id} status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChatTable({ chats }: { chats: ChatLead[] }) {
  if (chats.length === 0) return <EmptyState label="No chat transcripts match this filter." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/70 bg-surface-elevated">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="border-b border-border/70 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Interest</th>
            <th className="px-4 py-3">Transcript</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {chats.map((lead) => (
            <tr key={lead.id} id={`chat-${lead.id}`} className="align-top">
              <td className="px-4 py-4 text-muted-foreground">
                {formatDate(lead.created_at)}
                <p className="mt-1 text-xs">{lead.page_path ?? "Unknown page"}</p>
              </td>
              <td className="px-4 py-4">{lead.interest ?? "Unclassified"}</td>
              <td className="max-w-xl whitespace-pre-line px-4 py-4 leading-relaxed text-foreground/80">
                {trimText(lead.transcript, 360)}
                <p className="mt-2 text-xs text-muted-foreground">{lead.message_count} messages</p>
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-4">
                <StatusForm resource="chat" id={lead.id} status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PortalTable({ events }: { events: PortalEvent[] }) {
  if (events.length === 0) return <EmptyState label="No portal handoff events have been captured yet." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/70 bg-surface-elevated">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-border/70 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Mode</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Page</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {events.map((event) => (
            <tr key={event.id} className="align-top">
              <td className="px-4 py-4 text-muted-foreground">{formatDate(event.created_at)}</td>
              <td className="px-4 py-4 capitalize">{event.mode}</td>
              <td className="px-4 py-4">{event.role_title}</td>
              <td className="px-4 py-4">
                <a href={event.portal_url} target="_blank" rel="noreferrer" className="text-primary">
                  {event.action}
                </a>
              </td>
              <td className="px-4 py-4 text-muted-foreground">{event.page_path ?? "Unknown page"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const activeStatus = parseLeadStatus(params.status);
  const feedback = getFeedbackMessage(params);
  const result = await fetchAdminLeadDashboard({ status: activeStatus });

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-border/70 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">AIXCO Admin</p>
            <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">Lead dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Review captured website contacts, live chat handoffs, and portal intent events.
            </p>
          </div>
          <form action="/admin/logout" method="post">
            <button type="submit" className="btn-ghost-gold">
              Sign out
            </button>
          </form>
        </header>

        {feedback && (
          <p
            role="status"
            className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.text}
          </p>
        )}

        {result.ok === false ? (
          <section className="mt-8 rounded-lg border border-border/70 bg-surface-elevated p-6">
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
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="New contacts" value={result.data.stats.newContacts} />
              <Stat label="New chats" value={result.data.stats.newChats} />
              <Stat label="Total contacts" value={result.data.stats.totalContacts} />
              <Stat label="Total chats" value={result.data.stats.totalChats} />
              <Stat label="Portal clicks" value={result.data.stats.totalPortalEvents} />
            </section>

            <nav className="mt-8 flex flex-wrap gap-2" aria-label="Lead status filter">
              {statusTabs.map((tab) => {
                const active = tab.value === activeStatus || (!tab.value && !activeStatus);
                return (
                  <Link
                    key={tab.label}
                    href={tab.value ? `/admin/leads?status=${tab.value}` : "/admin/leads"}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface-elevated text-foreground hover:border-primary/40"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <section className="mt-10">
              <h2 className="font-display text-2xl">Contact submissions</h2>
              <div className="mt-4">
                <ContactTable contacts={result.data.contacts} />
              </div>
            </section>

            <section className="mt-12">
              <h2 className="font-display text-2xl">Live chat transcripts</h2>
              <div className="mt-4">
                <ChatTable chats={result.data.chats} />
              </div>
            </section>

            <section className="mt-12">
              <h2 className="font-display text-2xl">Portal handoff events</h2>
              <div className="mt-4">
                <PortalTable events={result.data.portalEvents} />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
