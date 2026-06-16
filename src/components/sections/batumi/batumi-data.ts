import type { LucideIcon } from "lucide-react";
import { Building2, FileText, Home, Percent, ShieldCheck, TrendingUp } from "lucide-react";
import type { SiteContent } from "@/lib/backend/site-content";
import {
  aixcoLiveAssetDetails,
  aixcoLiveDocuments,
  aixcoLiveImages,
  aixcoLiveVideoPreviews,
  aixcoLiveVideos,
} from "@/lib/aixco-live-assets";

export type BatumiProperty = SiteContent["batumiProperties"][number];
export type BatumiBenefits = SiteContent["batumiBenefits"];
export type Translate = (copy: string) => string;

export const batumiImageMap: Record<string, string> = {
  "batumi-current-project": aixcoLiveImages.batumiCurrentProject,
};

export const batumiVideoMap: Record<string, { src: string; previewSrc: string }> = {
  currentProject: { src: aixcoLiveVideos.currentProject, previewSrc: aixcoLiveVideoPreviews.currentProject },
};

export const batumiDocumentMap: Record<string, string> = {
  currentProject: aixcoLiveDocuments.currentProject,
};

export const batumiDetailAssetMap: Record<string, string> = {
  currentProject: aixcoLiveAssetDetails.currentProjectCatalog,
};

export const batumiMarketMetrics = [
  { label: "Entry", value: "EUR 50k", subtext: "from", subtextPosition: "before", highlight: true },
  { label: "Bank financing", value: "60%+", subtext: "minimum", subtextPosition: "after" },
  { label: "Net rental yields", value: "10-12%", subtext: "approx.", subtextPosition: "before" },
] as const;

export const batumiMarketDetailIcons: LucideIcon[] = [Home, Percent, TrendingUp, ShieldCheck];
export const batumiProjectDetailIcons: LucideIcon[] = [Building2, FileText, TrendingUp];

export function getBatumiMarketDetails(benefits: BatumiBenefits) {
  return [
    { label: "Exclusive access", content: [benefits[0], benefits[3], benefits[10]].filter(Boolean).join(" ") },
    { label: "Ownership", content: [benefits[1], benefits[2]].filter(Boolean).join(" ") },
    { label: "Financing", content: [benefits[4], benefits[6]].filter(Boolean).join(" ") },
    { label: "Tax & transparency", content: [benefits[7], benefits[8], benefits[9]].filter(Boolean).join(" ") },
  ].filter((detail): detail is { label: string; content: string } => Boolean(detail.content));
}
