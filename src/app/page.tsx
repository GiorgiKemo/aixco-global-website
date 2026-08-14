import Index from "@/views/HomePage";
import { ClientShell } from "./client-shell";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { JsonLd } from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site-url";
import { InitialSiteAnimation } from "@/components/InitialSiteAnimation";

export const revalidate = 300;

const organizationDescription =
  "Explore selected real estate opportunities with transparent euro pricing from EUR 45,000, brokerage, and property administration through AIXCO.";

export function buildHomeStructuredData(siteUrl: string, company: typeof import("@/lib/backend/site-content").siteContentDefaults.company) {
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const brandId = `${siteUrl}/#brand`;
  const logoUrl = `${siteUrl}/aixco-global-op2/images/AIXCOGlobal-horizontal-dark.png`;
  const sameAs = [
    company.socials.linkedin,
    company.socials.facebook,
    company.socials.instagram,
    company.socials.youtube,
    company.socials.x,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "RealEstateAgent"],
        "@id": organizationId,
        name: "AIXCO.Global",
        alternateName: ["AIXCO Global", "AIXCO.Global Real Estate"],
        description: organizationDescription,
        url: siteUrl,
        logo: { "@id": `${siteUrl}/#logo` },
        image: { "@id": `${siteUrl}/#logo` },
        email: company.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Grüngasse 16",
          postalCode: "1050",
          addressLocality: "Vienna",
          addressCountry: "AT",
        },
        foundingDate: String(company.founded),
        areaServed: company.offices,
        knowsAbout: [
          "Real estate investment",
          "Residential property",
          "Property brokerage",
          "Property administration",
          "Georgia residency",
        ],
        brand: { "@id": brandId },
        sameAs,
      },
      {
        "@type": "Brand",
        "@id": brandId,
        name: "AIXCO.Global",
        alternateName: "AIXCO Global",
        url: siteUrl,
        logo: { "@id": `${siteUrl}/#logo` },
      },
      {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: logoUrl,
        contentUrl: logoUrl,
        caption: "AIXCO.Global",
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "AIXCO.Global",
        alternateName: ["AIXCO Global", "AIXCO.Global Real Estate"],
        description: organizationDescription,
        url: siteUrl,
        inLanguage: "en",
        about: { "@id": organizationId },
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        name: "AIXCO.Global | Real Estate Investment",
        description: organizationDescription,
        url: siteUrl,
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
        mainEntity: { "@id": organizationId },
        primaryImageOfPage: { "@id": `${siteUrl}/#logo` },
      },
    ],
  };
}

export default async function HomePage() {
  const siteContent = await fetchSiteContentForServer();
  const siteUrl = getSiteUrl();
  const { company } = siteContent.content;
  const structuredData = buildHomeStructuredData(siteUrl, company);

  return (
    <>
      <InitialSiteAnimation />
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <Index />
      </ClientShell>
    </>
  );
}
