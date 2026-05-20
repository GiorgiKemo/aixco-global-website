"use client";

import type { MouseEvent as ReactMouseEvent, PointerEvent } from "react";
import type { LeadStatus } from "@/lib/admin/leads";
import { getLeadKey, PipelineLeadCard } from "./PipelineLeadCard";
import type { DashboardLead } from "./PipelineBoardTypes";

export type PipelineStage = {
  label: string;
  value: LeadStatus;
  headerClass: string;
  dotClass: string;
};

export function PipelineStageColumn({
  stage,
  leads,
  isDropTarget,
  draggedLeadKey,
  pendingLeadKey,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onMouseDown,
}: {
  stage: PipelineStage;
  leads: DashboardLead[];
  isDropTarget: boolean;
  draggedLeadKey: string | null;
  pendingLeadKey: string | null;
  onPointerDown: (event: PointerEvent<HTMLElement>, lead: DashboardLead) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  onMouseDown: (event: ReactMouseEvent<HTMLElement>, lead: DashboardLead) => void;
}) {
  return (
    <section aria-label={`${stage.label} leads`} className="flex min-h-[18rem] min-w-0 flex-col">
      <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${stage.headerClass}`}>
        <div className="flex min-w-0 items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${stage.dotClass}`} aria-hidden="true" />
          <h3 className="truncate text-sm font-semibold">{stage.label}</h3>
        </div>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">{leads.length}</span>
      </div>

      <div
        data-testid={`pipeline-stage-${stage.value}`}
        data-pipeline-stage-status={stage.value}
        className={`scrollbar-seamless mt-2 flex min-h-[14rem] flex-1 flex-col gap-2 overflow-y-auto rounded-lg border bg-background/60 p-2 transition-colors md:max-h-[30rem] ${
          isDropTarget ? "border-primary/60 bg-primary/5 ring-2 ring-primary/15" : "border-border/60"
        }`}
      >
        {leads.length === 0 ? (
          <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-border bg-white/70 px-3 py-6 text-center text-xs text-muted-foreground">
            Empty
          </div>
        ) : (
          leads.map((lead) => (
            <PipelineLeadCard
              key={getLeadKey(lead)}
              lead={lead}
              isDragging={draggedLeadKey === getLeadKey(lead)}
              isPending={pendingLeadKey === getLeadKey(lead)}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              onMouseDown={onMouseDown}
            />
          ))
        )}
      </div>
    </section>
  );
}
