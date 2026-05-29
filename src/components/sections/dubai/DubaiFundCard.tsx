import { ArrowRight } from "lucide-react";
import { ExpandableImage } from "@/components/ExpandableImage";
import { motion } from "@/lib/framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { DubaiHighlightItem } from "./DubaiHighlightItem";
import { DubaiStatCard } from "./DubaiStatCard";
import { renderDubaiFundTitle } from "./DubaiFundTitle";
import {
  dubaiDetailIcons,
  dubaiImageMap,
  formatMetricValue,
  hasAssetGallery,
  isHeadlineMetric,
  parseFundDetail,
  type DubaiFund,
  type Translate,
} from "./dubai-data";

type DubaiFundCardProps = {
  fund: DubaiFund;
  idx: number;
  tx: Translate;
  isLanding?: boolean;
};

export function DubaiFundCard({ fund, idx, tx, isLanding = false }: DubaiFundCardProps) {
  const details = fund.details.map(parseFundDetail);
  const headlineMetrics = details.filter((detail) => isHeadlineMetric(detail.label));
  const supportingDetails = details.filter((detail) => !isHeadlineMetric(detail.label));
  const hasLongHeadlineMetrics = headlineMetrics.some(
    (detail) => detail.label === "Site progress" || detail.value.length > 32,
  );
  const imageFirst = idx % 2 === 0;
  const isViewportFit = isLanding;
  const heightClass = isLanding
    ? "md:h-full md:min-h-0 md:max-h-full md:flex-1 lg:h-full lg:min-h-0 lg:max-h-full"
    : "md:min-h-[clamp(30rem,calc(100svh-15rem),38rem)] lg:min-h-[clamp(28rem,calc(100svh-15rem),32rem)]";
  const mediaOrderClass = imageFirst ? "order-2 md:order-1 lg:order-1" : "order-2 md:order-2 lg:order-2";
  const copyOrderClass = imageFirst ? "order-1 md:order-2 lg:order-2" : "order-1 md:order-1 lg:order-1";
  const titleShellClass = isViewportFit
    ? "border-b border-foreground/5 p-4 pb-3 md:p-5 md:pb-4 lg:p-6 lg:pb-4 xl:p-6"
    : "border-b border-foreground/5 p-7 pb-6 md:p-9 lg:p-10 xl:p-11";
  const titleClass = isViewportFit
    ? "max-w-[42rem] font-display text-[clamp(2rem,4.7vw,3rem)] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[clamp(2.15rem,3.1vw,3.5rem)] lg:text-[clamp(2.2rem,3.05vw,3.6rem)]"
    : "max-w-[42rem] font-display text-[clamp(2.2rem,3.7vw,4.5rem)] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[clamp(2.65rem,3.8vw,4.65rem)] lg:text-[clamp(2.45rem,3.45vw,4.25rem)]";
  const detailListClass = isViewportFit
    ? "grid gap-3 bg-surface/45 p-3.5 sm:grid-cols-2 md:gap-3 md:p-4 lg:grid-cols-3 lg:p-4"
    : "grid gap-7 bg-surface/45 p-7 sm:grid-cols-2 md:gap-8 md:p-9 lg:p-10 xl:grid-cols-3";
  const galleryId = hasAssetGallery(fund.id) ? fund.id : undefined;
  const galleryHref = galleryId ? `#dubai-asset-gallery-${galleryId}` : undefined;

  return (
    <motion.article
      data-fund-card={fund.id}
      data-density={isViewportFit ? "viewport-fit" : "standard"}
      data-image-position={imageFirst ? "left" : "right"}
      data-design-source="eden-house-portfolio-reference"
      className={`scroll-reveal group relative grid overflow-hidden border border-foreground/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10)] transition-[transform,box-shadow,border-color] duration-300 md:grid-cols-12 md:items-stretch lg:grid-cols-12 ${heightClass}`}
      whileHover={premiumSurfaceHover}
      whileTap={premiumPress}
    >
      <div
        data-fund-media
        className={`relative min-h-[22rem] overflow-hidden bg-foreground md:col-span-5 md:min-h-0 lg:col-span-5 lg:min-h-0 ${mediaOrderClass}`}
      >
        <ExpandableImage src={dubaiImageMap[fund.image]} title={tx(fund.name)} className="h-full w-full">
          <motion.img
            src={dubaiImageMap[fund.image]}
            alt={tx(fund.name)}
            loading="lazy"
            decoding="async"
            width={1536}
            height={960}
            className="h-full w-full object-cover opacity-85 transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            initial={isLanding ? { scale: 1.08 } : false}
            whileInView={isLanding ? { scale: 1 } : undefined}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.45, ease: "easeOut" }}
          />
        </ExpandableImage>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-foreground/45 via-foreground/12 to-transparent" aria-hidden />
        {galleryHref && (
          <a
            href={galleryHref}
            aria-label={`${tx("View Asset Details")}: ${tx(fund.name)}`}
            className="asset-detail-cta"
          >
            <span className="asset-detail-cta__label">{tx("View Asset Details")}</span>
            <ArrowRight size={17} className="asset-detail-cta__icon" />
          </a>
        )}
      </div>
      <div
        data-fund-copy
        className={`flex min-h-0 min-w-0 flex-col border-foreground/5 md:col-span-7 lg:col-span-7 ${copyOrderClass} ${
          imageFirst ? "md:border-l lg:border-l" : "md:border-r lg:border-r"
        }`}
      >
        <div className={titleShellClass}>
          <h3 className={titleClass}>
            {renderDubaiFundTitle(tx(fund.name), tx("The Canal"))}
          </h3>
        </div>
        <div
          data-fund-highlight-grid={fund.id}
          className={`grid grid-cols-1 border-b border-foreground/5 ${
            hasLongHeadlineMetrics
              ? "md:[grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr))]"
              : "md:grid-cols-3"
          }`}
        >
          {headlineMetrics.map((detail) => {
            const metric = formatMetricValue(detail.value);
            const isPerformance = detail.label === "Performance" || detail.label === "Status";

            return (
              <DubaiStatCard
                key={`${detail.label}:${detail.value}`}
                label={detail.label}
                value={`${metric.prefix ? `${tx(metric.prefix)} ` : ""}${metric.value}`}
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
            <DubaiHighlightItem
              key={`${detail.label}:${detail.value}`}
              icon={dubaiDetailIcons[detailIndex % dubaiDetailIcons.length]}
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
