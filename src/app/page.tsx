import Index from "@/views/HomePage";
import { ClientShell } from "./client-shell";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { JsonLd } from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site-url";
import { InitialSiteAnimation } from "@/components/InitialSiteAnimation";

export const revalidate = 300;

export default async function HomePage() {
  const siteContent = await fetchSiteContentForServer();
  const siteUrl = getSiteUrl();
  const { company } = siteContent.content;
  const sameAs = [
    company.socials.linkedin,
    company.socials.facebook,
    company.socials.instagram,
    company.socials.youtube,
    company.socials.x,
  ].filter(Boolean);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: company.name,
        url: siteUrl,
        logo: `${siteUrl}/aixco-global-op2/images/AIXCOGlobal-horizontal-dark.png`,
        email: company.email,
        address: company.address,
        foundingDate: String(company.founded),
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: company.name,
        url: siteUrl,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

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
