"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { flushSync } from "react-dom";
import {
  ArrowRight,
  ChevronDown,
  Download,
  Euro,
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Menu,
  MapPin,
  Percent,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import { LiveVideo } from "@/components/LiveVideo";
import { ExpandableImage } from "@/components/ExpandableImage";
import { FooterLegalBar } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialLinks";
import { useUI } from "@/components/ui-state";
import { legacyTimelineChapters } from "@/data/legacy-timeline";
import {
  philosophyHero,
  philosophyPrinciples,
  philosophySections,
  philosophyStats,
} from "@/data/aixco-philosophy";
import { materialDownloads } from "@/data/materials";
import { useSiteContent } from "@/data/site-content-context";
import type { SiteContent } from "@/lib/backend/site-content";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import type { Lang } from "@/i18n/languages";
import {
  aixcoDubaiHeroVideo,
  aixcoHeroBackgroundVideo,
  aixcoLiveIcons,
  aixcoLiveImages,
  aixcoLiveLogos,
  aixcoLiveVideoPreviews,
  aixcoLiveVideos,
} from "@/lib/aixco-live-assets";
import { replaceLocationHash } from "@/lib/section-hash";
import { getSafePublicAssetHref } from "@/lib/security/urls";
import { scrollToHash, scrollToPageTop } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { StoryMediaReveal, StorySceneReveal } from "@/components/StoryReveal";
import { PartnerMarquee } from "@/components/partners/PartnerMarquee";
import { useTeamMemberRotation } from "@/hooks/use-team-member-rotation";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { AnimatePresence, motion } from "@/lib/framer-motion";
import { premiumEase, revealTransition } from "@/lib/motion";
import {
  formatMetricValue,
  isHeadlineMetric,
  parseFundDetail,
  type DubaiFund,
} from "./dubai/dubai-data";
import { heroIntroText, heroOpportunityFootnote, heroStoryStatementLines } from "./hero/hero-ui";

type StoryChapterKey =
  | "hero"
  | "about"
  | "philosophy"
  | "philosophyOrigins"
  | "philosophyPlatform"
  | "aboutObjectives"
  | "aboutAccess"
  | "legacy"
  | "dubai"
  | "batumi"
  | "materials"
  | "participate"
  | "how"
  | "team"
  | "partners"
  | "faqs"
  | "contact";

type StoryChapter = {
  key: StoryChapterKey;
  id?: string;
  label: string;
};

type DesktopStoryNavGroup = {
  key: string;
  label: string;
  chapters: StoryChapter[];
};

type StoryMedia =
  | {
      kind: "image";
      src: string | StaticImageData;
      alt: string;
      fit?: "cover" | "contain";
      position?: string;
      sizes?: string;
    }
  | {
      kind: "video";
      src: string;
      previewSrc?: string;
      poster: string;
      title: string;
      fit?: "cover" | "contain";
      position?: string;
  };

type StoryMediaOverlay = "light" | "dark" | "contact" | "none";

const heroMobileVideoQuery = "(max-width: 767px)";

function useHeroBackdropVideoSrc() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      setVideoSrc(aixcoHeroBackgroundVideo.src);
      return undefined;
    }

    const mediaQuery = window.matchMedia(heroMobileVideoQuery);
    const syncVideoSrc = () => {
      setVideoSrc(mediaQuery.matches ? aixcoHeroBackgroundVideo.mobileSrc : aixcoHeroBackgroundVideo.src);
    };

    syncVideoSrc();
    mediaQuery.addEventListener("change", syncVideoSrc);
    return () => mediaQuery.removeEventListener("change", syncVideoSrc);
  }, []);

  return videoSrc;
}

const storyChapters: StoryChapter[] = [
  { key: "hero", label: "AIXCO" },
  { key: "about", id: "about", label: "About" },
  { key: "philosophy", id: "philosophy", label: "Philosophy" },
  { key: "philosophyOrigins", id: "philosophy-origins", label: "Origins" },
  { key: "philosophyPlatform", id: "philosophy-platform", label: "Principles" },
  { key: "aboutObjectives", id: "about-objectives", label: "Objectives" },
  { key: "aboutAccess", id: "about-access", label: "Access" },
  { key: "legacy", id: "legacy", label: "Legacy" },
  { key: "dubai", id: "dubai", label: "Dubai" },
  { key: "batumi", id: "batumi", label: "Batumi" },
  { key: "materials", id: "materials", label: "Download Materials" },
  { key: "participate", id: "participate", label: "How to work" },
  { key: "how", id: "how", label: "Journeys" },
  { key: "team", id: "team", label: "Team" },
  { key: "partners", id: "partners", label: "Partners" },
  { key: "faqs", id: "faqs", label: "FAQs" },
  { key: "contact", id: "contact", label: "Contact" },
];

const currentProjectHref = "/aixco-global-op2/current-project";

function getStoryChapterByKey(key: StoryChapterKey) {
  const chapter = storyChapters.find((item) => item.key === key);

  if (!chapter) {
    throw new Error(`Missing story chapter: ${key}`);
  }

  return chapter;
}

const desktopStoryNavGroups: DesktopStoryNavGroup[] = [
  {
    key: "about-aixco",
    label: "About AIXCO",
    chapters: ([
      "about",
      "philosophy",
      "philosophyOrigins",
      "philosophyPlatform",
      "aboutObjectives",
      "aboutAccess",
    ] satisfies StoryChapterKey[]).map(getStoryChapterByKey),
  },
  {
    key: "legacy-markets",
    label: "Legacy",
    chapters: (["legacy"] satisfies StoryChapterKey[]).map(getStoryChapterByKey),
  },
  {
    key: "opportunities",
    label: "Opportunities",
    chapters: (["batumi", "dubai", "materials", "participate", "how"] satisfies StoryChapterKey[]).map(getStoryChapterByKey),
  },
  {
    key: "company",
    label: "Company",
    chapters: (["team", "partners", "faqs", "contact"] satisfies StoryChapterKey[]).map(getStoryChapterByKey),
  },
];

const storyMediaSwitchTransition = {
  duration: 1.35,
  ease: premiumEase,
};

const storyMediaSwitchReducedMotionTransition = {
  duration: 1.05,
  ease: premiumEase,
};

type StorySectionMetric = {
  height: number;
  top: number;
};

const storyTeamSwitchIntervalMs = 6800;
const storyTeamResumeDelayMs = 9000;
const storyTitleRevealDurationMs = 1700;
const storyTitleRevealFallbackBufferMs = 240;
const storyTitleScrollAnimationRange = "entry 0% cover 42%";
const philosophyOwnershipSections = philosophySections.slice(0, 2);
const philosophyPlatformSections = philosophySections.slice(2);
const philosophyPlatformStats = [
  { ...philosophyStats[0], shortLabel: "First acquisition" },
  { ...philosophyStats[1], shortLabel: "Current GDV" },
  { value: "90+", label: "Professional and highly skilled employees", shortLabel: "Skilled employees" },
  { ...philosophyStats[2], shortLabel: "Transactions" },
  { ...philosophyStats[3], shortLabel: "Value transacted" },
] as const;

const participationVideoMap = {
  batumiBuy: {
    src: aixcoLiveVideos.batumiBuy,
    previewSrc: aixcoLiveVideoPreviews.batumiBuy,
    poster: aixcoLiveImages.batumiBuyPoster,
  },
  batumiOverview: {
    src: aixcoLiveVideos.batumiOverview,
    previewSrc: aixcoLiveVideoPreviews.batumiOverview,
    poster: aixcoLiveImages.batumiOverviewPoster,
  },
  currentProject: {
    src: aixcoLiveVideos.currentProject,
    previewSrc: aixcoLiveVideoPreviews.currentProject,
    poster: aixcoLiveImages.batumiCurrentProject,
  },
} as const;

const teamImageMap = {
  "team-benjamin": aixcoLiveImages.teamBenjamin,
  "team-owais": aixcoLiveImages.teamOwais,
  "team-walter": aixcoLiveImages.teamWalter,
} as const;

const batumiVisualMosaicImages = [
  {
    key: "dusk-central",
    src: aixcoLiveImages.batumiMosaicDuskAerialCentral,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbDuskAerialCentral,
    alt: "Batumi dusk aerial skyline and waterfront",
    width: 3840,
    height: 2160,
    objectPosition: "50% 50%",
  },
  {
    key: "dusk-coastline",
    src: aixcoLiveImages.batumiMosaicDuskAerialCoastline,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbDuskAerialCoastline,
    alt: "Batumi illuminated coastline at dusk from above",
    width: 3840,
    height: 2160,
    objectPosition: "50% 50%",
  },
  {
    key: "sunset-panorama",
    src: aixcoLiveImages.batumiMosaicSunsetPanorama,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbSunsetPanorama,
    alt: "Batumi sunset panorama over the Black Sea",
    width: 3840,
    height: 2160,
    objectPosition: "50% 50%",
  },
  {
    key: "golden-hour",
    src: aixcoLiveImages.batumiMosaicGoldenHourCoastline,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbGoldenHourCoastline,
    alt: "Batumi golden hour coastline and city lights",
    width: 3840,
    height: 2160,
    objectPosition: "50% 50%",
  },
  {
    key: "evening-waterfront",
    src: aixcoLiveImages.batumiMosaicEveningWaterfront,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbEveningWaterfront,
    alt: "Batumi evening waterfront and mountain skyline",
    width: 3840,
    height: 1946,
    objectPosition: "50% 50%",
  },
  {
    key: "day",
    src: aixcoLiveImages.batumiMosaicDayAerial,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbDayAerial,
    alt: "Batumi daytime aerial skyline and Black Sea",
    width: 7360,
    height: 4912,
    objectPosition: "50% 48%",
  },
  {
    key: "sunset",
    src: aixcoLiveImages.batumiMosaicSunsetCoastline,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbSunsetCoastline,
    alt: "Batumi sunset city and coastline view",
    width: 6000,
    height: 4000,
    objectPosition: "50% 52%",
  },
  {
    key: "night",
    src: aixcoLiveImages.batumiMosaicNightSkyline,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbNightSkyline,
    alt: "Batumi night skyline from the Black Sea",
    width: 7360,
    height: 4912,
    objectPosition: "50% 50%",
  },
  {
    key: "nature",
    src: aixcoLiveImages.batumiMosaicNatureAerial,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbNatureAerial,
    alt: "Batumi coastal nature and Black Sea view",
    width: 3981,
    height: 5971,
    objectPosition: "50% 50%",
  },
  {
    key: "tower",
    src: aixcoLiveImages.batumiMosaicBlueTower,
    thumbnailSrc: aixcoLiveImages.batumiMosaicThumbBlueTower,
    alt: "Batumi tower and daytime city view",
    width: 3903,
    height: 5854,
    objectPosition: "58% 50%",
  },
] as const;

type BatumiVisualMosaicImageKey = (typeof batumiVisualMosaicImages)[number]["key"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatChapterNumber(index: number) {
  return String(index).padStart(2, "0");
}

type StoryTitleRevealListener = (isInRevealZone: boolean) => void;

const storyTitleRevealListeners = new Map<Element, StoryTitleRevealListener>();
let storyTitleRevealObserver: IntersectionObserver | null = null;

function stopObservingStoryTitle(element: Element) {
  storyTitleRevealObserver?.unobserve(element);
  storyTitleRevealListeners.delete(element);

  if (storyTitleRevealListeners.size === 0) {
    storyTitleRevealObserver?.disconnect();
    storyTitleRevealObserver = null;
  }
}

function observeStoryTitle(element: HTMLElement, listener: StoryTitleRevealListener) {
  if (typeof window === "undefined" || typeof window.IntersectionObserver !== "function") {
    return undefined;
  }

  storyTitleRevealListeners.set(element, listener);

  storyTitleRevealObserver ??= new window.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        storyTitleRevealListeners.get(entry.target)?.(
          entry.isIntersecting && entry.intersectionRatio >= 0.2,
        );
      }
    },
    {
      rootMargin: "0px 0px -20% 0px",
      threshold: [0, 0.2],
    },
  );

  storyTitleRevealObserver.observe(element);
  return () => stopObservingStoryTitle(element);
}

function supportsStoryTitleScrollTimeline() {
  if (typeof window === "undefined" || typeof window.CSS?.supports !== "function") {
    return false;
  }

  // Safari currently advertises view-timeline support but resolves the range
  // incorrectly for several of our nested scenes. Use the proven observer
  // fallback there; Chromium gets the native scroll-linked path.
  const isChromiumEngine = /(?:Chrome|Chromium|Edg|OPR)\//u.test(window.navigator.userAgent);

  return (
    isChromiumEngine &&
    window.CSS.supports("animation-timeline: view()") &&
    window.CSS.supports(`animation-range: ${storyTitleScrollAnimationRange}`)
  );
}

