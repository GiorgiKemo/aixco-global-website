import { type MouseEvent } from "react";
import Image from "next/image";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { motion } from "@/lib/framer-motion";
import { HeroLottieArrow } from "./HeroLottieArrow";
import {
  headlineLineVariants,
  headlineVariants,
  heroEase,
  heroIntroText,
  heroPriceText,
  reducedLineVariants,
} from "./hero-ui";

type HeroAnimationState = {
  opacity: number;
  y?: number;
  filter?: string;
};

type HeroCompositionProps = {
  tx: (copy: string) => string;
  shouldReduceMotion: boolean | null;
  isHeroReady: boolean;
  hiddenTextState: HeroAnimationState;
  onAboutClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onFaqClick: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const MotionImage = motion.create(Image);

export function HeroComposition({
  tx,
  shouldReduceMotion,
  isHeroReady,
  hiddenTextState,
  onAboutClick,
  onFaqClick,
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
        <motion.p
          data-hero-kicker="true"
          className="mb-2 self-start text-sm font-medium uppercase tracking-normal text-white/90 drop-shadow-[0_4px_16px_rgb(0_0_0/0.55)] sm:ml-[clamp(0rem,20vw,18rem)] sm:text-base md:ml-0 md:self-center md:text-base lg:ml-[clamp(0rem,20vw,18rem)] lg:self-start lg:text-lg"
          initial={false}
          animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
          transition={{ duration: shouldReduceMotion ? 0.6 : 0.9, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: 0.12 }}
        >
          {tx("Quality Real Estate Participation")}
        </motion.p>
        <MotionImage
          data-hero-brand-mark="standalone"
          src={aixcoLiveLogos.aixcoMark}
          alt=""
          aria-hidden="true"
          width={780}
          height={704}
          sizes="(min-width: 1024px) 15vw, (min-width: 768px) 7rem, 6rem"
          loading="eager"
          fetchPriority="high"
          className="mb-2 h-auto w-[clamp(5rem,14vw,14.6rem)] self-start object-contain drop-shadow-[0_16px_32px_rgb(0_0_0/0.28)] sm:ml-[clamp(0rem,20vw,18rem)] md:ml-0 md:w-[clamp(5.5rem,10vw,7rem)] md:self-center lg:ml-[clamp(0rem,20vw,18rem)] lg:w-[clamp(5rem,14vw,14.6rem)] lg:self-start"
          decoding="async"
          initial={false}
          animate={isHeroReady ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985, filter: "blur(14px)" }}
          transition={{ duration: shouldReduceMotion ? 0.7 : 1.08, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: 0.24 }}
        />
        <motion.h1
          data-hero-title="true"
          className="hero-reference-font max-w-full min-w-0 break-words text-[clamp(1.85rem,8vw,7.45rem)] font-semibold leading-[0.82] tracking-normal text-white drop-shadow-[0_18px_42px_rgba(0,0,0,0.38)] [perspective:900px] sm:max-w-full sm:text-[clamp(2.9rem,10.25vw,7.45rem)] md:text-[clamp(3.25rem,7.2vw,4.75rem)] lg:text-[clamp(5rem,8vw,7.45rem)]"
          initial={false}
          animate={isHeroReady ? "visible" : "hidden"}
          variants={shouldReduceMotion ? { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } : headlineVariants}
        >
          <span className="block pb-[0.08em]">
            <motion.span
              className="block origin-bottom whitespace-nowrap will-change-[opacity,transform,filter]"
              variants={shouldReduceMotion ? reducedLineVariants : headlineLineVariants}
            >
              AIXCO<span data-hero-brand-dot="true" className="text-primary-glow drop-shadow-[0_0_22px_hsl(var(--primary-glow)/0.5)]">.</span>Global
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          data-hero-intro-copy="true"
          className="hero-reference-font mt-6 w-[18rem] max-w-full break-words px-1 text-[clamp(1.08rem,2.55vw,1.46rem)] font-normal leading-[1.55] text-white/90 drop-shadow-[0_3px_18px_rgb(0_0_0/0.46)] sm:w-full md:max-w-[42rem] md:text-[clamp(1rem,1.9vw,1.2rem)] lg:max-w-[50rem] lg:text-[clamp(1.14rem,1.7vw,1.46rem)]"
          initial={false}
          animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
          transition={{ duration: shouldReduceMotion ? 0.7 : 1.02, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: shouldReduceMotion ? 0.42 : 1.02 }}
        >
          {tx(heroIntroText)}
        </motion.p>

        <motion.a
          href="#faqs"
          onClick={onFaqClick}
          data-hero-price-lockup="true"
          className="mt-8 flex w-full max-w-full flex-row items-center justify-center rounded-lg px-3 py-2 text-center text-white drop-shadow-[0_14px_34px_rgb(0_0_0/0.42)] transition-colors duration-200 hover:text-primary-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:mt-6 md:flex-row md:px-0 lg:mt-8"
          initial={false}
          animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
          transition={{ duration: shouldReduceMotion ? 0.68 : 1, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: shouldReduceMotion ? 0.52 : 1.18 }}
        >
          <span
            data-hero-price-text="true"
            className="hero-reference-font max-w-full whitespace-nowrap text-[clamp(1.2rem,5vw,3.5rem)] font-light uppercase leading-none tracking-normal sm:text-[clamp(1.8rem,4vw,4rem)] md:text-[clamp(2rem,4vw,3rem)] lg:text-[clamp(2.8rem,3.8vw,4rem)]"
          >
            {tx(heroPriceText)}
          </span>
        </motion.a>
      </div>

      <motion.a
        href="#about"
        onClick={onAboutClick}
        data-hero-scroll-cue="viewport"
        aria-label="Scroll to About section"
        className="absolute inset-x-0 bottom-[clamp(1rem,4svh,2.75rem)] z-20 mx-auto inline-flex h-24 w-24 items-center justify-center text-white/85 drop-shadow-[0_4px_14px_rgb(0_0_0/0.45)] transition-colors duration-200 hover:text-white sm:h-28 sm:w-28 md:landscape:!h-14 md:landscape:!w-14"
        initial={false}
        animate={isHeroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.5, ease: "easeOut", delay: 0.74 }
            : { duration: 0.7, delay: 1.36, ease: heroEase }
        }
        whileHover={{ scale: 1.08, transition: { duration: 0.18, ease: heroEase } }}
        whileTap={{ scale: 0.96, transition: { duration: 0.08, ease: "easeOut" } }}
      >
        <HeroLottieArrow />
      </motion.a>
    </div>
  );
}
