import { dubaiFunds } from "@/data/site";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, HandCoins, TrendingUp, type LucideIcon } from "lucide-react";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { aixcoFundGallery, aixcoLiveImages } from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";

const imageMap: Record<string, string> = {
  "dubai-eden": aixcoLiveImages.dubaiEdenHouse,
  "dubai-healthcare": aixcoLiveImages.dubaiHealthcare,
};

const dubaiStillRailImages = [
  { src: aixcoFundGallery[4], title: "Eden House construction view" },
  { src: aixcoFundGallery[7], title: "Eden House completed facade" },
  { src: aixcoFundGallery[12], title: "Dubai project streetscape" },
] as const;

function galleryAspectClass(src: string) {
  if (src.endsWith("/fund1.png")) return "aspect-[2/3]";
  if (src.endsWith("/fund8.jpeg") || src.endsWith("/fund20.jpeg")) return "aspect-[9/16]";
  if (src.endsWith("/fund4.jpeg")) return "aspect-[4/3]";
  return "aspect-video";
}

function parseFundDetail(detail: string) {
  const separatorIndex = detail.indexOf(":");

  if (separatorIndex === -1) {
    return { label: "", value: detail };
  }

  return {
    label: detail.slice(0, separatorIndex).trim(),
    value: detail.slice(separatorIndex + 1).trim(),
  };
}

function isHeadlineMetric(label: string) {
  return ["Units", "Total", "Total Equity", "Performance"].includes(label);
}

function formatMetricValue(value: string) {
  const trimmed = value.trim();
  const unitsValue = trimmed.match(/^([\d,.]+)\+$/);
  const usdMillions = trimmed.match(/^USD\s+([\d,.]+)m$/i);
  const projectedValue = trimmed.match(/^Projected\s+(.+)$/i);

  if (unitsValue) {
    return { prefix: "", value: unitsValue[1], subtext: "+" };
  }

  if (usdMillions) {
    return { prefix: "", value: usdMillions[1], subtext: "m USD" };
  }

  if (projectedValue) {
    return { prefix: "", value: projectedValue[1], subtext: "Projected" };
  }

  const prefixedValue = trimmed.match(/^(USD|Projected)\s+(.+)$/i);

  if (!prefixedValue) {
    return { prefix: "", value: trimmed, subtext: "" };
  }

  return {
    prefix: prefixedValue[1],
    value: prefixedValue[2],
    subtext: "",
  };
}

type DubaiFund = (typeof dubaiFunds)[number];
type Translate = (copy: string) => string;

const detailIcons: LucideIcon[] = [TrendingUp, HandCoins, Building2];

function renderFundTitle(title: string) {
  const accent = "The Canal";

  if (!title.includes(accent)) {
    return title;
  }

  const [before, after] = title.split(accent);

  return (
    <>
      {before}
      <span className="text-primary">{accent}</span>
      {after}
    </>
  );
}

