import type { LucideIcon } from "lucide-react";
import { Building2, HandCoins, TrendingUp } from "lucide-react";
import type { SiteContent } from "@/lib/backend/site-content";
import {
  aixcoDubaiEdenHouseCanalGallery,
  aixcoDubaiEdenHouseParkGallery,
  aixcoDubaiHealthcareGallery,
  aixcoLiveImages,
} from "@/lib/aixco-live-assets";

export const dubaiImageMap: Record<string, string> = {
  "dubai-eden": aixcoLiveImages.dubaiEdenHouse,
  "dubai-healthcare": aixcoLiveImages.dubaiHealthcare,
};

export const fundAssetGalleries = {
  "fund-1": {
    source: "eden-house-and-park",
    label: "Eden House legacy asset gallery",
    groups: [
      { title: "Eden House The Canal", images: aixcoDubaiEdenHouseCanalGallery },
      { title: "Eden House The Park", images: aixcoDubaiEdenHouseParkGallery },
    ],
  },
  "fund-2": {
    source: "dubai-healthcare-city",
    label: "Dubai Healthcare City legacy gallery",
    groups: [{ title: "Dubai Healthcare City", images: aixcoDubaiHealthcareGallery }],
  },
} as const;

export type DubaiFund = SiteContent["dubaiFunds"][number];
export type Translate = (copy: string) => string;
export type DubaiFundGalleryId = keyof typeof fundAssetGalleries;
export type DubaiFundGalleryGroup = (typeof fundAssetGalleries)[DubaiFundGalleryId]["groups"][number];

export const dubaiDetailIcons: LucideIcon[] = [TrendingUp, HandCoins, Building2];

export function parseFundDetail(detail: string) {
  const separatorIndex = detail.indexOf(":");

  if (separatorIndex === -1) {
    return { label: "", value: detail };
  }

  return {
    label: detail.slice(0, separatorIndex).trim(),
    value: detail.slice(separatorIndex + 1).trim(),
  };
}

export function isHeadlineMetric(label: string) {
  return ["Units", "Total", "Development value", "Development scope", "Status", "Site progress", "Total Equity", "Target Net IRR", "Performance"].includes(label);
}

export function formatMetricValue(value: string) {
  const trimmed = value.trim();
  const unitsValue = trimmed.match(/^([\d,.]+)\+$/);
  const usdMillions = trimmed.match(/^USD\s+([\d,.]+)m$/i);
  const projectedValue = trimmed.match(/^Projected\s+(.+)$/i);

  if (unitsValue) {
    return { prefix: "", value: unitsValue[1], subtext: "+" };
  }

  if (usdMillions) {
    return { prefix: "", value: usdMillions[1], subtext: "m USD" };
  }

  if (projectedValue) {
    return { prefix: "", value: projectedValue[1], subtext: "Projected" };
  }

  const prefixedValue = trimmed.match(/^(USD|Projected)\s+(.+)$/i);

  if (!prefixedValue) {
    return { prefix: "", value: trimmed, subtext: "" };
  }

  return {
    prefix: prefixedValue[1],
    value: prefixedValue[2],
    subtext: "",
  };
}

export function hasAssetGallery(fundId: string): fundId is DubaiFundGalleryId {
  return fundId in fundAssetGalleries;
}
