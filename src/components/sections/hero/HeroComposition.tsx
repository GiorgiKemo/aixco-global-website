import { type MouseEvent } from "react";
import Image from "next/image";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { HeroLottieArrow } from "./HeroLottieArrow";
import { heroIntroText, heroOpportunityFootnote, heroOpportunityText } from "./hero-ui";

type HeroCompositionProps = {
  tx: (copy: string) => string;
  onAboutClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onBatumiClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  preloadBrandMark?: boolean;
};

export function HeroComposition({
  tx,
  onAboutClick,
  onBatumiClick,
  preloadBrandMark = true,
}: HeroCompositionProps) {
  return (
    <div
      data-hero-composition="reference-center"
      className="relative z-10 flex h-[var(--hero-viewport-height,100dvh)] min-h-[100svh] max-h-[var(--hero-viewport-height,100dvh)] flex-col items-center justify-center px-6 py-[clamp(5.5rem,10svh,7rem)] text-center md:flex-col md:px-8 lg:px-24 xl:px-28"
    >
      <div
        data-hero-content-stack="true"
        className="mx-auto flex w-full min-w-0 max-w-[calc(100vw-3rem)] translate-y-[clamp(1rem,4svh,3.5rem)] flex-col items-center md:max-w-[44rem] md:flex-col md:landscape:translate-y-0 lg:max-w-[72rem] lg:flex-col lg:landscape:-translate-y-[clamp(0.5rem,3svh,1.5rem)] xl:max-w-[82rem]"
      >
        <p
          data-hero-kicker="true"
          className="mb-2 min-w-0 max-w-full self-start break-words px-1 text-[clamp(0.68rem,2.6vw,1.125rem)] font-medium uppercase leading-snug tracking-normal text-white/90 [overflow-wrap:anywhere] [text-wrap:balance] drop-shadow-[0_4px_16px_rgb(0_0_0/0.55)] sm:ml-[clamp(0rem,20vw,18rem)] sm:px-0 sm:text-base md:ml-0 md:self-center md:text-base lg:ml-[clamp(0rem,20vw,18rem)] lg:self-start lg:text-lg"
        >
          {tx("Global Real Estate")}
        </p>
        <h1
          data-hero-title="true"
          aria-label="AIXCO.GLOBAL"
          className="hero-reference-font hero-title-shadow max-w-full min-w-0 break-words text-[clamp(1.85rem,8vw,7.45rem)] font-semibold leading-[0.82] tracking-normal text-white sm:max-w-full sm:text-[clamp(2.9rem,10.25vw,7.45rem)] md:text-[clamp(3.25rem,7.2vw,4.75rem)] lg:text-[clamp(5rem,8vw,7.45rem)]"
        >
          <span className="block pb-[0.08em]">
            <span className="inline-flex max-w-full min-w-0 items-center justify-center gap-[0.06em] align-middle sm:whitespace-nowrap">
              <Image
                data-hero-title-mark="true"
                src={aixcoLiveLogos.aixcoMark}
                alt=""
                aria-hidden="true"
                width={780}
                height={704}
                sizes="(min-width: 1024px) 9rem, (min-width: 768px) 6rem, 4.5rem"
                loading={preloadBrandMark ? "eager" : "lazy"}
                fetchPriority={preloadBrandMark ? "high" : "auto"}
                className="h-[0.9em] w-[0.9em] shrink-0 object-contain drop-shadow-[0_10px_22px_rgb(0_0_0/0.22)]"
                decoding="async"
              />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                IXCO<span data-hero-brand-dot="true" className="hero-title-dot text-primary-glow">.</span>GLOBAL
              </span>
            </span>
          </span>
        </h1>

        {heroIntroText ? (
          <p
            data-hero-intro-copy="true"
            className="hero-reference-font mt-6 w-full min-w-0 max-w-[min(100%,20rem)] break-words px-1 text-[clamp(0.98rem,2.4vw,1.46rem)] font-normal leading-[1.55] text-white/90 [hyphens:auto] [overflow-wrap:anywhere] [text-wrap:balance] drop-shadow-[0_3px_18px_rgb(0_0_0/0.46)] sm:max-w-[min(100%,28rem)] md:max-w-[42rem] md:text-[clamp(1rem,1.9vw,1.2rem)] lg:max-w-[50rem] lg:text-[clamp(1.14rem,1.7vw,1.46rem)]"
          >
            {tx(heroIntroText)}
          </p>
        ) : null}

        <a
          href="#batumi"
          onClick={onBatumiClick}
          data-hero-price-lockup="true"
          className="mt-8 flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-2 rounded-lg px-3 py-2 text-center text-white drop-shadow-[0_14px_34px_rgb(0_0_0/0.42)] transition-colors duration-200 hover:text-primary-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:mt-6 md:gap-2.5 md:px-0 lg:mt-8"
        >
          <span
            data-hero-price-text="true"
            className="hero-reference-font max-w-full text-[clamp(1.2rem,5vw,3.5rem)] font-light uppercase leading-none tracking-normal [overflow-wrap:anywhere] sm:text-[clamp(1.8rem,4vw,4rem)] md:text-[clamp(2rem,4vw,3rem)] lg:text-[clamp(2.8rem,3.8vw,4rem)]"
          >
            {tx(heroOpportunityText)}
          </span>
          {heroOpportunityFootnote ? (
            <span
              data-hero-price-footnote="true"
              className="min-w-0 max-w-[min(100%,18rem)] break-words px-0.5 text-sm font-normal normal-case leading-snug text-white/88 [overflow-wrap:anywhere] [text-wrap:balance] sm:max-w-lg sm:text-base sm:leading-relaxed md:max-w-xl md:text-lg md:leading-relaxed lg:max-w-2xl"
            >
              {tx(heroOpportunityFootnote)}
            </span>
          ) : null}
        </a>
      </div>

      <a
        href="#about"
        onClick={onAboutClick}
        data-hero-scroll-cue="viewport"
        aria-label="Scroll to About section"
        className="absolute inset-x-0 bottom-[clamp(1rem,4svh,2.75rem)] z-20 mx-auto inline-flex h-24 w-24 items-center justify-center text-white/85 drop-shadow-[0_4px_14px_rgb(0_0_0/0.45)] transition-colors duration-200 hover:text-white sm:h-28 sm:w-28 md:landscape:!h-14 md:landscape:!w-14"
      >
        <HeroLottieArrow />
      </a>
    </div>
  );
}
