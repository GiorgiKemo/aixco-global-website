import type { Metadata } from "next";
import { ClientShell } from "../client-shell";
import { PrivateClientAdvisoryLandingPage } from "@/components/sections/PrivateClientAdvisoryLandingPage";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/JsonLd";

const routePath = "/aixco-global-bond";
const pageTitle = "Emerging Market Real Estate Investment | AIXCO.Global";
const pageDescription = "AIXCO Global identifies, acquires, develops and manages residential real estate across high-growth emerging markets.";
const socialImage = "/aixco-global-op2/images/batumi-mosaic-hd/batumi-golden-hour-coastline.webp";

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
    images: [{ url: socialImage, width: 3840, height: 2160, alt: "Batumi coastline and high-rise skyline" }],
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription, images: [socialImage] },
};

export const revalidate = 300;

export default async function AixcoGlobalBondRoute() {
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
        primaryImageOfPage: { "@id": `${siteUrl}${routePath}#primaryimage` },
      },
      {
        "@type": "ImageObject",
        "@id": `${siteUrl}${routePath}#primaryimage`,
        url: `${siteUrl}${socialImage}`,
        contentUrl: `${siteUrl}${socialImage}`,
        caption: "Batumi coastline and high-rise skyline",
      },
      {
        "@type": "FinancialProduct",
        "@id": `${siteUrl}${routePath}#product`,
        name: "AIXCO Global Bond",
        description: "AIXCO Global's subordinated bond issued by AIXCO Global Assets GmbH and listed on the Vienna MTF.",
        url: `${siteUrl}${routePath}`,
        brand: { "@type": "Brand", name: "AIXCO.Global" },
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <PrivateClientAdvisoryLandingPage />
      </ClientShell>
    </>
  );
}
