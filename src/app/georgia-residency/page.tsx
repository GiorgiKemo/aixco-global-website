import type { Metadata } from "next";
import { GeorgiaResidencyLandingPage } from "@/components/sections/GeorgiaResidencyLandingPage";
import { ClientShell } from "../client-shell";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/JsonLd";

const routePath = "/georgia-residency";
const pageTitle = "Georgia Residency Pathways | AIXCO.Global";
const pageDescription =
  "Explore Georgian residence pathways through qualifying business activity, property above $150,000 certified market value, or qualifying investment from $300,000, with coordinated AIXCO support.";

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
        url: "/aixco-global-op2/images/batumi-mosaic-hd/batumi-dusk-aerial-central.webp",
        width: 3840,
        height: 2160,
        alt: "Batumi skyline at dusk",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/aixco-global-op2/images/batumi-mosaic-hd/batumi-dusk-aerial-central.webp"],
  },
};

export const revalidate = 300;

export default async function GeorgiaResidencyLandingRoute() {
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
        "@type": "ProfessionalService",
        "@id": `${siteUrl}${routePath}#service`,
        name: "AIXCO.Global Georgia Residency",
        description: pageDescription,
        url: `${siteUrl}${routePath}`,
        image: `${siteUrl}/aixco-global-op2/images/batumi-mosaic-hd/batumi-dusk-aerial-central.webp`,
        areaServed: { "@type": "Country", name: "Georgia" },
        parentOrganization: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <GeorgiaResidencyLandingPage />
      </ClientShell>
    </>
  );
}
