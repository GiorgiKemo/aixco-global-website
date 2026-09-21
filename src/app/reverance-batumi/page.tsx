import type { Metadata } from "next";
import { reveranceStockCopy } from "@/data/reverance-stock-copy";
import { BrandbookLandingPage } from "@/components/sections/BrandbookLandingPage";
import { ClientShell } from "../client-shell";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/JsonLd";

const routePath = "/reverance-batumi";
const pageTitle = "Project Reverance Batumi | AIXCO.Global";
const pageDescription = reveranceStockCopy.metadata;

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
        url: "/aixco-global-op2/images/project-gallery-2026/01-hero-exterior.webp",
        width: 1920,
        height: 1280,
        alt: "Project Reverance residential complex in Batumi",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/aixco-global-op2/images/project-gallery-2026/01-hero-exterior.webp"],
  },
};

export const revalidate = 300;

export default async function ReveranceBatumiLandingPage() {
  const siteContent = await fetchSiteContentForServer();
  const siteUrl = getSiteUrl();
  const currentProject = siteContent.content.batumiProperties.find((project) => project.id === "current-project");
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
        about: { "@id": `${siteUrl}${routePath}#residence` },
      },
      {
        "@type": "Residence",
        "@id": `${siteUrl}${routePath}#residence`,
        name: currentProject?.name ?? "Project Reverance",
        description: currentProject?.summary ?? pageDescription,
        url: `${siteUrl}${routePath}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "59 Adlia Street",
          addressLocality: "Batumi",
          addressCountry: "GE",
        },
        image: `${siteUrl}/aixco-global-op2/images/project-gallery-2026/01-hero-exterior.webp`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <BrandbookLandingPage />
      </ClientShell>
    </>
  );
}
