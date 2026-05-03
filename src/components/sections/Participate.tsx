import { ArrowRight } from "lucide-react";
import { participationRoutes } from "@/data/site";
import { useUI } from "../ui-state";
import { motion } from "framer-motion";
import { type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveImages, aixcoLiveVideos } from "@/lib/aixco-live-assets";
import { LiveVideo } from "@/components/LiveVideo";

const videoMap: Record<string, { src: string; poster: string }> = {
  bonds: { src: aixcoLiveVideos.bonds, poster: aixcoLiveImages.transactionBackdrop },
  batumiBuy: { src: aixcoLiveVideos.batumiBuy, poster: aixcoLiveImages.batumiOtium },
};

export function Participate() {
  const { openRegister } = useUI();
  const { tx } = useI18n();
  const navigate = useNavigate();

  const handleHowClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate("/#how");
  };

  return (
    <section id="participate" className="relative scroll-mt-16 overflow-hidden bg-surface/40 py-16 noise-overlay md:scroll-mt-20 md:py-20 lg:py-24">
      <div className="motion-accent-line absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container-x">
        <div className="scroll-reveal mb-16 max-w-3xl">
          <p className="eyebrow">{tx("Ways to Participate")}</p>
          <h2 className="heading-section mt-5">
            <span className="text-gold">{tx("How")}</span> {tx("Customers/Partners Profit")}
          </h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            {tx("Choose the route that fits your goals. Customers can either subscribe to the AIXCO 6% bond, secured by underlying property, or purchase an apartment directly and benefit from rental income potential, capital appreciation, and Batumi’s favorable tax environment.")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {participationRoutes.map((route, index) => (
            <motion.article
              key={route.id}
              className="scroll-reveal mac-card group relative overflow-hidden"
              whileHover={premiumSurfaceHover}
              whileTap={premiumPress}
            >
              <LiveVideo
                src={videoMap[route.video].src}
                title={tx(route.title)}
                poster={videoMap[route.video].poster}
                className="aspect-[16/10] rounded-none shadow-none"
              />
              <div className="p-8 md:p-10">
              <div className="mb-6 flex items-baseline justify-between">
                <span className="font-display text-6xl text-primary/30">0{index + 1}</span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl">{tx(route.title)}</h3>
              <p className="mt-5 text-sm leading-relaxed text-foreground/85">
                {route.id === "bond" ? (
                  <>
                    {tx("Customers sign up, complete onboarding, and invest in the AIXCO bond through a seamless digital process.")}{" "}
                    <strong>{tx("Purchase the AIXCO Bond with a guaranteed 30% return over 5 years")}</strong>{" "}
                    {tx("— combining structured security with strong, predictable growth. Backed by property as collateral, the bond provides investors with an added layer of asset-linked confidence.")}
                  </>
                ) : (
                  tx(route.body)
                )}
              </p>
              <motion.button
                onClick={openRegister}
                className="btn-gold mt-8 w-full sm:w-auto"
                whileHover={{ y: -2, scale: 1.012 }}
                whileTap={premiumPress}
              >
                {tx(route.cta)} <ArrowRight className="h-4 w-4" />
              </motion.button>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="scroll-reveal mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={openRegister} className="btn-gold">
            {tx("Register")}
          </button>
          <a href="#how" onClick={handleHowClick} className="btn-ghost-gold">
            {tx("How AIXCO Works")}
          </a>
        </div>
      </div>
    </section>
  );
}
