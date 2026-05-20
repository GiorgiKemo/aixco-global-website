import { motion } from "@/lib/framer-motion";
import { DubaiImageMarquee } from "./DubaiImageMarquee";
import { fundAssetGalleries, type DubaiFundGalleryId, type Translate } from "./dubai-data";

type DubaiFundAssetGalleryProps = {
  fundId: DubaiFundGalleryId;
  isLanding?: boolean;
  shouldReduceMotion: boolean | null;
  tx: Translate;
};

export function DubaiFundAssetGallery({
  fundId,
  isLanding = false,
  shouldReduceMotion,
  tx,
}: DubaiFundAssetGalleryProps) {
  const gallery = fundAssetGalleries[fundId];
  const viewportOffsetClass = isLanding ? "mt-28 md:mt-32" : "mt-5";

  return (
    <motion.div
      id={`dubai-asset-gallery-${fundId}`}
      data-fund-asset-gallery={fundId}
      data-gallery-source={gallery.source}
      data-viewport-offset={isLanding ? "landing-gallery" : undefined}
      aria-label={tx(gallery.label)}
      className={`${viewportOffsetClass} scroll-mt-16 border border-foreground/10 bg-white p-4 shadow-[0_34px_80px_-35px_rgba(0,0,0,0.28)] sm:p-5 md:scroll-mt-20 lg:p-6`}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.18 : 0.32, ease: "easeOut" }}
    >
      <div className="grid gap-7">
        {gallery.groups.map((group) => (
          <section key={group.title} className="min-w-0" aria-labelledby={`dubai-${fundId}-${group.title.replace(/\s+/g, "-").toLowerCase()}`}>
            <h4
              id={`dubai-${fundId}-${group.title.replace(/\s+/g, "-").toLowerCase()}`}
              className="mb-4 font-display text-[clamp(1.35rem,2.2vw,2rem)] font-semibold leading-tight text-foreground"
            >
              {tx(group.title)}
            </h4>
            <DubaiImageMarquee group={group} shouldReduceMotion={shouldReduceMotion} tx={tx} />
          </section>
        ))}
      </div>
    </motion.div>
  );
}
