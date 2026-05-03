import { batumiBenefits, batumiProperties } from "@/data/site";
import { ArrowRight, Building2, ExternalLink, FileText, Home, Percent, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { aixcoBatumiGalleryVideos, aixcoLiveDocuments, aixcoLiveImages, aixcoLiveVideos } from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";
import { LiveVideo } from "@/components/LiveVideo";

const imageMap: Record<string, string> = {
  "batumi-guru": aixcoLiveImages.batumiGuru,
  "batumi-otium": aixcoLiveImages.batumiOtium,
};

const videoMap: Record<string, string> = {
  guruBatumi: aixcoLiveVideos.guruBatumi,
  otium: aixcoLiveVideos.otium,
};

const documentMap: Record<string, string> = {
  guru: aixcoLiveDocuments.guru,
  otium: aixcoLiveDocuments.otium,
};

type BatumiProperty = (typeof batumiProperties)[number];
type Translate = (copy: string) => string;

const marketMetrics = [
  { label: "Rental yield", value: "8%", subtext: "starting from" },
  { label: "Annual growth", value: "12%", subtext: "up to" },
  { label: "Entry price", value: "EUR 50k", subtext: "from", highlight: true },
] as const;

const marketDetailIcons: LucideIcon[] = [Home, Percent, TrendingUp, ShieldCheck];
const projectDetailIcons: LucideIcon[] = [Building2, FileText, TrendingUp];

const marketDetails = [
  { label: "Ownership", content: batumiBenefits[3] },
  { label: "Tax", content: batumiBenefits[4] },
  { label: "Capital gains", content: batumiBenefits[5] },
  { label: "Financing", content: batumiBenefits[6] },
] as const;

function BatumiStatCard({
  label,
  value,
  subtext,
  highlight = false,
  compact = false,
  tx,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
  compact?: boolean;
  tx: Translate;
}) {
  return (
    <motion.div
      data-batumi-metric-tile
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group flex flex-col justify-between border transition-[background-color,border-color,box-shadow,color] duration-200 ${
        compact ? "min-h-[5.9rem] p-3.5 md:min-h-[6.15rem] lg:p-4" : "min-h-[8.8rem] p-5 md:min-h-[9.4rem] lg:p-6"
      } ${
        highlight
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/10 bg-white hover:bg-surface/45"
      }`}
    >
      <div>
        <span
          className={`${compact ? "mb-2.5 text-[0.66rem]" : "mb-5 text-[0.72rem]"} block font-bold uppercase tracking-[0.22em] ${
            highlight ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {tx(label)}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-display ${
              compact ? "text-[clamp(2rem,2.65vw,2.82rem)]" : "text-[clamp(2.55rem,3.6vw,3.75rem)]"
            } font-semibold leading-none tracking-tight ${highlight ? "text-primary" : "text-foreground"}`}
          >
            {tx(value)}
          </span>
          {subtext && (
            <span className={`text-sm font-medium leading-none ${highlight ? "text-background/70" : "text-foreground/60"}`}>
              {tx(subtext)}
            </span>
          )}
        </div>
      </div>
      <div className={`${compact ? "mt-3" : "mt-7"} h-px w-8 transition-[width,background-color] [transition-duration:400ms] group-hover:w-full ${highlight ? "bg-primary" : "bg-foreground/20"}`} />
    </motion.div>
  );
}

function BatumiDetailItem({
  icon: Icon,
  title,
  content,
  compact = false,
  tx,
}: {
  icon: LucideIcon;
  title: string;
  content: string;
  compact?: boolean;
  tx: Translate;
}) {
  return (
    <li className={compact ? "space-y-2.5" : "space-y-3"}>
      <div className="flex items-center gap-3">
        <span data-batumi-detail-icon className="flex size-7 items-center justify-center rounded-full border border-foreground/10 bg-white/70">
          <Icon size={14} className="text-primary" strokeWidth={1.9} />
        </span>
        <span className={`${compact ? "text-[0.68rem]" : "text-[0.72rem]"} font-bold uppercase tracking-[0.18em] text-muted-foreground`}>
          {tx(title)}
        </span>
      </div>
      <p className={`font-medium text-foreground/78 ${compact ? "text-[0.88rem] leading-[1.4]" : "text-[0.98rem] leading-relaxed"}`}>
        {tx(content)}
      </p>
    </li>
  );
}

function BatumiMarketCard({ tx }: { tx: Translate }) {
  return (
    <motion.article
      data-batumi-card="market-overview"
      data-density="viewport-fit"
      data-image-position="right"
      data-design-source="dubai-card-reference"
      className="batumi-market-card scroll-reveal group relative grid overflow-hidden border border-foreground/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10)] transition-[transform,box-shadow,border-color] duration-300 md:h-[clamp(30rem,calc(100svh-13rem),42rem)] md:min-h-0 md:max-h-[calc(100svh-13rem)] md:grid-cols-12 md:items-stretch lg:h-[clamp(30rem,calc(100svh-13rem),42rem)] lg:min-h-0 lg:max-h-[calc(100svh-13rem)] lg:grid-cols-12"
      whileHover={premiumSurfaceHover}
      whileTap={premiumPress}
    >
      <div
        aria-label="Batumi overview media"
        data-media-frame="dubai-style-split-media"
        data-batumi-card-media
        className="relative min-h-[22rem] overflow-hidden bg-foreground md:order-2 md:col-span-5 md:min-h-0 lg:order-2 lg:col-span-5 lg:min-h-0"
      >
        <LiveVideo
          src={aixcoLiveVideos.batumiOverview}
          title={tx("Batumi")}
          poster={aixcoLiveImages.batumiOverviewPoster}
          className="aspect-[9/16] w-full !rounded-none !shadow-none md:aspect-auto md:h-full md:min-h-0"
          videoClassName="bg-black"
          fit="contain"
          eager
          autoplayPreview={false}
        />
        <span className="pointer-events-none absolute left-8 top-7 select-none font-display text-[clamp(5.4rem,8vw,7.8rem)] font-semibold leading-none tracking-tight text-white/20 md:left-10 md:top-9">
          01
        </span>
      </div>
      <div
        data-batumi-card-copy
        className="flex min-h-0 flex-col border-foreground/5 md:order-1 md:col-span-7 md:border-r lg:order-1 lg:col-span-7 lg:border-r"
      >
        <div className="border-b border-foreground/5 p-5 pb-4 md:p-5 md:pb-4 lg:p-6 lg:pb-5">
          <h3 className="max-w-[42rem] font-display text-[clamp(2rem,4.7vw,3rem)] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[clamp(2.15rem,3.1vw,3.5rem)] lg:text-[clamp(2.2rem,3.05vw,3.6rem)]">
            {tx("Why Batumi")}
          </h3>
          <p className="mt-3 max-w-[45rem] text-[clamp(0.92rem,0.98vw,1rem)] leading-[1.45] text-foreground/76">
            {tx("Georgia sits at the crossroads of Europe and Asia, maintaining strong relationships with neighboring countries as well as with the EU, the United States, and Asian markets. Batumi offers a rare opportunity to enter an emerging market that is steadily aligning with the highest standards in safety, education, and transparency. At the same time, it benefits from a flexible, low-regulation environment and strong long-term growth potential.")}
          </p>
        </div>
        <div data-batumi-metric-grid className="grid grid-cols-1 border-b border-foreground/5 md:grid-cols-3">
          {marketMetrics.map((metric) => (
            <BatumiStatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              subtext={metric.subtext}
              highlight={metric.highlight}
              compact
              tx={tx}
            />
          ))}
        </div>
        <div aria-label="Batumi benefit highlights" data-layout="batumi-benefits-dubai-card" className="bg-surface/45">
          <ul data-batumi-detail-notes data-layout="prestige-highlights" className="grid gap-4 p-4 sm:grid-cols-2 md:grid-cols-2 md:gap-4 md:p-4 lg:p-5 xl:grid-cols-4">
            {marketDetails.map((detail, index) => (
              <BatumiDetailItem
                key={detail.label}
                icon={marketDetailIcons[index % marketDetailIcons.length]}
                title={detail.label}
                content={detail.content}
                compact
                tx={tx}
              />
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}

function BatumiPropertyCard({ property, idx, tx }: { property: BatumiProperty; idx: number; tx: Translate }) {
  const imageFirst = idx % 2 === 0;
  const mediaOrderClass = imageFirst ? "md:order-1 lg:order-1" : "md:order-2 lg:order-2";
  const copyOrderClass = imageFirst ? "md:order-2 lg:order-2" : "md:order-1 lg:order-1";
  const documentHref = documentMap[property.url] ?? property.url;
  const metricCards = property.metrics;

  return (
    <motion.article
      data-batumi-property-card={property.id}
      data-density="standard"
      data-image-position={imageFirst ? "left" : "right"}
      data-design-source="dubai-card-reference"
      className="scroll-reveal group relative grid overflow-hidden border border-foreground/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10)] transition-[transform,box-shadow,border-color] duration-300 md:min-h-[clamp(30rem,calc(100svh-15rem),38rem)] md:grid-cols-12 md:items-stretch lg:min-h-[clamp(28rem,calc(100svh-15rem),32rem)] lg:grid-cols-12"
      whileHover={premiumSurfaceHover}
      whileTap={premiumPress}
    >
      <div
        data-batumi-property-media
        className={`relative min-h-[24rem] overflow-hidden bg-foreground md:col-span-5 md:min-h-0 lg:col-span-5 lg:min-h-0 ${mediaOrderClass}`}
      >
        <LiveVideo
          src={videoMap[property.video]}
          title={tx(property.name)}
          poster={imageMap[property.image]}
          className="aspect-[4/5] w-full !rounded-none !shadow-none md:aspect-auto md:h-full md:min-h-0"
          videoClassName="bg-black"
          fit="contain"
          rootMargin="700px 0px"
          autoplayPreview={false}
        />
        <span className="pointer-events-none absolute left-8 top-7 select-none font-display text-[clamp(5.4rem,8vw,7.8rem)] font-semibold leading-none tracking-tight text-white/20 md:left-10 md:top-9">
          0{idx + 2}
        </span>
        <a
          href={documentHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`${tx("View Asset Details")}: ${tx(property.name)}`}
          className="absolute bottom-8 left-8 z-20 inline-flex items-center gap-3 text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors duration-200 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground md:bottom-10 md:left-10"
          onClick={(event) => event.stopPropagation()}
        >
          {tx("View Asset Details")}
          <ArrowRight size={17} className="text-primary transition-transform duration-200 group-hover:translate-x-2" />
        </a>
      </div>
      <div
        data-batumi-property-copy
        className={`flex min-h-0 flex-col border-foreground/5 md:col-span-7 lg:col-span-7 ${copyOrderClass} ${
          imageFirst ? "md:border-l lg:border-l" : "md:border-r lg:border-r"
        }`}
      >
        <div className="border-b border-foreground/5 p-7 pb-6 md:p-9 lg:p-10 xl:p-11">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="font-display text-[clamp(2.2rem,3.7vw,4.5rem)] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[clamp(2.65rem,3.8vw,4.65rem)] lg:text-[clamp(2.45rem,3.45vw,4.25rem)]">
                {tx(property.name)}
              </h3>
              <p className="mt-4 max-w-[38rem] text-[clamp(1rem,1.15vw,1.08rem)] font-medium leading-relaxed text-foreground/76">
                {tx(property.summary)}
              </p>
            </div>
            <a
              href={documentHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-primary/40 px-4 py-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-primary transition-[background-color,border-color,color] duration-200 hover:border-primary hover:bg-primary/10"
            >
              {tx(`Open ${property.name} profile`)}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div data-batumi-property-highlight-grid={property.id} className="grid grid-cols-1 border-b border-foreground/5 md:grid-cols-3">
          {metricCards.map((metric) => (
            <BatumiStatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              subtext={metric.subtext}
              highlight={metric.highlight}
              tx={tx}
            />
          ))}
        </div>
        <ul className="grid gap-7 bg-surface/45 p-7 md:grid-cols-3 md:gap-8 md:p-9 lg:p-10" data-batumi-property-detail-notes={property.id} data-layout="prestige-highlights">
          {property.highlights.map((highlight, detailIndex) => (
            <BatumiDetailItem
              key={`${property.id}-${highlight.label}`}
              icon={projectDetailIcons[detailIndex % projectDetailIcons.length]}
              title={highlight.label}
              content={highlight.value}
              tx={tx}
            />
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function Batumi() {
  const { tx } = useI18n();

  return (
    <section className="relative bg-surface/40 py-16 md:py-20 lg:py-20">
      <div className="container-x">
        <div
          id="batumi"
          aria-label="Batumi market overview"
          data-viewport-fit="first-view"
          className="flex min-h-[calc(100svh-4rem)] scroll-mt-16 flex-col md:min-h-[calc(100svh-5rem)] md:scroll-mt-20"
        >
          <div className="scroll-reveal mb-5 shrink-0 md:mb-6 lg:mb-7">
            <p className="eyebrow">{tx("Batumi")}</p>
            <h2 className="heading-section mt-4 max-w-2xl">{tx("Batumi")}</h2>
          </div>

          <div className="flex flex-1 flex-col md:min-h-0" data-layout="batumi-first-viewport">
            <BatumiMarketCard tx={tx} />
          </div>
        </div>

        <div className="mt-8 grid gap-8" data-layout="batumi-project-profile-cards">
          {batumiProperties.map((property, idx) => (
            <BatumiPropertyCard key={property.id} property={property} idx={idx} tx={tx} />
          ))}
        </div>

        <div className="scroll-reveal mt-16 md:mt-20">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">{tx("Batumi gallery")}</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-normal md:text-5xl">{tx("Video gallery")}</h3>
            </div>
          </div>
          <div
            aria-label="Batumi video gallery"
            data-layout="portrait-video-gallery"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {aixcoBatumiGalleryVideos.map((video) => (
              <LiveVideo
                key={video.src}
                src={video.src}
                title={tx(video.title)}
                poster={video.poster}
                className="aspect-[9/16]"
                rootMargin="700px 0px"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
