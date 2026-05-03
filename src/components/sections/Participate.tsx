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

type ParticipationRoute = (typeof participationRoutes)[number];

function ParticipationRouteCard({
  route,
  index,
  onRegister,
  tx,
}: {
  route: ParticipationRoute;
  index: number;
  onRegister: () => void;
  tx: (copy: string) => string;
}) {
  const imageFirst = index % 2 !== 0;
  const mediaOrderClass = imageFirst ? "md:order-1 lg:order-1" : "md:order-2 lg:order-2";
  const copyOrderClass = imageFirst ? "md:order-2 lg:order-2" : "md:order-1 lg:order-1";

  return (
    <motion.article
      data-participation-card={route.id}
      data-image-position={imageFirst ? "left" : "right"}
      data-design-source="dubai-batumi-split-card-reference"
      className="scroll-reveal group relative grid overflow-hidden border border-foreground/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10)] transition-[transform,box-shadow,border-color] duration-300 md:min-h-[clamp(28rem,calc(100svh-24rem),34rem)] md:grid-cols-12 md:items-stretch lg:min-h-[clamp(28rem,calc(100svh-24rem),34rem)] lg:grid-cols-12"
      whileHover={premiumSurfaceHover}
      whileTap={premiumPress}
    >
      <div
        data-participation-media
        className={`relative min-h-[22rem] overflow-hidden bg-foreground md:col-span-5 md:min-h-0 lg:col-span-5 lg:min-h-0 ${mediaOrderClass}`}
      >
        <LiveVideo
          src={videoMap[route.video].src}
          title={tx(route.title)}
          poster={videoMap[route.video].poster}
          className="aspect-[16/10] w-full !rounded-none !shadow-none md:aspect-auto md:h-full md:min-h-0"
          fit="cover"
          rootMargin="700px 0px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-foreground/45 via-foreground/10 to-transparent" aria-hidden />
      </div>
      <div
        data-participation-copy
        className={`flex min-h-0 flex-col justify-start border-foreground/5 p-8 md:col-span-7 md:p-10 lg:col-span-7 lg:p-11 ${copyOrderClass} ${
          imageFirst ? "md:border-l lg:border-l" : "md:border-r lg:border-r"
        }`}
      >
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
          onClick={onRegister}
          className="btn-gold mt-8 w-auto self-start"
          whileHover={{ y: -2, scale: 1.012 }}
          whileTap={premiumPress}
        >
          {tx(route.cta)} <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.article>
  );
}

export function Participate() {
  const { openRegister } = useUI();
  const { tx } = useI18n();
  const navigate = useNavigate();

  const handleHowClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate("/#how");
  };

  return (
    <section id="participate" className="relative scroll-mt-16 overflow-hidden bg-surface/40 py-14 noise-overlay md:scroll-mt-20 md:py-16 lg:py-16">
      <div className="motion-accent-line absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container-x">
        <div className="scroll-reveal mb-10 max-w-3xl">
          <p className="eyebrow">{tx("Ways to Participate")}</p>
          <h2 className="heading-section mt-5">
            <span className="text-gold">{tx("How")}</span> {tx("Customers/Partners Profit")}
          </h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            {tx("Choose the route that fits your goals. Customers can either subscribe to the AIXCO 6% bond, secured by underlying property, or purchase an apartment directly and benefit from rental income potential, capital appreciation, and Batumi’s favorable tax environment.")}
          </p>
        </div>

        <div className="grid gap-8" data-layout="alternating-participation-cards">
          {participationRoutes.map((route, index) => (
            <ParticipationRouteCard
              key={route.id}
              route={route}
              index={index}
              onRegister={openRegister}
              tx={tx}
            />
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