function PrestigeStatCard({
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
      data-fund-highlight-tile
      whileHover={{ y: -4 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col justify-between border transition-all duration-500 ${
        compact ? "min-h-[7.1rem] p-4 md:min-h-[7.35rem] lg:min-h-[7.55rem] lg:p-5" : "min-h-[8.8rem] p-5 md:min-h-[9.4rem] lg:p-6"
      } ${
        highlight
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/10 bg-white hover:bg-surface/45"
      }`}
    >
      <div>
        <span
          className={`${compact ? "mb-3.5 text-[0.68rem]" : "mb-5 text-[0.72rem]"} block font-bold uppercase tracking-[0.22em] ${
            highlight ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {tx(label)}
        </span>
        <div className="flex items-baseline gap-1.5">
          {value && (
            <span
              className={`font-display ${
                compact ? "text-[clamp(2.18rem,3vw,3.12rem)]" : "text-[clamp(2.55rem,3.6vw,3.75rem)]"
              } font-semibold leading-none tracking-tight ${highlight ? "text-primary" : "text-foreground"}`}
            >
              {tx(value)}
            </span>
          )}
          {subtext && (
            <span className={`text-sm font-medium leading-none ${highlight ? "text-background/70" : "text-foreground/60"}`}>
              {tx(subtext)}
            </span>
          )}
        </div>
      </div>
      <div className={`${compact ? "mt-4" : "mt-7"} h-px w-8 transition-all duration-700 group-hover:w-full ${highlight ? "bg-primary" : "bg-foreground/20"}`} />
    </motion.div>
  );
}

function PrestigeHighlightItem({
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
        <span data-fund-detail-icon className="flex size-7 items-center justify-center rounded-full border border-foreground/10 bg-white/70">
          <Icon size={14} className="text-primary" strokeWidth={1.9} />
        </span>
        <span className={`${compact ? "text-[0.68rem]" : "text-[0.72rem]"} font-bold uppercase tracking-[0.18em] text-muted-foreground`}>
          {tx(title)}
        </span>
      </div>
      <p className={`max-w-[18rem] font-medium text-foreground/78 ${compact ? "text-[0.92rem] leading-[1.48]" : "text-[0.98rem] leading-relaxed"}`}>
        {tx(content)}
      </p>
    </li>
  );
}

function DubaiFundCard({
  fund,
  idx,
  tx,
  isLanding = false,
}: {
  fund: DubaiFund;
  idx: number;
  tx: Translate;
  isLanding?: boolean;
}) {
  const details = fund.details.map(parseFundDetail);
  const headlineMetrics = details.filter((detail) => isHeadlineMetric(detail.label));
  const supportingDetails = details.filter((detail) => !isHeadlineMetric(detail.label));
  const imageFirst = idx % 2 === 0;
  const isViewportFit = isLanding;
  const heightClass = isLanding
    ? "md:h-full md:min-h-0 md:max-h-full lg:h-full lg:min-h-0 lg:max-h-full"
    : "md:min-h-[clamp(30rem,calc(100svh-15rem),38rem)] lg:min-h-[clamp(28rem,calc(100svh-15rem),32rem)]";
  const mediaOrderClass = imageFirst ? "md:order-1 lg:order-1" : "md:order-2 lg:order-2";
  const copyOrderClass = imageFirst ? "md:order-2 lg:order-2" : "md:order-1 lg:order-1";
  const titleShellClass = isViewportFit
    ? "border-b border-foreground/5 p-6 pb-5 md:p-7 md:pb-6 lg:p-8 lg:pb-7 xl:p-8"
    : "border-b border-foreground/5 p-7 pb-6 md:p-9 lg:p-10 xl:p-11";
  const titleClass = isViewportFit
    ? "max-w-[42rem] font-display text-[clamp(2rem,4.7vw,3rem)] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[clamp(2.15rem,3.1vw,3.5rem)] lg:text-[clamp(2.2rem,3.05vw,3.6rem)]"
    : "max-w-[42rem] font-display text-[clamp(2.2rem,3.7vw,4.5rem)] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[clamp(2.65rem,3.8vw,4.65rem)] lg:text-[clamp(2.45rem,3.45vw,4.25rem)]";
  const detailListClass = isViewportFit
    ? "grid gap-5 bg-surface/45 p-5 md:grid-cols-3 md:gap-5 md:p-6 lg:p-7"
    : "grid gap-7 bg-surface/45 p-7 md:grid-cols-3 md:gap-8 md:p-9 lg:p-10";

  return (
    <motion.article
      data-fund-card={fund.id}
      data-density={isViewportFit ? "viewport-fit" : "standard"}
      data-image-position={imageFirst ? "left" : "right"}
      data-design-source="eden-house-portfolio-reference"
      className={`scroll-reveal group relative grid overflow-hidden border border-foreground/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10)] transition-all duration-500 md:grid-cols-12 md:items-stretch lg:grid-cols-12 ${heightClass}`}
      whileHover={premiumSurfaceHover}
      whileTap={premiumPress}
    >
      <div
        data-fund-media
        className={`relative min-h-[22rem] overflow-hidden bg-foreground md:col-span-5 md:min-h-0 lg:col-span-5 lg:min-h-0 ${mediaOrderClass}`}
      >
        <motion.img
          src={imageMap[fund.image]}
          alt={tx(fund.name)}
          loading="lazy"
          decoding="async"
          width={1536}
          height={960}
          className="h-full w-full object-cover opacity-85 transition-transform duration-1000 ease-out group-hover:scale-[1.035]"
          initial={isLanding ? { scale: 1.08 } : false}
          whileInView={isLanding ? { scale: 1 } : undefined}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.45, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-foreground/45 via-foreground/12 to-transparent" aria-hidden />
        <span className="pointer-events-none absolute left-8 top-7 select-none font-display text-[clamp(5.4rem,8vw,7.8rem)] font-semibold leading-none tracking-tight text-white/20 md:left-10 md:top-9">
          0{idx + 1}
        </span>
        <div className="absolute bottom-8 left-8 z-10 md:bottom-10 md:left-10">
          <span className="inline-flex items-center gap-3 text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-white">
            {tx("View Asset Details")}
            <ArrowRight size={17} className="text-primary transition-transform duration-500 group-hover:translate-x-2" />
          </span>
        </div>
      </div>
      <div
        data-fund-copy
        className={`flex min-h-0 flex-col border-foreground/5 md:col-span-7 lg:col-span-7 ${copyOrderClass} ${
          imageFirst ? "md:border-l lg:border-l" : "md:border-r lg:border-r"
        }`}
      >
        <div className={titleShellClass}>
          <h3 className={titleClass}>
            {renderFundTitle(tx(fund.name))}
          </h3>
        </div>
        <div data-fund-highlight-grid={fund.id} className="grid grid-cols-1 border-b border-foreground/5 md:grid-cols-3">
          {headlineMetrics.map((detail) => {
            const metric = formatMetricValue(tx(detail.value));
            const isPerformance = detail.label === "Performance";

            return (
              <PrestigeStatCard
                key={`${detail.label}:${detail.value}`}
                label={detail.label}
                value={`${metric.prefix ? `${metric.prefix} ` : ""}${metric.value}`}
                subtext={metric.subtext}
                highlight={isPerformance}
                compact={isViewportFit}
                tx={tx}
              />
            );
          })}
        </div>
        <ul className={detailListClass} data-fund-detail-notes={fund.id} data-layout="prestige-highlights">
          {supportingDetails.map((detail, detailIndex) => (
            <PrestigeHighlightItem
              key={`${detail.label}:${detail.value}`}
              icon={detailIcons[detailIndex % detailIcons.length]}
              title={detail.label}
              content={detail.value}
              compact={isViewportFit}
              tx={tx}
            />
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function Dubai() {
  const { tx } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const [landingFund, ...remainingFunds] = dubaiFunds;

  return (
    <section className="relative bg-surface/40 py-16 md:py-20 lg:py-20">
      <div className="container-x">
        <div className="grid gap-8" data-layout="alternating-fund-cards">
          <div
            id="dubai"
            data-viewport-fit="first-view"
            className="flex min-h-[calc(100svh-4rem)] scroll-mt-16 flex-col md:min-h-[calc(100svh-5rem)] md:scroll-mt-20"
          >
            <div className="scroll-reveal mb-5 shrink-0 md:mb-6 lg:mb-7">
              <p className="eyebrow">{tx("Dubai")}</p>
              <h2 className="heading-section mt-4 max-w-2xl">{tx("Dubai")}</h2>
            </div>

            <div className="flex flex-1 flex-col md:min-h-0" data-layout="dubai-first-viewport">
              <DubaiFundCard fund={landingFund} idx={0} tx={tx} isLanding />
            </div>
          </div>

          <div className="grid gap-8" data-layout="remaining-dubai-fund-cards">
            {remainingFunds.map((fund, idx) => (
              <DubaiFundCard key={fund.id} fund={fund} idx={idx + 1} tx={tx} />
            ))}
          </div>
        </div>

        <div className="scroll-reveal mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(300px,0.82fr)] lg:items-start">
          <div
            className="columns-1 gap-4 sm:columns-2"
            aria-label="Fund I Eden House gallery"
            data-layout="dense-masonry"
          >
            {aixcoFundGallery.map((src, index) => (
              <motion.figure
                key={src}
                className={`group mb-4 break-inside-avoid overflow-hidden rounded-lg bg-background shadow-soft ${galleryAspectClass(src)}`}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.985 }}
                whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.22, margin: "0px 0px -10% 0px" }}
                transition={{
                  duration: shouldReduceMotion ? 0.35 : 0.72,
                  ease: shouldReduceMotion ? "easeOut" : [0.16, 1, 0.3, 1],
                  delay: shouldReduceMotion ? 0 : (index % 3) * 0.05,
                }}
              >
                <img
                  src={src}
                  alt={`Fund I Eden House gallery ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </motion.figure>
            ))}
          </div>
          <div
            className="grid grid-cols-3 gap-3 lg:sticky lg:top-24 lg:h-[calc(100svh-8rem)] lg:max-h-[calc(100svh-8rem)] lg:grid-cols-1 lg:grid-rows-3"
            aria-label="Dubai fund images"
            data-layout="viewport-fit-image-rail"
          >
            {dubaiStillRailImages.map((image) => (
              <motion.figure
                key={image.src}
                className="group min-h-0 overflow-hidden rounded-lg bg-background shadow-soft"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.985 }}
                whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.24, margin: "0px 0px -10% 0px" }}
                transition={{ duration: shouldReduceMotion ? 0.35 : 0.66, ease: shouldReduceMotion ? "easeOut" : [0.16, 1, 0.3, 1] }}
              >
                <img
                  src={image.src}
                  alt={tx(image.title)}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                  className="h-full min-h-0 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
