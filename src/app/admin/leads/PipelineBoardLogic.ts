import type { LeadStatus } from "@/lib/admin/leads";
import type { DashboardLead } from "./PipelineBoardTypes";
import type { PipelineStage } from "./PipelineStageColumn";

export const pipelineStages: PipelineStage[] = [
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

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return value === "new" || value === "contacted" || value === "qualified" || value === "archived";
}

export function getStageStatusFromPoint(clientX: number, clientY: number) {
  const target = document.elementFromPoint(clientX, clientY);
  const stage = target?.closest<HTMLElement>("[data-pipeline-stage-status]");
  const status = stage?.dataset.pipelineStageStatus;
  return isLeadStatus(status) ? status : null;
}

export function canStartCardDrag(target: EventTarget | null) {
  const element = target instanceof HTMLElement ? target : null;
  return Boolean(element && !element.closest("a,button,input,select,textarea,label"));
}

export async function updateDraggedLeadStatus(lead: DashboardLead, status: LeadStatus) {
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
