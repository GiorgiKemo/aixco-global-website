import { LiveVideo } from "@/components/LiveVideo";
import { aixcoLiveImages, aixcoLiveVideoPreviews, aixcoLiveVideos } from "@/lib/aixco-live-assets";
import { motion } from "@/lib/framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { BatumiDetailItem } from "./BatumiDetailItem";
import { BatumiStatCard } from "./BatumiStatCard";
import {
  batumiMarketDetailIcons,
  batumiMarketMetrics,
  getBatumiMarketDetails,
  type BatumiBenefits,
  type Translate,
} from "./batumi-data";

type BatumiMarketCardProps = {
  benefits: BatumiBenefits;
  tx: Translate;
};

export function BatumiMarketCard({ benefits, tx }: BatumiMarketCardProps) {
  const marketDetails = getBatumiMarketDetails(benefits);

  return (
    <motion.article
      data-batumi-card="market-overview"
      data-density="viewport-fit"
      data-image-position="right"
      data-design-source="dubai-card-reference"
      className="scroll-reveal group relative grid overflow-hidden border border-foreground/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10)] transition-[transform,box-shadow,border-color] duration-300 md:h-full md:min-h-0 md:max-h-full md:flex-1 md:grid-cols-12 md:items-stretch lg:h-full lg:min-h-0 lg:max-h-full lg:grid-cols-12"
      whileHover={premiumSurfaceHover}
      whileTap={premiumPress}
    >
      <div
        aria-label="Batumi overview media"
        data-media-frame="dubai-style-split-media"
        data-batumi-card-media
        className="batumi-match-current-project-video-height relative order-2 overflow-hidden bg-foreground md:order-2 md:col-span-5 md:min-h-0 lg:order-2 lg:col-span-5 lg:min-h-0"
      >
        <LiveVideo
          src={aixcoLiveVideos.batumiBuy}
          previewSrc={aixcoLiveVideoPreviews.batumiBuy}
          title={tx("Batumi")}
          poster={aixcoLiveImages.batumiBuyPoster}
          className="aspect-[9/16] w-full !rounded-none !shadow-none md:aspect-auto md:h-full md:min-h-0"
          fit="cover"
          rootMargin="250px 0px"
        />
      </div>
      <div
        data-batumi-card-copy
        className="order-1 flex min-h-0 min-w-0 flex-col border-foreground/5 md:order-1 md:col-span-7 md:border-r lg:order-1 lg:col-span-7 lg:border-r"
      >
        <div className="border-b border-foreground/5 p-4 pb-3 md:p-5 md:pb-4 lg:p-5 lg:pb-3 xl:p-5">
          <h3 className="max-w-[42rem] font-display text-[clamp(2rem,4.7vw,3rem)] font-semibold leading-[1.04] tracking-tight text-foreground md:text-[clamp(2.15rem,3.1vw,3.5rem)] lg:text-[clamp(2.2rem,3.05vw,3.6rem)]">
            {tx("Why Batumi")}
          </h3>
          <p className="mt-2 max-w-[45rem] text-[clamp(1rem,0.98vw,1.08rem)] leading-[1.32] text-foreground/76">
            {tx("Georgia sits at the crossroads of Europe and Asia, maintaining strong relationships with neighboring countries as well as with the EU, the United States, and Asian markets. Batumi offers a rare opportunity to enter an emerging market that is steadily aligning with the highest standards in safety, education, and transparency. At the same time, it benefits from a flexible, low-regulation environment and strong long-term growth potential.")}
          </p>
        </div>
        <div data-batumi-metric-grid className="grid grid-cols-1 border-b border-foreground/5 md:grid-cols-3">
          {batumiMarketMetrics.map((metric) => (
            <BatumiStatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              subtext={metric.subtext}
              subtextPosition={metric.subtextPosition}
              highlight={"highlight" in metric ? metric.highlight : false}
              compact
              tx={tx}
            />
          ))}
        </div>
        <div aria-label="Batumi benefit highlights" data-layout="batumi-benefits-dubai-card" className="bg-surface/45">
          <ul data-batumi-detail-notes data-layout="prestige-highlights" className="grid gap-3 p-3.5 sm:grid-cols-2 md:grid-cols-2 md:gap-3 md:p-3.5 lg:grid-cols-4 lg:p-3.5">
            {marketDetails.map((detail, index) => (
              <BatumiDetailItem
                key={detail.label}
                icon={batumiMarketDetailIcons[index % batumiMarketDetailIcons.length]}
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
