"use client";

import { LiveVideo } from "@/components/LiveVideo";
import { useSiteContent } from "@/data/site-content-context";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoBatumiGalleryVideos } from "@/lib/aixco-live-assets";
import { BatumiMarketCard } from "./batumi/BatumiMarketCard";
import { BatumiPropertyCard } from "./batumi/BatumiPropertyCard";

export function Batumi() {
  const { tx } = useI18n();
  const { batumiBenefits, batumiProperties } = useSiteContent();

  return (
    <section className="relative bg-surface/40 py-16 md:py-20 lg:py-20">
      <div className="container-x">
        <div
          id="batumi"
          aria-label="Batumi market overview"
          data-viewport-fit="first-view"
          className="flex min-h-[calc(100svh-4rem)] scroll-mt-16 flex-col md:min-h-[calc(100svh-5rem)] md:scroll-mt-20"
        >
          <div className="scroll-reveal mb-5 shrink-0 md:mb-4 lg:mb-4">
            <p className="eyebrow">{tx("Emerging market opportunity")}</p>
            <h2 className="heading-section mt-4 max-w-2xl [overflow-wrap:anywhere]">{tx("Batumi")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/75 md:text-base">
              {tx(
                "Selected emerging-market projects and apartments through AIXCO, with Batumi as the current focus, entry from €50,000, 100% foreign ownership, bank financing minimum 60%, and a transparent ISO-certified process.",
              )}
            </p>
          </div>

          <div className="flex flex-1 flex-col md:min-h-0" data-layout="batumi-first-viewport">
            <BatumiMarketCard benefits={batumiBenefits} tx={tx} />
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
                previewSrc={video.previewSrc}
                title={tx(video.title)}
                poster={video.poster}
                className="aspect-[9/16]"
                rootMargin="220px 0px"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
