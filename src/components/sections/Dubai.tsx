"use client";

import { useSiteContent } from "@/data/site-content-context";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { DubaiFundAssetGallery } from "./dubai/DubaiFundAssetGallery";
import { DubaiFundCard } from "./dubai/DubaiFundCard";
import { hasAssetGallery, type DubaiFund } from "./dubai/dubai-data";

export { getGalleryTileLoading } from "./dubai/DubaiImageMarquee";

export function Dubai() {
  const { tx } = useI18n();
  const { dubaiFunds } = useSiteContent();
  const shouldReduceMotion = useHydratedReducedMotion();
  const [landingFund, ...remainingFunds] = dubaiFunds;
  const renderFundGallery = (fund: DubaiFund, isLanding = false) => {
    if (!hasAssetGallery(fund.id)) return null;

    return <DubaiFundAssetGallery fundId={fund.id} isLanding={isLanding} shouldReduceMotion={shouldReduceMotion} tx={tx} />;
  };

  return (
    <section className="relative bg-surface/40 py-16 md:py-20 lg:py-20">
      <div className="container-x">
        <div className="grid gap-8" data-layout="alternating-fund-cards">
          <div data-fund-card-shell={landingFund.id}>
            <div
              id="dubai"
              data-viewport-fit="first-view"
              className="flex min-h-[calc(100svh-4rem)] scroll-mt-16 flex-col md:min-h-[calc(100svh-5rem)] md:scroll-mt-20"
            >
              <div className="scroll-reveal mb-5 shrink-0 md:mb-4 lg:mb-4">
                <p className="eyebrow">{tx("Dubai")}</p>
                <h2 className="heading-section mt-4 max-w-2xl">{tx("Dubai")}</h2>
              </div>

              <div className="flex flex-1 flex-col md:min-h-0" data-layout="dubai-first-viewport">
                <DubaiFundCard
                  fund={landingFund}
                  idx={0}
                  tx={tx}
                  isLanding
                />
              </div>
            </div>

            {renderFundGallery(landingFund, true)}
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
