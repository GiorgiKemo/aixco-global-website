"use client";

import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/data/site-content-context";
import type { SiteContent } from "@/lib/backend/site-content";
import { useUI } from "../ui-state";
import { motion } from "@/lib/framer-motion";
import { Fragment } from "react";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveImages, aixcoLiveVideoPreviews, aixcoLiveVideos } from "@/lib/aixco-live-assets";
import { LiveVideo } from "@/components/LiveVideo";

const videoMap: Record<string, { src: string; previewSrc: string; poster: string }> = {
  batumiBuy: { src: aixcoLiveVideos.batumiBuy, previewSrc: aixcoLiveVideoPreviews.batumiBuy, poster: aixcoLiveImages.batumiBuyPoster },
  batumiOverview: { src: aixcoLiveVideos.batumiOverview, previewSrc: aixcoLiveVideoPreviews.batumiOverview, poster: aixcoLiveImages.batumiOverviewPoster },
  otium: { src: aixcoLiveVideos.otium, previewSrc: aixcoLiveVideoPreviews.otium, poster: aixcoLiveImages.batumiOtium },
};

const apartmentMetrics = [
  {
    value: "€50K",
    label: "Entry pricing",
  },
  {
    value: "8%",
    label: "Approx. net rental yields",
  },
  {
    value: "60%",
    label: "Bank financing",
  },
  {
    value: "100%",
    label: "Foreign ownership",
  },
];

type ParticipationRoute = SiteContent["participationRoutes"][number];

function SlashBreakText({ text }: { text: string }) {
  const parts = text.split("/");

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          {part}
          {index < parts.length - 1 && (
            <>
              /
              <wbr />
            </>
          )}
        </Fragment>
      ))}
    </>
  );
}

