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
  "batumi-guru": aixcoLiveImages.batumiGuru,
  "batumi-otium": aixcoLiveImages.batumiOtium,
};

export const batumiVideoMap: Record<string, { src: string; previewSrc: string }> = {
  guruBatumi: { src: aixcoLiveVideos.guruBatumi, previewSrc: aixcoLiveVideoPreviews.guruBatumi },
  otium: { src: aixcoLiveVideos.otium, previewSrc: aixcoLiveVideoPreviews.otium },
};

export const batumiDocumentMap: Record<string, string> = {
  guru: aixcoLiveDocuments.guru,
  otium: aixcoLiveDocuments.otium,
};

export const batumiDetailAssetMap: Record<string, string> = {
  guru: aixcoLiveAssetDetails.guruCatalog,
  otium: aixcoLiveAssetDetails.otiumCatalog,
};

export const batumiMarketMetrics = [
  { label: "Rental yield", value: "8%", subtext: "starting from", subtextPosition: "before" },
  { label: "Annual growth", value: "12%", subtext: "up to", subtextPosition: "before" },
  { label: "Entry price", value: "EUR 50k", subtext: "from", subtextPosition: "before", highlight: true },
] as const;

export const batumiMarketDetailIcons: LucideIcon[] = [Home, Percent, TrendingUp, ShieldCheck];
export const batumiProjectDetailIcons: LucideIcon[] = [Building2, FileText, TrendingUp];

export function getBatumiMarketDetails(benefits: BatumiBenefits) {
  return [
    { label: "Ownership", content: benefits[3] },
    { label: "Tax", content: benefits[4] },
    { label: "Capital gains", content: benefits[5] },
    { label: "Financing", content: benefits[6] },
  ].filter((detail): detail is { label: string; content: string } => Boolean(detail.content));
}
