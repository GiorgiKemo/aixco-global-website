import type { SiteContent } from "@/lib/backend/site-content";
import {
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
  "current-project": aixcoLiveDocuments.currentProject,
};

export function getBatumiMarketDetails(benefits: BatumiBenefits) {
  return [
    { label: "Exclusive access", content: [benefits[0], benefits[3], benefits[10]].filter(Boolean).join(" ") },
    { label: "Ownership", content: [benefits[1], benefits[2]].filter(Boolean).join(" ") },
    { label: "Financing", content: [benefits[4], benefits[6]].filter(Boolean).join(" ") },
    { label: "Tax & transparency", content: [benefits[7], benefits[8], benefits[9]].filter(Boolean).join(" ") },
  ].filter((detail): detail is { label: string; content: string } => Boolean(detail.content));
}