function ParticipationRouteCard({
  route,
  index,
  onRegister,
  tx,
  viewportMode = "standard",
}: {
  route: ParticipationRoute;
  index: number;
  onRegister: () => void;
  tx: (copy: string) => string;
  viewportMode?: "first" | "full" | "standard";
}) {
  const imageFirst = index % 2 !== 0;
  const useViewportLayout = viewportMode !== "standard";
  const mediaOrderClass = imageFirst ? "order-2 md:order-1 lg:order-1" : "order-2 md:order-2 lg:order-2";
  const copyOrderClass = imageFirst ? "order-1 md:order-2 lg:order-2" : "order-1 md:order-1 lg:order-1";
  const mediaSpanClass = viewportMode === "first" ? "md:col-span-4 lg:col-span-4" : "md:col-span-5 lg:col-span-5";
  const copySpanClass = viewportMode === "first" ? "md:col-span-8 lg:col-span-8" : "md:col-span-7 lg:col-span-7";
  const viewportCardClass =
    viewportMode === "first"
      ? "md:flex-1 md:min-h-0 md:max-h-full lg:flex-1 lg:min-h-0 lg:max-h-full"
      : viewportMode === "full"
        ? "md:h-[calc(100svh-5rem)] md:max-h-[calc(100svh-5rem)] lg:h-[calc(100svh-5rem)] lg:max-h-[calc(100svh-5rem)]"
        : "";
  const copyLayoutClass = useViewportLayout
    ? viewportMode === "first"
      ? "md:px-6 md:py-5 lg:px-8 lg:py-6 xl:px-9"
      : "md:px-8 md:py-8 lg:px-12 lg:py-10 xl:px-14"
    : "md:px-8 md:py-7 lg:px-9 lg:py-7";
  const stackLayoutClass = useViewportLayout ? "max-w-[38rem] md:h-full md:justify-between md:gap-5" : "";

  return (
    <motion.article
      data-participation-card={route.id}
      data-image-position={imageFirst ? "left" : "right"}
      data-design-source="dubai-batumi-split-card-reference"
      className={`scroll-reveal group relative grid scroll-mt-24 overflow-hidden border border-foreground/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10)] transition-[transform,box-shadow,border-color] duration-300 md:grid-cols-12 md:items-stretch lg:grid-cols-12 ${viewportCardClass}`}
      whileHover={premiumSurfaceHover}
      whileTap={premiumPress}
    >
      <div
        data-participation-media
        className={`relative min-h-[22rem] overflow-hidden bg-foreground md:min-h-0 md:self-stretch lg:min-h-0 lg:self-stretch ${mediaSpanClass} ${mediaOrderClass}`}
      >
        <LiveVideo
          src={videoMap[route.video].src}
          previewSrc={videoMap[route.video].previewSrc}
          title={tx(route.title)}
          poster={videoMap[route.video].poster}
          className="!absolute !inset-0 !h-full !w-full !rounded-none !shadow-none"
          fit="cover"
          rootMargin="700px 0px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-foreground/45 via-foreground/10 to-transparent" aria-hidden />
      </div>
      <div
        data-participation-copy
        className={`flex min-h-0 flex-col border-foreground/5 p-7 ${copySpanClass} ${copyLayoutClass} ${copyOrderClass} ${
          imageFirst ? "md:border-l lg:border-l" : "md:border-r lg:border-r"
        }`}
      >
        <div className={`flex min-h-0 flex-col gap-5 ${stackLayoutClass}`}>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[clamp(3.75rem,4.7vw,4.7rem)] leading-none text-primary/30">0{index + 1}</span>
          </div>
          <div className="max-w-[34rem]">
            <h3 className="font-display text-[clamp(2.45rem,2.85vw,3rem)] leading-[1.03]">{tx(route.title)}</h3>
            <div className="mt-5 grid gap-3 text-[clamp(1.14rem,1.12vw,1.28rem)] leading-[1.62] text-foreground/85">
              <p className="text-[clamp(1.17rem,1.12vw,1.3rem)] leading-[1.6]">{tx(route.body)}</p>
              <p className="text-[clamp(1rem,0.96vw,1.12rem)] leading-[1.55] text-foreground/72">
                {tx("Review selected projects, arrange a private visit, compare rental assumptions, and move through reservation with a guided AIXCO team.")}
              </p>
            </div>
          </div>
          {route.id === "apartment" && (
            <dl className="grid max-w-[34rem] grid-cols-2 gap-px overflow-hidden border border-foreground/10 bg-foreground/10 text-left md:grid-cols-4">
              {apartmentMetrics.map((metric) => (
                <div key={metric.label} className="bg-white p-3">
                  <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-foreground/55">{tx(metric.label)}</dt>
                  <dd className="mt-2 font-display text-[clamp(1.35rem,1.55vw,1.95rem)] leading-none text-primary">{tx(metric.value)}</dd>
                </div>
              ))}
            </dl>
          )}
          <motion.button
            onClick={onRegister}
            className="btn-gold w-auto self-start"
            whileHover={{ y: -2, scale: 1.012 }}
            whileTap={premiumPress}
          >
            {tx(route.cta)} <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function Participate() {
  const { openRegister } = useUI();
  const { tx } = useI18n();
  const { participationRoutes } = useSiteContent();
  const [firstRoute, ...remainingRoutes] = participationRoutes;

  return (
    <section
      id="participate"
      className="relative isolate z-10 scroll-mt-16 overflow-x-hidden bg-surface/40 py-12 pb-14 noise-overlay md:scroll-mt-20 md:py-0 md:pb-20 lg:pb-24"
    >
      <div className="motion-accent-line absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container-x">
        <div
          data-viewport-fit="first-view"
          className="flex min-h-[calc(100svh-4rem)] flex-col md:h-[calc(100svh-5rem)] md:min-h-0 md:py-4 lg:py-3"
        >
          <div className="scroll-reveal mb-4 max-w-6xl shrink-0 md:mb-4">
          <p className="eyebrow">{tx("How to work with AIXCO")}</p>
          <h2 className="heading-section mt-4 max-w-full text-[clamp(2.25rem,10vw,3.5rem)] leading-[1.02] [overflow-wrap:anywhere] sm:text-[clamp(2.65rem,4.1vw,3.5rem)]">
            <span className="text-gold">{tx("How")}</span> <SlashBreakText text={tx("Customers/Partners Work")} />
          </h2>
          <p className="mt-4 max-w-5xl text-[clamp(1.08rem,1.05vw,1.18rem)] leading-[1.52] text-foreground/80">
            {tx("Buy a Batumi apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.")}
          </p>
        </div>

          {firstRoute && (
            <div className="flex flex-1 flex-col md:min-h-0" data-layout="participate-first-viewport">
              <ParticipationRouteCard
                route={firstRoute}
                index={0}
                onRegister={openRegister}
                tx={tx}
                viewportMode="first"
              />
            </div>
          )}
          </div>

        <div className="mt-16 grid gap-16 pb-4 md:mt-20 md:pb-8" data-layout="alternating-participation-cards">
          {remainingRoutes.map((route, index) => (
            <ParticipationRouteCard
              key={route.id}
              route={route}
              index={index + 1}
              onRegister={openRegister}
              tx={tx}
              viewportMode="standard"
            />
          ))}
        </div>

      </div>
    </section>
  );
}
