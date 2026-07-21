import type { Lang } from "@/i18n/languages";
import {
  aixcoLiveAssetDetails,
  getCurrentProjectBrochureDownload,
  type CurrentProjectBrochureDownload,
} from "@/lib/aixco-live-assets";

export type MaterialDownload = {
  id: string;
  title: string;
  category: string;
  description: string;
  audience: string;
  format: "PDF" | "JPEG" | "PNG";
  href: string;
  fileName: string;
};

export const materialDownloads: MaterialDownload[] = [
  {
    id: "current-project-brochure",
    title: "Current project brochure",
    category: "Current project",
    description: "Current project PDF for clients comparing selected apartment options.",
    audience: "Clients and partners",
    format: "PDF",
    href: aixcoLiveAssetDetails.currentProjectBrochure,
    fileName: "Reverance-brochure-EN.pdf",
  },
  {
    id: "eden-house-reference",
    title: "Eden House legacy image",
    category: "Dubai legacy reference",
    description: "Downloadable legacy visual reference for Eden House in Dubai.",
    audience: "Clients and partners",
    format: "JPEG",
    href: aixcoLiveAssetDetails.dubaiFundOne,
    fileName: "aixco-eden-house-legacy.jpeg",
  },
  {
    id: "dubai-healthcare-reference",
    title: "Dubai Healthcare City image",
    category: "Dubai legacy reference",
    description: "Downloadable legacy visual reference for Dubai Healthcare City.",
    audience: "Clients and partners",
    format: "PNG",
    href: aixcoLiveAssetDetails.dubaiFundTwo,
    fileName: "aixco-dubai-healthcare-city-legacy.png",
  },
];

export function resolveMaterialDownload(
  material: MaterialDownload,
  lang: Lang,
): CurrentProjectBrochureDownload {
  if (material.id === "current-project-brochure") {
    return getCurrentProjectBrochureDownload(lang) ?? {
      href: material.href,
      fileName: material.fileName,
    };
  }

  return {
    href: material.href,
    fileName: material.fileName,
  };
}
