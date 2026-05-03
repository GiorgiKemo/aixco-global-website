import { dubaiFunds } from "@/data/site";
import { motion, useReducedMotion } from "framer-motion";
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
  const prefixedValue = trimmed.match(/^(USD|Projected)\s+(.+)$/i);

  if (!prefixedValue) {
    return { prefix: "", value: trimmed };
  }

  return {
    prefix: prefixedValue[1],
    value: prefixedValue[2],
  };
}

type DubaiFund = (typeof dubaiFunds)[number];
type Translate = (copy: string) => string;

function DubaiFundCard({ fund, idx, tx }: { fund: DubaiFund; idx: number; tx: Translate }) {
  const details = fund.details.map(parseFundDetail);
  const headlineMetrics = details.filter((detail) => isHeadlineMetric(detail.label));
  const supportingDetails = details.filter((detail) => !isHeadlineMetric(detail.label));
  const imageFirst = idx % 2 === 0;

  return (
    <motion.article
      data-fund-card={fund.id}
      data-image-position={imageFirst ? "left" : "right"}
      className={`scroll-reveal mac-card group relative grid overflow-hidden lg:items-stretch ${
        imageFirst ? "lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]" : "lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]"
      }`}
      whileHover={premiumSurfaceHover}
      whileTap={premiumPress}
    >
      <div
        data-fund-media
        className={`relative aspect-[16/10] min-h-[18rem] overflow-hidden bg-muted lg:aspect-auto lg:min-h-full ${
          imageFirst ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <img
          src={imageMap[fund.image]}
          alt={tx(fund.name)}
          loading="lazy"
          decoding="async"
          width={1536}
          height={960}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent" aria-hidden />
        <span className="absolute right-4 top-4 font-display text-5xl text-primary/70 drop-shadow-[0_2px_12px_rgb(255_255_255/0.45)]">
          0{idx + 1}
        </span>
      </div>
      <div
        data-fund-copy
        className={`flex min-h-[28rem] flex-col justify-center p-7 md:p-9 lg:min-h-[34rem] lg:p-12 xl:p-14 2xl:p-16 ${
          imageFirst ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <h3 className="font-display max-w-2xl text-[clamp(2rem,2.35vw,3.05rem)] leading-[1.08]">
          {tx(fund.name)}
        </h3>
        <div data-fund-highlight-grid={fund.id} className="mt-8 grid gap-4 border-t border-border/60 pt-7 sm:grid-cols-2">
          {headlineMetrics.map((detail) => {
            const metric = formatMetricValue(tx(detail.value));
            const isPerformance = detail.label === "Performance";

            return (
            <div
              key={`${detail.label}:${detail.value}`}
              data-fund-highlight-tile
              className={`min-h-[9.25rem] rounded-lg border bg-background/80 p-5 shadow-soft md:p-6 ${
                isPerformance ? "border-primary/60 bg-primary/10" : "border-border/70"
              }`}
            >
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {tx(detail.label)}
              </p>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {metric.prefix && (
                  <span className={`font-display text-[1.15rem] leading-none md:text-[1.35rem] ${isPerformance ? "text-primary/80" : "text-foreground/72"}`}>
                    {tx(metric.prefix)}
                  </span>
                )}
                <span className={`font-display text-[clamp(2.65rem,4vw,4rem)] leading-none tracking-normal ${isPerformance ? "text-primary" : "text-foreground"}`}>
                  {tx(metric.value)}
                </span>
              </div>
            </div>
            );
          })}
        </div>
        <ul className="mt-5 space-y-3" data-fund-detail-notes={fund.id}>
          {supportingDetails.map((detail) => (
            <li key={`${detail.label}:${detail.value}`} className="rounded-lg border border-border/70 bg-muted/25 px-5 py-4">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.15em] text-primary">
                {tx(detail.label)}
              </p>
              <p className="mt-2 text-base font-medium leading-relaxed text-foreground/86">
                {tx(detail.value)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function Dubai() {
  const { tx } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="dubai" className="relative py-20 md:py-28 lg:py-36 scroll-mt-0 bg-surface/40">
      <div className="container-x">
        <div className="scroll-reveal mb-14">
          <p className="eyebrow">{tx("Dubai")}</p>
          <h2 className="heading-section mt-5 max-w-2xl">{tx("Dubai")}</h2>
        </div>

        <div className="grid gap-8" data-layout="alternating-fund-cards">
          {dubaiFunds.map((fund, idx) => (
            <DubaiFundCard key={fund.id} fund={fund} idx={idx} tx={tx} />
          ))}
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
