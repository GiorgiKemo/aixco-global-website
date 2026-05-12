"use client";

import Image from "next/image";
import { ChevronsDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoBatumiGalleryVideos, aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { replaceLocationHash } from "@/lib/section-hash";
import { scrollToHash } from "@/lib/smooth-scroll";

const heroIntroText =
  "Participate where growth, stability, and long term value creation meet. AIXCO gives private partners a simple and transparent way to join selected real estate projects.";
const heroPriceText = "Starting from \u20ac1,000";
const heroPanelVideos = aixcoBatumiGalleryVideos.slice(0, 4);
const mobileHeroVideoPanelLimit = 2;
const mobileHeroVideoBreakpoint = 768;
const enableHeroVideoWall = process.env.NEXT_PUBLIC_ENABLE_HERO_VIDEO_WALL === "true";

type HeroVideoEnvironment = {
  reduceMotion?: boolean | null;
  viewportWidth: number;
  saveData?: boolean;
  effectiveType?: string;
  deviceMemory?: number;
};

type HeroVideoPosterVisibility = {
  shouldUseVideoWall: boolean;
  isHeroInFocus: boolean;
  isVideoReady: boolean;
};

type HeroVideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

export function shouldShowHeroVideoPoster({
  shouldUseVideoWall,
  isHeroInFocus,
  isVideoReady,
}: HeroVideoPosterVisibility) {
  return !shouldUseVideoWall || !isHeroInFocus || !isVideoReady;
}

export function shouldUseHeroVideoWall(environment: HeroVideoEnvironment) {
  const { saveData = false, effectiveType, deviceMemory } = environment;

  if (!enableHeroVideoWall) return false;
  if (saveData) return false;
  if (effectiveType && ["slow-2g", "2g", "3g"].includes(effectiveType)) return false;
  if (typeof deviceMemory === "number" && deviceMemory <= 4) return false;
  return true;
}

export function getHeroVideoPanelLimit(environment: HeroVideoEnvironment) {
  return environment.viewportWidth < mobileHeroVideoBreakpoint ? mobileHeroVideoPanelLimit : heroPanelVideos.length;
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

function HeroScrollArrow() {
  return (
    <span
      aria-hidden="true"
      data-hero-scroll-arrow="true"
      className="inline-flex h-[5.5rem] w-[5.5rem] items-center justify-center text-primary-glow"
    >
      <ChevronsDown className="h-14 w-14" strokeWidth={2.25} />
    </span>
  );
}

export function Hero() {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroVideoWallRef = useRef<HTMLDivElement | null>(null);
  const [shouldUseVideoWall, setShouldUseVideoWall] = useState(false);
  const [isHeroInFocus, setIsHeroInFocus] = useState(false);
  const [heroVideoPanelLimit, setHeroVideoPanelLimit] = useState(0);
  const [readyHeroVideos, setReadyHeroVideos] = useState<Record<string, boolean>>({});
  const { tx } = useI18n();

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
  }, []);

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

  return (
    <section ref={heroSectionRef} className="hero-reference-font relative isolate min-h-screen overflow-hidden bg-background">
      <div
        ref={heroVideoWallRef}
        data-hero-video-wall="true"
        data-hero-video-mode={shouldUseVideoWall && isHeroInFocus ? "video" : "poster"}
        className="hero-video-wall"
        aria-hidden="true"
      >
        {heroPanelVideos.map((video, index) => {
          const shouldAttachVideo = shouldUseVideoWall && index < heroVideoPanelLimit;
          const isVideoReady = readyHeroVideos[video.src] === true;
          const showPoster = shouldShowHeroVideoPoster({ shouldUseVideoWall: shouldAttachVideo, isHeroInFocus, isVideoReady });
          const heroVideoSrc = video.previewSrc ?? video.src;

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
                  }}
                  onCanPlay={(event) => {
                    handleHeroVideoReadyEvent(video.src, event);
                    if (isHeroInFocus) {
                      void event.currentTarget.play().catch(() => undefined);
                    }
                  }}
                  onPlaying={(event) => handleHeroVideoReadyEvent(video.src, event)}
                >
                  <source src={heroVideoSrc} type="video/mp4" />
                </video>
              )}
            </div>
          );
        })}
      </div>

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
          <p
            className="mb-2 self-start text-sm font-medium uppercase tracking-normal text-white/90 drop-shadow-[0_4px_16px_rgb(0_0_0/0.55)] sm:ml-[clamp(0rem,20vw,18rem)] sm:text-base md:text-lg"
          >
            {tx("Quality Real Estate Participation")}
          </p>
          <Image
            data-hero-brand-mark="standalone"
            src={aixcoLiveLogos.aixcoMark}
            alt=""
            aria-hidden="true"
            width={780}
            height={704}
            className="mb-2 self-start object-contain drop-shadow-[0_16px_32px_rgb(0_0_0/0.28)] sm:ml-[clamp(0rem,20vw,18rem)]"
            decoding="async"
            style={{ width: "clamp(5rem, 14vw, 14.6rem)", height: "auto" }}
            unoptimized
          />
          <h1
            className="hero-reference-font max-w-[calc(100vw-3rem)] min-w-0 text-[clamp(1.85rem,8vw,7.45rem)] font-semibold leading-[0.82] tracking-normal text-white drop-shadow-[0_18px_42px_rgba(0,0,0,0.38)] [perspective:900px] sm:max-w-full sm:text-[clamp(2.9rem,10.25vw,7.45rem)]"
          >
            <span className="block pb-[0.08em]">
              <span className="block origin-bottom whitespace-nowrap">
                AIXCO<span data-hero-brand-dot="true" className="text-primary-glow drop-shadow-[0_0_22px_hsl(var(--primary-glow)/0.5)]">.</span>Global
              </span>
            </span>
          </h1>

          <p
            data-hero-intro-copy="true"
            className="hero-reference-font mt-6 w-[18rem] max-w-full px-1 text-[clamp(1.08rem,2.55vw,1.46rem)] font-normal leading-[1.55] text-white/90 drop-shadow-[0_3px_18px_rgb(0_0_0/0.46)] sm:w-full sm:max-w-[50rem]"
          >
            {tx(heroIntroText)}
          </p>

          <a
            href="#faqs"
            onClick={handleFaqClick}
            data-hero-price-lockup="true"
            className="mt-8 flex w-full items-center justify-center rounded-lg px-3 py-2 text-center text-white drop-shadow-[0_14px_34px_rgb(0_0_0/0.42)] transition-colors duration-200 hover:text-primary-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <span
              data-hero-price-text="true"
              className="hero-reference-font max-w-full whitespace-nowrap text-[clamp(1.2rem,5vw,3.5rem)] font-light uppercase leading-none tracking-normal sm:text-[clamp(1.8rem,4vw,4rem)]"
            >
              {tx(heroPriceText)}
            </span>
          </a>
        </div>

        <a
          href="#about"
          onClick={handleAboutClick}
          data-hero-scroll-cue="viewport"
          aria-label="Scroll to About section"
          className="absolute inset-x-0 bottom-[clamp(1rem,4svh,2.75rem)] z-20 mx-auto inline-flex h-24 w-24 items-center justify-center text-white/85 drop-shadow-[0_4px_14px_rgb(0_0_0/0.45)] transition-colors duration-200 hover:text-white sm:h-28 sm:w-28"
        >
          <HeroScrollArrow />
        </a>
      </div>
    </section>
  );
}
