"use client";

import { ChevronDown, GripVertical, Loader2 } from "lucide-react";
import type { MouseEvent as ReactMouseEvent, PointerEvent } from "react";
import type { LeadResource, LeadStatus } from "@/lib/admin/leads";
import { pipelineStages } from "./PipelineBoardLogic";
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
  return (
    <div className="relative mt-3 border-t border-[#161616]/10 pt-3">
      <label className="block">
        <span className="sr-only">Move {lead.title} to another stage</span>
        <select
          aria-label={`Move ${lead.title} to another stage`}
          value=""
          disabled={isPending}
          onChange={(event) => {
            const nextStatus = pipelineStages.find((stage) => stage.value === event.currentTarget.value)?.value;
            if (nextStatus) onStatusChange(lead, nextStatus);
          }}
          className="h-11 w-full appearance-none rounded-md border border-[#161616]/15 bg-[#161616] px-3 pr-10 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="" disabled>{isPending ? "Moving…" : "Move to…"}</option>
          {pipelineStages.filter((stage) => stage.value !== lead.status).map((stage) => (
            <option key={stage.value} value={stage.value}>Move to {stage.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute bottom-0 right-3 flex h-11 items-center text-white" aria-hidden="true">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </label>
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
      data-pipeline-lead-card="true"
      data-testid={`pipeline-card-${getLeadKey(lead)}`}
      className={`group select-text rounded-lg border bg-white p-3 shadow-[0_18px_44px_-38px_rgb(22_22_22_/_0.5)] transition-[border-color,box-shadow,opacity,transform] duration-200 ${
        isDragging ? "scale-[0.99] border-[#e6c767] opacity-30" : "border-[#161616]/10"
      } ${isPending ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          data-pipeline-drag-handle="true"
          disabled={isPending}
          aria-label={`Drag ${lead.title}`}
          title={`Drag ${lead.title}`}
          onPointerDown={(event) => onPointerDown(event, lead)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onMouseDown={(event) => onMouseDown(event, lead)}
          className={`mt-0.5 inline-flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-md border border-[#161616]/10 bg-[#f8f7f3] text-[#9e9d9d] transition-colors [touch-action:pan-y_pinch-zoom] hover:border-[#e6c767]/70 hover:text-[#161616] disabled:cursor-not-allowed disabled:opacity-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

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
              <a href={lead.contactHref} className="inline-flex min-h-11 max-w-full items-center truncate font-medium text-[#161616] underline-offset-4 hover:underline">
                {lead.contactLabel}
              </a>
            ) : (
              <p className="truncate font-medium text-[#161616]">{lead.contactLabel}</p>
            )}
            <p className="line-clamp-2 whitespace-pre-line break-words leading-5 text-[#55534f]">{lead.body}</p>
            {lead.resource === "contact" ? (
              <div className="grid gap-1 rounded-md bg-[#f8f7f3] px-2.5 py-2 text-[11px]">
                <p className="font-semibold capitalize text-[#161616]">{lead.requestType ?? "message"} request</p>
                {lead.phone ? <a href={`tel:${lead.phone}`} className="inline-flex min-h-11 items-center font-medium text-[#161616] underline-offset-4 hover:underline">{lead.phone}</a> : null}
                {lead.preferredCallAt ? (
                  <p>Requested call: {formatDate(lead.preferredCallAt)}{lead.preferredCallTimezone ? ` (${lead.preferredCallTimezone})` : ""}</p>
                ) : null}
                <p>Email delivery: {lead.emailDeliveryStatus?.replaceAll("_", " ") ?? "unknown"}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f6e6a]">
            <span className="rounded border border-[#161616]/10 bg-[#f8f7f3] px-2 py-1">{getSourceLabel(lead.resource)}</span>
            {lead.reference ? (
              <span className="rounded border border-[#e6c767]/70 bg-[#e6c767]/15 px-2 py-1 font-mono tracking-[0.06em] text-[#6f5112]">
                {lead.reference}
              </span>
            ) : null}
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
          {lead.reference ? (
            <p className="mt-2 font-mono text-[10px] font-semibold tracking-[0.06em] text-[#6f5112]">{lead.reference}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