function StoryTextReveal({
  active,
  label,
  mobileLabel,
}: {
  active: boolean;
  label: string;
  mobileLabel?: string;
}) {
  const shouldReduceMotion = useHydratedReducedMotion();
  const visualLabel = mobileLabel ?? label;
  const revealRef = useRef<HTMLSpanElement | null>(null);
  const animatedTextRef = useRef<HTMLSpanElement | null>(null);
  const initializedRef = useRef(false);
  const isInRevealZoneRef = useRef(false);
  // Start visible so an interrupted hydration or unsupported browser can never
  // leave important copy hidden. The layout effect arms the scroll reveal
  // before paint after hydration.
  const [animationState, setAnimationState] = useState<
    "idle" | "animating" | "played" | "scroll-linked"
  >("played");

  const finishReveal = useCallback(() => {
    setAnimationState("played");
  }, []);

  useLayoutEffect(() => {
    if (shouldReduceMotion) {
      setAnimationState("played");
      isInRevealZoneRef.current = false;
      return;
    }

    if (supportsStoryTitleScrollTimeline()) {
      initializedRef.current = true;
      setAnimationState("scroll-linked");
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      setAnimationState("idle");
    }
  }, [shouldReduceMotion]);

  const handleRevealZoneChange = useCallback((isInRevealZone: boolean) => {
    if (isInRevealZone && !isInRevealZoneRef.current) {
      setAnimationState("animating");
    }

    isInRevealZoneRef.current = isInRevealZone;
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return undefined;

    // Chrome and other modern engines tie the reveal directly to scroll
    // progress in CSS. The observer below remains the reliable fallback for
    // engines without view timelines.
    if (supportsStoryTitleScrollTimeline()) return undefined;

    const element = revealRef.current;
    if (!element) return undefined;

    const cleanup = observeStoryTitle(element, handleRevealZoneChange);
    if (cleanup) return cleanup;

    // Progressive fallback for engines without IntersectionObserver.
    if (active) handleRevealZoneChange(true);
    return undefined;
  }, [active, handleRevealZoneChange, shouldReduceMotion]);

  // Hash navigation and some WebKit builds can delay the observer's first
  // delivery. Never leave an active, visible section title waiting on it.
  useEffect(() => {
    if (
      shouldReduceMotion ||
      supportsStoryTitleScrollTimeline() ||
      !active ||
      animationState !== "idle"
    ) return;

    const element = revealRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      handleRevealZoneChange(true);
    }
  }, [active, animationState, handleRevealZoneChange, shouldReduceMotion]);

  // animationcancel is not delivered in every interruption scenario (for
  // example, background tabs), so also settle visibly after one duration.
  useEffect(() => {
    if (animationState !== "animating") return undefined;

    const timeoutId = window.setTimeout(
      finishReveal,
      storyTitleRevealDurationMs + storyTitleRevealFallbackBufferMs,
    );
    return () => window.clearTimeout(timeoutId);
  }, [animationState, finishReveal]);

  useEffect(() => {
    const animatedText = animatedTextRef.current;
    if (!animatedText) return undefined;

    const handleAnimationCancel = (event: AnimationEvent) => {
      if (event.animationName === "story-title-reveal") finishReveal();
    };

    animatedText.addEventListener("animationcancel", handleAnimationCancel);
    return () => animatedText.removeEventListener("animationcancel", handleAnimationCancel);
  }, [finishReveal]);

  const isPending = animationState === "idle";
  const isAnimating = animationState === "animating";
  const hasPlayed = animationState === "played";

  return (
    <span
      ref={revealRef}
      className={cn(
        "story-text-reveal story-title-reveal",
        isPending && "story-title-reveal--pending",
        isAnimating && "story-title-reveal--active",
        hasPlayed && "story-title-reveal--played",
      )}
      data-text-reveal-active={isAnimating ? "true" : "false"}
      data-text-reveal-engine="scroll-linked-with-observer-fallback"
      data-text-reveal-label={label}
      data-text-reveal-state={animationState}
      style={{
        "--story-title-reveal-duration": `${storyTitleRevealDurationMs}ms`,
      } as CSSProperties}
    >
      <span className="sr-only">{label}</span>
      <span
        ref={animatedTextRef}
        className="story-title-reveal__text"
        aria-hidden="true"
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === "story-title-reveal") finishReveal();
        }}
      >
        {visualLabel}
      </span>
    </span>
  );
}

function getMaterialIcon(format: string) {
  return format === "PDF" ? FileText : ImageIcon;
}

function StoryCrossfadeMediaPanel({
  media,
  mediaKey,
  isActive,
  preloadMedia = false,
}: {
  media: StoryMedia;
  mediaKey: string;
  isActive: boolean;
  preloadMedia?: boolean;
}) {
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={mediaKey}
        className="absolute inset-0"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.012, filter: "blur(2px)" }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.998, filter: "blur(1.5px)" }}
        transition={shouldReduceMotion ? storyMediaSwitchReducedMotionTransition : storyMediaSwitchTransition}
        style={{ willChange: shouldReduceMotion ? "opacity" : "opacity, transform, filter" }}
      >
        <StoryMediaPanel media={media} isActive={isActive} preloadMedia={preloadMedia} />
      </motion.div>
    </AnimatePresence>
  );
}

function StoryMediaPanel({
  isActive,
  media,
  preloadMedia = false,
}: {
  isActive: boolean;
  media: StoryMedia;
  preloadMedia?: boolean;
}) {
  const objectPosition = media.position ?? "center";

  if (media.kind === "video") {
    return (
      <LiveVideo
        src={media.src}
        previewSrc={media.previewSrc}
        poster={media.poster}
        title={media.title}
        fit={media.fit ?? "cover"}
        eager={preloadMedia || isActive}
        autoplayPreview={isActive}
        smoothPreview={false}
        rootMargin="0px"
        className="story-media-panel__video !h-full !w-full !rounded-none !bg-foreground !shadow-none"
        videoClassName="h-full w-full"
        videoStyle={{ objectPosition }}
      />
    );
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      preload={preloadMedia}
      fetchPriority={preloadMedia ? "high" : "auto"}
      loading={preloadMedia ? "eager" : "lazy"}
      decoding="async"
      quality={75}
      sizes={media.sizes ?? "(min-width: 1280px) 56vw, 100vw"}
      className={cn(
        "story-media-panel__image h-full w-full",
        media.fit === "contain" ? "object-contain" : "object-cover",
      )}
      style={{ objectPosition }}
    />
  );
}

function StoryMediaGradient({
  overlay,
  reverse,
}: {
  overlay: StoryMediaOverlay;
  reverse: boolean;
}) {
  if (overlay === "none" || overlay === "light") {
    return null;
  }

  const direction = reverse ? "to left" : "to right";

  if (overlay === "contact") {
    return (
      <div
        aria-hidden
        className="story-media-panel__gradient pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(${direction}, rgba(17,16,14,0.72) 0%, rgba(17,16,14,0.18) 38%, rgba(17,16,14,0.42) 100%), linear-gradient(180deg, rgba(17,16,14,0.12), rgba(17,16,14,0.34))`,
        }}
      />
    );
  }

  if (overlay === "dark") {
    return (
      <div
        aria-hidden
        className="story-media-panel__gradient pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(${direction}, rgba(17,16,14,0.55) 0%, rgba(17,16,14,0.08) 42%, transparent 100%), linear-gradient(180deg, transparent, rgba(17,16,14,0.22))`,
        }}
      />
    );
  }

  return null;
}

