import type { Metadata } from "next";
import { MedicalTourismLandingPage } from "@/components/sections/MedicalTourismLandingPage";
import { ClientShell } from "../client-shell";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/JsonLd";

const routePath = "/medical-tourism";
const pageTitle = "Medical Tourism in Georgia | AIXCO.Global";
const pageDescription =
  "Plan medical treatment in Georgia with AIXCO.Global: 50-80% lower costs than Western Europe, named private clinics, and recovery on the Black Sea coast in Batumi.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: routePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: routePath,
    siteName: "AIXCO.Global",
    images: [
      {
        url: "/aixco-global-op2/images/batumi-mosaic-hd/batumi-golden-hour-coastline.webp",
        width: 1920,
        height: 1280,
        alt: "Batumi coastline at golden hour",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/aixco-global-op2/images/batumi-mosaic-hd/batumi-golden-hour-coastline.webp"],
  },
};

export const revalidate = 300;

export default async function MedicalTourismLandingRoute() {
  const siteContent = await fetchSiteContentForServer();
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}${routePath}#webpage`,
        url: `${siteUrl}${routePath}`,
        name: pageTitle,
        description: pageDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}${routePath}#service` },
      },
      {
        "@type": "MedicalBusiness",
        "@id": `${siteUrl}${routePath}#service`,
        name: "AIXCO.Global Medical Tourism",
        description: pageDescription,
        url: `${siteUrl}${routePath}`,
        image: `${siteUrl}/aixco-global-op2/images/batumi-mosaic-hd/batumi-golden-hour-coastline.webp`,
        areaServed: {
          "@type": "Country",
          name: "Georgia",
        },
        parentOrganization: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <MedicalTourismLandingPage />
      </ClientShell>
    </>
  );
}
