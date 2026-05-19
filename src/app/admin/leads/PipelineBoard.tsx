"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent } from "react";
import { GripVertical, Loader2 } from "lucide-react";
import type { LeadResource, LeadStatus } from "@/lib/admin/leads";

export type DashboardLead = {
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

type PipelineStage = {
  label: string;
  value: LeadStatus;
  headerClass: string;
  dotClass: string;
};

const pipelineStages: PipelineStage[] = [
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

function getStatusClass(status: LeadStatus) {
  if (status === "new") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "contacted") return "border-blue-200 bg-blue-50 text-blue-800";
  if (status === "qualified") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function getLeadKey(lead: Pick<DashboardLead, "resource" | "id">) {
  return `${lead.resource}:${lead.id}`;
}

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return value === "new" || value === "contacted" || value === "qualified" || value === "archived";
}

function getStageStatusFromPoint(clientX: number, clientY: number) {
  const target = document.elementFromPoint(clientX, clientY);
  const stage = target?.closest<HTMLElement>("[data-pipeline-stage-status]");
  const status = stage?.dataset.pipelineStageStatus;
  return isLeadStatus(status) ? status : null;
}

function canStartCardDrag(target: EventTarget | null) {
  const element = target instanceof HTMLElement ? target : null;
  return Boolean(element && !element.closest("a,button,input,select,textarea,label"));
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

async function updateDraggedLeadStatus(lead: DashboardLead, status: LeadStatus) {
  const response = await fetch("/admin/leads/status", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resource: lead.resource,
      id: lead.id,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not update lead status.");
  }
}

function PipelineLeadCard({
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

function PipelineDragOverlay({
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

export function PipelineBoard({ leads }: { leads: DashboardLead[] }) {
  const [items, setItems] = useState(leads);
  const [draggedLeadKey, setDraggedLeadKey] = useState<string | null>(null);
  const [activeDropStatus, setActiveDropStatus] = useState<LeadStatus | null>(null);
  const [pendingLeadKey, setPendingLeadKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [dragOverlay, setDragOverlay] = useState<{ lead: DashboardLead; width: number; x: number; y: number } | null>(null);
  const pointerDragRef = useRef<{
    active: boolean;
    lead: DashboardLead;
    pointerId?: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    width: number;
  } | null>(null);

  const groupedLeads = useMemo(() => {
    const grouped = new Map<LeadStatus, DashboardLead[]>(pipelineStages.map((stage) => [stage.value, []]));

    for (const lead of items) {
      grouped.get(lead.status)?.push(lead);
    }

    return grouped;
  }, [items]);

  useEffect(() => {
    if (!feedback) return;

    const timeout = window.setTimeout(
      () => setFeedback(null),
      feedback.tone === "success" ? 2600 : 5200,
    );

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  async function moveLeadToStatus(draggedLead: DashboardLead, status: LeadStatus) {
    if (!draggedLead || draggedLead.status === status || pendingLeadKey) return;

    const previousItems = items;
    const leadKey = getLeadKey(draggedLead);
    setPendingLeadKey(leadKey);
    setItems((currentItems) => currentItems.map((lead) => (getLeadKey(lead) === leadKey ? { ...lead, status } : lead)));

    try {
      await updateDraggedLeadStatus(draggedLead, status);
      setFeedback({ tone: "success", text: `${draggedLead.title} moved to ${status}.` });
    } catch {
      setItems(previousItems);
      setFeedback({ tone: "error", text: "Could not move that lead. The board was restored." });
    } finally {
      setPendingLeadKey(null);
    }
  }

  function startManualDrag(lead: DashboardLead, clientX: number, clientY: number, rect: DOMRect, pointerId?: number) {
    pointerDragRef.current = {
      active: false,
      lead,
      pointerId,
      startX: clientX,
      startY: clientY,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      width: rect.width,
    };
    setFeedback(null);
  }

  function updateManualDrag(clientX: number, clientY: number) {
    const drag = pointerDragRef.current;
    if (!drag) return;

    const movedEnough = Math.abs(clientX - drag.startX) + Math.abs(clientY - drag.startY) > 6;
    if (!drag.active && movedEnough) {
      drag.active = true;
      setDraggedLeadKey(getLeadKey(drag.lead));
      setDragOverlay({
        lead: drag.lead,
        width: drag.width,
        x: clientX - drag.offsetX,
        y: clientY - drag.offsetY,
      });
    }

    if (!drag.active) return;

    setDragOverlay({
      lead: drag.lead,
      width: drag.width,
      x: clientX - drag.offsetX,
      y: clientY - drag.offsetY,
    });

    const status = getStageStatusFromPoint(clientX, clientY);
    setActiveDropStatus(status && status !== drag.lead.status ? status : null);
  }

  function finishManualDrag(clientX: number, clientY: number) {
    const drag = pointerDragRef.current;
    const status = drag?.active ? getStageStatusFromPoint(clientX, clientY) : null;

    pointerDragRef.current = null;
    setDraggedLeadKey(null);
    setActiveDropStatus(null);
    setDragOverlay(null);

    if (drag && status) void moveLeadToStatus(drag.lead, status);
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>, lead: DashboardLead) {
    if (event.pointerType === "mouse") return;
    if (event.button !== 0 || pendingLeadKey || !canStartCardDrag(event.target)) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startManualDrag(lead, event.clientX, event.clientY, event.currentTarget.getBoundingClientRect(), event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    updateManualDrag(event.clientX, event.clientY);
  }

  function clearPointerCapture(event: PointerEvent<HTMLElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    clearPointerCapture(event);
    finishManualDrag(event.clientX, event.clientY);
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>) {
    clearPointerCapture(event);
    pointerDragRef.current = null;
    setDraggedLeadKey(null);
    setActiveDropStatus(null);
    setDragOverlay(null);
  }

  function handleMouseDown(event: ReactMouseEvent<HTMLElement>, lead: DashboardLead) {
    if (event.button !== 0 || pendingLeadKey || pointerDragRef.current || !canStartCardDrag(event.target)) return;

    event.preventDefault();
    startManualDrag(lead, event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());

    function handleWindowMouseMove(moveEvent: MouseEvent) {
      moveEvent.preventDefault();
      updateManualDrag(moveEvent.clientX, moveEvent.clientY);
    }

    function handleWindowMouseUp(upEvent: MouseEvent) {
      upEvent.preventDefault();
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      finishManualDrag(upEvent.clientX, upEvent.clientY);
    }

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp, { once: true });
  }

  return (
    <section className="relative rounded-xl border border-border/70 bg-surface-elevated p-4 shadow-elegant md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Pipeline</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground">Lead pipeline</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Move contact forms and live chat transcripts through the same qualification flow.
          </p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{items.length} total lead records</p>
      </div>

      {feedback && (
        <p
          role="status"
          className={`pointer-events-none fixed bottom-5 right-5 z-[90] max-w-[calc(100vw-2.5rem)] rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur md:max-w-md ${
            feedback.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {pipelineStages.map((stage) => {
          const stageLeads = groupedLeads.get(stage.value) ?? [];
          const isDropTarget = activeDropStatus === stage.value;

          return (
            <section key={stage.value} aria-label={`${stage.label} leads`} className="flex min-h-[18rem] min-w-0 flex-col">
              <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${stage.headerClass}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${stage.dotClass}`} aria-hidden="true" />
                  <h3 className="truncate text-sm font-semibold">{stage.label}</h3>
                </div>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">{stageLeads.length}</span>
              </div>

              <div
                data-testid={`pipeline-stage-${stage.value}`}
                data-pipeline-stage-status={stage.value}
                className={`scrollbar-seamless mt-2 flex min-h-[14rem] flex-1 flex-col gap-2 overflow-y-auto rounded-lg border bg-background/60 p-2 transition-colors md:max-h-[30rem] ${
                  isDropTarget ? "border-primary/60 bg-primary/5 ring-2 ring-primary/15" : "border-border/60"
                }`}
              >
                {stageLeads.length === 0 ? (
                  <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-border bg-white/70 px-3 py-6 text-center text-xs text-muted-foreground">
                    Empty
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <PipelineLeadCard
                      key={getLeadKey(lead)}
                      lead={lead}
                      isDragging={draggedLeadKey === getLeadKey(lead)}
                      isPending={pendingLeadKey === getLeadKey(lead)}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      onMouseDown={handleMouseDown}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
      {dragOverlay && <PipelineDragOverlay lead={dragOverlay.lead} width={dragOverlay.width} x={dragOverlay.x} y={dragOverlay.y} />}
    </section>
  );
}
