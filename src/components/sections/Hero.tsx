import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoBatumiGalleryVideos, aixcoLiveLogos } from "@/lib/aixco-live-assets";

const heroEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
const heroIntroText =
  "Participate where growth, stability, and long term value creation meet. AIXCO gives private partners a simple and transparent way to join selected real estate projects.";
const heroPriceText = "Starting from \u20ac1,000";
const heroPanelVideos = aixcoBatumiGalleryVideos.slice(0, 4);

const headlineVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.22,
      staggerChildren: 0.24,
    },
  },
};

const headlineLineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.992,
    filter: "blur(16px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.18,
      ease: heroEase,
    },
  },
};

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [isHeroReady, setIsHeroReady] = useState(true);
  const { tx } = useI18n();
  const navigate = useNavigate();
  const hiddenTextState = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(10px)" };

  const handleAboutClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate("/#about");
  };

  const reducedLineVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="hero-reference-font relative isolate min-h-screen overflow-hidden bg-background">
      <motion.div
        data-hero-video-wall="true"
        className="hero-video-wall"
        aria-hidden="true"
        initial={shouldReduceMotion ? { scale: 1.006, opacity: 0.98 } : { scale: 1.055, opacity: 0.92 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.25 : 1.35, ease: heroEase }}
      >
        {heroPanelVideos.map((video, index) => (
          <div key={video.src} data-hero-video-panel="true" className="hero-video-panel">
            <video
              poster={video.poster}
              autoPlay
              muted
              loop
              playsInline
              preload={index === 0 ? "auto" : "metadata"}
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={index === 0 ? () => setIsHeroReady(true) : undefined}
              onCanPlay={index === 0 ? () => setIsHeroReady(true) : undefined}
              onError={index === 0 ? () => setIsHeroReady(true) : undefined}
            >
              <source src={video.src} type="video/mp4" />
            </video>
          </div>
        ))}
      </motion.div>

      <div
        className="hero-video-scrim absolute inset-0"
        aria-hidden
      />
      <div
        className="hero-video-edge-vignette absolute inset-0"
        aria-hidden
      />

      <div
        data-hero-composition="reference-center"
        className="relative z-10 flex min-h-screen items-center justify-center px-6 py-[clamp(5.5rem,10svh,7rem)] text-center sm:px-10 lg:px-24 xl:px-28"
      >
        <div
          data-hero-content-stack="true"
          className="flex w-full min-w-0 max-w-[calc(100vw-3rem)] translate-y-[clamp(1rem,4svh,3.5rem)] flex-col items-center sm:max-w-[82rem]"
        >
          <motion.p
            className="mb-2 self-start text-sm font-medium uppercase tracking-normal text-white/90 drop-shadow-[0_4px_16px_rgb(0_0_0/0.55)] sm:ml-[clamp(0rem,20vw,18rem)] sm:text-base md:text-lg"
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
            transition={{ duration: shouldReduceMotion ? 0.6 : 0.9, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: 0.12 }}
          >
            {tx("Quality Real Estate Participation")}
          </motion.p>
          <motion.img
            data-hero-brand-mark="standalone"
            src={aixcoLiveLogos.aixcoMark}
            alt=""
            aria-hidden="true"
            width={780}
            height={704}
            className="mb-2 h-auto w-[clamp(5rem,14vw,14.6rem)] self-start object-contain drop-shadow-[0_16px_32px_rgb(0_0_0/0.28)] sm:ml-[clamp(0rem,20vw,18rem)]"
            decoding="async"
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985, filter: "blur(14px)" }}
            transition={{ duration: shouldReduceMotion ? 0.7 : 1.08, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: 0.24 }}
          />
          <motion.h1
            className="hero-reference-font max-w-[calc(100vw-3rem)] min-w-0 text-[clamp(1.85rem,8vw,7.45rem)] font-semibold leading-[0.82] tracking-normal text-white drop-shadow-[0_18px_42px_rgba(0,0,0,0.38)] [perspective:900px] sm:max-w-full sm:text-[clamp(2.9rem,10.25vw,7.45rem)]"
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
            className="hero-reference-font mt-6 w-[18rem] max-w-full px-1 text-[clamp(1.08rem,2.55vw,1.46rem)] font-normal leading-[1.55] text-white/90 drop-shadow-[0_3px_18px_rgb(0_0_0/0.46)] sm:w-full sm:max-w-[50rem]"
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
            transition={{ duration: shouldReduceMotion ? 0.7 : 1.02, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: shouldReduceMotion ? 0.42 : 1.02 }}
          >
            {tx(heroIntroText)}
          </motion.p>

          <motion.div
            data-hero-price-lockup="true"
            className="mt-8 flex w-full items-center justify-center text-center text-white drop-shadow-[0_14px_34px_rgb(0_0_0/0.42)]"
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
            transition={{ duration: shouldReduceMotion ? 0.68 : 1, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: shouldReduceMotion ? 0.52 : 1.18 }}
          >
            <span
              data-hero-price-text="true"
              className="hero-reference-font max-w-full whitespace-nowrap text-[clamp(1.2rem,5vw,3.5rem)] font-light leading-none tracking-normal sm:text-[clamp(1.8rem,4vw,4rem)]"
            >
              {tx(heroPriceText)}
            </span>
          </motion.div>

          <motion.a
            href="#about"
            onClick={handleAboutClick}
            aria-label="Scroll to About section"
            className="relative mt-7 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/10 text-white/80 drop-shadow-[0_4px_14px_rgb(0_0_0/0.45)] backdrop-blur-sm transition-[background-color,border-color,color] duration-200 hover:bg-black/15 hover:text-white sm:mt-12"
            initial={false}
            animate={isHeroReady ? (shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, 10, 0] }) : { opacity: 0, y: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.5, ease: "easeOut", delay: 0.74 }
                : {
                    opacity: { duration: 0.7, delay: 1.36, ease: heroEase },
                    y: { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.52 },
                  }
            }
            whileHover={{ scale: 1.08, transition: { duration: 0.18, ease: heroEase } }}
            whileTap={{ scale: 0.96, transition: { duration: 0.08, ease: "easeOut" } }}
          >
            {!shouldReduceMotion && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-white/35"
                animate={{ opacity: [0.5, 0], scale: [1, 1.8] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut", delay: 1.64 }}
              />
            )}
            <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
