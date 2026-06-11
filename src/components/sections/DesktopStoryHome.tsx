"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeEuro,
  Building2,
  ChevronDown,
  CirclePercent,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Mail,
  Menu,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
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
  aixcoHeroBackgroundVideo,
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
import { premiumEase, reducedMotionTransition, revealTransition } from "@/lib/motion";
import {
  formatMetricValue,
  fundAssetGalleries,
  hasAssetGallery,
  isHeadlineMetric,
  parseFundDetail,
  type DubaiFund,
} from "./dubai/dubai-data";
import { DubaiImageMarquee } from "./dubai/DubaiImageMarquee";
import { heroIntroText, heroOpportunityFootnote, heroOpportunityText } from "./hero/hero-ui";

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

type StoryMedia =
  | {
      kind: "image";
      src: string | StaticImageData;
      alt: string;
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
  { key: "materials", id: "materials", label: "Materials" },
  { key: "participate", id: "participate", label: "How to work" },
  { key: "how", id: "how", label: "Journeys" },
  { key: "team", id: "team", label: "Team" },
  { key: "partners", id: "partners", label: "Partners" },
  { key: "faqs", id: "faqs", label: "FAQs" },
  { key: "contact", id: "contact", label: "Contact" },
];

const chapterHashDelays = [0, 90, 220, 480] as const;
const storySidebarWidth = "clamp(13.5rem,15vw,16rem)";
const storyMediaSwitchTransition = {
  duration: 0.48,
  ease: premiumEase,
};
const storyTeamSwitchIntervalMs = 2400;
const storyTeamResumeDelayMs = 3200;
const maxAnimatedStoryLetters = 72;
const philosophyOwnershipSections = philosophySections.slice(0, 2);
const philosophyPlatformSections = philosophySections.slice(2);
const philosophyPlatformStats = [
  { ...philosophyStats[0], shortLabel: "First acquisition" },
  { ...philosophyStats[1], shortLabel: "GDV" },
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
  otium: {
    src: aixcoLiveVideos.otium,
    previewSrc: aixcoLiveVideoPreviews.otium,
    poster: aixcoLiveImages.batumiOtium,
  },
} as const;

const dubaiVideoMap = {
  fundOne: {
    src: aixcoLiveVideos.fundOne,
    previewSrc: aixcoLiveVideoPreviews.fundOne,
    poster: aixcoLiveImages.dubaiEdenHouse,
  },
  fundTwo: {
    src: aixcoLiveVideos.fundTwo,
    previewSrc: aixcoLiveVideoPreviews.fundTwo,
    poster: aixcoLiveImages.dubaiHealthcare,
  },
  fundThree: {
    src: aixcoLiveVideos.fundThree,
    previewSrc: aixcoLiveVideoPreviews.fundThree,
    poster: aixcoLiveImages.dubaiHealthcare,
  },
} as const;

const teamImageMap = {
  "team-benjamin": aixcoLiveImages.teamBenjamin,
  "team-owais": aixcoLiveImages.teamOwais,
  "team-walter": aixcoLiveImages.teamWalter,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatChapterNumber(index: number) {
  return String(index).padStart(2, "0");
}

function useStoryTextInView(rootRef: React.RefObject<HTMLElement | null>) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  return isInView;
}

function StoryTextReveal({
  label,
}: {
  children?: React.ReactNode;
  label: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const isInView = useStoryTextInView(rootRef);
  const tokens = useMemo(() => label.split(/(\s+)/u), [label]);
  const letterCount = useMemo(() => Array.from(label).filter((character) => !/\s/u.test(character)).length, [label]);
  const useCompactReveal = letterCount > maxAnimatedStoryLetters;
  const animationDurationMs = useMemo(
    () => useCompactReveal ? 1100 : Math.min(2800, letterCount * 28 + 780),
    [letterCount, useCompactReveal],
  );
  const [animationState, setAnimationState] = useState<"idle" | "animating" | "played">("idle");
  const [animationRun, setAnimationRun] = useState(0);

  useEffect(() => {
    setAnimationState("idle");
    setAnimationRun(0);
  }, [label]);

  useEffect(() => {
    if (!isInView || animationState !== "idle") return;
    setAnimationRun((current) => current + 1);
    setAnimationState("animating");
  }, [animationState, isInView]);

  useEffect(() => {
    if (animationState !== "animating") return undefined;

    const timer = window.setTimeout(() => setAnimationState("played"), animationDurationMs);
    return () => window.clearTimeout(timer);
  }, [animationDurationMs, animationState]);

  let revealIndex = 0;
  const isAnimating = animationState === "animating";
  const hasPlayed = animationState === "played";

  return (
    <span
      ref={rootRef}
      className={cn(
        "story-text-reveal story-letter-reveal",
        useCompactReveal && "story-letter-reveal--compact",
        isAnimating && "story-letter-reveal--active",
        hasPlayed && "story-letter-reveal--played",
      )}
      aria-label={label}
      data-text-reveal-active={isAnimating ? "true" : "false"}
      data-text-reveal-state={animationState}
      style={{ "--story-letter-count": letterCount } as CSSProperties}
    >
      <span className="story-text-reveal__mobile-plain">{label}</span>
      <span key={animationRun} className="story-letter-reveal__text" aria-hidden="true">
        {useCompactReveal ? (
          <span className="story-letter-reveal__chunk">{label}</span>
        ) : (
          tokens.map((token, tokenIndex) => (
            token.trim() ? (
              <span key={`${token}-${tokenIndex}`} className="story-letter-reveal__word">
                {Array.from(token).map((character, characterIndex) => {
                  const characterRevealIndex = revealIndex;
                  revealIndex += 1;

                  return (
                    <span
                      key={`${character}-${tokenIndex}-${characterIndex}`}
                      className="story-letter-reveal__char"
                      data-char={character}
                      style={{ "--story-char-index": characterRevealIndex } as CSSProperties}
                    >
                      {character}
                    </span>
                  );
                })}
              </span>
            ) : (
              <span key={`${token}-${tokenIndex}`} className="story-letter-reveal__space">
                {token}
              </span>
            )
          ))
        )}
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
  priority = false,
}: {
  media: StoryMedia;
  mediaKey: string;
  isActive: boolean;
  priority?: boolean;
}) {
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={mediaKey}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={shouldReduceMotion ? reducedMotionTransition : storyMediaSwitchTransition}
      >
        <StoryMediaPanel media={media} isActive={isActive} priority={priority} />
      </motion.div>
    </AnimatePresence>
  );
}

