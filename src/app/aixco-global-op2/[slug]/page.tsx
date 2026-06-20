import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Download, FileText, MapPin, ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { Tx } from "@/components/i18n/Tx";
import {
  batumiDetailAssetMap,
  batumiDocumentMap,
  batumiImageMap,
  batumiVideoMap,
  getBatumiMarketDetails,
  type BatumiProperty,
} from "@/components/sections/batumi/batumi-data";

type PropertyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeSlug(slug: string) {
  return decodeURIComponent(slug).replace(/\/+$/, "").replace(/\.html$/i, "").toLowerCase();
}

function getPropertyBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  return siteContentDefaults.batumiProperties.find(
    (property) => normalizeSlug(property.url) === normalizedSlug || normalizeSlug(property.id) === normalizedSlug,
  );
}

export function generateStaticParams() {
  return siteContentDefaults.batumiProperties.map((property) => ({ slug: property.url }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "AIXCO.Global",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${property.name} | AIXCO.Global`,
    description: property.summary,
    alternates: {
      canonical: `/aixco-global-op2/${property.url}`,
    },
    openGraph: {
      title: `${property.name} | AIXCO.Global`,
      description: property.summary,
      images: [batumiImageMap[property.image]],
    },
  };
}

function DetailMetric({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="border border-foreground/10 bg-white p-4 shadow-[0_24px_70px_-58px_rgba(0,0,0,0.45)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Tx>{label}</Tx>
      </p>
      <p className="mt-3 font-display text-3xl font-semibold leading-none text-primary">{value}</p>
      {subtext ? (
        <p className="mt-2 text-sm leading-relaxed text-foreground/62">
          <Tx>{subtext}</Tx>
        </p>
      ) : null}
    </div>
  );
}

function PropertyChrome() {
  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-60 border-r border-foreground/10 bg-white px-6 py-7 text-foreground shadow-[18px_0_60px_-46px_rgba(0,0,0,0.42)] xl:flex xl:flex-col xl:justify-between">
        <div>
          <Link href="/" prefetch={false} className="inline-flex min-h-16 items-center gap-2 text-foreground transition-colors hover:text-primary">
            <img src={aixcoLiveLogos.aixcoMark} alt="" aria-hidden="true" className="h-auto w-16 object-contain [filter:brightness(0)_saturate(100%)]" />
            <span className="whitespace-nowrap text-[0.84rem] font-semibold tracking-[-0.02em]">AIXCO.GLOBAL</span>
          </Link>
          <nav aria-label="Property navigation" className="mt-12 grid gap-2 text-sm font-medium">
            <Link href="/#batumi" prefetch={false} className="inline-flex items-center gap-2 rounded-md py-2 text-foreground/75 transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <Tx>Back to Batumi</Tx>
            </Link>
            <Link href="/#contact" prefetch={false} className="inline-flex items-center gap-2 rounded-md py-2 text-foreground/75 transition-colors hover:text-primary">
              <Tx>Contact AIXCO</Tx>
            </Link>
          </nav>
        </div>
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Tx>Property profile</Tx>
        </p>
      </aside>
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-foreground/10 bg-white/96 px-4 py-3 text-foreground shadow-[0_18px_50px_-42px_rgba(0,0,0,0.44)] backdrop-blur-xl xl:hidden">
        <Link href="/" prefetch={false} className="inline-flex min-w-0 items-center gap-2 text-foreground">
          <img src={aixcoLiveLogos.aixcoMark} alt="" aria-hidden="true" className="h-auto w-11 shrink-0 object-contain [filter:brightness(0)_saturate(100%)]" />
          <span className="truncate text-sm font-semibold tracking-[-0.02em]">AIXCO.GLOBAL</span>
        </Link>
        <Link href="/#batumi" prefetch={false} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-foreground/10 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <Tx>Back</Tx>
        </Link>
      </header>
    </>
  );
}

function PropertyPageContent({ property }: { property: BatumiProperty }) {
  const image = batumiImageMap[property.image];
  const video = batumiVideoMap[property.video];
  const documentHref = batumiDocumentMap[property.id];
  const assetHref = batumiDetailAssetMap[property.id];
  const ownershipDetails = getBatumiMarketDetails(siteContentDefaults.batumiBenefits);

  return (
    <main className="min-h-screen bg-background text-foreground xl:pl-60">
      <PropertyChrome />
      <section className="grid min-h-screen grid-cols-1 pt-[4.75rem] xl:grid-cols-12 xl:pt-0">
        <div className="order-2 grid content-center gap-8 px-5 py-10 sm:px-8 lg:px-12 xl:order-1 xl:col-span-7 xl:px-14">
          <div>
            <p className="eyebrow text-primary">
              <Tx>Batumi property profile</Tx>
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-foreground">
              {property.name}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-foreground/74 md:text-xl">
              <Tx>{property.summary}</Tx>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {property.metrics.map((metric) => (
              <DetailMetric key={metric.label} label={metric.label} value={metric.value} subtext={metric.subtext} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {property.highlights.map((highlight) => (
              <article key={highlight.label} className="border-l border-primary/35 pl-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  <Tx>{highlight.label}</Tx>
                </p>
                <p className="mt-3 text-base leading-7 text-foreground/76">
                  <Tx>{highlight.value}</Tx>
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ownershipDetails.map((detail) => (
              <div key={detail.label} className="flex gap-3 border border-foreground/10 bg-white p-4">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-semibold text-foreground">
                    <Tx>{detail.label}</Tx>
                  </p>
                  <p className="mt-1 text-sm leading-6 text-foreground/68">
                    <Tx>{detail.content}</Tx>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {assetHref ? (
              <Link href={assetHref} prefetch={false} className="btn-gold" target="_blank" rel="noreferrer">
                <FileText className="h-4 w-4" aria-hidden />
                <Tx>View catalog</Tx>
              </Link>
            ) : null}
            {documentHref ? (
              <Link href={documentHref} prefetch={false} className="btn-ghost-gold" target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" aria-hidden />
                <Tx>Download brochure</Tx>
              </Link>
            ) : null}
            <Link href="/#contact" prefetch={false} className="btn-ghost-gold">
              <Tx>Contact AIXCO</Tx>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <aside className="relative order-1 min-h-[38rem] overflow-hidden bg-foreground xl:order-2 xl:col-span-5 xl:min-h-screen">
          {video ? (
            <video src={video.src} poster={image} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <Image
              src={image}
              alt={property.name}
              fill
              sizes="(min-width: 1280px) 38vw, 100vw"
              className="object-cover"
              preload
              fetchPriority="high"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,16,14,0.05),rgba(17,16,14,0.32)),linear-gradient(90deg,rgba(17,16,14,0.24),transparent_42%)]" />
          <div className="absolute bottom-6 left-6 right-6 grid gap-3 text-white">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/24 px-4 py-2 text-sm font-semibold backdrop-blur-md">
              <MapPin className="h-4 w-4" aria-hidden />
              <Tx>Selected AIXCO access</Tx>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/24 px-4 py-2 text-sm font-semibold backdrop-blur-md">
              <Building2 className="h-4 w-4" aria-hidden />
              <Tx>Current project</Tx>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;

  if (normalizeSlug(slug) === "index") {
    redirect("/");
  }

  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyPageContent property={property} />;
}
