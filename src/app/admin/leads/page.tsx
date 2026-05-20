import type { Metadata } from "next";
import { BarChart3, Inbox, Mail, MessageCircle, MousePointerClick } from "lucide-react";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  fetchAdminLeadDashboard,
  type ChatLead,
  type ContactLead,
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

export default async function AdminLeadsPage() {
  await requireAdminSession();

  const result = await fetchAdminLeadDashboard();

  return (
    <main data-admin-scrollbar="true" className="min-h-screen bg-[#f7f4ef] px-4 py-6 text-foreground md:px-8">
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

                <AdminLeadDetails contactLeads={contactLeads} chatLeads={chatLeads} portalEvents={result.data.portalEvents} />
              </>
            );
          })()
        )}
      </div>
    </main>
  );
}
