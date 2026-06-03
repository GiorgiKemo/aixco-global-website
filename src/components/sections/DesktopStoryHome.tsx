"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { CountUpText } from "@/components/CountUpText";
import { LiveVideo } from "@/components/LiveVideo";
import { useUI } from "@/components/ui-state";
import { legacyTimelineChapters } from "@/data/legacy-timeline";
import { materialDownloads } from "@/data/materials";
import { useSiteContent } from "@/data/site-content-context";
import { useI18n } from "@/i18n/I18nProvider";
import {
  aixcoHeroBackgroundVideo,
  aixcoLiveAssetDetails,
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
import { useTeamMemberRotation } from "@/hooks/use-team-member-rotation";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { AnimatePresence, motion } from "@/lib/framer-motion";
import { imageSettleTransition, reducedMotionTransition, revealTransition } from "@/lib/motion";
import {
  formatMetricValue,
  isHeadlineMetric,
  parseFundDetail,
  type DubaiFund,
} from "./dubai/dubai-data";
import { heroIntroText, heroPriceText } from "./hero/hero-ui";

type StoryChapterKey =
  | "hero"
  | "about"
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

type StoryMediaOverlay = "light" | "dark" | "contact";

const storyChapters: StoryChapter[] = [
  { key: "hero", label: "AIXCO" },
  { key: "about", id: "about", label: "About" },
  { key: "legacy", id: "legacy", label: "Legacy" },
  { key: "dubai", id: "dubai", label: "Dubai" },
  { key: "batumi", id: "batumi", label: "Batumi" },
  { key: "materials", id: "materials", label: "Materials" },
  { key: "participate", id: "participate", label: "Participate" },
  { key: "how", id: "how", label: "Journeys" },
  { key: "team", id: "team", label: "Team" },
  { key: "partners", id: "partners", label: "Partners" },
  { key: "faqs", id: "faqs", label: "FAQs" },
  { key: "contact", id: "contact", label: "Contact" },
];

const chapterHashDelays = [0, 90, 220, 480] as const;
const storySidebarWidth = "clamp(13.5rem,15vw,16rem)";

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
    poster: aixcoLiveImages.dubaiEdenHouse,
  },
  fundTwo: {
    src: aixcoLiveVideos.fundTwo,
    poster: aixcoLiveImages.dubaiHealthcare,
  },
} as const;