function StoryMediaPanel({
  isActive,
  media,
  priority = false,
}: {
  isActive: boolean;
  media: StoryMedia;
  priority?: boolean;
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
        eager={priority || isActive}
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
      preload={priority}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      quality={95}
      sizes={media.sizes ?? "(min-width: 1280px) 56vw, 100vw"}
      className="story-media-panel__image h-full w-full object-cover"
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
  const activeChapterKey = storyChapters[activeIndex]?.key ?? "hero";
  const useLightMobileLogo = ["hero", "about", "aboutAccess", "contact"].includes(activeChapterKey);

  const handleChapterLink = (event: MouseEvent<HTMLAnchorElement>, chapter: StoryChapter) => {
    setLangOpen(false);
    setMenuOpen(false);
    onChapterClick(event, chapter);
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-2 border-b border-transparent bg-transparent px-3 py-3 text-white sm:px-4 xl:hidden">
        <a
          href="/"
          aria-label="AIXCO.GLOBAL home"
          onClick={(event) => handleChapterLink(event, storyChapters[0])}
          className={cn(
            "inline-flex min-w-0 items-center gap-1.5 drop-shadow-[0_3px_14px_rgb(0_0_0/0.34)] sm:gap-2",
            useLightMobileLogo ? "text-white" : "text-foreground",
          )}
        >
          <img
            src={aixcoLiveLogos.aixcoMark}
            alt=""
            aria-hidden="true"
            className={cn(
              "h-auto w-10 shrink-0 object-contain sm:w-11",
              !useLightMobileLogo && "[filter:brightness(0)_saturate(100%)]",
            )}
          />
          <span className="whitespace-nowrap text-[0.78rem] font-semibold tracking-[-0.02em] sm:text-sm">AIXCO.GLOBAL</span>
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setLangOpen((value) => !value)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            aria-label={`${currentLangName} Change language`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-foreground/10 bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden />
            {currentLangName}
            <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="story-mobile-menu"
            aria-label={menuOpen ? tx("Close menu") : tx("Open menu")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-foreground/10 bg-white text-foreground"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
        {langOpen && (
          <ul
            role="listbox"
            className="absolute right-16 top-[calc(100%+0.5rem)] z-[70] w-64 rounded-lg border border-foreground/10 bg-white p-1 text-foreground shadow-elegant"
          >
            {LANGS.map((option) => (
              <li key={option.code}>
                <button
                  role="option"
                  data-lang={option.code}
                  aria-selected={option.code === lang}
                  onClick={() => {
                    setLang(option.code);
                    setLangOpen(false);
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

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm xl:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <aside
        id="story-mobile-menu"
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 w-[min(21rem,88vw)] border-l border-foreground/10 bg-white px-5 pb-6 pt-24 text-foreground shadow-[18px_0_60px_-30px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[var(--ease-apple)] xl:hidden",
          menuOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!menuOpen}
      >
        <nav aria-label={tx("Story navigation")} className="grid gap-1">
          {storyChapters.map((chapter, index) => {
            const isActive = activeIndex === index;
            const href = chapter.id ? `#${chapter.id}` : "/";

            return (
              <a
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
                    "story-chapter-link__line w-[0.65rem] bg-foreground/20 transition-[width,background-color] duration-300 ease-[var(--ease-apple)]",
                    isActive && "story-chapter-link__line--active w-full bg-primary",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{tx(chapter.label)}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <aside
        className="fixed bottom-0 left-0 top-0 z-50 hidden border-r border-foreground/10 bg-white px-5 pb-6 pt-6 text-foreground shadow-[18px_0_60px_-46px_rgba(0,0,0,0.42)] 2xl:px-6 xl:block"
        style={{ width: storySidebarWidth }}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            <a
              href="/"
              aria-label="AIXCO.GLOBAL home"
              onClick={(event) => handleChapterLink(event, storyChapters[0])}
              className="mb-5 inline-flex min-h-16 items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <img
                src={aixcoLiveLogos.aixcoMark}
                alt=""
                aria-hidden="true"
                className="h-auto w-16 object-contain [filter:brightness(0)_saturate(100%)]"
              />
              <span className="whitespace-nowrap text-[0.84rem] font-semibold tracking-[-0.02em]">AIXCO.GLOBAL</span>
            </a>
            <div className="relative mb-5">
              <button
                type="button"
                onClick={() => setLangOpen((value) => !value)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={`${currentLangName} Change language`}
                className="inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-foreground/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="inline-flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" aria-hidden />
                  {currentLangName}
                </span>
                <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
              </button>
              {langOpen && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 z-[70] mt-2 rounded-lg border border-foreground/10 bg-white p-1 text-foreground shadow-elegant"
                >
                  {LANGS.map((option) => (
                    <li key={option.code}>
                      <button
                        role="option"
                        data-lang={option.code}
                        aria-selected={option.code === lang}
                        onClick={() => {
                          setLang(option.code);
                          setLangOpen(false);
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
            <nav aria-label={tx("Story navigation")} className="grid gap-1">
              {storyChapters.map((chapter, index) => {
                const isActive = activeIndex === index;
                const href = chapter.id ? `#${chapter.id}` : "/";

                return (
                  <a
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
                        "story-chapter-link__line w-[0.65rem] bg-foreground/20 transition-[width,background-color] duration-300 ease-[var(--ease-apple)]",
                        "group-hover/story-chapter:w-full group-hover/story-chapter:bg-primary-glow group-focus-visible/story-chapter:w-full group-focus-visible/story-chapter:bg-primary-glow",
                        isActive && "story-chapter-link__line--active w-full bg-primary",
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{tx(chapter.label)}</span>
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="space-y-3">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {formatChapterNumber(activeIndex + 1)} / {formatChapterNumber(storyChapters.length)}
            </p>
            <div className="h-px w-full bg-foreground/12">
              <div className="h-px bg-primary transition-[width] duration-150" style={{ width: "var(--story-page-progress, 0%)" }} />
            </div>
          </div>
        </div>
      </aside>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-px bg-foreground/10">
        <div className="h-px bg-primary transition-[width] duration-150" style={{ width: "var(--story-page-progress, 0%)" }} />
      </div>
    </>
  );
}

function FixedHeroBackdrop({ visible }: { visible: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(visible);

  useEffect(() => {
    const video = videoRef.current;

    if (visible) {
      setShouldRenderVideo(true);
      void video?.play().catch(() => undefined);
      return undefined;
    }

    video?.pause();
    const cleanupTimer = window.setTimeout(() => {
      setShouldRenderVideo(false);
    }, 760);

    return () => window.clearTimeout(cleanupTimer);
  }, [visible]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-0 right-0 top-0 z-0 overflow-hidden bg-[#11100e] transition-opacity duration-700 ease-[var(--ease-apple)] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ left: "var(--story-fixed-backdrop-left, 0px)" }}
    >
      {shouldRenderVideo && (
        <video
          ref={videoRef}
          src={aixcoHeroBackgroundVideo.src}
          poster={aixcoHeroBackgroundVideo.poster}
          autoPlay={visible}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover brightness-[1.08] saturate-[1.08]"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,14,0.64),rgba(17,16,14,0.20)_44%,rgba(17,16,14,0.54)),linear-gradient(180deg,rgba(17,16,14,0.16),rgba(17,16,14,0.58))]" />
    </div>
  );
}

function StorySceneBody({
  children,
  density = "default",
  isRevealed,
  fitContent = true,
}: {
  children: React.ReactNode;
  density?: "default" | "compact" | "dense";
  isRevealed: boolean;
  fitContent?: boolean;
}) {
  const copyRef = useRef<HTMLDivElement | null>(null);

  const densityClass =
    density === "dense"
      ? "gap-[clamp(0.85rem,1.45svh,1.15rem)]"
      : density === "compact"
        ? "gap-[clamp(0.95rem,1.65svh,1.3rem)]"
        : "gap-[clamp(1rem,2svh,1.55rem)]";

  useLayoutEffect(() => {
    const copy = copyRef.current;
    const column = copy?.parentElement;
    if (!copy || !column) return undefined;

    if (!isRevealed || !fitContent) {
      copy.style.removeProperty("zoom");
      copy.style.removeProperty("width");
      return undefined;
    }

    let fitFrame: number | null = null;

    const fitCopy = () => {
      fitFrame = null;
      copy.style.removeProperty("zoom");
      copy.style.removeProperty("width");
      const columnAvailable = column.clientHeight;
      const copyAvailable = copy.clientHeight;
      const available =
        copyAvailable > 0 ? Math.min(columnAvailable, copyAvailable) : columnAvailable;

      let zoom = 1;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const needed = copy.scrollHeight;
        if (needed <= available + 2) break;

        const rawZoom = (available - 2) / needed;
        zoom = Math.max(0.8, Math.min(zoom, rawZoom));
        copy.style.setProperty("zoom", String(zoom));
      }
    };

    const scheduleFit = () => {
      if (fitFrame !== null) {
        window.cancelAnimationFrame(fitFrame);
      }
      fitFrame = window.requestAnimationFrame(fitCopy);
    };

    const observer = new ResizeObserver(scheduleFit);

    observer.observe(column);
    scheduleFit();
    window.addEventListener("resize", scheduleFit);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleFit);
      if (fitFrame !== null) {
        window.cancelAnimationFrame(fitFrame);
      }
      copy.style.removeProperty("zoom");
      copy.style.removeProperty("width");
    };
  }, [children, fitContent, isRevealed]);

  return (
    <div
      ref={copyRef}
      data-story-scene-copy
      className="flex min-h-0 w-full min-w-0 max-w-none flex-1 flex-col items-stretch self-stretch justify-center overflow-hidden"
    >
      <StorySceneReveal
        isActive={isRevealed}
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
  priority,
  reverse = false,
  tone = "light",
  density = "default",
  mediaWeight = "default",
  isActive,
  isRevealed = isActive,
  fitContent = true,
}: {
  children: React.ReactNode;
  media?: StoryMedia;
  mediaContent?: React.ReactNode;
  mediaCrossfadeKey?: string;
  mediaOverlay?: StoryMediaOverlay;
  priority?: boolean;
  reverse?: boolean;
  tone?: "light" | "dark" | "surface";
  density?: "default" | "compact" | "dense";
  mediaWeight?: "default" | "wide" | "gallery";
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
  const copyColumnSpan = mediaWeight === "gallery" ? "xl:col-span-5" : mediaWeight === "wide" ? "xl:col-span-6" : "xl:col-span-7";
  const mediaColumnSpan = mediaWeight === "gallery" ? "xl:col-span-7" : mediaWeight === "wide" ? "xl:col-span-6" : "xl:col-span-5";

  return (
    <div className={`relative h-full min-h-0 ${toneClass}`}>
      <div
        className="grid h-full min-h-0"
        style={{ gridTemplateColumns: "var(--story-shell-columns, minmax(0, 1fr))" }}
      >
        <div aria-hidden className="hidden xl:block" />
        <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-12">
          <div
            data-story-scene-column
            className={`relative z-10 flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-stretch justify-center overflow-hidden ${
              reverse ? `xl:order-2 ${copyColumnSpan}` : `xl:order-1 ${copyColumnSpan}`
            }`}
          >
            <StorySceneBody density={density} fitContent={fitContent} isRevealed={isRevealed}>
              {children}
            </StorySceneBody>
          </div>

          <div
            data-story-scene-media
            data-story-media-active={isActive ? "true" : "false"}
            className={`story-media-panel relative h-full min-h-0 overflow-hidden bg-foreground/5 ${
              reverse ? `xl:order-1 ${mediaColumnSpan}` : `xl:order-2 ${mediaColumnSpan}`
            }`}
          >
            {mediaContent ? (
              <StoryMediaReveal isActive={isRevealed} reverse={reverse} className="absolute inset-0">
                <div className="story-media-panel__stage story-media-panel__stage--custom relative h-full w-full overflow-hidden">
                  {mediaContent}
                </div>
              </StoryMediaReveal>
            ) : media ? (
              <StoryMediaReveal isActive={isRevealed} reverse={reverse} className="absolute inset-0">
                <div className="story-media-panel__stage relative h-full w-full overflow-hidden">
                  {mediaCrossfadeKey ? (
                    <StoryCrossfadeMediaPanel
                      media={media}
                      mediaKey={mediaCrossfadeKey}
                      isActive={isActive}
                      priority={priority}
                    />
                  ) : (
                    <StoryMediaPanel media={media} isActive={isActive} priority={priority} />
                  )}
                  <StoryMediaGradient overlay={resolvedOverlay} reverse={reverse} />
                </div>
              </StoryMediaReveal>
            ) : (
              <div className="h-full bg-gradient-to-br from-primary/12 via-background to-secondary/12" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroScene({ isActive, tx, onRegister }: { isActive: boolean; tx: (copy: string) => string; onRegister: () => void }) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden text-white">
      <div className="relative z-10 grid h-full min-h-0" style={{ gridTemplateColumns: "var(--story-shell-columns, minmax(0, 1fr))" }}>
        <div aria-hidden className="hidden xl:block" />
        <div className="flex h-full min-h-0 items-end overflow-hidden px-8 pb-[clamp(2.5rem,6svh,5rem)] pt-[clamp(5rem,8svh,7rem)] 2xl:px-14">
          <motion.div
            className="max-w-[74rem]"
            initial={{ opacity: 0, y: 32 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.92, y: 8 }}
            transition={revealTransition}
          >
            <p className="mb-5 max-w-full text-[clamp(0.82rem,0.86vw,1.05rem)] font-medium uppercase tracking-normal text-white/88 drop-shadow-[0_3px_16px_rgba(0,0,0,0.45)]">
              {tx("Quality Real Estate - Buy / Broker / Manage")}
            </p>
            <img
              src={aixcoLiveLogos.aixcoMark}
              alt=""
              aria-hidden="true"
              data-story-hero-standalone-mark="true"
              className="mb-3 h-[clamp(7rem,12vw,13rem)] w-[clamp(7rem,12vw,13rem)] shrink-0 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.3)]"
            />
            <h1
              aria-label="AIXCO.GLOBAL"
              data-brand-lockup="story-hero"
              className="mt-[clamp(1rem,3svh,2.5rem)] flex max-w-full items-center gap-[0.06em] font-semibold uppercase leading-none tracking-[-0.045em] text-[clamp(3.2rem,6.45vw,7.1rem)] text-white drop-shadow-[0_18px_42px_rgba(0,0,0,0.38)]"
            >
              <img
                src={aixcoLiveLogos.aixcoMark}
                alt=""
                aria-hidden="true"
                data-story-hero-title-mark="true"
                className="h-[0.98em] w-[0.98em] shrink-0 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.24)]"
              />
              <span className="min-w-0">IXCO.GLOBAL</span>
            </h1>
            <p className="mt-8 max-w-3xl text-[clamp(1.1rem,1.4vw,1.45rem)] leading-[1.55] text-white/86">
              {tx(heroIntroText)}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onRegister} className="btn-gold">
                {tx("Register")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <a href="#batumi" onClick={(event) => {
                event.preventDefault();
                replaceLocationHash("#batumi");
                scrollToHash("#batumi");
              }} className="btn-ghost-gold border-white/35 bg-white/12 text-white hover:bg-white/18 hover:text-white">
                {tx("Batumi apartments")}
              </a>
            </div>
            <div className="mt-8 max-w-3xl text-white/88">
              <p className="text-[clamp(1.35rem,2.2vw,2.35rem)] font-light uppercase leading-none">
                {tx(heroOpportunityText)}
              </p>
              <p className="mt-3 max-w-2xl text-sm font-normal normal-case leading-relaxed text-white/82 md:text-base">
                {tx(heroOpportunityFootnote)}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StoryDubaiFundRow({ fund, tx }: { fund: DubaiFund; tx: (copy: string) => string }) {
  const details = fund.details.map(parseFundDetail);
  const headlineMetrics = details.filter((detail) => isHeadlineMetric(detail.label)).slice(0, 3);

  return (
    <div className="story-fund-row py-[clamp(0.95rem,1.55svh,1.35rem)] first:pt-0 last:pb-0">
      <h3 className="story-card-title">{tx(fund.name)}</h3>
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-[clamp(0.75rem,1.25svh,1rem)] sm:grid-cols-3 sm:gap-x-6">
        {headlineMetrics.map((detail) => {
          const metric = formatMetricValue(detail.value);
          return (
            <div key={`${detail.label}:${detail.value}`}>
              <p className="story-metric-label">{tx(detail.label)}</p>
              <p className="story-metric-value">
                {metric.prefix ? `${tx(metric.prefix)} ` : ""}
                {metric.value}
                {metric.subtext ? (
                  <span className="ml-0.5 text-[0.58em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {tx(metric.subtext)}
                  </span>
                ) : null}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BatumiVisualMosaic({ tx }: { tx: (copy: string) => string }) {
  const galleryImages = [
    {
      key: "day",
      src: aixcoLiveImages.batumiMosaicDayAerial,
      alt: tx("Batumi daytime aerial skyline and Black Sea"),
      width: 7360,
      height: 4912,
      objectPosition: "50% 48%",
    },
    {
      key: "sunset",
      src: aixcoLiveImages.batumiMosaicSunsetCoastline,
      alt: tx("Batumi sunset city and coastline view"),
      width: 6000,
      height: 4000,
      objectPosition: "50% 52%",
    },
    {
      key: "night",
      src: aixcoLiveImages.batumiMosaicNightSkyline,
      alt: tx("Batumi night skyline from the Black Sea"),
      width: 7360,
      height: 4912,
      objectPosition: "50% 50%",
    },
    {
      key: "nature",
      src: aixcoLiveImages.batumiMosaicNatureAerial,
      alt: tx("Batumi coastal nature and Black Sea view"),
      width: 3981,
      height: 5971,
      objectPosition: "50% 50%",
    },
    {
      key: "tower",
      src: aixcoLiveImages.batumiMosaicBlueTower,
      alt: tx("Batumi tower and daytime city view"),
      width: 3903,
      height: 5854,
      objectPosition: "58% 50%",
    },
  ] satisfies Array<{
    key: string;
    src: string;
    alt: string;
    width: number;
    height: number;
    objectPosition: string;
  }>;
  const [selectedImageKey, setSelectedImageKey] = useState(galleryImages[0].key);
  const selectedImage = galleryImages.find((image) => image.key === selectedImageKey) ?? galleryImages[0];
  const carouselImages = [...galleryImages, ...galleryImages];

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
          sizes="(min-width: 1280px) 52vw, 100vw"
          quality={95}
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
            onClick={() => setSelectedImageKey(image.key)}
          >
            <Image
              src={image.src}
              alt=""
              width={image.width}
              height={image.height}
              sizes="(min-width: 1280px) 9vw, 24vw"
              quality={75}
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

function BatumiBenefitIconGrid({
  benefits,
  tx,
}: {
  benefits: readonly string[];
  tx: (copy: string) => string;
}) {
  const items = [
    { icon: BadgeEuro, metric: "€50k", label: benefits[3] ?? "Entry from €50,000" },
    { icon: KeyRound, metric: "100%", label: benefits[1] ?? "100% foreign ownership" },
    { icon: TrendingUp, metric: "60%", label: benefits[4] ?? "Bank financing available from 60% of the property value" },
    { icon: CirclePercent, metric: "8%", label: benefits[5] ?? "Approx. 8% net rental yields" },
  ];

  return (
    <div data-layout="story-batumi-benefits" className="story-batumi-benefit-grid">
      {items.map(({ icon: Icon, label, metric }) => (
        <div key={label} className="story-batumi-benefit">
          <Icon className="story-batumi-benefit__icon" aria-hidden />
          <div className="min-w-0">
            <span className="story-batumi-benefit__metric">{metric}</span>
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
  tx,
}: {
  isActive: boolean;
  isRevealed: boolean;
  tx: (copy: string) => string;
}) {
  const metrics = [
    { value: "5,000+", label: "Trusted clients" },
    { value: "$400M", label: "Gross Development Value (GDV)" },
    { value: "500+", label: "Total transactions" },
    { value: "2009", label: "In business since" },
  ];

  return (
    <div className="story-about-cinematic-stage relative h-full min-h-0 bg-[#11100e] text-white">
      <div
        className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[var(--story-custom-sidebar)_minmax(0,1fr)]"
        style={{ "--story-custom-sidebar": storySidebarWidth } as CSSProperties}
      >
        <div aria-hidden className="hidden xl:block" />
        <div className="relative h-full min-h-0 overflow-hidden">
          <StoryMediaReveal isActive={isRevealed} className="story-about-cinematic-media absolute inset-0">
            <div className="story-about-cinematic-image relative h-full w-full">
              <Image
                src={aixcoLiveImages.batumi}
                alt={tx("Batumi skyline at sunset")}
                fill
                loading="lazy"
                decoding="async"
                quality={95}
                sizes="(min-width: 1280px) calc(100vw - 14rem), 100vw"
                className="h-full w-full object-cover"
                style={{ objectPosition: "center 42%" }}
              />
            </div>
          </StoryMediaReveal>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.32),transparent_34%),linear-gradient(90deg,rgba(17,16,14,0.48),rgba(17,16,14,0.10)_46%,rgba(17,16,14,0.70)),linear-gradient(180deg,rgba(17,16,14,0.04),rgba(17,16,14,0.78))]"
          />
          <StorySceneReveal
            isActive={isRevealed}
            className="story-about-cinematic-copy relative z-10 flex h-full min-h-0 flex-col justify-end px-[clamp(2rem,5vw,5.5rem)] pb-[clamp(2.8rem,7svh,5.6rem)] pt-[clamp(4rem,8svh,6rem)]"
          >
            <div data-layout="story-about-cinematic" className="max-w-[52rem]">
              <p className="mb-5 flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/78">
                <span className="h-px w-8 bg-white/58" aria-hidden />
                {tx("About AIXCO")}
              </p>
              <h2
                aria-label="AIXCO.GLOBAL"
                data-brand-lockup="story-about"
                className="max-w-none font-semibold leading-[0.9] tracking-normal text-white drop-shadow-[0_18px_48px_rgba(0,0,0,0.36)]"
              >
                <span className="flex min-w-0 items-center gap-[clamp(0.9rem,1.6vw,1.35rem)]">
                  <Image
                    src={aixcoLiveLogos.aixcoMark}
                    alt=""
                    aria-hidden="true"
                    width={780}
                    height={704}
                    sizes="(min-width: 1280px) 10vw, 28vw"
                    className="h-[clamp(4.4rem,8vw,8.8rem)] w-[clamp(4.4rem,8vw,8.8rem)] shrink-0 object-contain [filter:brightness(0)_invert(1)]"
                  />
                  <span className="text-[clamp(2.3rem,5.2vw,5.85rem)] uppercase tracking-[-0.04em]">
                    <StoryTextReveal label="AIXCO.GLOBAL" />
                  </span>
                </span>
              </h2>
              <p className="mt-[clamp(1.2rem,2.4svh,2rem)] max-w-[46rem] text-[clamp(1.05rem,1.28vw,1.34rem)] leading-[1.62] text-white/88">
                {tx("Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on Batumi, with a legacy track record in Switzerland and Dubai.")}
              </p>
            </div>
            <dl className="mt-[clamp(1.7rem,3.4svh,2.6rem)] grid max-w-[48rem] grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {metrics.slice(0, 4).map((metric) => (
                <div key={metric.label} className="border-l border-white/28 pl-4">
                  <dt className="text-[clamp(1.55rem,2.45vw,2.7rem)] font-light leading-none text-primary-glow">
                    {metric.value}
                  </dt>
                  <dd className="mt-2 text-[0.64rem] font-semibold uppercase leading-relaxed tracking-[0.04em] text-white/70 [overflow-wrap:anywhere]">
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
        <StoryTextReveal label={tx(philosophyHero.title)} />
      </h2>
      <p className="story-body text-foreground/76">{tx(philosophyHero.summary)}</p>

      <dl data-layout="story-philosophy-stats" className="grid w-full grid-cols-2 gap-px overflow-hidden border border-foreground/10 bg-foreground/10">
        {philosophyStats.map((stat) => (
          <div key={stat.label} className="bg-white px-4 py-4">
            <dt className="story-metric-label text-foreground/58">{tx(stat.label)}</dt>
            <dd className="mt-2 font-display text-[clamp(1.8rem,2.8vw,3.2rem)] leading-none text-primary">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div data-layout="story-philosophy-principles" className="grid w-full gap-2 sm:grid-cols-2">
        {philosophyPrinciples.map((principle) => (
          <div key={principle} className="flex min-h-12 items-center gap-3 border border-foreground/10 bg-white px-4 py-3 text-sm font-semibold text-foreground/84">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {tx(principle)}
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
      fitContent
      media={{
        kind: "image",
        src: aixcoLiveImages.batumiMosaicNightSkyline,
        alt: tx("Batumi night skyline from the Black Sea"),
        position: "center 38%",
      }}
      mediaOverlay="none"
    >
      <p className="eyebrow story-eyebrow">{tx("Long-term platform")}</p>
      <h2 className="story-h2 story-philosophy-platform-title">
        <StoryTextReveal label={tx("International expansion through selected opportunities")} />
      </h2>
      <p className="story-body text-foreground/76">
        {tx("The platform connects selected opportunities, international teams, and service discipline around long-term property value.")}
      </p>

      <dl data-layout="story-philosophy-platform-stats" className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        {philosophyPlatformStats.map((stat) => (
          <div key={stat.label} className="story-philosophy-stat">
            <dt className="story-metric-label text-foreground/52" title={tx(stat.label)}>{tx(stat.shortLabel)}</dt>
            <dd className="story-metric-value mt-1 leading-none text-primary">{stat.value}</dd>
          </div>
        ))}
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
    <div className="relative h-full min-h-0 bg-surface text-foreground">
      <div
        className="grid h-full min-h-0"
        style={{ gridTemplateColumns: "var(--story-shell-columns, minmax(0, 1fr))" }}
      >
        <div aria-hidden className="hidden xl:block" />
        <div
          data-story-scene-column
          data-story-media-active={isActive ? "true" : "false"}
          className="story-philosophy-detail-stage relative z-10 flex h-full min-h-0 flex-col overflow-hidden bg-surface"
        >
          <StorySceneBody fitContent isRevealed={isRevealed}>
            <p className="eyebrow story-eyebrow">{tx(eyebrow)}</p>
            <h2 className="story-h2 story-philosophy-detail-title">
              <StoryTextReveal label={tx(title)} />
            </h2>
            <p className="story-body text-foreground/76">{tx(summary)}</p>

            <div data-layout="story-philosophy-detail" className="grid w-full gap-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
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
          </StorySceneBody>
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
    <div className="relative h-full min-h-0 bg-surface text-foreground">
      <div
        className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[var(--story-custom-sidebar)_minmax(0,1fr)]"
        style={{ "--story-custom-sidebar": storySidebarWidth } as CSSProperties}
      >
        <div aria-hidden className="hidden xl:block" />
        <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden px-[clamp(2rem,6vw,7rem)] py-[clamp(3rem,8svh,6rem)]">
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[26svh] overflow-hidden opacity-70">
            <Image
              src={aixcoLiveImages.aboutArchitecture}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              quality={95}
              sizes="(min-width: 1280px) calc(100vw - 14rem), 100vw"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 64%" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--surface))_0%,hsl(var(--surface)/0.72)_42%,hsl(var(--surface)/0.22)_100%)]" />
          </div>
          <StorySceneReveal isActive={isRevealed} className="relative z-10 mx-auto w-full max-w-[70rem] text-center">
            <p className="eyebrow story-eyebrow justify-center text-primary/80">{tx("Client objectives")}</p>
            <h2 className="mx-auto mt-6 max-w-[20ch] text-[clamp(2.2rem,4.3vw,5.2rem)] font-light leading-[1.15] tracking-normal text-foreground/72">
              <StoryTextReveal label={tx("Every client starts with a different objective")} />
            </h2>
            <div data-layout="story-about-objectives" className="mx-auto mt-[clamp(1.6rem,3.2svh,2.4rem)] grid max-w-[54rem] gap-4">
              <p className="text-[clamp(1.02rem,1.18vw,1.28rem)] leading-[1.7] text-foreground/70">
                {tx("Some are looking to build long-term wealth through real estate ownership. Others want recurring income, international diversification, or simply a way to participate in a market they believe has strong future potential.")}
              </p>
              <p className="text-[clamp(1rem,1.08vw,1.18rem)] leading-[1.68] text-foreground/62">
                {tx("Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.")}
              </p>
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
    <div className="relative h-full min-h-0 bg-[#11100e] text-white">
      <div
        className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[var(--story-custom-sidebar)_minmax(0,1fr)]"
        style={{ "--story-custom-sidebar": storySidebarWidth } as CSSProperties}
      >
        <div aria-hidden className="hidden xl:block" />
        <div className="relative h-full min-h-0 overflow-hidden">
          <StoryMediaReveal isActive={isRevealed} className="story-about-access-media absolute inset-0">
            <div className="story-about-access-image relative h-full w-full">
              <Image
                src={aixcoLiveImages.batumiSeafrontPoster}
                alt={tx("Selected Batumi property opportunity")}
                fill
                loading="lazy"
                decoding="async"
                quality={95}
                sizes="(min-width: 1280px) calc(100vw - 14rem), 100vw"
                className="h-full w-full object-cover"
                style={{ objectPosition: "center 45%" }}
              />
            </div>
          </StoryMediaReveal>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_68%_36%,rgba(255,255,255,0.26),transparent_28%),linear-gradient(90deg,rgba(17,16,14,0.68),rgba(17,16,14,0.18)_48%,rgba(17,16,14,0.30)),linear-gradient(180deg,rgba(17,16,14,0.08),rgba(17,16,14,0.76))]"
          />
          <StorySceneReveal
            isActive={isRevealed}
            className="relative z-10 flex h-full min-h-0 flex-col justify-end px-[clamp(2rem,5.4vw,6rem)] pb-[clamp(3rem,7.2svh,5.5rem)] pt-[clamp(4rem,8svh,6rem)]"
          >
            <p className="eyebrow story-eyebrow text-white/78">{tx("Client approach")}</p>
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
                <h2 className="text-[clamp(2.1rem,3.6vw,4.3rem)] font-semibold leading-[0.98] tracking-normal text-white">
                  <StoryTextReveal label={tx("Ownership or flexible participation")} />
                </h2>
                <p className="mt-5 text-[clamp(1rem,1.12vw,1.18rem)] leading-[1.65] text-white/80">
                  {tx("For many clients, this leads to direct ownership of carefully selected properties in emerging, profitable, sustainable markets.")}
                </p>
                <p className="mt-4 text-[clamp(0.98rem,1.05vw,1.1rem)] leading-[1.65] text-white/72">
                  {tx("For others, AIXCO offers an alternative participation program for clients who would like exposure to the market without the commitments that come with owning and managing property themselves.")}
                </p>
                <p className="mt-4 text-[clamp(0.98rem,1.05vw,1.1rem)] leading-[1.65] text-white/72">
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
        position: "center 56%",
      }}
      reverse
    >
      <p className="eyebrow story-eyebrow">{tx("Our journey")}</p>
      <h2 className="story-h2">
        <StoryTextReveal label={tx("From Switzerland to Dubai to Batumi")} />
      </h2>
      <div data-layout="story-legacy-timeline" className="grid w-full">
        {legacyTimelineChapters.slice(0, 3).map((chapter, index) => (
          <div key={chapter.id} className="border-l-2 border-primary/35 pl-5">
            <p className="story-metric-label text-primary/80">{formatChapterNumber(index + 1)}</p>
            <h3 className="story-card-title">{tx(chapter.title)}</h3>
            <p className="story-body text-foreground/72">{tx(chapter.highlight)}</p>
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
  const shouldReduceMotion = useHydratedReducedMotion();
  const [landingFund, secondFund] = dubaiFunds;
  const media = dubaiVideoMap[landingFund.video as keyof typeof dubaiVideoMap];
  const galleryGroups = hasAssetGallery(landingFund.id) ? fundAssetGalleries[landingFund.id].groups : [];

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="light"
      media={{
        kind: "video",
        src: media.src,
        previewSrc: media.previewSrc,
        poster: media.poster,
        title: tx(landingFund.name),
        position: "center 38%",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Dubai - Legacy portfolio")}</p>
      <h2 className="story-h2">
        <StoryTextReveal label={tx("Our history in Dubai")} />
      </h2>
      <p className="story-body text-foreground/78">
        {tx("Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.")}
      </p>
      <div data-layout="story-dubai-funds" className="w-full">
        {[landingFund, secondFund].filter(Boolean).map((fund) => (
          <StoryDubaiFundRow key={fund.id} fund={fund} tx={tx} />
        ))}
      </div>
      {galleryGroups.length > 0 && (
        <div data-layout="story-dubai-marquee" className="w-full">
          {galleryGroups.slice(0, 2).map((group, index) => (
            <div key={group.title} className="min-w-0">
              <p className="story-dubai-gallery-title">{tx(group.title)}</p>
              <DubaiImageMarquee
                group={group}
                reverse={index % 2 === 1}
                shouldReduceMotion={shouldReduceMotion}
                speed="slow"
                tx={tx}
              />
            </div>
          ))}
        </div>
      )}
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
      mediaContent={<BatumiVisualMosaic tx={tx} />}
      mediaOverlay="none"
    >
      <p className="eyebrow story-eyebrow">{tx("Batumi - Current opportunity")}</p>
      <h2 className="story-h2">
        <StoryTextReveal label={tx("Batumi")} />
      </h2>
      <p className="story-body text-foreground/78">
        {tx("Selected Batumi projects and apartments through AIXCO, with entry from €50,000, 100% foreign ownership, bank financing options, and transparent ISO-certified process.")}
      </p>
      <BatumiBenefitIconGrid benefits={batumiBenefits} tx={tx} />
      <div data-layout="story-batumi-properties" className="w-full divide-y divide-foreground/30">
        {[firstProperty, secondProperty].filter(Boolean).map((property) => (
          <Link
            key={property.id}
            href={`/aixco-global-op2/${property.url}`}
            prefetch={false}
            className="group flex w-full items-center justify-between gap-4 py-4 transition-colors hover:text-primary"
          >
            <span className="min-w-0 flex-1">
              <span className="story-card-title block">{tx(property.name)}</span>
              <span className="story-body block text-foreground/62">
                {tx(property.summary)}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
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
      media={{
        kind: "image",
        src: aixcoLiveImages.batumiOverviewPoster,
        alt: tx("Batumi skyline at night"),
        position: "50% center",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Client materials")}</p>
      <h2 className="story-h2">
        <StoryTextReveal label={tx("Materials & downloads")} />
      </h2>
      <p className="story-body text-foreground/74">
        {tx("Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.")}
      </p>
      <div className="w-full divide-y divide-foreground/10 border-y border-foreground/10">
        {materialDownloads.slice(0, 4).map((material) => {
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
                <span className="story-card-title block truncate">{tx(material.title)}</span>
                <span className="story-body mt-0.5 block truncate text-foreground/62">{material.format} / {tx(material.audience)}</span>
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
        <StoryTextReveal label={`${tx("How")} ${tx("Customers/Partners Work")}`} />
      </h2>
      <p className="story-body text-foreground/76">
        {tx("Buy a Batumi apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.")}
      </p>
      <div className="w-full divide-y divide-foreground/30" data-layout="story-participation-routes">
        {[primaryRoute, ...remainingRoutes].map((route, index) => (
          <button
            key={route.id}
            type="button"
            data-participation-card={route.id}
            onClick={onRegister}
            className="group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-3.5 text-left transition-colors hover:text-primary"
          >
            <span className="story-metric-value text-primary/45">{formatChapterNumber(index + 1)}</span>
            <span className="min-w-0">
              <span className="story-card-title block">{tx(route.title)}</span>
              <span className="story-body block text-foreground/64">{tx(route.body)}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
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

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="light"
      media={{
        kind: "image",
        src: aixcoLiveImages.batumiFogPoster,
        alt: tx("Batumi skyline above coastal fog"),
        position: "center 44%",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Journeys")}</p>
      <h2 className="story-h2">
        <StoryTextReveal label={tx("How AIXCO Works")} />
      </h2>
      <p className="story-body text-foreground/76">
        {tx("Choose the journey that fits your role. The process is structured, transparent, and digitally managed.")}
      </p>
      <div data-layout="story-journeys" className="grid w-full sm:grid-cols-2">
        {journeys.map((journey, index) => (
          <button key={journey.role} type="button" onClick={() => onJourney(journey)} className="group text-left transition-colors hover:text-primary">
            <p className="story-metric-label text-primary/75">{tx(journey.tag ?? `Journey ${formatChapterNumber(index + 1)}`)}</p>
            <h3 className="story-card-title">{tx(journey.role)}</h3>
            <p className="story-body text-foreground/65">{tx(journey.summary)}</p>
          </button>
        ))}
      </div>
      <button type="button" onClick={onRegister} className="btn-gold w-fit shrink-0">
        {tx("Register")}
        <ArrowRight className="h-4 w-4" aria-hidden />
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
  const { activeIndex, selectMember, previewMember, resumeRotation } = useTeamMemberRotation({
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
        <StoryTextReveal label={tx("AIXCO leadership")} />
      </h2>
      <div
        data-layout="story-team-list"
        className="w-full divide-y divide-foreground/30"
        onMouseLeave={resumeRotation}
      >
        {team.map((member, index) => {
          const isSelected = activeIndex === index;

          return (
            <button
              key={member.name}
              type="button"
              aria-pressed={isSelected}
              data-active={isSelected ? "true" : "false"}
              onClick={() => selectMember(index)}
              onMouseEnter={() => previewMember(index)}
              onFocus={() => previewMember(index)}
              onBlur={resumeRotation}
              className={cn(
                "group/story-team-member relative grid w-full cursor-pointer grid-cols-[3.75rem_minmax(0,1fr)] gap-3 px-3 text-left transition-colors duration-300 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2",
                isSelected && "bg-foreground/[0.04] text-primary",
              )}
            >
              <span
                className={cn(
                  "absolute bottom-0 left-0 top-0 w-[0.2rem] bg-foreground/15 transition-[background-color] duration-300 ease-[var(--ease-apple)]",
                  "group-hover/story-team-member:bg-primary-glow group-focus-visible/story-team-member:bg-primary-glow",
                  isSelected && "bg-primary",
                )}
                aria-hidden="true"
              />
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={teamImageMap[member.image as keyof typeof teamImageMap]}
                  alt={tx(member.name)}
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
        variant="story"
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
      <h2 className="story-h2 story-partners-title">{tx("Group companies and strategic partners")}</h2>
      <div data-layout="story-partners-marquee" className="story-partners-section">
        <StoryPartnerRow label="Group companies" partners={groupCompanies} tx={tx} onPartnerClick={onPartnerClick} />
        <StoryPartnerRow label="Strategic partners" partners={strategicPartners} tx={tx} onPartnerClick={onPartnerClick} reverse />
      </div>
    </SceneShell>
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
  const coreFaqs = faqGroups.flatMap((group) => group.items.slice(0, 2).map((item) => ({ ...item, group: group.group }))).slice(0, 4);
  const customerGroup = faqGroups.find((group) => group.group === "Customer");
  const companyFinancingFaq = customerGroup?.items.find((item) => item.q === "Can I ask about AIXCO company financing?");
  const highlightedFaqs = companyFinancingFaq
    ? [...coreFaqs.slice(0, 3), { ...companyFinancingFaq, group: customerGroup?.group ?? "Customer" }]
    : coreFaqs;

  return (
    <SceneShell
      isActive={isActive}
      isRevealed={isRevealed}
      tone="surface"
      density="compact"
      reverse
      media={{ kind: "image", src: aixcoLiveImages.batumiMosaicModernCoastline, alt: tx("Batumi coastal real estate reference"), position: "center" }}
    >
      <p className="eyebrow story-eyebrow">{tx("FAQs")}</p>
      <h2 className="story-h2">
        <StoryTextReveal label={tx("Frequently asked questions")} />
      </h2>
      <div data-layout="story-faq-list" className="w-full divide-y divide-foreground/10 border-y border-foreground/10">
        {highlightedFaqs.map((item) => (
          <div key={`${item.group}-${item.q}`}>
            <p className="story-metric-label text-primary/75">{tx(item.group)}</p>
            <h3 className="story-card-title">{tx(item.q)}</h3>
            <p className="story-body text-foreground/66">{tx(item.a)}</p>
          </div>
        ))}
      </div>
    </SceneShell>
  );
}

function ContactScene({
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
      className="story-footer site-footer flex h-full min-h-0 flex-col bg-background text-foreground"
    >
      <div className="container-x flex h-full min-h-0 w-full flex-col py-5 md:py-6 lg:py-7">
        <div className="min-h-0 flex-1">
          <StorySceneBody density="compact" fitContent isRevealed={isRevealed}>
          <div className="flex w-full flex-col gap-4 md:gap-5">
            <Logo />

            <div
              data-layout="story-contact-layout"
              className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-x-10 xl:gap-x-14"
            >
              <div className="story-contact-intro flex min-w-0 flex-col gap-4">
                <p className="eyebrow story-eyebrow">{tx("Contact")}</p>
                <div className="space-y-[var(--story-item-gap)]">
                  <h2 className="story-h2">
                    <StoryTextReveal label={tx("Start with AIXCO")} />
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
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div data-layout="story-contact-panel" className="flex min-w-0 flex-col gap-3">
                <div data-layout="story-contact-details" className="grid w-full gap-3 sm:grid-cols-2">
                  <a href={`mailto:${company.email}`} className="story-contact-card group min-w-0">
                    <span className="story-metric-label text-primary/75">{tx("Email")}</span>
                    <span className="story-contact-card__row">
                      <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="story-card-title min-w-0 text-[clamp(0.95rem,1vw,1.05rem)] font-medium leading-snug [overflow-wrap:anywhere]">
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
                      <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="story-body min-w-0 text-foreground/82 [overflow-wrap:anywhere]">{company.address}</span>
                    </span>
                  </a>
                </div>

                <div data-layout="story-contact-socials" className="story-contact-card min-w-0">
                  <span className="story-metric-label text-primary/75">{tx("Social media")}</span>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <SocialLinks
                      socials={company.socials}
                      theme="light"
                      className="gap-2.5"
                      aria-label={tx("AIXCO social media links")}
                    />
                  </div>
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

export function DesktopStoryHome() {
  const storyRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollFrameRef = useRef<number | null>(null);
  const pageProgressRef = useRef(-1);
  const textRevealProgressRef = useRef<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [sectionPresence, setSectionPresence] = useState<boolean[]>(() => storyChapters.map((_, index) => index === 0));
  const { openJourney, openLogin, openPartner, openRegister } = useUI();
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

    document.documentElement.dataset.homeExperience = "story";
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

  const syncProgress = useCallback(() => {
    scrollFrameRef.current = null;
    const viewportHeight = Math.max(1, window.innerHeight);
    const scrollY = window.scrollY;
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const scrollableDistance = Math.max(1, documentHeight - viewportHeight);
    const nextProgress = clamp(scrollY / scrollableDistance, 0, 1);
    if (
      Math.abs(nextProgress - pageProgressRef.current) >= 0.002 ||
      nextProgress === 0 ||
      nextProgress === 1
    ) {
      pageProgressRef.current = nextProgress;
      storyRef.current?.style.setProperty("--story-page-progress", `${(nextProgress * 100).toFixed(2)}%`);
    }

    const revealDistance = Math.max(1, viewportHeight * 0.95);
    const viewportCenter = viewportHeight * 0.5;
    const nextActiveIndex = clamp(
      Math.floor((scrollY + viewportCenter) / viewportHeight),
      0,
      storyChapters.length - 1,
    );
    const nextSectionPresence = storyChapters.map((_, index) => Math.abs(index - nextActiveIndex) <= 1);

    const nearbyStart = Math.max(0, nextActiveIndex - 1);
    const nearbyEnd = Math.min(storyChapters.length - 1, nextActiveIndex + 1);

    for (let index = nearbyStart; index <= nearbyEnd; index += 1) {
      const section = sectionRefs.current[index];
      if (!section) continue;

      const rect = section.getBoundingClientRect();
      const top = rect.top;
      const bottom = rect.bottom;
      const sectionHeight = Math.max(1, rect.height);
      const isAboutSection = storyChapters[index]?.key === "about";
      const isAboutAccessSection = storyChapters[index]?.key === "aboutAccess";
      const exitRange = isAboutSection
        ? viewportHeight
        : sectionHeight > viewportHeight
          ? sectionHeight - viewportHeight
          : viewportHeight;
      const exitProgress = clamp(-top / Math.max(1, exitRange), 0, 1);
      const localProgress = (viewportHeight - top) / revealDistance;
      const textProgress = clamp(localProgress, 0, 1);
      const previousProgress = textRevealProgressRef.current[index] ?? -1;
      if (
        Math.abs(textProgress - previousProgress) >= 0.006 ||
        textProgress === 0 ||
        textProgress === 1
      ) {
        textRevealProgressRef.current[index] = textProgress;
        section.style.setProperty("--story-text-reveal-progress", textProgress.toFixed(3));
      }
      if (isAboutSection) {
        section.style.setProperty("--story-section-exit-progress", exitProgress.toFixed(3));
      }
      if (isAboutAccessSection) {
        section.style.setProperty("--story-section-exit-progress", exitProgress.toFixed(3));
        section.style.setProperty("--story-about-access-zoom-progress", clamp(exitProgress * 2, 0, 1).toFixed(3));
      }

      nextSectionPresence[index] = top < viewportHeight * 0.98 && bottom > viewportHeight * 0.02;
    }

    setActiveIndex((current) => (current === nextActiveIndex ? current : nextActiveIndex));

    setSectionPresence((current) => {
      if (
        current.length === nextSectionPresence.length &&
        current.every((value, index) => value === nextSectionPresence[index])
      ) {
        return current;
      }

      return nextSectionPresence;
    });
  }, []);

  const requestScrollSync = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(syncProgress);
  }, [syncProgress]);

  useEffect(() => {
    syncProgress();

    window.addEventListener("scroll", requestScrollSync, { passive: true });
    window.addEventListener("resize", requestScrollSync);

    return () => {
      window.removeEventListener("scroll", requestScrollSync);
      window.removeEventListener("resize", requestScrollSync);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [requestScrollSync, syncProgress]);

  useEffect(() => {
    if (!window.location.hash) return undefined;

    const timers = chapterHashDelays.map((delay) =>
      window.setTimeout(() => {
        scrollToHash(window.location.hash, "auto");
        requestScrollSync();
      }, delay),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [requestScrollSync]);

  const handleChapterClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, chapter: StoryChapter) => {
      event.preventDefault();

      const chapterIndex = storyChapters.findIndex((entry) => entry.key === chapter.key);
      if (chapterIndex >= 0) {
        setActiveIndex(chapterIndex);
      }

      if (!chapter.id) {
        replaceLocationHash("");
        scrollToPageTop();
        requestScrollSync();
        return;
      }

      const hash = `#${chapter.id}`;
      replaceLocationHash(hash);
      scrollToHash(hash);
      requestScrollSync();
    },
    [requestScrollSync],
  );

  const scenes = useMemo(
    () => {
      const isRevealed = (index: number) => Boolean(sectionPresence[index] ?? index === 0);

      return [
      <HeroScene key="hero" isActive={activeIndex === 0} tx={tx} onRegister={openRegister} />,
      <AboutScene key="about" isActive={activeIndex === 1} isRevealed={isRevealed(1)} tx={tx} />,
      <PhilosophyScene key="philosophy" isActive={activeIndex === 2} isRevealed={isRevealed(2)} tx={tx} />,
      <PhilosophyDetailScene
        key="philosophy-origins"
        isActive={activeIndex === 3}
        isRevealed={isRevealed(3)}
        tx={tx}
        eyebrow="Swiss discipline in practice"
        title="A real estate foundation built through ownership"
        summary="AIXCO's philosophy starts with ownership: durable assets, conservative risk assessment, and recurring income generation."
        sections={philosophyOwnershipSections}
        media={{
          kind: "image",
          src: aixcoLiveImages.aboutArchitecture,
          alt: tx("AIXCO real estate architecture"),
          position: "center 64%",
          sizes: "(min-width: 1280px) 40vw, 100vw",
        }}
      />,
      <PhilosophyPlatformScene key="philosophy-platform" isActive={activeIndex === 4} isRevealed={isRevealed(4)} tx={tx} />,
      <AboutObjectivesScene key="about-objectives" isActive={activeIndex === 5} isRevealed={isRevealed(5)} tx={tx} />,
      <AboutAccessScene key="about-access" isActive={activeIndex === 6} isRevealed={isRevealed(6)} tx={tx} />,
      <LegacyScene key="legacy" isActive={activeIndex === 7} isRevealed={isRevealed(7)} tx={tx} />,
      <DubaiScene key="dubai" isActive={activeIndex === 8} isRevealed={isRevealed(8)} tx={tx} />,
      <BatumiScene key="batumi" isActive={activeIndex === 9} isRevealed={isRevealed(9)} tx={tx} />,
      <MaterialsScene key="materials" isActive={activeIndex === 10} isRevealed={isRevealed(10)} tx={tx} />,
      <ParticipateScene key="participate" isActive={activeIndex === 11} isRevealed={isRevealed(11)} tx={tx} onRegister={openRegister} />,
      <HowScene key="how" isActive={activeIndex === 12} isRevealed={isRevealed(12)} tx={tx} onJourney={openJourney} onRegister={openRegister} />,
      <TeamScene key="team" isActive={activeIndex === 13} isRevealed={isRevealed(13)} tx={tx} />,
      <PartnersScene key="partners" isActive={activeIndex === 14} isRevealed={isRevealed(14)} tx={tx} onPartnerClick={openPartner} />,
      <FaqScene key="faqs" isActive={activeIndex === 15} isRevealed={isRevealed(15)} tx={tx} />,
      <ContactScene key="contact" isActive={activeIndex === 16} isRevealed={isRevealed(16)} tx={tx} onLogin={openLogin} onRegister={openRegister} />,
      ];
    },
    [activeIndex, openJourney, openLogin, openPartner, openRegister, sectionPresence, tx],
  );

  return (
    <div ref={storyRef} data-home-experience="desktop-story" className="relative bg-background" style={{ "--story-page-progress": "0%" } as CSSProperties}>
      <FixedHeroBackdrop visible={activeIndex === 0} />
      <StoryChrome
        activeIndex={activeIndex}
        lang={lang}
        langOpen={langOpen}
        setLang={setLang}
        setLangOpen={setLangOpen}
        tx={tx}
        onChapterClick={handleChapterClick}
      />
      <div className="relative z-10">
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
              data-story-section={chapter.key}
              data-story-active={isActive ? "true" : "false"}
              data-story-revealed={sectionPresence[index] ? "true" : "false"}
              className={cn(
                "isolate relative scroll-mt-0",
                chapter.key === "about"
                  ? "story-about-scroll-section h-[100svh] max-h-[100svh] overflow-hidden"
                  : "h-[100svh] max-h-[100svh] overflow-hidden",
              )}
            >
              {scene}
            </section>
          );
        })}
      </div>
    </div>
  );
}
