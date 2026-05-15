"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from "react";
import type { AnimationItem } from "lottie-web";
import { useI18n } from "@/i18n/I18nProvider";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { useDelayedIdleReady } from "@/hooks/use-idle-ready";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { replaceLocationHash } from "@/lib/section-hash";
import { scrollToHash } from "@/lib/smooth-scroll";
import {
  getHeroVideoPanelLimit,
  getHeroVideoStartDelay,
  heroPanelVideos,
  heroVideoIdleTimeoutMs,
  shouldAttachHeroVideo,
  shouldShowHeroVideoPoster,
  shouldUseHeroVideoWall,
  type HeroVideoEnvironment,
} from "./hero-video-policy";

const heroEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
const heroIntroText =
  "Participate where growth, stability, and long term value creation meet. AIXCO gives private partners a simple and transparent way to join selected real estate projects.";
const heroPriceText = "Starting from \u20ac1,000";

type HeroVideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

export function getHeroLottieArrowPath(baseUrl: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}animations/arrow-down-gold.json`;
}

function getHeroVideoEnvironment(): HeroVideoEnvironment {
  const navigatorWithConnection = window.navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };

  return {
    viewportWidth: window.innerWidth,
    saveData: navigatorWithConnection.connection?.saveData,
    effectiveType: navigatorWithConnection.connection?.effectiveType,
    deviceMemory: navigatorWithConnection.deviceMemory,
  };
}

function useHeroVideoStartReady() {
  const [startupDelay, setStartupDelay] = useState(() => getHeroVideoStartDelay(0));

  useEffect(() => {
    if (typeof window === "undefined") return;
    setStartupDelay(getHeroVideoStartDelay(window.innerWidth));
  }, []);

  return useDelayedIdleReady(startupDelay, heroVideoIdleTimeoutMs);
}

const arrowLottiePath = getHeroLottieArrowPath(process.env.NEXT_PUBLIC_BASE_PATH ?? "/");

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

function HeroLottieArrow() {
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || process.env.NODE_ENV === "test" || process.env.VITEST === "true") return;

    let animation: AnimationItem | null = null;
    let cancelled = false;

    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (cancelled || !containerRef.current) return;

      animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: arrowLottiePath,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });

    });

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);

  return (
    <span
      ref={containerRef}
      aria-hidden="true"
      data-hero-lottie-arrow="true"
      className="block h-[5.5rem] w-[5.5rem] [&_svg]:!block [&_svg]:!h-full [&_svg]:!w-full"
    />
  );
}

export function Hero() {
  const shouldReduceMotion = useHydratedReducedMotion();
  const isHeroVideoIdleReady = useHeroVideoStartReady();
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroVideoWallRef = useRef<HTMLDivElement | null>(null);
  const [isHeroReady, setIsHeroReady] = useState(true);
  const [shouldUseVideoWall, setShouldUseVideoWall] = useState(false);
  const [isHeroInFocus, setIsHeroInFocus] = useState(false);
  const [heroVideoPanelLimit, setHeroVideoPanelLimit] = useState(0);
  const [readyHeroVideos, setReadyHeroVideos] = useState<Record<string, boolean>>({});
  const { tx } = useI18n();
  const hiddenTextState = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(10px)" };

  const markHeroVideoReady = useCallback((src: string, videoElement: HTMLVideoElement) => {
    const markReady = () => {
      setReadyHeroVideos((currentReadyVideos) => {
        if (currentReadyVideos[src]) return currentReadyVideos;
        return { ...currentReadyVideos, [src]: true };
      });
    };

    const videoWithFrameCallback = videoElement as HeroVideoWithFrameCallback;
    if (typeof videoWithFrameCallback.requestVideoFrameCallback === "function") {
      videoWithFrameCallback.requestVideoFrameCallback(markReady);
      return;
    }

    markReady();
  }, []);

  const handleHeroVideoReadyEvent = useCallback(
    (src: string, event: SyntheticEvent<HTMLVideoElement>) => {
      markHeroVideoReady(src, event.currentTarget);
    },
    [markHeroVideoReady],
  );

  useEffect(() => {
    if (typeof window === "undefined" || process.env.NODE_ENV === "test" || process.env.VITEST === "true") return;

    setShouldUseVideoWall(false);
    setIsHeroInFocus(false);
    setHeroVideoPanelLimit(0);

    if (!isHeroVideoIdleReady) return;

    const heroVideoEnvironment = getHeroVideoEnvironment();
    if (!shouldUseHeroVideoWall(heroVideoEnvironment)) return;

    setHeroVideoPanelLimit(getHeroVideoPanelLimit(heroVideoEnvironment));

    const node = heroSectionRef.current;
    if (!node || typeof window.IntersectionObserver !== "function") {
      setShouldUseVideoWall(true);
      setIsHeroInFocus(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIsInFocus = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        setIsHeroInFocus(nextIsInFocus);
        if (nextIsInFocus) {
          setShouldUseVideoWall(true);
        }
      },
      { threshold: [0, 0.35, 1] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isHeroVideoIdleReady]);

  useEffect(() => {
    if (!shouldUseVideoWall) return;

    const videos = heroVideoWallRef.current?.querySelectorAll("video") ?? [];
    videos.forEach((video) => {
      if (isHeroInFocus) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [isHeroInFocus, shouldUseVideoWall]);

  useEffect(() => {
    if (!shouldUseVideoWall) {
      setReadyHeroVideos({});
    }
  }, [shouldUseVideoWall]);

  const handleAboutClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    replaceLocationHash("#about");
    scrollToHash("#about");
  };

  const handleFaqClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    replaceLocationHash("#faqs");
    scrollToHash("#faqs");
  };

  const reducedLineVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={heroSectionRef}
      data-hero-shell="true"
      className="hero-reference-font relative isolate min-h-screen min-h-[100svh] overflow-hidden bg-background"
    >
      <motion.div
        ref={heroVideoWallRef}
        data-hero-video-wall="true"
        data-hero-video-mode={shouldUseVideoWall && isHeroVideoIdleReady && isHeroInFocus ? "video" : "poster"}
        className="hero-video-wall"
        aria-hidden="true"
        initial={shouldReduceMotion ? { scale: 1.006, opacity: 0.98 } : { scale: 1.055, opacity: 0.92 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.25 : 1.35, ease: heroEase }}
      >
        {heroPanelVideos.map((video, index) => {
          const shouldAttachVideo = shouldAttachHeroVideo({
            shouldUseVideoWall,
            isHeroVideoIdleReady,
            panelIndex: index,
            panelLimit: heroVideoPanelLimit,
          });
          const isVideoReady = readyHeroVideos[video.src] === true;
          const showPoster = shouldShowHeroVideoPoster({ shouldUseVideoWall: shouldAttachVideo, isHeroInFocus, isVideoReady });
          const heroVideoSrc = video.src;

          return (
            <div
              key={video.src}
              data-hero-video-panel="true"
              data-hero-video-ready={isVideoReady ? "true" : "false"}
              className="hero-video-panel"
            >
              <Image
                src={video.poster}
                alt=""
                aria-hidden="true"
                data-hero-video-poster="true"
                className={showPoster ? "opacity-100" : "opacity-0"}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              {shouldAttachVideo && (
                <video
                  poster={video.poster}
                  autoPlay={isHeroInFocus}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  tabIndex={-1}
                  onLoadedData={(event) => {
                    handleHeroVideoReadyEvent(video.src, event);
                    if (index === 0) setIsHeroReady(true);
                  }}
                  onCanPlay={(event) => {
                    handleHeroVideoReadyEvent(video.src, event);
                    if (index === 0) setIsHeroReady(true);
                    if (isHeroInFocus) {
                      void event.currentTarget.play().catch(() => undefined);
                    }
                  }}
                  onPlaying={(event) => handleHeroVideoReadyEvent(video.src, event)}
                  onError={index === 0 ? () => setIsHeroReady(true) : undefined}
                >
                  <source src={heroVideoSrc} type="video/mp4" />
                </video>
              )}
            </div>
          );
        })}
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
        className="relative z-10 flex min-h-screen min-h-[100svh] flex-col items-center justify-center px-6 py-[clamp(5.5rem,10svh,7rem)] text-center md:flex-col md:px-8 lg:px-24 xl:px-28"
      >
        <div
          data-hero-content-stack="true"
          className="mx-auto flex w-full min-w-0 max-w-[calc(100vw-3rem)] translate-y-[clamp(1rem,4svh,3.5rem)] flex-col items-center md:max-w-[44rem] md:flex-col lg:max-w-[72rem] lg:flex-col xl:max-w-[82rem]"
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
          <motion.img
            data-hero-brand-mark="standalone"
            src={aixcoLiveLogos.aixcoMark}
            alt=""
            aria-hidden="true"
            width={780}
            height={704}
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
            onClick={handleFaqClick}
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
          onClick={handleAboutClick}
          data-hero-scroll-cue="viewport"
          aria-label="Scroll to About section"
          className="absolute inset-x-0 bottom-[clamp(1rem,4svh,2.75rem)] z-20 mx-auto inline-flex h-24 w-24 items-center justify-center text-white/85 drop-shadow-[0_4px_14px_rgb(0_0_0/0.45)] transition-colors duration-200 hover:text-white sm:h-28 sm:w-28"
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
    </section>
  );
}
