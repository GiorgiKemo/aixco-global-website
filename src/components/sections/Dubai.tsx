import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { dubaiFunds } from "@/data/site";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, HandCoins, TrendingUp, type LucideIcon } from "lucide-react";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import {
  aixcoDubaiEdenHouseCanalGallery,
  aixcoDubaiEdenHouseParkGallery,
  aixcoDubaiHealthcareGallery,
  aixcoLiveImages,
} from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";

const imageMap: Record<string, string> = {
  "dubai-eden": aixcoLiveImages.dubaiEdenHouse,
  "dubai-healthcare": aixcoLiveImages.dubaiHealthcare,
};

const fundAssetGalleries = {
  "fund-1": {
    source: "eden-house-and-park",
    label: "Fund I asset image gallery",
    groups: [
      { title: "Eden House The Canal", images: aixcoDubaiEdenHouseCanalGallery },
      { title: "Eden House The Park", images: aixcoDubaiEdenHouseParkGallery },
    ],
  },
  "fund-2": {
    source: "dubai-healthcare-city",
    label: "Fund II asset image gallery",
    groups: [{ title: "Dubai Healthcare City", images: aixcoDubaiHealthcareGallery }],
  },
} as const;

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
type DubaiFundGalleryId = keyof typeof fundAssetGalleries;
type DubaiFundGalleryGroup = (typeof fundAssetGalleries)[DubaiFundGalleryId]["groups"][number];

const detailIcons: LucideIcon[] = [TrendingUp, HandCoins, Building2];

