"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type SyntheticEvent } from "react";
import { useDelayedIdleReady } from "@/hooks/use-idle-ready";
import { useI18n } from "@/i18n/I18nProvider";
import { replaceLocationHash } from "@/lib/section-hash";
import { scrollToHash } from "@/lib/smooth-scroll";
import {
  getHeroVideoPanelLimit,
  getHeroVideoStartDelay,
  heroVideoIdleTimeoutMs,
  shouldUseHeroVideoWall,
  type HeroVideoEnvironment,
} from "./hero-video-policy";
import { HeroComposition } from "./hero/HeroComposition";
import { getHeroLottieArrowPath } from "./hero/HeroLottieArrow";
import { HeroVideoWall } from "./hero/HeroVideoWall";

export { getHeroLottieArrowPath };

type HeroVideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

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

export function Hero() {
  const isHeroVideoIdleReady = useHeroVideoStartReady();
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

  useEffect(() => {
    const node = heroSectionRef.current;
    if (typeof window === "undefined" || !node) return;

    const updateHeroViewportHeight = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      node.style.setProperty("--hero-viewport-height", `${Math.round(viewportHeight)}px`);
    };

    updateHeroViewportHeight();
    window.addEventListener("resize", updateHeroViewportHeight);
    window.visualViewport?.addEventListener("resize", updateHeroViewportHeight);
    window.visualViewport?.addEventListener("scroll", updateHeroViewportHeight);

    return () => {
      window.removeEventListener("resize", updateHeroViewportHeight);
      window.visualViewport?.removeEventListener("resize", updateHeroViewportHeight);
      window.visualViewport?.removeEventListener("scroll", updateHeroViewportHeight);
    };
  }, []);

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
    <section
      ref={heroSectionRef}
      data-hero-shell="true"
      style={{ "--hero-viewport-height": "100dvh" } as CSSProperties}
      className="hero-reference-font relative isolate h-[var(--hero-viewport-height,100dvh)] min-h-[100svh] max-h-[var(--hero-viewport-height,100dvh)] overflow-hidden bg-[#061211]"
    >
      <HeroVideoWall
        ref={heroVideoWallRef}
        shouldUseVideoWall={shouldUseVideoWall}
        isHeroVideoIdleReady={isHeroVideoIdleReady}
        isHeroInFocus={isHeroInFocus}
        heroVideoPanelLimit={heroVideoPanelLimit}
        readyHeroVideos={readyHeroVideos}
        onHeroVideoReady={handleHeroVideoReadyEvent}
      />

      <div className="hero-video-scrim absolute inset-0" aria-hidden />
      <div className="hero-video-edge-vignette absolute inset-0" aria-hidden />

      <HeroComposition
        tx={tx}
        onAboutClick={handleAboutClick}
        onFaqClick={handleFaqClick}
      />
    </section>
  );
}
