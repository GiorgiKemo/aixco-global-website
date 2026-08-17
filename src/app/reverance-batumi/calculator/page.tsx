import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ReveranceInvestmentCalculator } from "@/components/sections/ReveranceInvestmentCalculator";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";
import { ClientShell } from "../../client-shell";

const routePath = "/reverance-batumi/calculator";
const pageTitle = "Project Reverance investment calculator | AIXCO.Global";
const pageDescription =
  "Model Reverance apartments in Batumi with transparent price, financing, rental and growth assumptions, then download a localized PDF brief.";
const socialImage = "/aixco-global-op2/images/project-gallery-2026/01-hero-exterior.webp";

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
    images: [{ url: socialImage, width: 1920, height: 1280, alt: "Project Reverance residential complex in Batumi" }],
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

export default async function ReveranceInvestmentCalculatorPage() {
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
        about: { "@id": `${siteUrl}${routePath}#application` },
        primaryImageOfPage: { "@id": `${siteUrl}${routePath}#primaryimage` },
      },
      {
        "@type": "ImageObject",
        "@id": `${siteUrl}${routePath}#primaryimage`,
        url: `${siteUrl}${socialImage}`,
        contentUrl: `${siteUrl}${socialImage}`,
        caption: "Project Reverance residential complex in Batumi",
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}${routePath}#application`,
        name: pageTitle,
        description: pageDescription,
        url: `${siteUrl}${routePath}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        provider: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <ReveranceInvestmentCalculator />
      </ClientShell>
    </>
  );
}
