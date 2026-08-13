import type { Metadata } from "next";
import { ClientShell } from "../client-shell";
import { JsonLd } from "@/components/JsonLd";
import { InvestBatumiLandingPage } from "@/components/sections/InvestBatumiLandingPage";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";

const routePath = "/invest-in-batumi";
const pageTitle = "Invest in Batumi Property | AIXCO.Global";
const pageDescription =
  "Explore selected Batumi property opportunities with AIXCO.Global, transparent guidance and local support from first shortlist to ownership.";
const socialImage = "/aixco-global-op2/images/batumi-mosaic-hd/batumi-day-aerial.jpg";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: routePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: routePath,
    siteName: "AIXCO.Global",
    images: [{ url: socialImage, width: 7360, height: 4912, alt: "Batumi skyline and Black Sea from above" }],
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

export default async function InvestInBatumiPage() {
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
        caption: "Batumi skyline and Black Sea from above",
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}${routePath}#service`,
        name: "AIXCO Batumi property buyer advisory",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: { "@type": "City", name: "Batumi" },
        serviceType: "Property buyer advisory",
        url: `${siteUrl}${routePath}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <InvestBatumiLandingPage />
      </ClientShell>
    </>
  );
}
