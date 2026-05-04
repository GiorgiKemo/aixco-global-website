import { ArrowRight } from "lucide-react";
import { participationRoutes } from "@/data/site";
import { useUI } from "../ui-state";
import { motion } from "framer-motion";
import { Fragment, type MouseEvent } from "react";
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
      className="scroll-reveal group relative grid overflow-hidden border border-foreground/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10)] transition-[transform,box-shadow,border-color] duration-300 md:min-h-[max(24.5rem,calc(100svh-22rem))] md:grid-cols-12 md:items-stretch lg:min-h-[max(24.5rem,calc(100svh-22rem))] lg:grid-cols-12"
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
        className={`flex min-h-0 flex-col border-foreground/5 p-7 md:col-span-7 md:px-8 md:py-7 lg:col-span-7 lg:px-9 lg:py-7 ${copyOrderClass} ${
          imageFirst ? "md:border-l lg:border-l" : "md:border-r lg:border-r"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[clamp(3.75rem,4.7vw,4.7rem)] leading-none text-primary/30">0{index + 1}</span>
          </div>
          <div className="max-w-[34rem]">
            <h3 className="font-display text-[clamp(2.45rem,2.85vw,3rem)] leading-[1.03]">{tx(route.title)}</h3>
            <div className="mt-5 grid gap-3 text-[clamp(1.14rem,1.12vw,1.28rem)] leading-[1.62] text-foreground/85">
              {route.id === "bond" ? (
                <>
                  <p className="text-[clamp(1.17rem,1.12vw,1.3rem)] leading-[1.6]">
                    {tx("Customers sign up, complete onboarding, and invest in the AIXCO bond through a seamless digital process.")}
                  </p>
                  <p className="text-[clamp(1.17rem,1.12vw,1.3rem)] leading-[1.6]">
                    <strong>{tx("Purchase the AIXCO Bond with a guaranteed 30% return over 5 years")}</strong>{" "}
                    {tx("— combining structured security with strong, predictable growth. Backed by property as collateral, the bond provides investors with an added layer of asset-linked confidence.")}
                  </p>
                </>
              ) : (
                <p className="text-[clamp(1.17rem,1.12vw,1.3rem)] leading-[1.6]">{tx(route.body)}</p>
              )}
            </div>
          </div>
          <motion.button
            onClick={onRegister}
            className="btn-gold mt-auto w-auto self-start"
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
  const navigate = useNavigate();

  const handleHowClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate("/#how");
  };

  return (
    <section id="participate" className="relative scroll-mt-16 overflow-hidden bg-surface/40 py-12 noise-overlay md:scroll-mt-20 md:py-10 lg:py-0">
      <div className="motion-accent-line absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container-x">
        <div className="scroll-reveal mb-2 max-w-6xl">
          <p className="eyebrow">{tx("Ways to Participate")}</p>
          <h2 className="heading-section mt-4 max-w-full text-[clamp(2.25rem,10vw,3.5rem)] leading-[1.02] [overflow-wrap:anywhere] sm:text-[clamp(2.65rem,4.1vw,3.5rem)]">
            <span className="text-gold">{tx("How")}</span> <SlashBreakText text={tx("Customers/Partners Profit")} />
          </h2>
          <p className="mt-4 max-w-5xl text-[clamp(1.08rem,1.05vw,1.18rem)] leading-[1.56] text-foreground/80">
            {tx("Choose the route that fits your goals. Customers can either subscribe to the AIXCO 6% bond, secured by underlying property, or purchase an apartment directly and benefit from rental income potential, capital appreciation, and Batumi’s favorable tax environment.")}
          </p>
        </div>

        <div className="grid gap-16" data-layout="alternating-participation-cards">
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
