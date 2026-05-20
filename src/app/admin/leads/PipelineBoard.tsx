"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent } from "react";
import type { LeadStatus } from "@/lib/admin/leads";
import { canStartCardDrag, getStageStatusFromPoint, pipelineStages, updateDraggedLeadStatus } from "./PipelineBoardLogic";
import { getLeadKey, PipelineDragOverlay } from "./PipelineLeadCard";
import { PipelineStageColumn } from "./PipelineStageColumn";
import type { DashboardLead } from "./PipelineBoardTypes";

export type { DashboardLead } from "./PipelineBoardTypes";

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

          return (
            <PipelineStageColumn
              key={stage.value}
              stage={stage}
              leads={stageLeads}
              isDropTarget={activeDropStatus === stage.value}
              draggedLeadKey={draggedLeadKey}
              pendingLeadKey={pendingLeadKey}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onMouseDown={handleMouseDown}
            />
          );
        })}
      </div>
      {dragOverlay && <PipelineDragOverlay lead={dragOverlay.lead} width={dragOverlay.width} x={dragOverlay.x} y={dragOverlay.y} />}
    </section>
  );
}
