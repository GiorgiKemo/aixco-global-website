import { ArrowRight } from "lucide-react";
import { LiveVideo } from "@/components/LiveVideo";
import { motion } from "@/lib/framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { getSafeAssetKey, getSafePublicAssetHref } from "@/lib/security/urls";
import { BatumiDetailItem } from "./BatumiDetailItem";
import { BatumiStatCard } from "./BatumiStatCard";
import {
  batumiDetailAssetMap,
  batumiDocumentMap,
  batumiImageMap,
  batumiProjectDetailIcons,
  batumiVideoMap,
  type BatumiProperty,
  type Translate,
} from "./batumi-data";

type BatumiPropertyCardProps = {
  property: BatumiProperty;
  idx: number;
  tx: Translate;
};

export function BatumiPropertyCard({ property, idx, tx }: BatumiPropertyCardProps) {
  const imageFirst = idx % 2 === 0;
  const mediaOrderClass = imageFirst ? "order-2 md:order-1 lg:order-1" : "order-2 md:order-2 lg:order-2";
  const copyOrderClass = imageFirst ? "order-1 md:order-2 lg:order-2" : "order-1 md:order-1 lg:order-1";
  const documentKey = getSafeAssetKey(property.url, property.id);
  const documentHref = getSafePublicAssetHref(batumiDetailAssetMap[documentKey] ?? batumiDocumentMap[documentKey], "#batumi");
  const mediaHeightClass = "min-h-[22rem] md:min-h-0 lg:min-h-0";

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
        className={`relative overflow-hidden bg-foreground md:col-span-5 lg:col-span-5 ${mediaHeightClass} ${mediaOrderClass}`}
      >
        <LiveVideo
          src={batumiVideoMap[property.video].src}
          previewSrc={batumiVideoMap[property.video].previewSrc}
          title={tx(property.name)}
          poster={batumiImageMap[property.image]}
          className="aspect-[4/5] w-full !rounded-none !shadow-none md:aspect-auto md:h-full md:min-h-0"
          fit="cover"
          rootMargin="700px 0px"
        />
        <a
          href={documentHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`${tx("View Asset Details")}: ${tx(property.name)}`}
          className="asset-detail-cta"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="asset-detail-cta__label">{tx("View Asset Details")}</span>
          <ArrowRight size={17} className="asset-detail-cta__icon" />
        </a>
      </div>
      <div
        data-batumi-property-copy
        className={`flex min-h-0 min-w-0 flex-col border-foreground/5 md:col-span-7 lg:col-span-7 ${copyOrderClass} ${
          imageFirst ? "md:border-l lg:border-l" : "md:border-r lg:border-r"
        }`}
      >
        <div data-batumi-property-title className="border-b border-foreground/5 p-7 pb-6 md:p-9 lg:p-10 xl:p-11">
          <h3 className="max-w-[42rem] font-display text-[clamp(2.2rem,3.7vw,4.5rem)] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[clamp(2.65rem,3.8vw,4.65rem)] lg:text-[clamp(2.45rem,3.45vw,4.25rem)]">
            {tx(property.name)}
          </h3>
        </div>
        <div
          data-batumi-property-highlight-grid={property.id}
          className="grid min-w-0 grid-cols-1 border-b border-foreground/5 md:grid-cols-3 [&>*]:min-w-0"
        >
          {property.metrics.map((metric) => (
            <BatumiStatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              subtext={metric.subtext}
              highlight={"highlight" in metric ? metric.highlight : false}
              tx={tx}
            />
          ))}
        </div>
        <ul className="grid gap-7 bg-surface/45 p-7 sm:grid-cols-2 md:gap-8 md:p-9 lg:p-10 xl:grid-cols-3" data-batumi-property-detail-notes={property.id} data-layout="prestige-highlights">
          {property.highlights.map((highlight, detailIndex) => (
            <BatumiDetailItem
              key={`${property.id}-${highlight.label}`}
              icon={batumiProjectDetailIcons[detailIndex % batumiProjectDetailIcons.length]}
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
