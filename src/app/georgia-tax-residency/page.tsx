import type { Metadata } from "next";
import { GeorgiaTaxResidencyLandingPage } from "@/components/sections/GeorgiaTaxResidencyLandingPage";
import { ClientShell } from "../client-shell";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/JsonLd";

const routePath = "/georgia-tax-residency";
const pageTitle = "Georgia Tax Residency for HNWI | AIXCO.Global";
const pageDescription =
  "AIXCO.Global explains Georgia's 183-day tax-residency test, the HNWI procedure and separate residence-permit routes using official sources.";
const socialImage = "/aixco-global-op2/images/batumi-mosaic-hd/batumi-day-aerial.jpg";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: routePath },
  robots: { index: true, follow: true },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: routePath,
    siteName: "AIXCO.Global",
    images: [{ url: socialImage, width: 7360, height: 4912, alt: "Batumi coastline and modern architecture" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [socialImage],
  },
};

export const revalidate = 300;

export default async function GeorgiaTaxResidencyRoute() {
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
        primaryImageOfPage: { "@id": `${siteUrl}${routePath}#primaryimage` },
      },
      {
        "@type": "ImageObject",
        "@id": `${siteUrl}${routePath}#primaryimage`,
        url: `${siteUrl}${socialImage}`,
        contentUrl: `${siteUrl}${socialImage}`,
        caption: "Batumi coastline and modern architecture",
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}${routePath}#service`,
        name: "AIXCO.Global Georgia tax residency advisory",
        description: pageDescription,
        url: `${siteUrl}${routePath}`,
        image: `${siteUrl}${socialImage}`,
        areaServed: { "@type": "Country", name: "Georgia" },
        serviceType: "Tax residency advisory coordination",
        parentOrganization: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <GeorgiaTaxResidencyLandingPage />
      </ClientShell>
    </>
  );
}
