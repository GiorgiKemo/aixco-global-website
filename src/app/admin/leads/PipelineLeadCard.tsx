"use client";

import { Archive, CheckCircle2, GripVertical, Loader2, Mail, RotateCcw } from "lucide-react";
import type { MouseEvent as ReactMouseEvent, PointerEvent } from "react";
import type { LeadResource, LeadStatus } from "@/lib/admin/leads";
import type { DashboardLead } from "./PipelineBoardTypes";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClass(status: LeadStatus) {
  if (status === "new") return "border-[#e6c767]/70 bg-[#e6c767]/20 text-[#161616]";
  if (status === "contacted") return "border-[#161616]/15 bg-white text-[#161616]";
  if (status === "qualified") return "border-[#161616] bg-[#161616] text-white";
  return "border-[#9e9d9d]/35 bg-[#efefec] text-[#6f6e6a]";
}

function getSourceLabel(resource: LeadResource) {
  return resource === "contact" ? "Form" : "Chat";
}

function getPrimaryAction(status: LeadStatus): { label: string; nextStatus: LeadStatus; icon: typeof CheckCircle2 } {
  if (status === "new") return { label: "Mark contacted", nextStatus: "contacted", icon: Mail };
  if (status === "contacted") return { label: "Qualify", nextStatus: "qualified", icon: CheckCircle2 };
  if (status === "qualified") return { label: "Archive", nextStatus: "archived", icon: Archive };
  return { label: "Reopen", nextStatus: "new", icon: RotateCcw };
}

export function getLeadKey(lead: Pick<DashboardLead, "resource" | "id">) {
  return `${lead.resource}:${lead.id}`;
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

function LeadAction({
  lead,
  isPending,
  onStatusChange,
}: {
  lead: DashboardLead;
  isPending: boolean;
  onStatusChange: (lead: DashboardLead, status: LeadStatus) => void;
}) {
  const action = getPrimaryAction(lead.status);
  const Icon = action.icon;

  return (
    <div className="mt-3 flex items-center gap-2 border-t border-[#161616]/10 pt-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => onStatusChange(lead, action.nextStatus)}
        className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-[#161616] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {action.label}
      </button>
      {lead.status !== "archived" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => onStatusChange(lead, "archived")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#161616]/10 bg-white text-[#6f6e6a] transition-colors hover:border-[#161616]/40 hover:text-[#161616] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Archive lead"
          title="Archive lead"
        >
          <Archive className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
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
  onStatusChange,
}: {
  lead: DashboardLead;
  isDragging: boolean;
  isPending: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>, lead: DashboardLead) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  onMouseDown: (event: ReactMouseEvent<HTMLElement>, lead: DashboardLead) => void;
  onStatusChange: (lead: DashboardLead, status: LeadStatus) => void;
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
      className={`group select-none rounded-lg border bg-white p-3 shadow-[0_18px_44px_-38px_rgb(22_22_22_/_0.5)] transition-[border-color,box-shadow,opacity,transform] duration-200 ${
        isDragging ? "scale-[0.99] border-[#e6c767] opacity-30" : "cursor-grab border-[#161616]/10 active:cursor-grabbing"
      } ${isPending ? "pointer-events-none opacity-70" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          title="Drag lead"
          className="mt-0.5 inline-flex h-8 w-7 shrink-0 items-center justify-center rounded-md border border-[#161616]/10 bg-[#f8f7f3] text-[#9e9d9d] transition-colors group-hover:border-[#e6c767]/70 group-hover:text-[#161616]"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-2 text-[0.94rem] font-semibold leading-snug text-[#161616]">{lead.title}</p>
              <p className="mt-1 truncate text-xs text-[#6f6e6a]">{lead.interest}</p>
            </div>
            <StatusBadge status={lead.status} />
          </div>

          <div className="mt-3 grid gap-2 text-xs text-[#6f6e6a]">
            {lead.contactHref ? (
              <a href={lead.contactHref} className="truncate font-medium text-[#161616] underline-offset-4 hover:underline">
                {lead.contactLabel}
              </a>
            ) : (
              <p className="truncate font-medium text-[#161616]">{lead.contactLabel}</p>
            )}
            <p className="line-clamp-2 whitespace-pre-line break-words leading-5 text-[#55534f]">{lead.body}</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6e6a]">
            <span className="rounded border border-[#161616]/10 bg-[#f8f7f3] px-2 py-1">{getSourceLabel(lead.resource)}</span>
            <time dateTime={lead.createdAt} className="rounded border border-[#161616]/10 bg-[#f8f7f3] px-2 py-1">
              {formatDate(lead.createdAt)}
            </time>
          </div>

          <LeadAction lead={lead} isPending={isPending} onStatusChange={onStatusChange} />
        </div>
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
      className="pointer-events-none fixed z-[100] -rotate-1 rounded-lg border border-[#e6c767] bg-white p-3 opacity-95 shadow-2xl ring-2 ring-[#e6c767]/20"
      style={{
        left: 0,
        top: 0,
        width,
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-8 w-7 shrink-0 items-center justify-center rounded-md border border-[#e6c767]/70 bg-[#e6c767]/15 text-[#161616]">
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-2 text-[0.94rem] font-semibold leading-snug text-[#161616]">{lead.title}</p>
              <p className="mt-1 truncate text-xs text-[#6f6e6a]">{lead.interest}</p>
            </div>
            <StatusBadge status={lead.status} />
          </div>
          <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-xs leading-5 text-[#55534f]">{lead.body}</p>
        </div>
      </div>
    </div>
  );
}
