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
  localizedDownloads?: Partial<Record<Lang, CurrentProjectBrochureDownload & { title: string }>>;
};

export const materialDownloads: MaterialDownload[] = [
  {
    id: "current-project-brochure",
    title: "Reverance Brochure",
    category: "Current project",
    description: "Current project PDF for clients comparing selected apartment options.",
    audience: "Clients and partners",
    format: "PDF",
    href: aixcoLiveAssetDetails.currentProjectBrochure,
    fileName: "Reverance-brochure-EN.pdf",
  },
  {
    id: "tax-residency-guide",
    title: "AIXCO Tax Residency Guide for HNWIs",
    category: "AIXCO guide",
    description: "A guide to tax residency in Georgia for high-net-worth individuals.",
    audience: "Clients and partners",
    format: "PDF",
    href: "/aixco-global-op2/documents/aixco-tax-residency-guide-hnwi-en.pdf",
    fileName: "AIXCO-Tax-Residency-Guide-for-HNWIs.pdf",
    localizedDownloads: {
      en: {
        title: "AIXCO Tax Residency Guide for HNWIs",
        href: "/aixco-global-op2/documents/aixco-tax-residency-guide-hnwi-en.pdf",
        fileName: "AIXCO-Tax-Residency-Guide-for-HNWIs.pdf",
      },
      de: {
        title: "AIXCO Leitfaden zur Steuerresidenz für HNWI",
        href: "/aixco-global-op2/documents/aixco-leitfaden-steuerresidenz-hnwi-de.pdf",
        fileName: "AIXCO-Leitfaden-zur-Steuerresidenz-fuer-HNWI.pdf",
      },
    },
  },
  {
    id: "brief-residence-guide",
    title: "AIXCO Brief Residence Guide",
    category: "AIXCO guide",
    description: "A concise guide to residence permits and related services in Georgia.",
    audience: "Clients and partners",
    format: "PDF",
    href: "/aixco-global-op2/documents/aixco-brief-residence-guide-en.pdf",
    fileName: "AIXCO-Brief-Residence-Guide.pdf",
    localizedDownloads: {
      en: {
        title: "AIXCO Brief Residence Guide",
        href: "/aixco-global-op2/documents/aixco-brief-residence-guide-en.pdf",
        fileName: "AIXCO-Brief-Residence-Guide.pdf",
      },
      de: {
        title: "AIXCO Aufenthaltsleitfaden Kompakt",
        href: "/aixco-global-op2/documents/aixco-aufenthaltsleitfaden-kompakt-de.pdf",
        fileName: "AIXCO-Aufenthaltsleitfaden-Kompakt.pdf",
      },
    },
  },
  {
    id: "medical-tourism-guide",
    title: "AIXCO Medical Tourism Guide",
    category: "AIXCO guide",
    description: "A guide to medical tourism and healthcare access in Georgia.",
    audience: "Clients and partners",
    format: "PDF",
    href: "/aixco-global-op2/documents/aixco-medical-tourism-guide-en.pdf",
    fileName: "AIXCO-Medical-Tourism-Guide.pdf",
    localizedDownloads: {
      en: {
        title: "AIXCO Medical Tourism Guide",
        href: "/aixco-global-op2/documents/aixco-medical-tourism-guide-en.pdf",
        fileName: "AIXCO-Medical-Tourism-Guide.pdf",
      },
      de: {
        title: "AIXCO Leitfaden für Medizintourismus",
        href: "/aixco-global-op2/documents/aixco-leitfaden-medizintourismus-de.pdf",
        fileName: "AIXCO-Leitfaden-fuer-Medizintourismus.pdf",
      },
    },
  },
  {
    id: "full-residence-guide",
    title: "AIXCO Full Residence Guide",
    category: "AIXCO guide",
    description: "A comprehensive guide to residence permits and related services in Georgia.",
    audience: "Clients and partners",
    format: "PDF",
    href: "/aixco-global-op2/documents/aixco-full-residence-guide-en.pdf",
    fileName: "AIXCO-Full-Residence-Guide.pdf",
    localizedDownloads: {
      en: {
        title: "AIXCO Full Residence Guide",
        href: "/aixco-global-op2/documents/aixco-full-residence-guide-en.pdf",
        fileName: "AIXCO-Full-Residence-Guide.pdf",
      },
      de: {
        title: "AIXCO Aufenthaltsleitfaden Gesamtversion",
        href: "/aixco-global-op2/documents/aixco-aufenthaltsleitfaden-gesamtversion-de.pdf",
        fileName: "AIXCO-Aufenthaltsleitfaden-Gesamtversion.pdf",
      },
    },
  },
  {
    id: "leisure-activities",
    title: "AIXCO Leisure Activities",
    category: "AIXCO guide",
    description: "A guide to leisure activities and destinations in and around Batumi.",
    audience: "Clients and partners",
    format: "PDF",
    href: "/aixco-global-op2/documents/aixco-leisure-activities-en.pdf",
    fileName: "AIXCO-Leisure-Activities.pdf",
    localizedDownloads: {
      en: {
        title: "AIXCO Leisure Activities",
        href: "/aixco-global-op2/documents/aixco-leisure-activities-en.pdf",
        fileName: "AIXCO-Leisure-Activities.pdf",
      },
      de: {
        title: "AIXCO Freizeitaktivitäten",
        href: "/aixco-global-op2/documents/aixco-freizeitaktivitaeten-de.pdf",
        fileName: "AIXCO-Freizeitaktivitaeten.pdf",
      },
    },
  },
];

export function getMaterialDownloadsForLanguage(lang: Lang): MaterialDownload[] {
  return materialDownloads.filter(
    (material) => !material.localizedDownloads || Boolean(material.localizedDownloads[lang]),
  );
}

export function resolveMaterialTitle(material: MaterialDownload, lang: Lang): string {
  return material.localizedDownloads?.[lang]?.title ?? material.title;
}

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

  const localizedDownload = material.localizedDownloads?.[lang];
  if (localizedDownload) {
    return {
      href: localizedDownload.href,
      fileName: localizedDownload.fileName,
    };
  }

  return {
    href: material.href,
    fileName: material.fileName,
  };
}
