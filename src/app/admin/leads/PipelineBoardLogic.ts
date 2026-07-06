import type { LeadStatus } from "@/lib/admin/leads";
import type { DashboardLead } from "./PipelineBoardTypes";
import type { PipelineStage } from "./PipelineStageColumn";

export const pipelineStages: PipelineStage[] = [
  {
    label: "New",
    value: "new",
    headerClass: "border-[#e6c767]/60 bg-[#e6c767]/15 text-[#161616]",
    dotClass: "bg-[#e6c767]",
  },
  {
    label: "Contacted",
    value: "contacted",
    headerClass: "border-[#161616]/10 bg-white text-[#161616]",
    dotClass: "bg-[#161616]",
  },
  {
    label: "Qualified",
    value: "qualified",
    headerClass: "border-[#161616] bg-[#161616] text-white",
    dotClass: "bg-[#e6c767]",
  },
  {
    label: "Archived",
    value: "archived",
    headerClass: "border-[#9e9d9d]/35 bg-[#f0efeb] text-[#6b6a67]",
    dotClass: "bg-[#9e9d9d]",
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
