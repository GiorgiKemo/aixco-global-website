"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent } from "react";
import type { LeadStatus } from "@/lib/admin/leads";
import { canStartCardDrag, getStageStatusFromPoint, pipelineStages, postPipelineLeadStatus } from "./PipelineBoardLogic";
import { getLeadKey, PipelineDragOverlay } from "./PipelineLeadCard";
import { PipelineStageColumn } from "./PipelineStageColumn";
import type { DashboardLead } from "./PipelineBoardTypes";

export type { DashboardLead } from "./PipelineBoardTypes";

export function PipelineBoard({
  leads,
  returnTo = "/admin/leads?tab=pipeline",
}: {
  leads: DashboardLead[];
  returnTo?: string;
}) {
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

  const openLeadCount = groupedLeads.get("new")?.length ?? 0;

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
      await postPipelineLeadStatus(draggedLead, status, returnTo);
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

    const card = event.currentTarget.closest<HTMLElement>("[data-pipeline-lead-card]");
    if (!card) return;
    startManualDrag(lead, event.clientX, event.clientY, card.getBoundingClientRect(), event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (!drag.active) {
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);

      // Leave vertical gestures entirely to the browser so the pipeline remains
      // naturally scrollable on touch screens. A drag only takes ownership once
      // the gesture has moved decisively in the board's horizontal direction.
      if (absoluteY > 8 && absoluteY > absoluteX) {
        pointerDragRef.current = null;
        return;
      }

      if (absoluteX <= 8 || absoluteX <= absoluteY) return;

      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }

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

    const card = event.currentTarget.closest<HTMLElement>("[data-pipeline-lead-card]");
    if (!card) return;
    startManualDrag(lead, event.clientX, event.clientY, card.getBoundingClientRect());

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
    <section className="relative">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6a18]">Pipeline</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#161616] md:text-3xl">Lead flow</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6e6a]">
          <span className="rounded-full border border-[#e6c767]/60 bg-[#e6c767]/15 px-3 py-1.5 text-[#161616]">{openLeadCount} new</span>
          <span className="rounded-full border border-[#161616]/10 bg-white px-3 py-1.5">{items.length} total</span>
        </div>
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

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              onStatusChange={(lead, status) => void moveLeadToStatus(lead, status)}
            />
          );
        })}
      </div>
      {dragOverlay && <PipelineDragOverlay lead={dragOverlay.lead} width={dragOverlay.width} x={dragOverlay.x} y={dragOverlay.y} />}
    </section>
  );
}
