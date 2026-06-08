import { aixcoLiveAssetDetails, aixcoLiveDocuments } from "@/lib/aixco-live-assets";

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
    id: "otium-brochure",
    title: "Otium brochure",
    category: "Batumi project brochure",
    description: "Full Otium project PDF for clients comparing Batumi apartment options.",
    audience: "Clients and brokers",
    format: "PDF",
    href: aixcoLiveDocuments.otium,
    fileName: "aixco-otium-brochure.pdf",
  },
  {
    id: "otium-catalog-sheet",
    title: "Otium catalog sheet",
    category: "Catalog sheet",
    description: "High-resolution Otium catalog image for quick sharing and offline review.",
    audience: "Clients and sales partners",
    format: "JPEG",
    href: aixcoLiveAssetDetails.otiumCatalog,
    fileName: "aixco-otium-catalog.jpeg",
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