const propertyMediaMap = {
  guruBatumi: {
    src: aixcoLiveVideos.guruBatumi,
    previewSrc: aixcoLiveVideoPreviews.guruBatumi,
    poster: aixcoLiveImages.batumiGuru,
  },
  otium: {
    src: aixcoLiveVideos.otium,
    previewSrc: aixcoLiveVideoPreviews.otium,
    poster: aixcoLiveImages.batumiOtium,
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
        transition={shouldReduceMotion ? reducedMotionTransition : imageSettleTransition}
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
        smoothPreview={isActive}
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
      sizes="(min-width: 1280px) 42vw, 100vw"
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

  return (
    <div
      aria-hidden
      className="story-media-panel__gradient pointer-events-none absolute inset-0"
      style={{
        background: `linear-gradient(${direction}, hsl(var(--background) / 0.82) 0%, hsl(var(--background) / 0.22) 36%, transparent 100%), linear-gradient(180deg, transparent, hsl(var(--foreground) / 0.18))`,
      }}
    />
  );
}

function StoryChrome({
  activeIndex,
  onChapterClick,
  progress,
  tx,
}: {
  activeIndex: number;
  onChapterClick: (event: MouseEvent<HTMLAnchorElement>, chapter: StoryChapter) => void;
  progress: number;
  tx: (copy: string) => string;
}) {
  return (
    <>
      <aside
        className="fixed bottom-0 left-0 top-0 z-50 hidden border-r border-foreground/10 bg-white px-7 pb-8 pt-8 text-foreground shadow-[18px_0_60px_-46px_rgba(0,0,0,0.42)] xl:block"
        style={{ width: storySidebarWidth }}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            <a
              href="/"
              aria-label="AIXCO.GLOBAL home"
              onClick={(event) => onChapterClick(event, storyChapters[0])}
              className="mb-8 inline-flex min-h-12 items-center gap-3 text-foreground transition-colors hover:text-primary"
            >
              <img
                src={aixcoLiveLogos.aixcoMark}
                alt=""
                aria-hidden="true"
                className="h-auto w-11 object-contain [filter:brightness(0)_saturate(100%)]"
              />
              <span className="whitespace-nowrap text-sm font-semibold tracking-[-0.02em]">AIXCO.GLOBAL</span>
            </a>
            <nav aria-label={tx("Story navigation")} className="mt-10 grid gap-2">
              {storyChapters.map((chapter, index) => {
                const isActive = activeIndex === index;
                const href = chapter.id ? `#${chapter.id}` : "/";

                return (
                  <a
                    key={chapter.key}
                    href={href}
                    aria-current={isActive ? "true" : undefined}
                    data-active={isActive ? "true" : "false"}
                    onClick={(event) => onChapterClick(event, chapter)}
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
              <div className="h-px bg-primary transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </div>
      </aside>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-px bg-foreground/10">
        <div className="h-px bg-primary transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>
    </>
  );
}

function FixedHeroBackdrop({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-0 right-0 top-0 z-0 overflow-hidden bg-[#11100e] transition-opacity duration-700 ease-[var(--ease-apple)] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ left: storySidebarWidth }}
    >
      <video
        src={aixcoHeroBackgroundVideo.src}
        poster={aixcoHeroBackgroundVideo.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,14,0.78),rgba(17,16,14,0.30)_44%,rgba(17,16,14,0.70)),linear-gradient(180deg,rgba(17,16,14,0.26),rgba(17,16,14,0.78))]" />
    </div>
  );
}

function StorySceneBody({
  children,
  density = "default",
  isActive,
}: {
  children: React.ReactNode;
  density?: "default" | "compact" | "dense";
  isActive: boolean;
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

    const fitCopy = () => {
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
        copy.style.setProperty("width", `${100 / zoom}%`);
      }
    };

    const scheduleFit = () => window.requestAnimationFrame(fitCopy);
    const observer = new ResizeObserver(scheduleFit);

    observer.observe(copy);
    observer.observe(column);
    scheduleFit();
    window.addEventListener("resize", scheduleFit);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleFit);
      copy.style.removeProperty("zoom");
      copy.style.removeProperty("width");
    };
  }, [children, isActive]);

  return (
    <div
      ref={copyRef}
      data-story-scene-copy
      className="flex min-h-0 w-full min-w-0 max-w-none flex-1 flex-col items-stretch self-stretch justify-center overflow-hidden"
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
  mediaCrossfadeKey,
  mediaOverlay = "light",
  priority,
  reverse = false,
  tone = "light",
  density = "default",
  isActive,
}: {
  children: React.ReactNode;
  media?: StoryMedia;
  mediaCrossfadeKey?: string;
  mediaOverlay?: StoryMediaOverlay;
  priority?: boolean;
  reverse?: boolean;
  tone?: "light" | "dark" | "surface";
  density?: "default" | "compact" | "dense";
  isActive: boolean;
}) {
  const toneClass =
    tone === "dark"
      ? "bg-[#11100e] text-white"
      : tone === "surface"
        ? "bg-surface text-foreground"
        : "bg-background text-foreground";

  const resolvedOverlay: StoryMediaOverlay =
    mediaOverlay === "light" && tone === "dark" ? "contact" : mediaOverlay;

  return (
    <div className={`relative h-full min-h-0 ${toneClass}`}>
      <div
        className="grid h-full min-h-0"
        style={{ gridTemplateColumns: `${storySidebarWidth} minmax(0, 1fr)` }}
      >
        <div aria-hidden className="hidden xl:block" />
        <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-12">
          <div
            data-story-scene-column
            className={`relative z-10 flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-stretch justify-center overflow-hidden ${
              reverse ? "xl:order-2 xl:col-span-7" : "xl:order-1 xl:col-span-7"
            }`}
          >
            <StorySceneBody density={density} isActive={isActive}>
              {children}
            </StorySceneBody>
          </div>

          <div
            data-story-scene-media
            data-story-media-active={isActive ? "true" : "false"}
            className={`story-media-panel relative h-full min-h-0 overflow-hidden bg-foreground/5 ${
              reverse ? "xl:order-1 xl:col-span-5" : "xl:order-2 xl:col-span-5"
            }`}
          >
            {media ? (
              <StoryMediaReveal isActive={isActive} reverse={reverse} className="absolute inset-0">
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
      <div className="relative z-10 grid h-full min-h-0" style={{ gridTemplateColumns: `${storySidebarWidth} minmax(0, 1fr)` }}>
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
              className="mb-4 h-auto w-[clamp(5rem,8.5vw,8rem)] object-contain drop-shadow-[0_20px_34px_rgba(0,0,0,0.34)]"
            />
            <h1 className="max-w-[12ch] text-[clamp(5rem,10vw,10rem)] font-semibold leading-[0.82] tracking-normal text-white drop-shadow-[0_18px_42px_rgba(0,0,0,0.38)]">
              AIXCO<span className="text-primary-glow">.</span>Global
            </h1>
            <p className="mt-8 max-w-3xl text-[clamp(1.1rem,1.4vw,1.45rem)] leading-[1.55] text-white/86">
              {tx(heroIntroText)}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onRegister} className="btn-gold">
                {tx("Register")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <a href="#about" onClick={(event) => {
                event.preventDefault();
                replaceLocationHash("#about");
                scrollToHash("#about");
              }} className="btn-ghost-gold border-white/35 bg-white/12 text-white hover:bg-white/18 hover:text-white">
                {tx("Explore")}
              </a>
            </div>
            <p className="mt-8 max-w-3xl text-[clamp(1.65rem,2.4vw,2.6rem)] font-light uppercase leading-none text-white/85">
              {tx(heroPriceText)}
            </p>
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
      <div className="grid w-full grid-cols-3 gap-x-6 gap-y-[clamp(0.75rem,1.25svh,1rem)]">
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

function AboutScene({ isActive, tx }: { isActive: boolean; tx: (copy: string) => string }) {
  const { metrics } = useSiteContent();

  return (
    <SceneShell
      isActive={isActive}
      media={{
        kind: "video",
        src: aixcoLiveVideos.batumiOverview,
        previewSrc: aixcoLiveVideoPreviews.batumiOverview,
        poster: aixcoLiveImages.batumiOverviewPoster,
        title: tx("Batumi skyline and landmark towers"),
        position: "55% center",
      }}
      tone="light"
    >
      <p className="eyebrow story-eyebrow">{tx("About AIXCO")}</p>
      <h2 className="story-h2">{tx("AIXCO - Real Estate Platform")}</h2>
      <p className="story-body text-foreground/78">
        {tx("Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on Batumi, with a legacy track record in Switzerland and Dubai.")}
      </p>
      <dl data-layout="story-about-metrics" className="grid w-full grid-cols-2">
        {metrics.slice(0, 4).map((metric) => (
          <div key={metric.label}>
            <dt className="story-metric-value">
              <CountUpText value={metric.value} />
            </dt>
            <dd className="story-metric-label">{tx(metric.label)}</dd>
          </div>
        ))}
      </dl>
    </SceneShell>
  );
}

function LegacyScene({ isActive, tx }: { isActive: boolean; tx: (copy: string) => string }) {
  return (
    <SceneShell
      isActive={isActive}
      tone="surface"
      media={{
        kind: "image",
        src: aixcoLiveImages.transactionBackdrop,
        alt: tx("AIXCO transaction backdrop"),
        position: "42% center",
      }}
      reverse
    >
      <p className="eyebrow story-eyebrow">{tx("Our journey")}</p>
      <h2 className="story-h2">{tx("From Switzerland to Dubai to Batumi")}</h2>
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

function DubaiScene({ isActive, tx }: { isActive: boolean; tx: (copy: string) => string }) {
  const { dubaiFunds } = useSiteContent();
  const [landingFund, secondFund] = dubaiFunds;
  const media = dubaiVideoMap[landingFund.video as keyof typeof dubaiVideoMap];

  return (
    <SceneShell
      isActive={isActive}
      tone="light"
      media={{
        kind: "video",
        src: media.src,
        poster: media.poster,
        title: tx(landingFund.name),
        position: "center 38%",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Dubai - Legacy portfolio")}</p>
      <h2 className="story-h2">{tx("Our history in Dubai")}</h2>
      <p className="story-body text-foreground/78">
        {tx("Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.")}
      </p>
      <div data-layout="story-dubai-funds" className="w-full">
        {[landingFund, secondFund].filter(Boolean).map((fund) => (
          <StoryDubaiFundRow key={fund.id} fund={fund} tx={tx} />
        ))}
      </div>
    </SceneShell>
  );
}

function BatumiScene({ isActive, tx }: { isActive: boolean; tx: (copy: string) => string }) {
  const { batumiBenefits, batumiProperties } = useSiteContent();
  const [firstProperty, secondProperty] = batumiProperties;
  const media = propertyMediaMap[firstProperty.video as keyof typeof propertyMediaMap];

  return (
    <SceneShell
      isActive={isActive}
      tone="surface"
      reverse
      media={{
        kind: "video",
        src: media.src,
        previewSrc: media.previewSrc,
        poster: media.poster,
        title: tx(firstProperty.name),
        position: "center 42%",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Batumi - Current opportunity")}</p>
      <h2 className="story-h2">{tx("Batumi")}</h2>
      <p className="story-body text-foreground/78">
        {tx("Opportunity-driven focus in Georgia - buy apartments with transparent euro pricing, strong rental potential, and full foreign ownership.")}
      </p>
      <div
        data-layout="story-batumi-benefits"
        className="grid w-full gap-x-6 gap-y-3 sm:grid-cols-2"
      >
        {batumiBenefits.slice(0, 4).map((benefit) => (
          <div key={benefit} className="font-medium leading-snug text-foreground/80">
            {tx(benefit)}
          </div>
        ))}
      </div>
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

function MaterialsScene({ isActive, tx }: { isActive: boolean; tx: (copy: string) => string }) {
  return (
    <SceneShell
      isActive={isActive}
      tone="light"
      media={{
        kind: "image",
        src: aixcoLiveAssetDetails.otiumCatalog,
        alt: tx("Otium Batumi project reference"),
        position: "center 35%",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Client materials")}</p>
      <h2 className="story-h2">{tx("Materials & downloads")}</h2>
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

function ParticipateScene({ isActive, tx, onRegister }: { isActive: boolean; tx: (copy: string) => string; onRegister: () => void }) {
  const { participationRoutes } = useSiteContent();
  const [primaryRoute, ...remainingRoutes] = participationRoutes;
  const primaryMedia = participationVideoMap[primaryRoute.video as keyof typeof participationVideoMap];

  return (
    <SceneShell
      isActive={isActive}
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
        <span className="text-gold">{tx("How")}</span> {tx("Customers/Partners Work")}
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
  onJourney,
  onRegister,
  tx,
}: {
  isActive: boolean;
  onJourney: (journey: ReturnType<typeof useSiteContent>["journeys"][number]) => void;
  onRegister: () => void;
  tx: (copy: string) => string;
}) {
  const { journeys } = useSiteContent();

  return (
    <SceneShell
      isActive={isActive}
      tone="light"
      media={{
        kind: "image",
        src: aixcoLiveImages.aboutArchitecture,
        alt: tx("AIXCO contact and office reference"),
        position: "62% center",
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Journeys")}</p>
      <h2 className="story-h2">{tx("How AIXCO Works")}</h2>
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

function TeamScene({ isActive, tx }: { isActive: boolean; tx: (copy: string) => string }) {
  const { team } = useSiteContent();
  const { activeIndex, selectMember, pauseRotation, resumeRotation } = useTeamMemberRotation({
    memberCount: team.length,
    isActive,
  });
  const activeMember = team[activeIndex] ?? team[0];

  return (
    <SceneShell
      isActive={isActive}
      tone="surface"
      density="compact"
      media={{
        kind: "image",
        src: teamImageMap[activeMember.image as keyof typeof teamImageMap],
        alt: tx(activeMember.name),
        position: "center top",
      }}
      mediaCrossfadeKey={activeMember.image}
      reverse
    >
      <p className="eyebrow story-eyebrow">{tx("Team")}</p>
      <h2 className="story-h2">{tx("AIXCO leadership")}</h2>
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
              onMouseEnter={pauseRotation}
              onFocus={pauseRotation}
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

function PartnersScene({ isActive, tx }: { isActive: boolean; tx: (copy: string) => string }) {
  const { partners } = useSiteContent();
  const featuredPartners = partners.slice(0, 8);

  return (
    <SceneShell
      isActive={isActive}
      tone="light"
      media={{ kind: "image", src: aixcoLiveImages.dubaiHealthcare, alt: tx("Dubai Healthcare City legacy reference"), position: "center" }}
    >
      <p className="eyebrow story-eyebrow">{tx("Partners")}</p>
      <h2 className="story-h2">{tx("Group companies and strategic partners")}</h2>
      <div data-layout="story-partners-grid" className="grid w-full grid-cols-2">
        {featuredPartners.map((partner) => {
          const logo = aixcoLiveLogos[partner.logo as keyof typeof aixcoLiveLogos];

          return (
            <div key={partner.name} className="flex min-h-[4.75rem] flex-col justify-between">
              {logo ? (
                <Image src={logo} alt={tx(partner.name)} width={160} height={72} className="h-10 w-auto max-w-full object-contain object-left" />
              ) : (
                <Building2 className="h-7 w-7 text-primary" aria-hidden />
              )}
              <p className="story-card-title mt-2">{tx(partner.name)}</p>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
}

function FaqScene({ isActive, tx }: { isActive: boolean; tx: (copy: string) => string }) {
  const { faqGroups } = useSiteContent();
  const highlightedFaqs = faqGroups.flatMap((group) => group.items.slice(0, 2).map((item) => ({ ...item, group: group.group }))).slice(0, 4);

  return (
    <SceneShell
      isActive={isActive}
      tone="surface"
      density="compact"
      reverse
      media={{ kind: "image", src: aixcoLiveImages.batumiGuru, alt: tx("Guru Batumi project reference"), position: "center" }}
    >
      <p className="eyebrow story-eyebrow">{tx("FAQs")}</p>
      <h2 className="story-h2">{tx("Frequently asked questions")}</h2>
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
  isActive,
  onLogin,
  onRegister,
  tx,
}: {
  isActive: boolean;
  onLogin: () => void;
  onRegister: () => void;
  tx: (copy: string) => string;
}) {
  return (
    <SceneShell
      isActive={isActive}
      tone="dark"
      media={{
        kind: "image",
        src: aixcoLiveImages.contact,
        alt: tx("AIXCO contact office reference"),
        position: "48% center",
      }}
      mediaOverlay="contact"
    >
      <p className="eyebrow story-eyebrow text-primary-glow">{tx("Contact")}</p>
      <h2 className="story-h2 text-white">{tx("Start with AIXCO")}</h2>
      <p className="story-body text-white/76">
        {tx("Register for the correct customer, broker, property owner, or developer journey and the AIXCO team will follow up.")}
      </p>
      <div className="w-full divide-y divide-white/20">
        <a href="mailto:info@aixco.global" className="group flex w-full items-center gap-3 py-3.5 text-white transition-colors hover:text-primary-glow">
          <Mail className="h-5 w-5 text-primary-glow" aria-hidden />
          <span className="story-body text-white">info@aixco.global</span>
        </a>
        <div className="flex w-full items-center gap-3 py-3.5 text-white">
          <MapPin className="h-5 w-5 text-primary-glow" aria-hidden />
          <span className="story-body text-white">{tx("Grungasse 16, 1050 Wien, Austria")}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={onRegister} className="btn-gold">
          {tx("Register")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" onClick={onLogin} className="btn-ghost-gold border-white/28 bg-white/10 text-white hover:bg-white/16 hover:text-white">
          {tx("Login")}
        </button>
        <Link href="/aixco-philosophy" prefetch={false} className="btn-ghost-gold border-white/28 bg-white/10 text-white hover:bg-white/16 hover:text-white">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          {tx("Philosophy")}
        </Link>
      </div>
    </SceneShell>
  );
}

export function DesktopStoryHome() {
  const storyRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollFrameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { openJourney, openLogin, openRegister } = useUI();
  const { tx } = useI18n();

  useLayoutEffect(() => {
    const hiddenHeaders = new Map<HTMLElement, string>();
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

    document.body.classList.add("home-story-nav-hidden");
    document.body.classList.remove("home-desktop-story-boot");
    hideGlobalHeaders();

    const observer = new MutationObserver(hideGlobalHeaders);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.body.classList.remove("home-story-nav-hidden");
      hiddenHeaders.forEach((display, header) => {
        header.style.display = display;
        delete header.dataset.storyHiddenHeader;
      });
    };
  }, []);

  const syncProgress = useCallback(() => {
    scrollFrameRef.current = null;
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const scrollableDistance = Math.max(1, documentHeight - window.innerHeight);
    const nextProgress = clamp(window.scrollY / scrollableDistance, 0, 1);
    setProgress(nextProgress);
  }, []);

  const syncActiveChapter = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    let nextActiveIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    sectionRefs.current.forEach((section, index) => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        nextActiveIndex = index;
      }
    });

    setActiveIndex((current) => (current === nextActiveIndex ? current : nextActiveIndex));
  }, []);

  const requestScrollSync = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      syncProgress();
      syncActiveChapter();
    });
  }, [syncActiveChapter, syncProgress]);

  useEffect(() => {
    document.documentElement.dataset.homeExperience = "story";
    syncProgress();
    syncActiveChapter();

    window.addEventListener("scroll", requestScrollSync, { passive: true });
    window.addEventListener("resize", requestScrollSync);

    return () => {
      delete document.documentElement.dataset.homeExperience;
      window.removeEventListener("scroll", requestScrollSync);
      window.removeEventListener("resize", requestScrollSync);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [requestScrollSync, syncActiveChapter, syncProgress]);

  useLayoutEffect(() => {
    const sections = sectionRefs.current.filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length || typeof window.IntersectionObserver !== "function") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (!intersecting.length) return;

        const best = intersecting.reduce((winner, entry) =>
          entry.intersectionRatio > winner.intersectionRatio ? entry : winner,
        );
        const index = sections.indexOf(best.target as HTMLElement);
        if (index >= 0) {
          setActiveIndex((current) => (current === index ? current : index));
        }
      },
      { root: null, rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

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
    () => [
      <HeroScene key="hero" isActive={activeIndex === 0} tx={tx} onRegister={openRegister} />,
      <AboutScene key="about" isActive={activeIndex === 1} tx={tx} />,
      <LegacyScene key="legacy" isActive={activeIndex === 2} tx={tx} />,
      <DubaiScene key="dubai" isActive={activeIndex === 3} tx={tx} />,
      <BatumiScene key="batumi" isActive={activeIndex === 4} tx={tx} />,
      <MaterialsScene key="materials" isActive={activeIndex === 5} tx={tx} />,
      <ParticipateScene key="participate" isActive={activeIndex === 6} tx={tx} onRegister={openRegister} />,
      <HowScene key="how" isActive={activeIndex === 7} tx={tx} onJourney={openJourney} onRegister={openRegister} />,
      <TeamScene key="team" isActive={activeIndex === 8} tx={tx} />,
      <PartnersScene key="partners" isActive={activeIndex === 9} tx={tx} />,
      <FaqScene key="faqs" isActive={activeIndex === 10} tx={tx} />,
      <ContactScene key="contact" isActive={activeIndex === 11} tx={tx} onLogin={openLogin} onRegister={openRegister} />,
    ],
    [activeIndex, openJourney, openLogin, openRegister, tx],
  );

  return (
    <div ref={storyRef} data-home-experience="desktop-story" className="relative bg-background">
      <FixedHeroBackdrop visible={activeIndex === 0} />
      <StoryChrome activeIndex={activeIndex} progress={progress} tx={tx} onChapterClick={handleChapterClick} />
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
              className="isolate h-[100svh] max-h-[100svh] scroll-mt-0 overflow-hidden"
            >
              {scene}
            </section>
          );
        })}
      </div>
    </div>
  );
}
