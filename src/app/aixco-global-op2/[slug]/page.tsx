import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import {
  BadgeCheck,
  Diamond,
  FileCheck2,
  Globe2,
  KeyRound,
  Landmark,
  Percent,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { ClientShell } from "@/app/client-shell";
import { JsonLd } from "@/components/JsonLd";
import { Tx } from "@/components/i18n/Tx";
import { EnglishBrochureLink, PropertyChrome, PropertyContactLink } from "@/components/property/PropertyChrome";
import {
  batumiImageMap,
  batumiVideoMap,
  getBatumiMarketDetails,
  type BatumiProperty,
} from "@/components/sections/batumi/batumi-data";
import { getSiteUrl } from "@/lib/site-url";

type PropertyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeSlug(slug: string) {
  let decodedSlug = slug;

  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    decodedSlug = "";
  }

  return decodedSlug.replace(/\/+$/, "").replace(/\.html$/i, "").toLowerCase();
}

const getCurrentSiteContent = cache(() => fetchSiteContentForServer());

async function getPropertyBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const siteContent = await getCurrentSiteContent();
  return siteContent.content.batumiProperties.find(
    (property) => normalizeSlug(property.url) === normalizedSlug || normalizeSlug(property.id) === normalizedSlug,
  );
}

export function generateStaticParams() {
  return siteContentDefaults.batumiProperties.map((property) => ({ slug: property.url }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "AIXCO.Global",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${property.name} | AIXCO.Global`;
  const canonicalPath = `/aixco-global-op2/${property.url}`;
  const socialImage = property.id === "current-project"
    ? {
        url: "/aixco-global-op2/images/optimized/current-project-hero-towers.webp",
        width: 1280,
        height: 610,
        alt: `${property.name} private residences in Batumi`,
      }
    : {
        url: batumiImageMap[property.image],
        alt: `${property.name} property opportunity`,
      };

  return {
    title,
    description: property.summary,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description: property.summary,
      url: canonicalPath,
      siteName: "AIXCO.Global",
      locale: "en_US",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: property.summary,
      images: [socialImage],
    },
  };
}

function DetailMetric({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="property-detail-metric min-w-0 border-l border-[#9E9D9D]/45 pl-5">
      <p className="property-detail-metric__label text-xs font-semibold uppercase tracking-[0.14em] text-[#161616]">
        <Tx>{label}</Tx>
      </p>
      <p className="property-detail-metric__value font-medium tracking-[-0.025em] text-[#161616]"><Tx>{value}</Tx></p>
      {subtext ? (
        <p className="property-detail-metric__subtext mt-2 text-sm leading-relaxed text-[#5F5F5F]">
          <Tx>{subtext}</Tx>
        </p>
      ) : null}
    </div>
  );
}

function PropertyPageContent({ property, batumiBenefits }: { property: BatumiProperty; batumiBenefits: string[] }) {
  const image = batumiImageMap[property.image];
  const ownershipDetails = getBatumiMarketDetails(batumiBenefits);
  const heroImage = property.id === "current-project"
    ? "/aixco-global-op2/images/optimized/current-project-hero-towers.webp"
    : image;
  const heroMetrics = [
    ...property.metrics,
    { label: "Available apartments", value: "28", subtext: "13th and 14th floors" },
  ];
  const investmentBenefits = [
    { icon: Globe2, title: "100% Ownership", body: "Full freehold, no local partner, no conditions. Yours entirely." },
    { icon: KeyRound, title: "No Residency Permit", body: "Ownership without relocation. Buy from anywhere." },
    { icon: Percent, title: "1% Rental Income Tax", body: "Keep 99% of what your asset earns - rental income taxed at just 1%." },
    { icon: BadgeCheck, title: "0% Capital Gains", body: "Hold for more than two years and keep the full upside." },
    { icon: Landmark, title: "Minimum 60% Financing", body: "Local bank financing can cover at least 60% of the purchase price." },
    { icon: FileCheck2, title: "Transparent Title", body: "ISO-certified guidance with clear, verifiable documentation." },
  ];

  return (
    <>
      <PropertyChrome />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#F3EDE1] text-[#161616]">
      <section className="property-hero relative mx-auto grid max-w-[96rem] overflow-hidden border-b border-[#9E9D9D]/35 lg:min-h-[40rem] lg:grid-cols-[minmax(0,1.16fr)_minmax(28rem,0.84fr)]">
        <div className="property-hero__content order-2 flex flex-col justify-center bg-[#F3EDE1] px-5 py-10 sm:px-8 sm:py-12 lg:order-1 lg:px-[clamp(3rem,4.2vw,4.5rem)] lg:py-10">
          <div className="max-w-[48rem]">
            <p className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#161616]">
              <Diamond className="h-2.5 w-2.5 fill-[#E6C767] stroke-[#E6C767]" aria-hidden />
              <Tx>Batumi property profile</Tx>
            </p>
            <h1 className="property-hero__title mt-5 max-w-4xl text-[clamp(3.5rem,5.6vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.035em] text-[#161616]">
              <Tx>{property.name}</Tx>
            </h1>
            <p className="property-hero__subtitle mt-2 text-[clamp(1.55rem,2.5vw,2.7rem)] font-medium leading-[1.08] tracking-[-0.02em] text-[#161616]">
              <Tx>private residences</Tx>
            </p>
            <p className="mt-5 max-w-[42rem] text-[clamp(1.02rem,1.22vw,1.2rem)] font-normal leading-[1.5] text-[#161616]">
              <Tx>{property.summary}</Tx>
            </p>
          </div>

          <div className="property-hero__metrics mt-8 grid grid-cols-2 gap-y-6 border-y border-[#9E9D9D]/35 py-5 xl:grid-cols-4">
            {heroMetrics.map((metric) => (
              <DetailMetric key={metric.label} label={metric.label} value={metric.value} subtext={metric.subtext} />
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <PropertyContactLink className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#9E9D9D] bg-transparent px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#161616] transition-colors hover:border-[#161616] hover:bg-[#161616] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C767]">
              <Tx>Contact AIXCO</Tx>
            </PropertyContactLink>
            {property.id === "current-project" ? (
              <EnglishBrochureLink
                href="/aixco-global-op2/documents/reverance-by-otium-brochure-en.pdf"
                fileName="Reverance-by-Otium-brochure-EN.pdf"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#161616] px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#9A7425] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C767]"
              />
            ) : null}
          </div>
        </div>

        <aside className="property-hero__media relative order-1 min-h-[23rem] overflow-hidden bg-[#161616] sm:min-h-[32rem] lg:order-2 lg:min-h-full">
          <Image
            src={heroImage}
            alt={property.name}
            fill
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="object-cover object-[62%_center]"
            preload
            fetchPriority="high"
            loading="eager"
          />
        </aside>
      </section>

      <section className="border-b border-[#9E9D9D]/35 bg-white px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#161616]"><Tx>The investment case</Tx></p>
            <span aria-hidden className="mx-auto mt-3 block h-px w-12 bg-[#E6C767]" />
          </div>
          <div className="mt-9 grid gap-px bg-[#9E9D9D]/45 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {investmentBenefits.map(({ icon: Icon, title, body }) => (
              <article key={title} className="min-h-[11rem] bg-white px-5 py-5">
                <Icon className="h-7 w-7 stroke-[1.35] text-[#161616]" aria-hidden />
                <h2 className="mt-4 text-[1.05rem] font-semibold leading-tight text-[#161616]"><Tx>{title}</Tx></h2>
                <p className="mt-2 text-sm leading-6 text-[#161616]"><Tx>{body}</Tx></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#161616] px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[82rem] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#E6C767]"><Tx>Project highlights</Tx></p>
            <h2 className="mt-5 max-w-[12ch] text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
              <Tx>Selected access, structured for ownership.</Tx>
            </h2>
            <p className="mt-5 max-w-[34rem] border-l-[3px] border-[#E6C767] pl-4 text-lg font-normal leading-8 text-white">
              <Tx>Clear guidance, real project information, and supporting materials from AIXCO.</Tx>
            </p>
          </div>
          <div className="grid gap-0 border-t border-white/30">
            {property.highlights.map((highlight, index) => (
              <article key={highlight.label} className="grid gap-3 border-b border-white/20 py-6 sm:grid-cols-[4rem_10rem_1fr] sm:items-start">
                <span className="text-3xl font-medium text-[#E6C767]">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]"><Tx>{highlight.label}</Tx></p>
                <p className="text-base leading-7 text-white/80"><Tx>{highlight.value}</Tx></p>
              </article>
            ))}
            {ownershipDetails.length ? (
              <p className="pt-6 text-sm leading-6 text-white/65">
                {ownershipDetails.map((detail, index) => (
                  <span key={detail.label}>
                    {index ? " / " : null}
                    <Tx>{detail.label}</Tx>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;

  if (normalizeSlug(slug) === "index") {
    redirect("/");
  }

  const siteContent = await getCurrentSiteContent();
  const property = siteContent.content.batumiProperties.find(
    (item) => normalizeSlug(item.url) === normalizeSlug(slug) || normalizeSlug(item.id) === normalizeSlug(slug),
  );

  if (!property) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/aixco-global-op2/${property.url}`;
  const propertyImage = property.id === "current-project"
    ? "/aixco-global-op2/images/optimized/current-project-hero-towers.webp"
    : batumiImageMap[property.image];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.name,
    description: property.summary,
    sku: property.id,
    category: "Residential real estate",
    url: canonicalUrl,
    image: new URL(propertyImage, siteUrl).toString(),
    brand: {
      "@type": "Brand",
      name: "AIXCO.Global",
    },
    areaServed: {
      "@type": "Place",
      name: "Batumi, Georgia",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "45000",
      offerCount: "28",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientShell initialSiteContent={siteContent.content} initialSiteContentSource={siteContent.source}>
        <PropertyPageContent property={property} batumiBenefits={siteContent.content.batumiBenefits} />
      </ClientShell>
    </>
  );
}
