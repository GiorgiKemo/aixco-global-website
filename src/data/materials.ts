import { aixcoLiveAssetDetails } from "@/lib/aixco-live-assets";

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