function hasAssetGallery(fundId: string): fundId is DubaiFundGalleryId {
  return fundId in fundAssetGalleries;
}

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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group flex flex-col justify-between border transition-[background-color,border-color,box-shadow,color] duration-200 ${
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
      <div className={`${compact ? "mt-4" : "mt-7"} h-px w-8 transition-[width,background-color] [transition-duration:400ms] group-hover:w-full ${highlight ? "bg-primary" : "bg-foreground/20"}`} />
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

function getNormalizedGalleryScrollLeft(container: HTMLDivElement, scrollLeft: number) {
  const loopWidth = container.scrollWidth / 2;
  if (loopWidth <= container.clientWidth) return scrollLeft;

  if (scrollLeft >= loopWidth) return scrollLeft - loopWidth;
  if (scrollLeft <= 0) return scrollLeft + loopWidth;
  return scrollLeft;
}

function DubaiImageMarquee({
  group,
  shouldReduceMotion,
  tx,
}: {
  group: DubaiFundGalleryGroup;
  shouldReduceMotion: boolean | null;
  tx: Translate;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const currentScrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  const syncGalleryScroll = (viewport: HTMLDivElement, nextScrollLeft: number) => {
    const normalized = getNormalizedGalleryScrollLeft(viewport, nextScrollLeft);
    viewport.scrollLeft = normalized;
    currentScrollRef.current = normalized;
    targetScrollRef.current = normalized;
    return normalized;
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      if (shouldReduceMotion) {
        syncGalleryScroll(viewport, viewport.scrollLeft + event.deltaY);
        return;
      }

      targetScrollRef.current = getNormalizedGalleryScrollLeft(viewport, targetScrollRef.current + event.deltaY * 1.15);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [shouldReduceMotion]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const drag = dragRef.current;
      const viewport = viewportRef.current;
      if (!drag.active || !viewport) return;

      const deltaX = event.clientX - drag.lastX;
      const deltaTime = Math.max(16, event.timeStamp - drag.lastTime);
      const nextScrollLeft = viewport.scrollLeft - deltaX;

      syncGalleryScroll(viewport, nextScrollLeft);
      drag.velocity = (-deltaX / deltaTime) * 1000;
      drag.lastX = event.clientX;
      drag.lastTime = event.timeStamp;
      event.preventDefault();
    };

    const finishMouseDrag = () => {
      const viewport = viewportRef.current;
      if (!dragRef.current.active || !viewport) return;

      dragRef.current.active = false;
      targetScrollRef.current = viewport.scrollLeft;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", finishMouseDrag);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", finishMouseDrag);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || shouldReduceMotion) return undefined;

    let animationFrame = 0;
    let previousTime = 0;
    const autoPixelsPerSecond = 46;
    const easing = 0.12;
    const frictionPerSecond = 0.085;

    const tick = (time: number) => {
      if (previousTime === 0) previousTime = time;
      const deltaSeconds = (time - previousTime) / 1000;
      previousTime = time;

      if (!dragRef.current.active) {
        targetScrollRef.current += autoPixelsPerSecond * deltaSeconds;

        if (Math.abs(dragRef.current.velocity) > 1) {
          targetScrollRef.current += dragRef.current.velocity * deltaSeconds;
          dragRef.current.velocity *= Math.pow(frictionPerSecond, deltaSeconds);
        } else {
          dragRef.current.velocity = 0;
        }

        currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * easing;
        const normalized = getNormalizedGalleryScrollLeft(viewport, currentScrollRef.current);
        viewport.scrollLeft = normalized;
        currentScrollRef.current = normalized;
        targetScrollRef.current = getNormalizedGalleryScrollLeft(viewport, targetScrollRef.current);
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    currentScrollRef.current = viewport.scrollLeft;
    targetScrollRef.current = viewport.scrollLeft;
    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [group.images, shouldReduceMotion]);

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const viewport = event.currentTarget;
    dragRef.current.active = true;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastTime = event.timeStamp;
    dragRef.current.velocity = 0;
    currentScrollRef.current = viewport.scrollLeft;
    targetScrollRef.current = viewport.scrollLeft;
    event.preventDefault();
  };

  return (
    <div
      ref={viewportRef}
      aria-label={tx(`${group.title} images`)}
      className="dubai-image-marquee cursor-grab select-none active:cursor-grabbing"
      data-gallery-group={group.title}
      data-layout="horizontal-infinite-gallery"
      data-drag-scroll="left-mouse"
      data-native-scroll="true"
      data-scroll-easing="true"
      data-scroll-mode="horizontal-smooth-glide-loop"
      onMouseDown={handleMouseDown}
    >
      <div className="dubai-image-marquee-track" data-gallery-track="horizontal-loop">
        {[0, 1].map((setIndex) => (
          <div
            key={`${group.title}-${setIndex}`}
            aria-hidden={setIndex === 1 ? "true" : undefined}
            className="dubai-image-marquee-set"
            data-gallery-set={setIndex === 0 ? "primary" : "duplicate"}
          >
            {group.images.map((image) => (
              <figure key={`${setIndex}-${image.src}`} className="dubai-gallery-tile" data-gallery-tile>
                <img
                  src={image.src}
                  alt={setIndex === 0 ? tx(image.title) : ""}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover"
                />
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DubaiFundAssetGallery({
  fundId,
  shouldReduceMotion,
  tx,
}: {
  fundId: DubaiFundGalleryId;
  shouldReduceMotion: boolean | null;
  tx: Translate;
}) {
  const gallery = fundAssetGalleries[fundId];

  return (
    <motion.div
      id={`dubai-asset-gallery-${fundId}`}
      data-fund-asset-gallery={fundId}
      data-gallery-source={gallery.source}
      aria-label={tx(gallery.label)}
      className="mt-5 scroll-mt-16 border border-foreground/10 bg-white p-4 shadow-[0_34px_80px_-35px_rgba(0,0,0,0.28)] sm:p-5 md:scroll-mt-20 lg:p-6"
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
        <motion.img
          src={imageMap[fund.image]}
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
        <div className="absolute inset-0 bg-gradient-to-tr from-foreground/45 via-foreground/12 to-transparent" aria-hidden />
        {galleryHref && (
          <a
            href={galleryHref}
            aria-label={`${tx("View Asset Details")}: ${tx(fund.name)}`}
            className="absolute bottom-8 left-8 z-20 inline-flex items-center gap-3 text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors duration-200 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground md:bottom-10 md:left-10"
          >
            {tx("View Asset Details")}
            <ArrowRight size={17} className="text-primary transition-transform duration-200 group-hover:translate-x-2" />
          </a>
        )}
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
  const renderFundGallery = (fund: DubaiFund) => {
    if (!hasAssetGallery(fund.id)) return null;

    return <DubaiFundAssetGallery fundId={fund.id} shouldReduceMotion={shouldReduceMotion} tx={tx} />;
  };

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

            <div className="flex flex-1 flex-col md:min-h-0" data-layout="dubai-first-viewport" data-fund-card-shell={landingFund.id}>
              <DubaiFundCard
                fund={landingFund}
                idx={0}
                tx={tx}
                isLanding
              />
              {renderFundGallery(landingFund)}
            </div>
          </div>

          <div className="grid gap-8" data-layout="remaining-dubai-fund-cards">
            {remainingFunds.map((fund, idx) => (
              <div key={fund.id} data-fund-card-shell={fund.id}>
                <DubaiFundCard
                  fund={fund}
                  idx={idx + 1}
                  tx={tx}
                />
                {renderFundGallery(fund)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
