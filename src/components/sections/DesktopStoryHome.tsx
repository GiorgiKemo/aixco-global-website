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
  aixcoLiveImages,
  aixcoLiveLogos,
  aixcoLiveVideoPreviews,
  aixcoLiveVideos,
} from "@/lib/aixco-live-assets";
import { replaceLocationHash } from "@/lib/section-hash";
import { getSafePublicAssetHref } from "@/lib/security/urls";
import { scrollToHash, scrollToPageTop } from "@/lib/smooth-scroll";
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
    };

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

function StoryMediaPanel({
  isActive,
  media,
  priority = false,
}: {
  isActive: boolean;
  media: StoryMedia;
  priority?: boolean;
}) {
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
        className="!h-full !w-full !rounded-none !bg-foreground !shadow-none"
        videoClassName="h-full w-full"
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
      sizes="(min-width: 1280px) 58vw, 100vw"
      className="h-full w-full object-cover"
      style={{ objectPosition: media.position ?? "center" }}
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
        className="fixed bottom-0 left-0 top-0 z-40 hidden border-r border-foreground/10 bg-white px-7 pb-8 pt-8 text-foreground shadow-[18px_0_60px_-46px_rgba(0,0,0,0.42)] xl:block"
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
            <nav aria-label={tx("Story navigation")} className="grid gap-1.5">
              {storyChapters.map((chapter, index) => {
                const isActive = activeIndex === index;
                const href = chapter.id ? `#${chapter.id}` : "/";
                const labelClass = isActive ? "text-primary" : "text-foreground/78 hover:text-foreground";
                const lineClass = isActive ? "bg-primary" : "bg-foreground/20 group-hover:bg-foreground/45";

                return (
                  <a
                    key={chapter.key}
                    href={href}
                    onClick={(event) => onChapterClick(event, chapter)}
                    className={`group grid grid-cols-[1.6rem_minmax(0,1fr)] items-center gap-2 rounded-md px-1 py-1.5 text-left text-[0.76rem] font-medium leading-tight transition-colors ${labelClass}`}
                  >
                    <span className={`h-px transition-colors ${lineClass}`} />
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
}: {
  children: React.ReactNode;
  density?: "default" | "compact" | "dense";
}) {
  const copyRef = useRef<HTMLDivElement | null>(null);

  const densityClass =
    density === "dense"
      ? "gap-[clamp(0.38rem,0.75svh,0.62rem)]"
      : density === "compact"
        ? "gap-[clamp(0.45rem,0.9svh,0.72rem)]"
        : "gap-[clamp(0.55rem,1.15svh,0.9rem)]";

  useLayoutEffect(() => {
    const copy = copyRef.current;
    const column = copy?.parentElement;
    if (!copy || !column) return undefined;

    const fitCopy = () => {
      copy.style.removeProperty("zoom");
      copy.style.removeProperty("width");
      const available = column.clientHeight;
      const needed = copy.scrollHeight;
      if (needed <= available + 2) return;

      const rawZoom = (available - 2) / needed;
      const zoom = Math.max(0.88, Math.min(1, rawZoom));
      if (zoom < 0.985) {
        copy.style.setProperty("zoom", String(zoom));
        // Zoom shrinks layout width too — expand so scaled content still fills the column edge-to-edge.
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
  }, [children]);

  return (
    <div
      ref={copyRef}
      data-story-scene-copy
      className={`flex min-h-0 w-full min-w-0 max-w-none flex-1 flex-col items-stretch self-stretch justify-center overflow-hidden ${densityClass}`}
    >
      {children}
    </div>
  );
}

function SceneShell({
  children,
  media,
  priority,
  reverse = false,
  tone = "light",
  density = "default",
  isActive,
}: {
  children: React.ReactNode;
  media?: StoryMedia;
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
              reverse ? "xl:order-2 xl:col-span-8" : "xl:order-1 xl:col-span-8"
            }`}
          >
            <StorySceneBody density={density}>{children}</StorySceneBody>
          </div>

          <div
            data-story-scene-media
            className={`relative h-full min-h-0 overflow-hidden ${reverse ? "xl:order-1 xl:col-span-4" : "xl:order-2 xl:col-span-4"}`}
          >
            {media ? (
              <>
                <StoryMediaPanel media={media} isActive={isActive} priority={priority} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/28 via-transparent to-transparent" />
              </>
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
          <div className="max-w-[74rem]">
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
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryDubaiFundRow({ fund, tx }: { fund: DubaiFund; tx: (copy: string) => string }) {
  const details = fund.details.map(parseFundDetail);
  const headlineMetrics = details.filter((detail) => isHeadlineMetric(detail.label)).slice(0, 3);

  return (
    <div className="story-fund-row py-[clamp(0.65rem,1.1svh,0.95rem)] first:pt-0 last:pb-0">
      <h3 className="story-card-title">{tx(fund.name)}</h3>
      <div className="mt-2.5 grid w-full grid-cols-3 gap-x-4 gap-y-2">
        {headlineMetrics.map((detail) => {
          const metric = formatMetricValue(detail.value);
          return (
            <div key={`${detail.label}:${detail.value}`}>
              <p className="story-metric-label">{tx(detail.label)}</p>
              <p className="story-metric-value mt-1">
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
      media={{ kind: "image", src: aixcoLiveImages.aboutArchitecture, alt: tx("Batumi skyline and landmark towers") }}
      tone="light"
    >
      <p className="eyebrow story-eyebrow">{tx("About AIXCO")}</p>
      <h2 className="story-h2">{tx("AIXCO - Real Estate Platform")}</h2>
      <p className="story-body text-foreground/78">
        {tx("Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on Batumi, with a legacy track record in Switzerland and Dubai.")}
      </p>
      <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-[clamp(0.65rem,1.1svh,0.95rem)]">
        {metrics.slice(0, 4).map((metric) => (
          <div key={metric.label}>
            <dt className="story-metric-value">
              <CountUpText value={metric.value} />
            </dt>
            <dd className="story-metric-label mt-2">{tx(metric.label)}</dd>
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
      media={{ kind: "image", src: aixcoLiveImages.transactionBackdrop, alt: tx("AIXCO transaction backdrop"), position: "center" }}
      reverse
    >
      <p className="eyebrow story-eyebrow">{tx("Our journey")}</p>
      <h2 className="story-h2">{tx("From Switzerland to Dubai to Batumi")}</h2>
      <div className="grid w-full gap-[clamp(0.65rem,1.1svh,0.95rem)]">
        {legacyTimelineChapters.slice(0, 3).map((chapter, index) => (
          <div key={chapter.id} className="border-l-2 border-primary/35 pl-4">
            <p className="story-metric-label text-primary/80">{formatChapterNumber(index + 1)}</p>
            <h3 className="story-card-title mt-1">{tx(chapter.title)}</h3>
            <p className="story-body line-clamp-2 text-foreground/72">{tx(chapter.highlight)}</p>
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
      density="compact"
      reverse
      media={{
        kind: "video",
        src: media.src,
        previewSrc: media.previewSrc,
        poster: media.poster,
        title: tx(firstProperty.name),
      }}
    >
      <p className="eyebrow story-eyebrow">{tx("Batumi - Current opportunity")}</p>
      <h2 className="story-h2">{tx("Batumi")}</h2>
      <p className="story-body text-foreground/78">
        {tx("Opportunity-driven focus in Georgia - buy apartments with transparent euro pricing, strong rental potential, and full foreign ownership.")}
      </p>
      <div
        data-layout="story-batumi-benefits"
        className="grid w-full gap-x-6 gap-y-2 sm:grid-cols-2"
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
            className="group flex w-full items-center justify-between gap-4 py-3.5 transition-colors hover:text-primary"
          >
            <span className="min-w-0 flex-1">
              <span className="story-card-title block">{tx(property.name)}</span>
              <span className="story-body line-clamp-2 block text-foreground/62">
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
      media={{ kind: "image", src: aixcoLiveImages.batumiOtium, alt: tx("Otium Batumi project reference") }}
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
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3.5"
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
              <span className="story-body line-clamp-2 block text-foreground/64">{tx(route.body)}</span>
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
      density="compact"
      media={{ kind: "image", src: aixcoLiveImages.contact, alt: tx("AIXCO contact and office reference"), position: "center" }}
    >
      <p className="eyebrow story-eyebrow">{tx("Journeys")}</p>
      <h2 className="story-h2">{tx("How AIXCO Works")}</h2>
      <p className="story-body text-foreground/76">
        {tx("Choose the journey that fits your role. The process is structured, transparent, and digitally managed.")}
      </p>
      <div className="grid w-full gap-x-6 gap-y-[clamp(0.65rem,1.1svh,0.95rem)] sm:grid-cols-2">
        {journeys.map((journey, index) => (
          <button key={journey.role} type="button" onClick={() => onJourney(journey)} className="group text-left transition-colors hover:text-primary">
            <p className="story-metric-label text-primary/75">{tx(journey.tag ?? `Journey ${formatChapterNumber(index + 1)}`)}</p>
            <h3 className="story-card-title mt-1">{tx(journey.role)}</h3>
            <p className="story-body line-clamp-2 text-foreground/65">{tx(journey.summary)}</p>
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

  return (
    <SceneShell
      isActive={isActive}
      tone="surface"
      density="dense"
      media={{ kind: "image", src: teamImageMap[team[0].image as keyof typeof teamImageMap], alt: tx(team[0].name), position: "center top" }}
      reverse
    >
      <p className="eyebrow story-eyebrow">{tx("Team")}</p>
      <h2 className="story-h2">{tx("AIXCO leadership")}</h2>
      <div className="w-full divide-y divide-foreground/30">
        {team.map((member) => (
          <div key={member.name} className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0">
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
              <h3 className="story-card-title">{tx(member.name)}</h3>
              <p className="story-body font-medium text-primary">{tx(member.role)}</p>
              <p className="story-body line-clamp-1 text-foreground/64">{tx(member.summary)}</p>
            </div>
          </div>
        ))}
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
      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-[clamp(0.65rem,1.1svh,0.95rem)]">
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
  const highlightedFaqs = faqGroups.flatMap((group) => group.items.slice(0, 2).map((item) => ({ ...item, group: group.group }))).slice(0, 5);

  return (
    <SceneShell
      isActive={isActive}
      tone="surface"
      density="dense"
      reverse
      media={{ kind: "image", src: aixcoLiveImages.batumiGuru, alt: tx("Guru Batumi project reference"), position: "center" }}
    >
      <p className="eyebrow story-eyebrow">{tx("FAQs")}</p>
      <h2 className="story-h2">{tx("Frequently asked questions")}</h2>
      <div className="w-full divide-y divide-foreground/10 border-y border-foreground/10">
        {highlightedFaqs.map((item) => (
          <div key={`${item.group}-${item.q}`} className="py-3">
            <p className="story-metric-label text-primary/75">{tx(item.group)}</p>
            <h3 className="story-card-title mt-1">{tx(item.q)}</h3>
            <p className="story-body line-clamp-1 text-foreground/66">{tx(item.a)}</p>
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
      media={{ kind: "image", src: aixcoLiveImages.contact, alt: tx("AIXCO contact office reference"), position: "center" }}
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

    setProgress(nextProgress);
    setActiveIndex(nextActiveIndex);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.homeExperience = "story";
    syncProgress();

    const requestSync = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(syncProgress);
    };

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      delete document.documentElement.dataset.homeExperience;
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [syncProgress]);

  useEffect(() => {
    if (!window.location.hash) return undefined;

    const timers = chapterHashDelays.map((delay) =>
      window.setTimeout(() => {
        scrollToHash(window.location.hash, "auto");
        syncProgress();
      }, delay),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [syncProgress]);

  const handleChapterClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, chapter: StoryChapter) => {
      event.preventDefault();

      if (!chapter.id) {
        replaceLocationHash("");
        scrollToPageTop();
        return;
      }

      const hash = `#${chapter.id}`;
      replaceLocationHash(hash);
      scrollToHash(hash);
    },
    [],
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
