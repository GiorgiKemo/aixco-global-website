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
