"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink, ShieldCheck } from "lucide-react";
import type { LeadResource, LeadStatus, PortalEvent } from "@/lib/admin/leads";
import type { DashboardLead } from "./PipelineBoard";

const statusTabs: { label: string; value?: LeadStatus }[] = [
  { label: "All" },
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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sortNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function getFeedbackMessage(updated: string | null, error: string | null) {
  if (updated === "1") return { tone: "success", text: "Lead status updated." };
  if (error === "invalid-status-update") return { tone: "error", text: "That status update was invalid." };
  if (error === "status-update-failed") return { tone: "error", text: "Could not update lead status." };
  return null;
}

function getStatusClass(status: LeadStatus) {
  if (status === "new") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "contacted") return "border-blue-200 bg-blue-50 text-blue-800";
  if (status === "qualified") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-slate-200 bg-slate-100 text-slate-600";
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white/70 p-5 text-center text-sm text-muted-foreground">
      {label}
    </div>
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

export function AdminLeadDetails({
  contactLeads,
  chatLeads,
  portalEvents,
}: {
  contactLeads: DashboardLead[];
  chatLeads: DashboardLead[];
  portalEvents: PortalEvent[];
}) {
  const params = useSearchParams();
  const requestedStatus = params?.get("status") ?? null;
  const activeStatus = isLeadStatus(requestedStatus) ? requestedStatus : undefined;
  const feedback = getFeedbackMessage(params?.get("updated") ?? null, params?.get("error") ?? null);
  const focusedContacts = useMemo(
    () => (activeStatus ? contactLeads.filter((lead) => lead.status === activeStatus) : contactLeads),
    [activeStatus, contactLeads],
  );
  const focusedChats = useMemo(
    () => (activeStatus ? chatLeads.filter((lead) => lead.status === activeStatus) : chatLeads),
    [activeStatus, chatLeads],
  );
  const focusedCount = focusedContacts.length + focusedChats.length;

  return (
    <>
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
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-foreground hover:border-primary/40"
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
        <PortalActivity events={portalEvents} />
      </section>
    </>
  );
}
