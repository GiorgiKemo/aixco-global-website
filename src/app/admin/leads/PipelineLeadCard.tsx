"use client";

import { GripVertical, Loader2 } from "lucide-react";
import type { MouseEvent as ReactMouseEvent, PointerEvent } from "react";
import type { LeadResource, LeadStatus } from "@/lib/admin/leads";
import type { DashboardLead } from "./PipelineBoardTypes";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClass(status: LeadStatus) {
  if (status === "new") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "contacted") return "border-blue-200 bg-blue-50 text-blue-800";
  if (status === "qualified") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

export function getLeadKey(lead: Pick<DashboardLead, "resource" | "id">) {
  return `${lead.resource}:${lead.id}`;
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

function StatusForm({ resource, id, status }: { resource: LeadResource; id: string; status: LeadStatus }) {
  return (
    <form action="/admin/leads/status" method="post" className="grid grid-cols-[1fr_auto] gap-2">
      <input type="hidden" name="resource" value={resource} />
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`${resource}-${id}-pipeline-status`}>
        Status
      </label>
      <select
        id={`${resource}-${id}-pipeline-status`}
        name="status"
        defaultValue={status}
        className="h-8 min-w-0 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none transition-colors focus:border-primary"
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="archived">Archived</option>
      </select>
      <button
        type="submit"
        className="h-8 rounded-md border border-primary/30 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Save
      </button>
    </form>
  );
}

export function PipelineLeadCard({
  lead,
  isDragging,
  isPending,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onMouseDown,
}: {
  lead: DashboardLead;
  isDragging: boolean;
  isPending: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>, lead: DashboardLead) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  onMouseDown: (event: ReactMouseEvent<HTMLElement>, lead: DashboardLead) => void;
}) {
  return (
    <article
      id={`${lead.resource}-${lead.id}`}
      data-testid={`pipeline-card-${getLeadKey(lead)}`}
      onPointerDown={(event) => onPointerDown(event, lead)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onMouseDown={(event) => onMouseDown(event, lead)}
      className={`group select-none rounded-lg border bg-white p-3 shadow-sm transition-[border-color,box-shadow,opacity,transform] duration-200 ${
        isDragging ? "scale-[0.99] border-primary/60 opacity-30 shadow-gold" : "cursor-grab border-border/70 active:cursor-grabbing"
      } ${isPending ? "pointer-events-none opacity-70" : ""}`}
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          title="Drag lead"
          className="mt-0.5 inline-flex h-8 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/70 text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{lead.title}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{lead.interest}</p>
            </div>
            <StatusBadge status={lead.status} />
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                lead.resource === "contact" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {lead.resource === "contact" ? "Contact" : "Chat"}
            </span>
            <span className="rounded bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {lead.meta}
            </span>
          </div>

          <p className="mt-2 line-clamp-3 whitespace-pre-line break-words text-xs leading-5 text-foreground/75">{lead.body}</p>

          <div className="mt-3 grid gap-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            {lead.contactHref ? (
              <a href={lead.contactHref} className="truncate text-primary">
                {lead.contactLabel}
              </a>
            ) : (
              <p className="truncate">{lead.contactLabel}</p>
            )}
            <p className="truncate">{lead.pagePath}</p>
            <p>{formatDate(lead.createdAt)}</p>
          </div>

          <div className="mt-3">
            <StatusForm resource={lead.resource} id={lead.id} status={lead.status} />
          </div>
        </div>

        {isPending && <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />}
      </div>
    </article>
  );
}

export function PipelineDragOverlay({
  lead,
  width,
  x,
  y,
}: {
  lead: DashboardLead;
  width: number;
  x: number;
  y: number;
}) {
  return (
    <div
      data-testid="pipeline-drag-overlay"
      className="pointer-events-none fixed z-[100] -rotate-1 rounded-lg border border-primary/50 bg-white p-3 opacity-95 shadow-2xl ring-2 ring-primary/10"
      style={{
        left: 0,
        top: 0,
        width,
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 inline-flex h-8 w-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{lead.title}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{lead.interest}</p>
            </div>
            <StatusBadge status={lead.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                lead.resource === "contact" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {lead.resource === "contact" ? "Contact" : "Chat"}
            </span>
            <span className="rounded bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {lead.meta}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-xs leading-5 text-foreground/75">{lead.body}</p>
        </div>
      </div>
    </div>
  );
}