function StoryChrome({
  activeIndex,
  lang,
  langOpen,
  onChapterClick,
  setLang,
  setLangOpen,
  tx,
}: {
  activeIndex: number;
  lang: Lang;
  langOpen: boolean;
  onChapterClick: (event: MouseEvent<HTMLAnchorElement>, chapter: StoryChapter) => void;
  setLang: (lang: Lang) => void;
  setLangOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  tx: (copy: string) => string;
}) {
  const currentLangName = LANGS.find((item) => item.code === lang)?.native ?? lang.toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopGroupOpen, setDesktopGroupOpen] = useState<string | null>(null);
  const [hasScrolledFromTop, setHasScrolledFromTop] = useState(false);
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const mobileMenuLayerRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const shouldRestoreMobileMenuFocusRef = useRef(true);
  const mobileLanguageButtonRef = useRef<HTMLButtonElement | null>(null);
  const desktopLanguageButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileLanguageMenuRef = useRef<HTMLUListElement | null>(null);
  const desktopLanguageMenuRef = useRef<HTMLUListElement | null>(null);
  const languageOpenerRef = useRef<HTMLButtonElement | null>(null);
  const activeChapterKey = storyChapters[activeIndex]?.key ?? "hero";
  const useLightMobileLogo = ["hero", "about", "aboutAccess"].includes(activeChapterKey);
  const isHeaderTransparent = activeChapterKey === "hero" && !hasScrolledFromTop;

  useEffect(() => {
    document.body.classList.toggle("story-mobile-menu-open", menuOpen);
    document.documentElement.classList.toggle("story-mobile-menu-open", menuOpen);

    return () => {
      document.body.classList.remove("story-mobile-menu-open");
      document.documentElement.classList.remove("story-mobile-menu-open");
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 1280px)");
    const closeMobileUiAtDesktopBreakpoint = () => {
      if (!desktopMedia.matches) return;
      shouldRestoreMobileMenuFocusRef.current = false;
      setMenuOpen(false);
      if (languageOpenerRef.current === mobileLanguageButtonRef.current) setLangOpen(false);
    };

    closeMobileUiAtDesktopBreakpoint();
    desktopMedia.addEventListener("change", closeMobileUiAtDesktopBreakpoint);
    return () => desktopMedia.removeEventListener("change", closeMobileUiAtDesktopBreakpoint);
  }, [setLangOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const menu = mobileMenuRef.current;
    const layer = mobileMenuLayerRef.current;
    const opener = mobileMenuButtonRef.current;
    if (!menu || !layer) return;

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const previousStates: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }> = [];
    let current: HTMLElement = layer;

    while (current.parentElement) {
      const parent = current.parentElement;
      Array.from(parent.children).forEach((sibling) => {
        if (sibling === current || !(sibling instanceof HTMLElement)) return;
        previousStates.push({ element: sibling, inert: sibling.inert, ariaHidden: sibling.getAttribute("aria-hidden") });
        sibling.inert = true;
        sibling.setAttribute("aria-hidden", "true");
      });
      if (parent === document.body) break;
      current = parent;
    }

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.tabIndex >= 0 && element.getAttribute("aria-hidden") !== "true" && !element.closest("[inert]"),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
        menu.focus({ preventScroll: true });
      } else if (event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", handleMenuKeyDown);
    (mobileMenuCloseButtonRef.current ?? menu).focus({ preventScroll: true });

    return () => {
      window.removeEventListener("keydown", handleMenuKeyDown);
      previousStates.reverse().forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      if (shouldRestoreMobileMenuFocusRef.current && opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  useEffect(() => {
    let wasScrolledFromTop = window.scrollY > 10;

    const syncScrolledState = () => {
      const nextScrolledFromTop = window.scrollY > 10;
      if (nextScrolledFromTop === wasScrolledFromTop) return;

      wasScrolledFromTop = nextScrolledFromTop;
      setHasScrolledFromTop(nextScrolledFromTop);
    };

    setHasScrolledFromTop(wasScrolledFromTop);
    window.addEventListener("scroll", syncScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrolledState);
  }, []);

  useEffect(() => {
    const restoreLanguageFocus = () => {
      const opener = languageOpenerRef.current;
      window.requestAnimationFrame(() => {
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      });
    };
    const closeDesktopMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopGroupOpen(null);
        if (langOpen) {
          setLangOpen(false);
          restoreLanguageFocus();
        }
      }
    };

    const closeDesktopMenuFromOutside = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!desktopNavRef.current?.contains(target)) setDesktopGroupOpen(null);

      const clickedLanguageUi = mobileLanguageButtonRef.current?.contains(target)
        || desktopLanguageButtonRef.current?.contains(target)
        || mobileLanguageMenuRef.current?.contains(target)
        || desktopLanguageMenuRef.current?.contains(target);
      if (langOpen && !clickedLanguageUi) {
        setLangOpen(false);
        restoreLanguageFocus();
      }
    };

    window.addEventListener("keydown", closeDesktopMenu);
    window.addEventListener("pointerdown", closeDesktopMenuFromOutside);
    return () => {
      window.removeEventListener("keydown", closeDesktopMenu);
      window.removeEventListener("pointerdown", closeDesktopMenuFromOutside);
    };
  }, [langOpen, setLangOpen]);

  const handleChapterLink = (event: MouseEvent<HTMLAnchorElement>, chapter: StoryChapter) => {
    setLangOpen(false);
    setMenuOpen(false);
    setDesktopGroupOpen(null);
    onChapterClick(event, chapter);
  };

  return (
    <>
      <div
        className={cn(
          "story-mobile-header fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-2 border-b border-transparent bg-transparent px-3 py-3 sm:px-4 xl:hidden",
          useLightMobileLogo ? "story-mobile-header--dark text-white" : "story-mobile-header--light text-foreground",
          isHeaderTransparent && "story-mobile-header--transparent",
        )}
      >
        <Link
          href="/"
          aria-label={tx("AIXCO.GLOBAL home")}
          onClick={(event) => handleChapterLink(event, storyChapters[0])}
          className={cn(
            "inline-flex min-h-11 min-w-0 items-center gap-1.5 drop-shadow-[0_3px_14px_rgb(0_0_0/0.34)] sm:gap-2",
            useLightMobileLogo ? "text-white" : "text-foreground",
          )}
        >
          <Image
            src={useLightMobileLogo ? aixcoLiveLogos.aixcoHorizontalLight : aixcoLiveLogos.aixcoHorizontalDark}
            alt=""
            aria-hidden="true"
            width={1600}
            height={333}
            unoptimized
            loading="eager"
            sizes="(max-width: 767px) 9rem, 10rem"
            className="h-auto w-[9rem] shrink-0 object-contain sm:w-[10rem]"
          />
          <span className="sr-only">AIXCO.GLOBAL</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            ref={mobileLanguageButtonRef}
            data-language-trigger="true"
            type="button"
            onClick={(event) => {
              languageOpenerRef.current = event.currentTarget;
              setMenuOpen(false);
              setLangOpen((value) => !value);
            }}
            aria-expanded={langOpen}
            aria-label={`${currentLangName} ${tx("Change language")}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-foreground/10 bg-white px-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            <Globe className="h-3 w-3" aria-hidden />
            {currentLangName}
            <ChevronDown className="h-2.5 w-2.5 opacity-70" aria-hidden />
          </button>
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => {
              setLangOpen(false);
              setMenuOpen((value) => {
                if (!value) shouldRestoreMobileMenuFocusRef.current = true;
                return !value;
              });
            }}
            aria-expanded={menuOpen}
            aria-controls="story-mobile-menu"
            aria-label={menuOpen ? tx("Close menu") : tx("Open menu")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-foreground/10 bg-white text-foreground"
          >
            {menuOpen ? <X className="h-[1.125rem] w-[1.125rem]" aria-hidden /> : <Menu className="h-[1.125rem] w-[1.125rem]" aria-hidden />}
          </button>
        </div>
        {langOpen && (
          <ul
            ref={mobileLanguageMenuRef}
            aria-label={tx("Change language")}
            className="story-mobile-language-list absolute end-16 top-[calc(100%+0.5rem)] z-[70] max-h-[calc(100dvh-5.5rem)] w-64 overflow-y-auto overscroll-contain rounded-lg border border-foreground/10 bg-white p-1 text-foreground shadow-elegant"
          >
            {LANGS.map((option) => (
              <li key={option.code}>
                <button
                  data-lang={option.code}
                  aria-current={option.code === lang ? "true" : undefined}
                  onClick={() => {
                    setLang(option.code);
                    setLangOpen(false);
                    window.requestAnimationFrame(() => languageOpenerRef.current?.focus({ preventScroll: true }));
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-start text-sm transition-colors",
                    option.code === lang ? "bg-primary/10 text-primary" : "hover:bg-muted/70",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="text-[12px] uppercase tracking-widest opacity-70">{option.native}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {menuOpen && (
        <div
          ref={(node) => {
            mobileMenuLayerRef.current = node;
            mobileMenuRef.current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-label={tx("Story navigation")}
          tabIndex={-1}
          className="fixed inset-0 w-screen z-[70] xl:hidden"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 top-[var(--story-mobile-header-height)] bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <button
            ref={mobileMenuCloseButtonRef}
            type="button"
            aria-label={tx("Close menu")}
            onClick={() => setMenuOpen(false)}
            className="absolute end-[max(0.85rem,env(safe-area-inset-right,0px))] top-[max(0.8rem,env(safe-area-inset-top,0px))] z-20 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-foreground/10 bg-white text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="h-[1.125rem] w-[1.125rem]" aria-hidden />
          </button>
          <aside
            id="story-mobile-menu"
            aria-label={tx("Story navigation")}
            className="absolute bottom-0 end-0 top-0 z-10 max-h-[100dvh] w-[min(21rem,88vw)] overflow-y-auto overscroll-contain border-s border-foreground/10 bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-24 text-foreground shadow-[18px_0_60px_-30px_rgba(0,0,0,0.38)] [scrollbar-gutter:stable]"
          >
            <nav aria-label={tx("Story navigation")} className="grid gap-1">
              {storyChapters.map((chapter, index) => {
                const isActive = activeIndex === index;
                const href = chapter.id ? `#${chapter.id}` : "/";

                return (
                  <Link
                    key={chapter.key}
                    href={href}
                    aria-current={isActive ? "true" : undefined}
                    data-active={isActive ? "true" : "false"}
                    onClick={(event) => handleChapterLink(event, chapter)}
                    className={cn(
                      "group/story-chapter story-chapter-link text-foreground/78 hover:text-primary focus-visible:text-primary",
                      isActive && "story-chapter-link--active text-primary font-semibold",
                    )}
                  >
                    <span
                      className={cn(
                        "story-chapter-link__line w-[0.65rem] bg-foreground/20 transition-[width,background-color] duration-300 [transition-timing-function:var(--ease-apple)]",
                        isActive && "story-chapter-link__line--active w-full bg-primary",
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 [overflow-wrap:anywhere]">{tx(chapter.label)}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <header
        className={cn(
          "story-desktop-header fixed inset-x-0 top-0 z-[60] hidden items-center gap-4 border-b px-6 py-3 xl:flex 2xl:px-8",
          useLightMobileLogo ? "story-desktop-header--dark text-white" : "story-desktop-header--light text-foreground",
          isHeaderTransparent && "story-desktop-header--transparent",
        )}
      >
        <Link
          href="/"
          aria-label={tx("AIXCO.GLOBAL home")}
          onClick={(event) => handleChapterLink(event, storyChapters[0])}
          className={cn(
            "story-desktop-header__brand inline-flex min-w-max items-center gap-2 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            useLightMobileLogo ? "text-white" : "text-foreground",
          )}
        >
          <Image
            src={useLightMobileLogo ? aixcoLiveLogos.aixcoHorizontalLight : aixcoLiveLogos.aixcoHorizontalDark}
            alt=""
            aria-hidden="true"
            width={1600}
            height={333}
            unoptimized
            loading="eager"
            sizes="12rem"
            className="h-auto w-[10.75rem] shrink-0 object-contain 2xl:w-[11.5rem]"
          />
          <span className="sr-only">AIXCO.GLOBAL</span>
        </Link>

        <nav ref={desktopNavRef} aria-label={tx("Story navigation")} className="story-desktop-nav min-w-0 flex-1">
          <div className="story-desktop-nav__scroller">
            {(() => {
              const chapter = storyChapters[0];
              const isActive = activeChapterKey === chapter.key;

              return (
                <Link
                  key={chapter.key}
                  href="/"
                  aria-current={isActive ? "true" : undefined}
                  data-active={isActive ? "true" : "false"}
                  onClick={(event) => handleChapterLink(event, chapter)}
                  className="story-desktop-nav-link"
                >
                  <span>{tx(chapter.label)}</span>
                </Link>
              );
            })()}
            {desktopStoryNavGroups.map((group) => {
              const isOpen = desktopGroupOpen === group.key;
              const isActive = group.chapters.some((chapter) => chapter.key === activeChapterKey);
              const menuId = `story-desktop-nav-${group.key}`;

              return (
                <div key={group.key} className="story-desktop-nav-group">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={menuId}
                    data-active={isActive ? "true" : "false"}
                    className="story-desktop-nav-trigger"
                    onClick={() => {
                      setLangOpen(false);
                      setDesktopGroupOpen((value) => value === group.key ? null : group.key);
                    }}
                  >
                    <span>{tx(group.label)}</span>
                    <ChevronDown className="story-desktop-nav-trigger__icon" aria-hidden />
                  </button>
                  {isOpen && (
                    <div id={menuId} className="story-desktop-nav-menu">
                      {group.chapters.map((chapter) => {
                        const isChapterActive = activeChapterKey === chapter.key;
                        const href = chapter.id ? `#${chapter.id}` : "/";

                        return (
                          <Link
                            key={chapter.key}
                            href={href}
                            aria-current={isChapterActive ? "true" : undefined}
                            data-active={isChapterActive ? "true" : "false"}
                            onClick={(event) => handleChapterLink(event, chapter)}
                            className="story-desktop-nav-menu-link"
                          >
                            {tx(chapter.label)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="story-desktop-header__tools relative flex min-w-max items-center gap-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] opacity-70">
            {formatChapterNumber(activeIndex + 1)} / {formatChapterNumber(storyChapters.length)}
          </p>
          <button
            ref={desktopLanguageButtonRef}
            data-language-trigger="true"
            type="button"
            onClick={(event) => {
              languageOpenerRef.current = event.currentTarget;
              setDesktopGroupOpen(null);
              setLangOpen((value) => !value);
            }}
            aria-expanded={langOpen}
            aria-label={`${currentLangName} ${tx("Change language")}`}
            className="story-desktop-lang-button"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden />
            {currentLangName}
            <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
          </button>
          {langOpen && (
            <ul
              ref={desktopLanguageMenuRef}
              aria-label={tx("Change language")}
              className="absolute end-0 top-[calc(100%+0.65rem)] z-[70] w-72 rounded-lg border border-foreground/10 bg-white p-1 text-foreground shadow-elegant"
            >
              {LANGS.map((option) => (
                <li key={option.code}>
                  <button
                    data-lang={option.code}
                    aria-current={option.code === lang ? "true" : undefined}
                    onClick={() => {
                      setLang(option.code);
                      setLangOpen(false);
                      window.requestAnimationFrame(() => languageOpenerRef.current?.focus({ preventScroll: true }));
                    }}
                    className={cn(
                      "flex min-h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                      option.code === lang ? "bg-primary/10 text-primary" : "hover:bg-muted/70",
                    )}
                  >
                    <span>{option.label}</span>
                    <span className="text-[12px] uppercase tracking-widest opacity-70">{option.native}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

    </>
  );
}

function FixedHeroBackdrop({ visible }: { visible: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoSrc = useHeroBackdropVideoSrc();
  const shouldReduceMotion = useHydratedReducedMotion();
  const canAnimate = shouldReduceMotion !== true;
  // Fail closed until the hydrated motion preference has been evaluated. This
  // prevents an autoplay frame for visitors who request reduced motion.
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const [shouldExposeBackdrop, setShouldExposeBackdrop] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!canAnimate) {
      video?.pause();
      setShouldRenderVideo(false);
      setShouldExposeBackdrop(false);
      return undefined;
    }

    if (visible) {
      setShouldRenderVideo(true);
      setShouldExposeBackdrop(true);
      void video?.play().catch(() => undefined);

      return undefined;
    }

    // Keep the full-quality backdrop playing after its first activation. Once
    // the opacity transition completes, visibility removes only the inactive
    // compositor layer; decoding/playback continues without a pause.
    const visibilityTimer = window.setTimeout(() => {
      setShouldExposeBackdrop(false);
    }, 760);

    return () => window.clearTimeout(visibilityTimer);
  }, [canAnimate, videoSrc, visible]);

  return (
    <div
        aria-hidden="true"
        className={`pointer-events-none fixed bottom-0 end-0 top-0 z-0 overflow-hidden bg-[#11100e] transition-opacity duration-700 [transition-timing-function:var(--ease-apple)] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          insetInlineStart: "var(--story-fixed-backdrop-left, 0px)",
          visibility: visible || shouldExposeBackdrop ? "visible" : "hidden",
        }}
      >
        <Image
          src={aixcoHeroBackgroundVideo.poster}
          alt=""
          fill
          fetchPriority="high"
          loading="eager"
          quality={78}
          sizes="100vw"
          className="object-cover brightness-[1.08] saturate-[1.08]"
        />
        {shouldRenderVideo && canAnimate && videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover brightness-[1.08] saturate-[1.08]"
            style={{ visibility: visible ? "visible" : "hidden" }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,14,0.64),rgba(17,16,14,0.20)_44%,rgba(17,16,14,0.54)),linear-gradient(180deg,rgba(17,16,14,0.16),rgba(17,16,14,0.58))]" />
      </div>
  );
}

function StorySceneBody({
  children,
  density = "default",
  isActive,
  fitContent = true,
}: {
  children: React.ReactNode;
  density?: "default" | "compact" | "dense";
  isActive: boolean;
  fitContent?: boolean;
}) {
  const densityClass =
    density === "dense"
      ? "gap-[clamp(0.85rem,1.45svh,1.15rem)]"
      : density === "compact"
        ? "gap-[clamp(0.95rem,1.65svh,1.3rem)]"
        : "gap-[clamp(1rem,2svh,1.55rem)]";

  return (
    <div
      data-story-scene-copy
      data-story-fit-content={fitContent ? "true" : "false"}
      className="flex min-h-0 w-full min-w-0 max-w-none flex-1 flex-col items-stretch self-stretch justify-center overflow-visible"
    >
      <StorySceneReveal
        isActive={isActive}
        className={`flex min-h-0 w-full min-w-0 max-w-none flex-1 flex-col items-stretch self-stretch justify-center ${densityClass}`}
      >
        {children}
      </StorySceneReveal>
    </div>
  );
}

function SceneShell({
  children,
  media,
  mediaContent,
  mediaCrossfadeKey,
  mediaOverlay = "light",
  preloadMedia,
  reverse = false,
  tone = "light",
  density = "default",
  mediaWeight = "default",
  fullWidth = false,
  isActive,
  isRevealed = isActive,
  fitContent = true,
}: {
  children: React.ReactNode;
  media?: StoryMedia;
  mediaContent?: React.ReactNode;
  mediaCrossfadeKey?: string;
  mediaOverlay?: StoryMediaOverlay;
  preloadMedia?: boolean;
  reverse?: boolean;
  tone?: "light" | "dark" | "surface";
  density?: "default" | "compact" | "dense";
  mediaWeight?: "default" | "wide" | "gallery";
  fullWidth?: boolean;
  isActive: boolean;
  isRevealed?: boolean;
  fitContent?: boolean;
}) {
  const toneClass =
    tone === "dark"
      ? "bg-[#11100e] text-white"
      : tone === "surface"
        ? "bg-surface text-foreground"
        : "bg-background text-foreground";

  const resolvedOverlay: StoryMediaOverlay =
    mediaOverlay === "light" && tone === "dark" ? "contact" : mediaOverlay;
  const copyColumnSpan = fullWidth ? "md:col-span-2 xl:col-span-12" : mediaWeight === "gallery" ? "xl:col-span-5" : mediaWeight === "wide" ? "xl:col-span-6" : "xl:col-span-7";
  const mediaColumnSpan = mediaWeight === "gallery" ? "xl:col-span-7" : mediaWeight === "wide" ? "xl:col-span-6" : "xl:col-span-5";
  const shouldRenderMedia = Boolean(isRevealed || isActive || preloadMedia);

  return (
    <div className={`relative min-h-[100svh] ${toneClass}`}>
      <div
        className="grid min-h-[100svh]"
        style={{ gridTemplateColumns: "var(--story-shell-columns, minmax(0, 1fr))" }}
      >
        <div aria-hidden className="hidden" />
        <div data-story-scene-grid className="grid min-h-[100svh] grid-cols-1 xl:grid-cols-12">
          <div
            data-story-scene-column
            className={`relative z-10 flex min-h-[100svh] w-full min-w-0 flex-1 flex-col items-stretch justify-center overflow-visible ${
              reverse ? `xl:order-2 ${copyColumnSpan}` : `xl:order-1 ${copyColumnSpan}`
            }`}
          >
            <StorySceneBody density={density} fitContent={fitContent} isActive={isActive}>
              {children}
            </StorySceneBody>
          </div>

          {fullWidth ? null : (
            <div
              data-story-scene-media
              data-story-media-active={isActive ? "true" : "false"}
              className={`story-media-panel relative min-h-[28rem] overflow-hidden bg-foreground/5 xl:min-h-[100svh] ${
                reverse ? `xl:order-1 ${mediaColumnSpan}` : `xl:order-2 ${mediaColumnSpan}`
              }`}
            >
              {shouldRenderMedia && mediaContent ? (
                <StoryMediaReveal isActive={isRevealed} reverse={reverse} className="absolute inset-0">
                  <div className="story-media-panel__stage story-media-panel__stage--custom relative h-full w-full overflow-hidden">
                    {mediaContent}
                  </div>
                </StoryMediaReveal>
              ) : shouldRenderMedia && media ? (
                <StoryMediaReveal isActive={isRevealed} reverse={reverse} className="absolute inset-0">
                  <div className="story-media-panel__stage relative h-full w-full overflow-hidden">
                    {mediaCrossfadeKey ? (
                      <StoryCrossfadeMediaPanel
                        media={media}
                        mediaKey={mediaCrossfadeKey}
                        isActive={isActive}
                        preloadMedia={preloadMedia}
                      />
                    ) : (
                      <StoryMediaPanel media={media} isActive={isActive} preloadMedia={preloadMedia} />
                    )}
                    <StoryMediaGradient overlay={resolvedOverlay} reverse={reverse} />
                  </div>
                </StoryMediaReveal>
              ) : (
                <div className="h-full bg-gradient-to-br from-primary/12 via-background to-secondary/12" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroScene({
  isActive,
  onContact,
  onRegister,
  tx,
}: {
  isActive: boolean;
  onContact: () => void;
  onRegister: () => void;
  tx: (copy: string) => string;
}) {
  const statementLabel = heroStoryStatementLines.map((line) => tx(line)).join(" ");

  return (
    <div className="relative h-full min-h-0 overflow-hidden text-white">
      <div className="relative z-10 grid h-full min-h-0" style={{ gridTemplateColumns: "var(--story-shell-columns, minmax(0, 1fr))" }}>
        <div aria-hidden className="hidden" />
        <div className="story-hero-copy">
          <motion.div
            className="story-hero-lockup hero-reference-font"
            initial={{ opacity: 0, y: 28 }}
            animate={
              isActive
                ? { opacity: 1, y: 0 }
                : { opacity: 0.94, y: 6 }
            }
            transition={revealTransition}
          >
            <header className="story-hero-brand">
              <p className="story-hero-kicker">{tx("Global Real Estate")}</p>
              <h1 data-brand-lockup="story-hero" className="story-hero-wordmark hero-title-shadow">
                <Image
                  src={aixcoLiveLogos.aixcoHorizontalLight}
                  alt=""
                  aria-hidden="true"
                  width={1600}
                  height={333}
                  preload
                  sizes="(min-width: 1280px) 52vw, 88vw"
                  className="story-hero-official-logo h-auto w-full max-w-[44rem] object-contain object-left"
                />
                <span className="sr-only">AIXCO.GLOBAL - {tx("Emerging Market Opportunities")}</span>
              </h1>
            </header>

            <div className="story-hero-rule" aria-hidden="true" />

            {heroIntroText ? (
              <p className="story-hero-intro">{tx(heroIntroText)}</p>
            ) : null}

            <div
              className="story-hero-statement"
              aria-label={statementLabel}
              role="group"
            >
              {heroStoryStatementLines.map((line) => (
                <span key={line} className="story-hero-statement__line">
                  {tx(line)}
                </span>
              ))}
              {heroOpportunityFootnote ? (
                <p className="story-hero-statement__note">{tx(heroOpportunityFootnote)}</p>
              ) : null}
            </div>

            <div className="story-hero-actions">
              <Link
                href={currentProjectHref}
                prefetch={false}
                className="btn-gold"
              >
                {tx("Current project")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
              <button type="button" onClick={onRegister} className="btn-ghost-gold story-hero-actions__ghost">
                {tx("REGISTER")}
              </button>
              <button type="button" onClick={onContact} className="btn-ghost-gold story-hero-actions__ghost">
                {tx("CONTACT ME")}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const DUBAI_METRIC_NUMBER_PATTERN = /(~?\d[\d,.]*(?:\s*%|\+|[mMbBkK])?)/gu;

function StoryDubaiMetricNumbers({ value }: { value: string }) {
  return value.split(DUBAI_METRIC_NUMBER_PATTERN).map((part, partIndex) =>
    /\d/u.test(part) ? (
      <span
        key={`${part}:${partIndex}`}
        className="story-standard-number story-dubai-metric-number"
      >
        {part}
      </span>
    ) : (
      part ? (
        <span key={`${part}:${partIndex}`} className="story-dubai-metric-copy">
          {part}
        </span>
      ) : null
    ),
  );
}

function StoryDubaiStatus({ value }: { value: string }) {
  const [portfolio, ...statusParts] = value.split(/\s+[—–-]\s+/u);
  const status = statusParts.join(" — ");

  return (
    <>
      <span className="story-dubai-status__portfolio">{portfolio}</span>
      {status ? <span className="story-dubai-status__state">{status}</span> : null}
    </>
  );
}

function StoryDubaiFundRow({
  fund,
  index,
  tx,
}: {
  fund: DubaiFund;
  index: number;
  tx: (copy: string) => string;
}) {
  const details = fund.details.map(parseFundDetail);
  const headlineMetrics = details.filter((detail) => isHeadlineMetric(detail.label)).slice(0, 3);

  return (
    <article className="story-fund-row story-dubai-portfolio-card">
      <header className="story-dubai-portfolio-card__header">
        <span className="story-dubai-portfolio-card__index" aria-hidden="true">
          {formatChapterNumber(index + 1)}
        </span>
        <h3 className="story-card-title">{tx(fund.name)}</h3>
      </header>
      <div className="story-dubai-portfolio-card__metrics">
        {headlineMetrics.map((detail, metricIndex) => {
          const metric = formatMetricValue(detail.value);
          const translatedFullValue = tx(detail.value);
          const useTranslatedFullValue =
            translatedFullValue !== detail.value && (Boolean(metric.prefix) || Boolean(metric.subtext));
          const metricLayout =
            detail.label === "Status"
              ? "status"
              : detail.label === "Development scope"
                ? "scope"
                : detail.label === "Site progress"
                  ? "progress"
                  : "number";
          return (
            <div
              key={`${detail.label}:${detail.value}`}
              className="story-dubai-portfolio-card__metric"
              data-metric-layout={metricLayout}
              data-metric-tone={(metricIndex % 3) + 1}
            >
              <p className="story-metric-label">{tx(detail.label)}</p>
              <p className="story-metric-value">
                {metricLayout === "status" ? (
                  <StoryDubaiStatus value={translatedFullValue} />
                ) : useTranslatedFullValue ? (
                  <StoryDubaiMetricNumbers value={translatedFullValue} />
                ) : (
                  <>
                    {metric.prefix ? (
                      <span className="story-dubai-metric-prefix">{tx(metric.prefix)}</span>
                    ) : null}
                    <StoryDubaiMetricNumbers value={tx(metric.value)} />
                    {metric.subtext ? (
                      <span className="story-standard-number story-dubai-metric-number story-dubai-metric-affix">
                        {tx(metric.subtext)}
                      </span>
                    ) : null}
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
function BatumiVisualMosaic({ tx }: { tx: (copy: string) => string }) {
  const galleryImages = useMemo(
    () => batumiVisualMosaicImages.map((image) => ({ ...image, alt: tx(image.alt) })),
    [tx],
  );
  const [selectedImageKey, setSelectedImageKey] = useState<BatumiVisualMosaicImageKey>(batumiVisualMosaicImages[0].key);
  const selectedImage = galleryImages.find((image) => image.key === selectedImageKey) ?? galleryImages[0];
  const carouselImages = [...galleryImages, ...galleryImages];
  const selectImage = useCallback((imageKey: BatumiVisualMosaicImageKey) => {
    if (imageKey === selectedImageKey) return;

    flushSync(() => {
      setSelectedImageKey(imageKey);
    });
  }, [selectedImageKey]);
  const handleThumbnailPointerDown = useCallback((event: PointerEvent<HTMLButtonElement>, imageKey: BatumiVisualMosaicImageKey) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    selectImage(imageKey);
  }, [selectImage]);

  return (
    <div className="story-batumi-gallery" aria-label={tx("Batumi project image gallery")}>
      <div className="story-batumi-gallery__wash" aria-hidden />
      <ExpandableImage
        src={selectedImage.src}
        title={selectedImage.alt}
        className="story-batumi-gallery__hero"
      >
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          sizes="(min-width: 1280px) 100vw, 100vw"
          quality={75}
          loading="lazy"
          data-batumi-hero-image={selectedImage.key}
          className="story-batumi-gallery__hero-image"
          style={{ objectPosition: selectedImage.objectPosition }}
        />
      </ExpandableImage>

      <div className="story-batumi-gallery__carousel" aria-label={tx("Select Batumi gallery image")}>
        <div className="story-batumi-gallery__track">
        {carouselImages.map((image, index) => (
          <button
            key={`${image.key}-${index}`}
            type="button"
            aria-label={`${tx("Show image")}: ${image.alt}`}
            aria-pressed={image.key === selectedImage.key}
            className={cn(
              "story-batumi-gallery__thumb",
              image.key === selectedImage.key && "story-batumi-gallery__thumb--active",
            )}
            onPointerDown={(event) => handleThumbnailPointerDown(event, image.key)}
            onClick={() => selectImage(image.key)}
          >
            <Image
              src={image.thumbnailSrc}
              alt=""
              width={192}
              height={128}
              sizes="(min-width: 1280px) 144px, 34vw"
              quality={75}
              loading="eager"
              decoding="async"
              className="story-batumi-gallery__thumb-image"
              style={{ objectPosition: image.objectPosition }}
            />
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}

function StoryMetricText({ value }: { value: string }) {
  const currencyMetric = value.match(/^([$€])(.*)$/u);

  if (!currencyMetric) return <>{value}</>;

  return (
    <>
      <span className={`story-currency-symbol ${currencyMetric[1] === "€" ? "story-currency-symbol--euro" : "story-currency-symbol--dollar"}`} aria-hidden="true">
        {currencyMetric[1]}
      </span>
      <span className="story-currency-value" aria-hidden="true">
        {currencyMetric[2]}
      </span>
    </>
  );
}

function BatumiBenefitIconGrid({
  benefits,
  tx,
}: {
  benefits: readonly string[];
  tx: (copy: string) => string;
}) {
  const items = [
    { icon: Euro, metric: "€5k", label: "Secure your position from €5,000" },
    { icon: KeyRound, metric: "€45k", label: "Entry from €45,000" },
    { icon: TrendingUp, metric: "60%+", label: benefits[4] ?? "Bank financing minimum 60%" },
    { icon: Percent, metric: "12%", label: "Approx. 12% net rental yields" },
  ];

  return (
    <div data-layout="story-batumi-benefits" className="story-batumi-benefit-grid">
      {items.map(({ icon: Icon, label, metric }) => (
        <div key={label} className="story-batumi-benefit">
          <span className="story-batumi-benefit__icon-tile" aria-hidden="true">
            <Icon className="story-batumi-benefit__icon" />
          </span>
          <div className="min-w-0">
            <span className="story-batumi-benefit__metric story-standard-number" aria-label={metric}>
              <StoryMetricText value={metric} />
            </span>
            <span className="story-batumi-benefit__label">{tx(label)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}


function AboutScene({
  isActive,
  isRevealed,
  shouldExposeVideo,
  shouldStartVideo,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  shouldExposeVideo: boolean;
  shouldStartVideo: boolean;
  tx: (copy: string) => string;
}) {
  const dubaiVideoRef = useRef<HTMLVideoElement | null>(null);
  const shouldReduceMotion = useHydratedReducedMotion();
  const [motionPreferenceResolved, setMotionPreferenceResolved] = useState(false);
  const [videoRequested, setVideoRequested] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const shouldLoadVideo = motionPreferenceResolved && shouldReduceMotion !== true;
  const shouldAttachVideo = shouldLoadVideo && videoRequested;
  const metrics = [
    { value: "5,000+", label: "Trusted clients" },
    { value: "$400M", label: "Gross Development Value (GDV)" },
    { value: "2000+", label: "Total transactions" },
    { value: "2009", label: "In business since" },
  ];

  useEffect(() => {
    setMotionPreferenceResolved(true);
  }, []);

  useEffect(() => {
    if (shouldLoadVideo && shouldStartVideo) {
      setVideoRequested(true);
    }
  }, [shouldLoadVideo, shouldStartVideo]);

  useEffect(() => {
    const video = dubaiVideoRef.current;
    if (!video) return undefined;

    video.playbackRate = 0.82;

    if (shouldReduceMotion === true) {
      setVideoStarted(false);
      video.pause();
      video.removeAttribute("src");
      video.load();
      return undefined;
    }

    if (!shouldAttachVideo) {
      return undefined;
    }

    let cancelled = false;
    const playVideo = () => {
      if (cancelled) return;
      video.playbackRate = 0.82;
      void video.play().catch(() => undefined);
    };

    if (video.readyState >= 2) {
      playVideo();
      return () => {
        cancelled = true;
      };
    }

    video.addEventListener("loadeddata", playVideo);
    video.addEventListener("canplay", playVideo);
    video.load();

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", playVideo);
      video.removeEventListener("canplay", playVideo);
    };
  }, [shouldAttachVideo, shouldReduceMotion]);

  const markVideoStarted = () => {
    setVideoStarted(true);
  };

  return (
    <div className="story-about-cinematic-stage relative h-full min-h-0 bg-[#11100e] text-white">
      <div
        className="grid h-full min-h-0 grid-cols-1"
      >
        <div aria-hidden className="hidden" />
        <div className="relative h-full min-h-0 overflow-hidden">
          <StoryMediaReveal isActive={isRevealed} className="story-about-cinematic-media absolute inset-0">
            <div className="story-about-cinematic-image relative h-full w-full">
              <video
                ref={dubaiVideoRef}
                src={shouldAttachVideo ? aixcoDubaiHeroVideo.src : undefined}
                className="h-full w-full object-cover"
                style={{ visibility: shouldExposeVideo ? "visible" : "hidden" }}
                autoPlay={shouldAttachVideo}
                muted
                playsInline
                loop
                preload={shouldAttachVideo ? "auto" : "none"}
                aria-label={tx(aixcoDubaiHeroVideo.title)}
                onLoadedData={(event) => {
                  event.currentTarget.playbackRate = 0.82;
                }}
                onCanPlay={(event) => {
                  event.currentTarget.playbackRate = 0.82;
                  if (shouldAttachVideo) {
                    void event.currentTarget.play().catch(() => undefined);
                  }
                }}
                onPlaying={markVideoStarted}
                onTimeUpdate={(event) => {
                  if (event.currentTarget.currentTime > 0.04) {
                    markVideoStarted();
                  }
                }}
              />
              <Image
                src={aixcoDubaiHeroVideo.poster}
                alt=""
                aria-hidden="true"
                fill
                data-about-video-poster=""
                data-video-started={videoStarted && shouldExposeVideo ? "true" : "false"}
                className="story-about-cinematic-poster object-cover"
                loading="eager"
                fetchPriority="high"
                sizes="100vw"
                decoding="async"
              />
            </div>
          </StoryMediaReveal>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_34%),linear-gradient(90deg,rgba(17,16,14,0.62),rgba(17,16,14,0.26)_46%,rgba(17,16,14,0.70)),linear-gradient(180deg,rgba(17,16,14,0.14),rgba(17,16,14,0.62))]"
          />
          <StorySceneReveal
            isActive={isActive}
            className="story-about-cinematic-copy relative z-10 flex h-full min-h-0 flex-col justify-end px-[clamp(2rem,5vw,5.5rem)] pb-[clamp(2.8rem,7svh,5.6rem)] pt-[clamp(4rem,8svh,6rem)]"
          >
            <div data-layout="story-about-cinematic" className="max-w-[52rem]">
              <p className="mb-5 text-[clamp(0.84rem,0.86vw,0.96rem)] font-semibold uppercase tracking-[0.16em] text-white/82">
                {tx("About AIXCO")}
              </p>
              <h2
                aria-label="AIXCO.GLOBAL"
                data-brand-lockup="story-about"
                className="max-w-none font-semibold leading-[1.04] tracking-normal text-white drop-shadow-[0_18px_48px_rgba(0,0,0,0.36)]"
              >
                <Image
                  src={aixcoLiveLogos.aixcoHorizontalLight}
                  alt=""
                  aria-hidden="true"
                  width={1600}
                  height={333}
                  sizes="(min-width: 1280px) 48vw, 84vw"
                  className="story-about-official-logo h-auto w-full max-w-[42rem] object-contain object-left"
                />
                <span className="sr-only">AIXCO.GLOBAL</span>
              </h2>
              <p className="mt-[clamp(1.2rem,2.4svh,2rem)] max-w-[46rem] text-[clamp(1.05rem,1.28vw,1.34rem)] leading-[1.62] text-white/88">
                {tx("Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on selected emerging-market opportunities, with a legacy track record in Switzerland and Dubai.")}
              </p>
            </div>
            <dl className="mt-[clamp(1.7rem,3.4svh,2.6rem)] grid max-w-[48rem] grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {metrics.slice(0, 4).map((metric) => (
                <div key={metric.label} className="border-s border-white/28 ps-4">
                  <dt className="story-glyph-safe story-standard-number tabular-nums" aria-label={metric.value}>
                    <StoryMetricText value={metric.value} />
                  </dt>
                  <dd className="mt-2 text-[clamp(0.7rem,2.45vw,0.82rem)] font-semibold uppercase leading-relaxed tracking-[0.04em] text-white/70 [overflow-wrap:anywhere]">
                    {tx(metric.label)}
                  </dd>
                </div>
              ))}
            </dl>
          </StorySceneReveal>
        </div>
      </div>
    </div>
  );
}

function PhilosophyScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="surface"
      density="dense"
      mediaWeight="wide"
      fitContent={false}
      reverse
      media={{
        kind: "image",
        src: aixcoLiveImages.aboutArchitecture,
        alt: tx("AIXCO real estate architecture"),
        position: "center 56%",
        sizes: "(min-width: 1280px) 52vw, 100vw",
      }}
      mediaOverlay="none"
    >
      <p className="eyebrow story-eyebrow">{tx(philosophyHero.eyebrow)}</p>
      <h2 className="story-h2 story-philosophy-title">
        <StoryTextReveal active={isActive} label={tx(philosophyHero.title)} />
      </h2>
      <p className="story-body text-foreground/76">{tx(philosophyHero.summary)}</p>

      <dl data-layout="story-philosophy-stats" className="grid w-full grid-cols-2 gap-2">
        {philosophyStats.map((stat) => {
          const mobileLabel =
            stat.label === "Current gross development value"
              ? "Current GDV"
              : stat.label === "Real estate transacted across markets"
                ? "Value transacted"
                : stat.label;

          return (
            <div key={stat.label} className="story-philosophy-card bg-white px-4 py-4">
              <dt className="story-metric-label text-foreground/58">
                <span className="hidden sm:inline">{tx(stat.label)}</span>
                <span className="sm:hidden">{tx(mobileLabel)}</span>
              </dt>
              <dd className="story-glyph-safe story-standard-number tabular-nums" aria-label={stat.value}>
                <StoryMetricText value={stat.value} />
              </dd>
            </div>
          );
        })}
      </dl>

      <div data-layout="story-philosophy-principles" className="grid w-full gap-2 sm:grid-cols-2">
        {philosophyPrinciples.map((principle) => (
          <div key={principle} className="story-philosophy-card flex min-h-12 items-center gap-3 border border-foreground/10 bg-white px-4 py-3 text-sm font-semibold text-foreground/84">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 break-words">{tx(principle)}</span>
          </div>
        ))}
      </div>

    </SceneShell>
  );
}

function PhilosophyPlatformScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="light"
      density="dense"
      fitContent={false}
      media={{
        kind: "image",
        src: aixcoLiveImages.batumiMosaicEveningWaterfront,
        alt: tx("Batumi evening waterfront and mountain skyline"),
        position: "56% 50%",
        sizes: "(min-width: 1280px) 140vw, 100vw",
      }}
      mediaOverlay="none"
    >
      <p className="eyebrow story-eyebrow">{tx("Global opportunities")}</p>
      <h2 className="story-h2 story-philosophy-platform-title">
        <StoryTextReveal active={isActive} label={tx("Expanding through carefully selected opportunities")} />
      </h2>
      <p className="story-body text-foreground/76">
        {tx("AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.")}
      </p>

      <dl data-layout="story-philosophy-platform-stats" className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {philosophyPlatformStats.map((stat) => {
          const prefix = stat.value.startsWith("$") ? "$" : "";
          const suffix = stat.value.endsWith("+") ? "+" : "";
          const numericValue = stat.value.slice(prefix.length, suffix ? -1 : undefined);
          const numericSegments = numericValue.split(/([.,])/u).filter(Boolean);

          return (
            <div key={stat.label} className="story-philosophy-stat">
              <dt className="story-metric-label text-foreground/52" title={tx(stat.label)}>{tx(stat.shortLabel)}</dt>
              <dd className="story-metric-value story-philosophy-stat__value story-standard-number" aria-label={stat.value}>
                {prefix ? <span className="story-philosophy-stat__affix story-philosophy-stat__affix--prefix story-currency-symbol story-currency-symbol--dollar" aria-hidden="true">{prefix}</span> : null}
                <span className="story-philosophy-stat__number">
                  {numericSegments.map((segment, segmentIndex) => (
                    <span
                      key={`${segment}:${segmentIndex}`}
                      className={cn(
                        "story-philosophy-stat__number-part",
                        /^[.,]$/u.test(segment) && "story-philosophy-stat__punctuation",
                      )}
                    >
                      {segment}
                    </span>
                  ))}
                </span>
                {suffix ? <span className="story-philosophy-stat__affix story-philosophy-stat__affix--suffix">{suffix}</span> : null}
              </dd>
            </div>
          );
        })}
      </dl>

      <div data-layout="story-philosophy-platform-panels" className="grid w-full gap-3 lg:grid-cols-2">
        {philosophyPlatformSections.map((section) => (
          <article key={section.title} className="story-philosophy-panel min-w-0">
            <p className="story-metric-label text-primary/75">{tx(section.eyebrow)}</p>
            <h3 className="story-card-title mt-1.5">{tx(section.title)}</h3>
            <div className="mt-2 grid gap-2">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="story-body text-foreground/68">
                  {tx(paragraph)}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SceneShell>
  );
}

function PhilosophyDetailScene({
  isActive,
  isRevealed,
  tx,
  eyebrow,
  title,
  summary,
  sections,
  media,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
  eyebrow: string;
  title: string;
  summary: string;
  sections: Array<(typeof philosophySections)[number]>;
  media?: StoryMedia;
}) {
  return (
    <div className="relative min-h-[100svh] overflow-visible bg-surface text-foreground">
      {media && isRevealed ? (
        <div aria-hidden className="story-philosophy-detail-media absolute inset-0">
          <StoryMediaPanel media={media} isActive={isActive} />
          <div className="story-philosophy-detail-media__wash absolute inset-0" />
        </div>
      ) : null}
      <div
        className="relative z-10 grid min-h-[100svh]"
        style={{ gridTemplateColumns: "var(--story-shell-columns, minmax(0, 1fr))" }}
      >
        <div aria-hidden className="hidden" />
        <div
          data-story-scene-column
          data-story-media-active={isActive ? "true" : "false"}
          className="story-philosophy-detail-stage relative z-10 flex min-h-[100svh] flex-col"
        >
          <StorySceneReveal isActive={isActive} className="story-philosophy-detail-copy relative z-10 w-full">
            <div className="story-philosophy-detail-intro">
              <p className="eyebrow story-eyebrow">{tx(eyebrow)}</p>
              <h2 className="story-philosophy-detail-title">
                <StoryTextReveal active={isActive} label={tx(title)} />
              </h2>
              <p className="story-philosophy-detail-summary">{tx(summary)}</p>
            </div>

            <div data-layout="story-philosophy-detail" className="story-philosophy-detail-grid">
              {sections.map((section) => (
                <article key={section.title} className="story-philosophy-detail-column min-w-0">
                  <p className="story-metric-label text-primary/78">{tx(section.eyebrow)}</p>
                  <h3 className="story-card-title mt-2">{tx(section.title)}</h3>
                  <div className="mt-3 grid gap-3">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="story-body text-foreground/72">
                        {tx(paragraph)}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </StorySceneReveal>
        </div>
      </div>
    </div>
  );
}

function AboutObjectivesScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  return (
    <div className="relative min-h-[100svh] bg-surface text-foreground">
      <div
        className="grid min-h-[100svh] grid-cols-1"
      >
        <div aria-hidden className="hidden" />
        <div className="story-objectives-stage relative flex min-h-[100svh] items-center overflow-clip px-[clamp(1.5rem,5vw,6rem)] py-[clamp(3rem,8svh,6rem)]">
          <div aria-hidden className="story-objectives-media absolute inset-0 overflow-hidden">
            <Image
              src={aixcoLiveImages.aboutArchitecture}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              quality={75}
              sizes="(min-width: 1280px) calc(100vw - 14rem), 100vw"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 64%" }}
            />
            <div className="story-objectives-media__wash absolute inset-0" />
          </div>
          <div aria-hidden className="story-objectives-access-preview absolute inset-x-0 bottom-0 overflow-hidden">
            <Image
              src={aixcoLiveImages.batumiSeafrontPoster}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              quality={75}
              sizes="(max-width: 1279px) 140vw, 1px"
              className="h-full w-full object-cover xl:hidden"
              style={{ objectPosition: "center 56%" }}
            />
            <Image
              src={aixcoLiveImages.batumiMosaicSunsetPanorama}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              quality={75}
              sizes="(min-width: 1280px) 120vw, 1px"
              className="hidden h-full w-full object-cover xl:block"
              style={{ objectPosition: "center 58%" }}
            />
          </div>
          <StorySceneReveal isActive={isActive} className="story-objectives-copy relative z-10 w-full">
            <p className="eyebrow story-eyebrow text-primary/80">{tx("Client objectives")}</p>
            <div data-layout="story-about-objectives" className="story-objectives-grid mt-[clamp(1.4rem,3svh,2.4rem)] grid w-full gap-[clamp(1.4rem,4vw,4.5rem)]">
              <h2 className="story-objectives-title font-light tracking-normal text-foreground">
                <StoryTextReveal active={isActive} label={tx("Every client starts with a different objective")} />
              </h2>
              <div className="story-objectives-text grid gap-4">
                <p className="story-objectives-lead text-foreground/90">
                  {tx("Some are looking to build long-term wealth through real estate ownership. Others want recurring income, international diversification, or simply a way to participate in a market they believe has strong future potential.")}
                </p>
                <p className="story-objectives-support text-foreground/82">
                  {tx("Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.")}
                </p>
              </div>
            </div>
          </StorySceneReveal>
        </div>
      </div>
    </div>
  );
}

function AboutAccessScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  return (
    <div className="relative min-h-[100svh] bg-[#11100e] text-white">
      <div
        className="grid min-h-[100svh] grid-cols-1"
      >
        <div aria-hidden className="hidden" />
        <div className="story-about-access-stage relative min-h-[100svh] overflow-clip">
          <StoryMediaReveal isActive className="story-about-access-media absolute inset-0">
            <div className="story-about-access-image relative h-full w-full">
              <Image
                src={aixcoLiveImages.batumiSeafrontPoster}
                alt={tx("Selected emerging market property opportunity")}
                fill
                loading="lazy"
                decoding="async"
                quality={75}
                sizes="(max-width: 1279px) 140vw, 1px"
                className="h-full w-full object-cover xl:hidden"
                style={{ objectPosition: "center 56%" }}
              />
              <Image
                src={aixcoLiveImages.batumiMosaicSunsetPanorama}
                alt={tx("Selected emerging market property opportunity")}
                fill
                loading="lazy"
                decoding="async"
                quality={75}
                sizes="(min-width: 1280px) 120vw, 1px"
                className="hidden h-full w-full object-cover xl:block"
                style={{ objectPosition: "center 58%" }}
              />
            </div>
          </StoryMediaReveal>
          <div
            aria-hidden
            className="story-about-access-atmosphere absolute inset-0 bg-[radial-gradient(circle_at_68%_36%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(90deg,rgba(17,16,14,0.64),rgba(17,16,14,0.16)_48%,rgba(17,16,14,0.26)),linear-gradient(180deg,rgba(17,16,14,0.06),rgba(17,16,14,0.56))]"
          />
          <div aria-hidden className="story-about-access-legacy-preview absolute inset-x-0 bottom-0 overflow-hidden">
            <Image
              src={aixcoLiveImages.dubaiEdenHouseRendering}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              quality={75}
              sizes="100vw"
              className="h-full w-full object-cover"
              style={{ objectPosition: "58% 56%" }}
            />
          </div>
          <StorySceneReveal
            isActive={isActive}
            className="relative z-10 flex min-h-[100svh] flex-col justify-end px-[clamp(2rem,5.4vw,6rem)] pb-[clamp(3rem,7.2svh,5.5rem)] pt-[clamp(4rem,8svh,6rem)]"
          >
            <p className="eyebrow story-eyebrow story-about-access-eyebrow">{tx("Client approach")}</p>
            <div data-layout="story-about-access" className="grid max-w-[72rem] gap-[clamp(1rem,2.6svh,2rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,0.75fr)] lg:items-end">
              <div>
                <p className="text-[clamp(4.6rem,10vw,11rem)] font-light leading-none tracking-normal text-white drop-shadow-[0_18px_44px_rgba(0,0,0,0.42)]">
                  2009
                </p>
                <p className="mt-3 max-w-[23rem] text-[clamp(1.1rem,1.35vw,1.45rem)] leading-snug text-white/82">
                  {tx("in business, supporting clients across property ownership, brokerage, and administration.")}
                </p>
              </div>
              <div className="max-w-[34rem]">
                <h2 className="text-[clamp(2.1rem,3.6vw,4.3rem)] font-semibold leading-[1.04] tracking-normal text-white">
                  <StoryTextReveal active={isActive} label={tx("Ownership or flexible participation")} />
                </h2>
                <p className="mt-5 text-[clamp(1rem,1.12vw,1.18rem)] leading-[1.65] text-white">
                  {tx("For many clients, this leads to direct ownership of carefully selected properties in emerging, profitable, sustainable markets.")}
                </p>
                <p className="mt-4 text-[clamp(0.98rem,1.05vw,1.1rem)] leading-[1.65] text-white">
                  {tx("For others, AIXCO offers an alternative participation program for clients who would like exposure to the market without the commitments that come with owning and managing property themselves.")}
                </p>
                <p className="mt-4 text-[clamp(0.98rem,1.05vw,1.1rem)] leading-[1.65] text-white">
                  {tx("Our commitment remains the same: transparent guidance, long-term support, and access to opportunities that align with your personal goals.")}
                </p>
              </div>
            </div>
          </StorySceneReveal>
        </div>
      </div>
    </div>
  );
}

function LegacyScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="surface"
      media={{
        kind: "image",
        src: aixcoLiveImages.dubaiEdenHouseRendering,
        alt: tx("Dubai waterfront residential real estate development"),
        fit: "contain",
        position: "left center",
        sizes: "(min-width: 1280px) 58vw, 100vw",
      }}
      mediaWeight="wide"
      reverse
    >
      <p className="eyebrow story-eyebrow story-legacy-eyebrow">{tx("Our journey")}</p>
      <h2 className="story-h2">
        <StoryTextReveal active={isActive} label={tx("From Switzerland to Dubai to Batumi")} />
      </h2>
      <div data-layout="story-legacy-timeline" className="grid w-full">
        {legacyTimelineChapters.slice(0, 3).map((chapter, index) => (
          <div
            key={chapter.id}
            className="rounded-lg border border-primary/20 border-l-[3px] border-l-primary/50 bg-primary/[0.06] px-5 py-4 shadow-[0_14px_34px_-30px_hsl(var(--primary)/0.5)]"
          >
            <p className="story-metric-value story-standard-number story-legacy-number">{formatChapterNumber(index + 1)}</p>
            <h3 className="story-card-title">{tx(chapter.title)}</h3>
            <p className="story-body story-glyph-safe text-foreground/72">{tx(chapter.highlight)}</p>
          </div>
        ))}
      </div>
    </SceneShell>
  );
}

function DubaiScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  const { dubaiFunds } = useSiteContent();
  const visibleFunds = dubaiFunds.slice(0, 2);

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="light"
      media={{
        kind: "image",
        src: aixcoLiveImages.dubaiBurjKhalifaSunset,
        alt: tx("Burj Khalifa and Dubai skyline at sunset"),
        position: "center top",
        sizes: "(min-width: 1280px) 82vw, 100vw",
      }}
    >
      <div className="story-dubai-intro">
        <p className="eyebrow story-eyebrow">{tx("Dubai - Legacy portfolio")}</p>
        <h2 className="story-h2">
          <StoryTextReveal active={isActive} label={tx("Our history in Dubai")} />
        </h2>
        <p className="story-body text-foreground/78">
          {tx("Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.")}
        </p>
      </div>
      <div data-layout="story-dubai-funds" className="w-full">
        {visibleFunds.map((fund, index) => (
          <StoryDubaiFundRow key={fund.id} fund={fund} index={index} tx={tx} />
        ))}
      </div>
    </SceneShell>
  );
}

function BatumiScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  const { batumiBenefits, batumiProperties } = useSiteContent();
  const [firstProperty, secondProperty] = batumiProperties;

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="surface"
      reverse
      mediaWeight="gallery"
      fitContent={false}
      mediaContent={<BatumiVisualMosaic tx={tx} />}
      mediaOverlay="none"
    >
      <p className="eyebrow story-eyebrow">{tx("Emerging market opportunity")}</p>
      <h2 className="story-h2">
        <StoryTextReveal active={isActive} label={tx("Batumi")} />
      </h2>
      <p className="story-body story-glyph-safe text-foreground/78">
        {tx("Selected emerging-market projects and apartments through AIXCO, with Batumi as the current focus, entry from €45,000, 100% foreign ownership, bank financing minimum 60%, and a transparent ISO-certified process.")}
      </p>
      <BatumiBenefitIconGrid benefits={batumiBenefits} tx={tx} />
      <div data-layout="story-batumi-properties" className="grid w-full gap-3">
        {[firstProperty, secondProperty].filter(Boolean).map((property) => (
          <Link
            key={property.id}
            href={`/aixco-global-op2/${property.url}`}
            prefetch={false}
            className="story-batumi-property-link flex w-full items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/[0.07] px-5 py-4 shadow-[0_14px_36px_-28px_hsl(var(--primary)/0.55)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/50 hover:bg-primary/[0.11] hover:shadow-[0_18px_42px_-26px_hsl(var(--primary)/0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <span className="story-batumi-property-copy min-w-0 flex-1">
              <span className="story-card-title block transition-none">{tx(property.name)}</span>
              <span className="story-body block hyphens-none text-foreground/62 transition-none">
                {tx(property.summary)}
              </span>
            </span>
            <span className="btn-gold story-batumi-property__explore w-fit shrink-0" data-batumi-project-cta="explore">
              {tx("Explore")}
            </span>
          </Link>
        ))}
      </div>
    </SceneShell>
  );
}

function MaterialsScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="light"
      fitContent={false}
      media={{
        kind: "image",
        src: aixcoLiveImages.batumiMosaicDuskAerialCoastline,
        alt: tx("Batumi dusk aerial coastline and city lights"),
        position: "62% 50%",
        sizes: "(min-width: 1280px) 140vw, 100vw",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Download Materials")}</p>
      <h2 className="story-mobile-materials-title hidden">{tx("Download Materials")}</h2>
      <p className="story-body text-foreground/74">
        {tx("Access property reference images and supporting documentation.")}
      </p>
      <div className="w-full divide-y divide-foreground/10 border-y border-foreground/10">
        {materialDownloads.map((material) => {
          const Icon = getMaterialIcon(material.format);
          const href = getSafePublicAssetHref(material.href, "#materials");

          return (
            <a
              key={material.id}
              href={href}
              download={material.fileName}
              className="group grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3.5 transition-colors duration-300 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
              aria-label={`${tx("Download")} ${tx(material.title)}`}
            >
              <span className="flex size-12 shrink-0 items-center justify-center text-primary">
                <Icon size={22} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="story-card-title block [overflow-wrap:anywhere]">{tx(material.title)}</span>
                <span className="story-body mt-0.5 block text-foreground/62 [overflow-wrap:anywhere]">{material.format} / {tx(material.audience)}</span>
              </span>
              <Download className="h-4 w-4 text-primary transition-transform group-hover:translate-y-0.5" aria-hidden />
            </a>
          );
        })}
      </div>
    </SceneShell>
  );
}

function ParticipateScene({
  isActive,
  isRevealed,
  onRegister,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  onRegister: () => void;
  tx: (copy: string) => string;
}) {
  const { participationRoutes } = useSiteContent();
  const [primaryRoute, ...remainingRoutes] = participationRoutes;
  const primaryMedia = participationVideoMap[primaryRoute.video as keyof typeof participationVideoMap];

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="surface"
      density="compact"
      fitContent={false}
      reverse
      media={{
        kind: "video",
        src: primaryMedia.src,
        previewSrc: primaryMedia.previewSrc,
        poster: primaryMedia.poster,
        title: tx(primaryRoute.title),
        position: "center 40%",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("How to work with AIXCO")}</p>
      <h2 className="story-h2">
        <StoryTextReveal
          active={isActive}
          label={tx("ACQUIRE.PARTNER.CREATE VALUE.")}
          mobileLabel={tx("ACQUIRE.PARTNER.CREATE VALUE.").replace(/\./g, ".\u200B")}
        />
      </h2>
      <p className="story-body text-foreground/76">
        {tx("From property ownership and strategic partnership to professional asset management, AIXCO is with you at every stage of the journey.")}
      </p>
      <div className="w-full divide-y divide-foreground/30" data-layout="story-participation-routes">
        {[primaryRoute, ...remainingRoutes].map((route, index) => (
          <button
            key={route.id}
            type="button"
            data-participation-card={route.id}
            onClick={onRegister}
            className="group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-3.5 text-start transition-colors hover:text-primary"
          >
            <span className="story-metric-value story-standard-number">{formatChapterNumber(index + 1)}</span>
            <span className="min-w-0">
              <span className="story-card-title block">{tx(route.title)}</span>
              <span className="story-body block text-foreground/64">{tx(route.body)}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
          </button>
        ))}
      </div>
    </SceneShell>
  );
}

function HowScene({
  isActive,
  isRevealed,
  onJourney,
  onRegister,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  onJourney: (journey: ReturnType<typeof useSiteContent>["journeys"][number]) => void;
  onRegister: () => void;
  tx: (copy: string) => string;
}) {
  const { journeys } = useSiteContent();
  const journeyRailRef = useRef<HTMLDivElement>(null);
  const journeyDragRef = useRef<{
    animation: Animation;
    didDrag: boolean;
    pointerId: number;
    startTime: number;
    startX: number;
  } | null>(null);
  const suppressJourneyClickRef = useRef(false);

  const finishJourneyDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = journeyDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const rail = journeyRailRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    if (rail) delete rail.dataset.dragging;

    const track = rail?.querySelector<HTMLElement>(".story-journeys-track");
    if (track) track.style.animationPlayState = "";
    drag.animation.play();
    suppressJourneyClickRef.current = drag.didDrag;
    journeyDragRef.current = null;
  }, []);

  const handleJourneyPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType === "mouse" && event.button !== 0) || !window.matchMedia("(max-width: 767px)").matches) return;

    const rail = journeyRailRef.current;
    const track = rail?.querySelector<HTMLElement>(".story-journeys-track");
    const animation = track?.getAnimations()[0];
    if (!rail || !track || !animation) return;

    const currentTime = Number(animation.currentTime ?? 0);
    journeyDragRef.current = {
      animation,
      didDrag: false,
      pointerId: event.pointerId,
      startTime: Number.isFinite(currentTime) ? currentTime : 0,
      startX: event.clientX,
    };
    suppressJourneyClickRef.current = false;
    rail.dataset.dragging = "true";
    rail.setPointerCapture(event.pointerId);
    track.style.animationPlayState = "paused";
    animation.pause();
  }, []);

  const handleJourneyPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = journeyDragRef.current;
    const rail = journeyRailRef.current;
    const track = rail?.querySelector<HTMLElement>(".story-journeys-track");
    if (!drag || drag.pointerId !== event.pointerId || !track) return;

    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > 4) drag.didDrag = true;

    const duration = drag.animation.effect?.getTiming().duration;
    const loopDistance = track.scrollWidth / 2;
    if (typeof duration !== "number" || loopDistance <= 0) return;

    const requestedTime = drag.startTime - (deltaX / loopDistance) * duration;
    drag.animation.currentTime = ((requestedTime % duration) + duration) % duration;
  }, []);

  const handleJourneyClick = useCallback((journey: ReturnType<typeof useSiteContent>["journeys"][number]) => {
    if (suppressJourneyClickRef.current) {
      suppressJourneyClickRef.current = false;
      return;
    }
    onJourney(journey);
  }, [onJourney]);

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="light"
      fitContent={false}
      media={{
        kind: "image",
        src: aixcoLiveImages.batumiMosaicGoldenHourCoastline,
        alt: tx("Batumi golden hour skyline and coastline"),
        position: "60% 50%",
        sizes: "(min-width: 1280px) 140vw, 100vw",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Journeys")}</p>
      <h2 className="story-h2">
        <StoryTextReveal active={isActive} label={tx("How AIXCO Works")} />
      </h2>
      <p className="story-body text-foreground/76">
        {tx("Choose the journey that fits your role. The process is structured, transparent, and digitally managed.")}
      </p>
      <div
        ref={journeyRailRef}
        data-layout="story-journeys"
        className="grid w-full sm:grid-cols-2"
        onPointerDown={handleJourneyPointerDown}
        onPointerMove={handleJourneyPointerMove}
        onPointerUp={finishJourneyDrag}
        onPointerCancel={finishJourneyDrag}
      >
        <div className="story-journeys-track">
          {[0, 1].map((setIndex) => (
            <div
              key={setIndex}
              className="story-journeys-set"
              data-journey-set={setIndex === 0 ? "primary" : "duplicate"}
              aria-hidden={setIndex === 1 ? true : undefined}
            >
              {journeys.map((journey, index) => (
                <button
                  key={`${setIndex}-${journey.role}`}
                  type="button"
                  tabIndex={setIndex === 1 ? -1 : undefined}
                  onClick={() => handleJourneyClick(journey)}
                  className="group flex min-w-0 flex-col items-stretch justify-start text-start transition-colors hover:text-primary"
                >
                  <p className="story-metric-label text-primary/75">{tx(journey.tag ?? `Journey ${formatChapterNumber(index + 1)}`)}</p>
                  <h3 className="story-card-title">{tx(journey.role)}</h3>
                  <p className="story-body text-foreground/65">{tx(journey.summary)}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button type="button" onClick={onRegister} className="btn-gold w-fit shrink-0">
        {tx("Register")}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </button>
    </SceneShell>
  );
}

function TeamScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  const { team } = useSiteContent();
  const { openTeam } = useUI();
  const { activeIndex, selectMember } = useTeamMemberRotation({
    memberCount: team.length,
    isActive,
    intervalMs: storyTeamSwitchIntervalMs,
    resumeDelayMs: storyTeamResumeDelayMs,
  });
  const activeMember = team[activeIndex] ?? team[0];

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="surface"
      density="compact"
      media={{
        kind: "image",
        src: teamImageMap[activeMember.image as keyof typeof teamImageMap],
        alt: tx(activeMember.name),
        position: "center top",
        sizes: "(min-width: 1280px) 70vw, 100vw",
      }}
      mediaCrossfadeKey={activeMember.image}
      mediaOverlay="none"
      reverse
    >
      <p className="eyebrow story-eyebrow">{tx("Team")}</p>
      <h2 className="story-h2">
        <StoryTextReveal active={isActive} label={tx("AIXCO leadership")} />
      </h2>
      <div
        data-layout="story-team-list"
        className="w-full divide-y divide-foreground/30"
      >
        {team.map((member, index) => {
          const isSelected = activeIndex === index;

          return (
            <button
              key={member.name}
              type="button"
              aria-pressed={isSelected}
              data-active={isSelected ? "true" : "false"}
              onClick={() => {
                selectMember(index);
                openTeam(member);
              }}
              className={cn(
                "group/story-team-member relative grid w-full cursor-pointer grid-cols-[3.75rem_minmax(0,1fr)] gap-3 px-3 text-start transition-colors duration-300 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2",
                isSelected && "bg-foreground/[0.04] text-primary",
              )}
            >
              <span
                className={cn(
                  "absolute bottom-0 start-0 top-0 w-[0.2rem] bg-foreground/15 transition-[background-color] duration-300 [transition-timing-function:var(--ease-apple)]",
                  "group-hover/story-team-member:bg-primary-glow group-focus-visible/story-team-member:bg-primary-glow",
                  isSelected && "bg-primary",
                )}
                aria-hidden="true"
              />
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={teamImageMap[member.image as keyof typeof teamImageMap]}
                  alt=""
                  fill
                  sizes="5rem"
                  className="object-cover object-top"
                />
              </div>
              <div className="min-w-0 self-center">
                <h3 className={cn("story-card-title", isSelected && "text-primary")}>{tx(member.name)}</h3>
                <p className="story-body font-medium text-primary">{tx(member.role)}</p>
                <p className="story-body text-foreground/64">{tx(member.summary)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </SceneShell>
  );
}

type StoryPartner = SiteContent["partners"][number];

function StoryPartnerRow({
  label,
  partners,
  tx,
  onPartnerClick,
  reverse = false,
}: {
  label: string;
  partners: StoryPartner[];
  tx: (copy: string) => string;
  onPartnerClick: (partner: StoryPartner) => void;
  reverse?: boolean;
}) {
  if (!partners.length) return null;

  return (
    <div className="story-partner-row">
      <p className="story-partner-row__label">{tx(label)}</p>
      <PartnerMarquee
        partners={partners}
        openPartner={onPartnerClick}
        tx={tx}
        reverse={reverse}
        ariaLabel={tx(label)}
      />
    </div>
  );
}

function PartnersScene({
  isActive,
  isRevealed,
  tx,
  onPartnerClick,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
  onPartnerClick: (partner: StoryPartner) => void;
}) {
  const { partners } = useSiteContent();
  const groupCompanies = partners.filter((partner) => partner.group === "Group companies");
  const strategicPartners = partners.filter((partner) => partner.group === "Strategic partners");

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="light"
      density="compact"
      media={{ kind: "image", src: aixcoLiveImages.dubaiHealthcare, alt: tx("Dubai Healthcare City legacy reference"), position: "center" }}
    >
      <p className="eyebrow story-eyebrow">{tx("Partners")}</p>
      <h2 className="story-h2 story-partners-title">
        <StoryTextReveal active={isActive} label={tx("Group companies and strategic partners")} />
      </h2>
      <div data-layout="story-partners-marquee" className="story-partners-section">
        <StoryPartnerRow label="Group companies" partners={groupCompanies} tx={tx} onPartnerClick={onPartnerClick} />
        <StoryPartnerRow label="Strategic partners" partners={strategicPartners} tx={tx} onPartnerClick={onPartnerClick} reverse />
      </div>
    </SceneShell>
  );
}

type StoryFaqItem = SiteContent["faqGroups"][number]["items"][number] & { group: string };

function StoryFaqDropdown({
  item,
  tx,
  openId,
  setOpenId,
}: {
  item: StoryFaqItem;
  tx: (copy: string) => string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const itemId = `${item.group}-${item.q}`;
  const panelId = `story-faq-panel-${itemId.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`;
  const isOpen = openId === itemId;

  return (
    <article className="story-faq-item">
      <button
        type="button"
        className="story-faq-trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpenId(openId === itemId ? null : itemId)}
      >
        <span className="min-w-0">
          <span className="story-metric-label text-primary/75">{tx(item.group)}</span>
          <span className="story-faq-question">{tx(item.q)}</span>
        </span>
        <ChevronDown className={cn("story-faq-icon", isOpen && "story-faq-icon--open")} aria-hidden />
      </button>
      <div
        id={panelId}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        className={cn("story-faq-answer", isOpen && "story-faq-answer--open")}
      >
        <div className="min-h-0 overflow-hidden">
          <p>{tx(item.a)}</p>
        </div>
      </div>
    </article>
  );
}

function FaqScene({
  isActive,
  isRevealed,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  const { faqGroups } = useSiteContent();
  const allFaqs = faqGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.group })));
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="surface"
      density="compact"
      fullWidth
      fitContent={false}
    >
      <p className="eyebrow story-eyebrow">{tx("FAQs")}</p>
      <h2 className="story-h2 story-faq-title">
        <StoryTextReveal active={isActive} label={tx("FAQ essentials")} />
      </h2>
      <p className="story-body text-foreground/70">
        {tx("Click a question to read the answer.")}
      </p>
      <div data-layout="story-faq-list" className="story-faq-list">
        {allFaqs.map((item) => (
          <StoryFaqDropdown
            key={`${item.group}-${item.q}`}
            item={item}
            tx={tx}
            openId={openId}
            setOpenId={setOpenId}
          />
        ))}
      </div>
    </SceneShell>
  );
}

function ContactScene({
  isActive,
  isRevealed,
  onLogin,
  onRegister,
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  onLogin: () => void;
  onRegister: () => void;
  tx: (copy: string) => string;
}) {
  const { company } = useSiteContent();
  const { openTerms, openPrivacy } = useUI();

  return (
    <footer
      data-story-footer="true"
      className="story-footer site-footer flex min-h-[100svh] flex-col bg-background text-foreground"
    >
      <div className="container-x flex min-h-[100svh] w-full flex-col py-5 md:py-6 lg:py-7">
        <div className="min-h-0 flex-1">
          <StorySceneBody density="compact" fitContent={false} isActive={isActive}>
          <div className="flex w-full flex-col gap-4 md:gap-5">
            <Logo ariaLabel={tx("AIXCO.GLOBAL home")} />

            <div
              data-layout="story-contact-layout"
              className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-x-10 xl:gap-x-14"
            >
              <div className="story-contact-intro flex min-w-0 flex-col gap-4">
                <p className="eyebrow story-eyebrow">{tx("Contact")}</p>
                <div className="space-y-[var(--story-item-gap)]">
                  <h2 className="story-h2">
                    <StoryTextReveal active={isActive} label={tx("Start with AIXCO")} />
                  </h2>
                  <p className="story-body text-foreground/76">
                    {tx("Register for the correct customer, broker, property owner, or developer journey and the AIXCO team will follow up.")}
                  </p>
                </div>

                <div data-layout="story-contact-actions" className="flex w-full flex-wrap gap-2.5">
                  <button type="button" onClick={onLogin} className="btn-ghost-gold">
                    {tx("Login")}
                  </button>
                  <button type="button" onClick={onRegister} className="btn-gold">
                    {tx("Register")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </button>
                </div>
              </div>

              <div data-layout="story-contact-panel" className="flex min-w-0 flex-col gap-3">
                <div data-layout="story-contact-details" className="grid w-full gap-3 sm:grid-cols-2">
                  <a href={`mailto:${company.email}`} className="story-contact-card story-contact-card--email group min-w-0">
                    <span className="story-metric-label text-primary/75">{tx("Email")}</span>
                    <span className="story-contact-card__row">
                      <span className="story-contact-card__icon-tile" aria-hidden="true">
                        <Image src={aixcoLiveIcons.email} alt="" width={28} height={28} unoptimized className="story-contact-card__svg-icon" />
                      </span>
                      <span className="story-contact-detail min-w-0 [overflow-wrap:anywhere]">
                        {company.email}
                      </span>
                    </span>
                  </a>
                  <a
                    href="https://maps.app.goo.gl/AVywyfokNdm4VuLD9"
                    target="_blank"
                    rel="noreferrer"
                    className="story-contact-card group min-w-0"
                  >
                    <span className="story-metric-label text-primary/75">{tx("Address")}</span>
                    <span className="story-contact-card__row">
                      <span className="story-contact-card__icon-tile" aria-hidden="true">
                        <MapPin />
                      </span>
                      <span className="story-contact-detail min-w-0 [overflow-wrap:anywhere]">{tx(company.address)}</span>
                    </span>
                  </a>
                </div>

                <div data-layout="story-contact-socials" className="story-contact-card story-contact-social-card min-w-0">
                  <span className="story-metric-label text-primary/75">{tx("SOCIAL MEDIA")}</span>
                  <SocialLinks
                    socials={company.socials}
                    theme="light"
                    showLabels
                    className="story-contact-social-links"
                    aria-label={tx("AIXCO social media links")}
                  />
                </div>
              </div>
            </div>
          </div>
          </StorySceneBody>
        </div>

        <FooterLegalBar tx={tx} openTerms={openTerms} openPrivacy={openPrivacy} compact />
      </div>
    </footer>
  );
}

const MemoizedHeroScene = memo(HeroScene);
const MemoizedAboutScene = memo(AboutScene);
const MemoizedPhilosophyScene = memo(PhilosophyScene);
const MemoizedPhilosophyDetailScene = memo(PhilosophyDetailScene);
const MemoizedPhilosophyPlatformScene = memo(PhilosophyPlatformScene);
const MemoizedAboutObjectivesScene = memo(AboutObjectivesScene);
const MemoizedAboutAccessScene = memo(AboutAccessScene);
const MemoizedLegacyScene = memo(LegacyScene);
const MemoizedDubaiScene = memo(DubaiScene);
const MemoizedBatumiScene = memo(BatumiScene);
const MemoizedMaterialsScene = memo(MaterialsScene);
const MemoizedParticipateScene = memo(ParticipateScene);
const MemoizedHowScene = memo(HowScene);
const MemoizedTeamScene = memo(TeamScene);
const MemoizedPartnersScene = memo(PartnersScene);
const MemoizedFaqScene = memo(FaqScene);
const MemoizedContactScene = memo(ContactScene);

export function DesktopStoryHome() {
  const storyRef = useRef<HTMLDivElement | null>(null);
  const pageProgressBarRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const sectionMetricsRef = useRef<Array<StorySectionMetric | null>>([]);
  const sectionProgressValuesRef = useRef<Record<string, string>>({});
  const scrollFrameRef = useRef<number | null>(null);
  const pageProgressRef = useRef(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [sectionPresence, setSectionPresence] = useState<boolean[]>(() => storyChapters.map((_, index) => index <= 1));
  const activeIndexRef = useRef(0);
  const [heroBackdropVisible, setHeroBackdropVisible] = useState(true);
  const heroBackdropVisibleRef = useRef(true);
  const sectionPresenceRef = useRef(sectionPresence);
  const { openContact, openJourney, openLogin, openPartner, openRegister } = useUI();
  const { lang, setLang, tx } = useI18n();

  useLayoutEffect(() => {
    const hiddenHeaders = new Map<HTMLElement, string>();
    const previousHomeExperience = document.documentElement.dataset.homeExperience;
    const hideGlobalHeaders = () => {
      document
        .querySelectorAll<HTMLElement>('header[dir="ltr"], header.fixed.inset-x-0.top-0')
        .forEach((header) => {
          if (storyRef.current?.contains(header)) return;
          if (!hiddenHeaders.has(header)) hiddenHeaders.set(header, header.style.display);
          header.dataset.storyHiddenHeader = "true";
          header.style.setProperty("display", "none", "important");
        });
    };

    if (previousHomeExperience !== "story") {
      document.documentElement.dataset.homeExperience = "story";
    }
    document.body.classList.add("home-story-nav-hidden");
    document.body.classList.remove("home-desktop-story-boot");
    hideGlobalHeaders();

    const observer = new MutationObserver(hideGlobalHeaders);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (previousHomeExperience === undefined) {
        delete document.documentElement.dataset.homeExperience;
      } else {
        document.documentElement.dataset.homeExperience = previousHomeExperience;
      }
      document.body.classList.remove("home-story-nav-hidden");
      hiddenHeaders.forEach((display, header) => {
        header.style.display = display;
        delete header.dataset.storyHiddenHeader;
      });
    };
  }, []);

  const refreshSectionMetrics = useCallback(() => {
    sectionMetricsRef.current = storyChapters.map((_, index) => {
      const section = sectionRefs.current[index];
      if (!section) return null;

      const rect = section.getBoundingClientRect();
      return {
        height: Math.max(1, rect.height),
        top: rect.top + window.scrollY,
      };
    });
  }, []);

  const syncProgress = useCallback(() => {
    scrollFrameRef.current = null;
    const viewportHeight = Math.max(1, window.innerHeight);
    const scrollY = window.scrollY;
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const scrollableDistance = Math.max(1, documentHeight - viewportHeight);
    const nextProgress = clamp(scrollY / scrollableDistance, 0, 1);
    if (
      Math.abs(nextProgress - pageProgressRef.current) >= 0.0005 ||
      nextProgress === 0 ||
      nextProgress === 1
    ) {
      pageProgressRef.current = nextProgress;
      if (pageProgressBarRef.current) {
        pageProgressBarRef.current.style.transform = `scaleX(${nextProgress.toFixed(5)})`;
      }
    }

    const viewportCenter = viewportHeight * 0.5;
    if (sectionMetricsRef.current.length !== storyChapters.length) {
      refreshSectionMetrics();
    }

    const sectionRects = storyChapters.map((_, index) => {
      const metric = sectionMetricsRef.current[index];
      if (!metric) return null;

      const top = metric.top - scrollY;
      return {
        bottom: top + metric.height,
        height: metric.height,
        top,
      };
    });
    let nextActiveIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    const nextHeroBackdropVisible = (sectionRects[0]?.bottom ?? viewportHeight) > 0;

    sectionRects.forEach((rect, index) => {
      if (!rect) return;

      const isCentered = rect.top <= viewportCenter && rect.bottom >= viewportCenter;
      const distance = isCentered
        ? 0
        : Math.min(Math.abs(rect.top - viewportCenter), Math.abs(rect.bottom - viewportCenter));

      if (distance < closestDistance) {
        closestDistance = distance;
        nextActiveIndex = index;
      }
    });

    nextActiveIndex = clamp(nextActiveIndex, 0, storyChapters.length - 1);
    const nextSectionPresence = sectionRects.map((rect, index) => {
      const isNearActiveSection = Math.abs(index - nextActiveIndex) <= 2;
      if (!rect) return isNearActiveSection;
      return isNearActiveSection || (rect.top < viewportHeight * 1.2 && rect.bottom > -viewportHeight * 0.1);
    });

    for (let index = 0; index < sectionRects.length; index += 1) {
      const section = sectionRefs.current[index];
      const rect = sectionRects[index];
      if (!section || !rect) continue;

      const nextInViewport = rect.top < viewportHeight && rect.bottom > 0 ? "true" : "false";
      if (section.dataset.storyInViewport !== nextInViewport) {
        section.dataset.storyInViewport = nextInViewport;
      }

      if (!nextSectionPresence[index] && Math.abs(index - nextActiveIndex) > 1) continue;

      const top = rect.top;
      const bottom = rect.bottom;
      const sectionHeight = Math.max(1, rect.height);
      const isAboutSection = storyChapters[index]?.key === "about";
      const exitRange = isAboutSection
        ? viewportHeight
        : sectionHeight > viewportHeight
          ? sectionHeight - viewportHeight
          : viewportHeight;
      const exitProgress = clamp(-top / Math.max(1, exitRange), 0, 1);
      if (isAboutSection) {
        const nextExitProgress = exitProgress.toFixed(3);
        const progressKey = `${index}:exit`;
        if (sectionProgressValuesRef.current[progressKey] !== nextExitProgress) {
          sectionProgressValuesRef.current[progressKey] = nextExitProgress;
          section.style.setProperty("--story-section-exit-progress", nextExitProgress);
        }
      }

      nextSectionPresence[index] =
        Math.abs(index - nextActiveIndex) <= 2 ||
        (top < viewportHeight * 1.15 && bottom > -viewportHeight * 0.1);
    }

    if (activeIndexRef.current !== nextActiveIndex) {
      activeIndexRef.current = nextActiveIndex;
      setActiveIndex(nextActiveIndex);
    }

    if (heroBackdropVisibleRef.current !== nextHeroBackdropVisible) {
      heroBackdropVisibleRef.current = nextHeroBackdropVisible;
      setHeroBackdropVisible(nextHeroBackdropVisible);
    }

    const currentPresence = sectionPresenceRef.current;
    const hasPresenceChanged =
      currentPresence.length !== nextSectionPresence.length ||
      currentPresence.some((value, index) => value !== nextSectionPresence[index]);

    if (hasPresenceChanged) {
      sectionPresenceRef.current = nextSectionPresence;
      setSectionPresence(nextSectionPresence);
    }
  }, [refreshSectionMetrics]);

  const requestScrollSync = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(syncProgress);
  }, [syncProgress]);

  useEffect(() => {
    refreshSectionMetrics();
    syncProgress();

    const refreshAndSync = () => {
      refreshSectionMetrics();
      requestScrollSync();
    };
    const refreshTimers = [120, 620, 1400].map((delay) => window.setTimeout(refreshAndSync, delay));
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(refreshAndSync);

    resizeObserver?.observe(document.documentElement);
    sectionRefs.current.forEach((section) => {
      if (section) resizeObserver?.observe(section);
    });

    window.addEventListener("scroll", requestScrollSync, { passive: true });
    window.addEventListener("resize", refreshAndSync);
    window.addEventListener("load", refreshAndSync);

    return () => {
      refreshTimers.forEach((timer) => window.clearTimeout(timer));
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", requestScrollSync);
      window.removeEventListener("resize", refreshAndSync);
      window.removeEventListener("load", refreshAndSync);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [refreshSectionMetrics, requestScrollSync, syncProgress]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshSectionMetrics();
      requestScrollSync();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [lang, refreshSectionMetrics, requestScrollSync]);

  const handleChapterClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, chapter: StoryChapter) => {
      event.preventDefault();

      const chapterIndex = storyChapters.findIndex((entry) => entry.key === chapter.key);
      if (chapterIndex >= 0) {
        activeIndexRef.current = chapterIndex;
        setActiveIndex(chapterIndex);
      }

      if (!chapter.id) {
        replaceLocationHash("");
        scrollToPageTop();
        window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }));
        requestScrollSync();
        return;
      }

      const hash = `#${chapter.id}`;
      replaceLocationHash(hash);
      scrollToHash(hash);
      window.requestAnimationFrame(() => document.getElementById(chapter.id ?? "")?.focus({ preventScroll: true }));
      requestScrollSync();
    },
    [requestScrollSync],
  );

  const scenes = useMemo(
    () => {
      const isRevealed = (index: number) => Boolean(sectionPresence[index] ?? index === 0);

      return [
      <MemoizedHeroScene key="hero" isActive={activeIndex === 0} tx={tx} onContact={openContact} onRegister={openRegister} />,
      <MemoizedAboutScene
        key="about"
        isActive={activeIndex === 1}
        isRevealed={isRevealed(1)}
        shouldExposeVideo={activeIndex === 1 && !heroBackdropVisible}
        shouldStartVideo={activeIndex >= 1}
        tx={tx}
      />,
      <MemoizedPhilosophyScene key="philosophy" isActive={activeIndex === 2} isRevealed={isRevealed(2)} tx={tx} />,
      <MemoizedPhilosophyDetailScene
        key="philosophy-origins"
        isActive={activeIndex === 3}
        isRevealed={isRevealed(3)}
        tx={tx}
        eyebrow="Swiss discipline in practice"
        title="A real estate foundation built on wise selection"
        summary="AIXCO's philosophy starts with wise selection: durable assets, disciplined risk assessment, and recurring income generation."
        sections={philosophyOwnershipSections}
        media={{
          kind: "image",
          src: aixcoLiveImages.aboutArchitecture,
          alt: tx("AIXCO real estate architecture"),
          position: "center 64%",
          sizes: "(max-width: 767px) 170vw, 100vw",
        }}
      />,
      <MemoizedPhilosophyPlatformScene key="philosophy-platform" isActive={activeIndex === 4} isRevealed={isRevealed(4)} tx={tx} />,
      <MemoizedAboutObjectivesScene key="about-objectives" isActive={activeIndex === 5} isRevealed={isRevealed(5)} tx={tx} />,
      <MemoizedAboutAccessScene key="about-access" isActive={activeIndex === 6} isRevealed={isRevealed(6)} tx={tx} />,
      <MemoizedLegacyScene key="legacy" isActive={activeIndex === 7} isRevealed={isRevealed(7)} tx={tx} />,
      <MemoizedDubaiScene key="dubai" isActive={activeIndex === 8} isRevealed={isRevealed(8)} tx={tx} />,
      <MemoizedBatumiScene key="batumi" isActive={activeIndex === 9} isRevealed={isRevealed(9)} tx={tx} />,
      <MemoizedMaterialsScene key="materials" isActive={activeIndex === 10} isRevealed={isRevealed(10)} tx={tx} />,
      <MemoizedParticipateScene key="participate" isActive={activeIndex === 11} isRevealed={isRevealed(11)} tx={tx} onRegister={openRegister} />,
      <MemoizedHowScene key="how" isActive={activeIndex === 12} isRevealed={isRevealed(12)} tx={tx} onJourney={openJourney} onRegister={openRegister} />,
      <MemoizedTeamScene key="team" isActive={activeIndex === 13} isRevealed={isRevealed(13)} tx={tx} />,
      <MemoizedPartnersScene key="partners" isActive={activeIndex === 14} isRevealed={isRevealed(14)} tx={tx} onPartnerClick={openPartner} />,
      <MemoizedFaqScene key="faqs" isActive={activeIndex === 15} isRevealed={isRevealed(15)} tx={tx} />,
      <MemoizedContactScene key="contact" isActive={activeIndex === 16} isRevealed={isRevealed(16)} tx={tx} onLogin={openLogin} onRegister={openRegister} />,
      ];
    },
    [activeIndex, heroBackdropVisible, openContact, openJourney, openLogin, openPartner, openRegister, sectionPresence, tx],
  );

  return (
    <div ref={storyRef} data-home-experience="desktop-story" className="relative bg-background">
      <FixedHeroBackdrop visible={heroBackdropVisible} />
      <StoryChrome
        activeIndex={activeIndex}
        lang={lang}
        langOpen={langOpen}
        setLang={setLang}
        setLangOpen={setLangOpen}
        tx={tx}
        onChapterClick={handleChapterClick}
      />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-px bg-foreground/10">
        <div
          ref={pageProgressBarRef}
          className="h-px origin-left bg-primary will-change-transform"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <div id="main-content" tabIndex={-1} className="relative z-10">
        {scenes.map((scene, index) => {
          const chapter = storyChapters[index];
          const isActive = activeIndex === index;

          return (
            <section
              key={chapter.key}
              ref={(node) => {
                sectionRefs.current[index] = node;
              }}
              id={chapter.id}
              tabIndex={-1}
              data-story-section={chapter.key}
              data-story-active={isActive ? "true" : "false"}
              data-story-revealed={sectionPresence[index] ? "true" : "false"}
              className={cn(
                "isolate relative scroll-mt-0",
                chapter.key === "about"
                  ? "story-about-scroll-section h-[100svh] max-h-[100svh] overflow-hidden"
                  : chapter.key === "hero"
                    ? "h-[100svh] max-h-[100svh] overflow-hidden"
                    : "min-h-[100svh] overflow-visible",
              )}
            >
              {scene}
              {chapter.key !== "contact" ? (
                <div aria-hidden="true" className="story-section-boundary" />
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

