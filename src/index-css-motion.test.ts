import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");
const appLayout = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");
const desktopStoryHome = readFileSync(resolve(process.cwd(), "src/components/sections/DesktopStoryHome.tsx"), "utf8");
const liveAssets = readFileSync(resolve(process.cwd(), "src/lib/aixco-live-assets.ts"), "utf8");

function cssBlock(selector: string) {
  const start = css.indexOf(`  ${selector} {`);
  expect(start, `${selector} block`).toBeGreaterThanOrEqual(0);
  const end = css.indexOf("\n  }", start);
  return css.slice(start, end);
}

describe("index.css motion rules", () => {
  it("keeps shared buttons on targeted, snappy transitions", () => {
    const gold = cssBlock(".btn-gold");
    const ghost = cssBlock(".btn-ghost-gold");

    expect(gold).not.toContain("transition-all");
    expect(gold).toContain("translate 180ms");
    expect(gold).toContain("box-shadow 180ms");
    expect(ghost).not.toContain("transition-all");
    expect(ghost).toContain("translate 180ms");
    expect(ghost).toContain("background-color 180ms");
  });

  it("animates individual translate hover properties instead of broad all transitions", () => {
    const dataPanel = cssBlock(".data-panel");
    const macCard = cssBlock(".mac-card");

    expect(dataPanel).toContain("translate 0.3s");
    expect(dataPanel).not.toContain("transition-all");
    expect(macCard).toContain("translate 0.3s");
    expect(macCard).not.toContain("transition-all");
  });

  it("keeps partner marquee hover responsive", () => {
    const partnerCard = cssBlock(".partner-marquee-item__card");

    expect(partnerCard).toContain("transform 260ms");
    expect(partnerCard).toContain("border-color 260ms");
    expect(partnerCard).toContain("box-shadow 260ms");
  });

  it("keeps partner marquee scrolling even when reduced motion is preferred", () => {
    expect(css).not.toMatch(/\.partner-marquee-track\s*\{[^}]*animation:\s*none/);
    expect(css).toContain("animation-duration: 52s !important");
  });

  it("keeps story letter reveals active even when the browser prefers reduced motion", () => {
    expect(desktopStoryHome).toContain('const isAnimating = animationState === "animating";');
    expect(desktopStoryHome).toContain('const hasPlayed = animationState === "played";');
    expect(desktopStoryHome).toContain('<span className="sr-only">{label}</span>');
    expect(desktopStoryHome).not.toContain("aria-label={label}");
    expect(css).not.toContain(".story-letter-reveal--active .story-letter-reveal__char {\n      opacity: 1 !important");
    expect(css).not.toContain(".story-letter-reveal--active .story-letter-reveal__text,\n    .story-letter-reveal--compact .story-letter-reveal__text");
  });

  it("starts the next-section About video while revealed so it is already moving on scroll entry", () => {
    expect(desktopStoryHome).toContain("src={isRevealed ? aixcoDubaiHeroVideo.src : undefined}");
    expect(desktopStoryHome).toContain('preload={isRevealed ? "auto" : "none"}');
    expect(desktopStoryHome).toContain("autoPlay={isRevealed}");
    expect(desktopStoryHome).toContain("if (!isRevealed) {");
    expect(desktopStoryHome).toContain("setVideoStarted(false);");
    expect(desktopStoryHome).not.toContain("if (!isActive) {\n      video.pause();\n      video.load();");
    expect(desktopStoryHome).toContain("if (isRevealed) {\n                    void event.currentTarget.play().catch(() => undefined);");
    expect(desktopStoryHome).toContain("onPlaying={markVideoStarted}");
    expect(desktopStoryHome).toContain('data-about-video-poster=""');
    expect(desktopStoryHome).toContain('data-video-started={videoStarted ? "true" : "false"}');
    expect(css).toContain("[data-story-section='about'] .story-about-cinematic-poster");
    expect(css).toContain(".story-about-cinematic-poster[data-video-started='true']");
    expect(css).toContain("transition: opacity 900ms var(--ease-apple)");
    expect(desktopStoryHome).toContain('video.removeAttribute("src");');
    expect(desktopStoryHome).toContain("function useHeroBackdropVideoSrc()");
    expect(desktopStoryHome).toContain("mediaQuery.matches ? aixcoHeroBackgroundVideo.mobileSrc : aixcoHeroBackgroundVideo.src");
    expect(desktopStoryHome).toContain("src={videoSrc}");
    expect(liveAssets).toContain("batumi-hero-landscape-mobile.mp4");
    expect(liveAssets).toContain("batumi-hero-landscape-poster-upscaled.webp");
    expect(liveAssets).toContain("aixco-group-dubai-hero-poster-ultra.webp");
  });

  it("uses a static Dubai image on the legacy Dubai page while keeping the hero video for About", () => {
    expect(liveAssets).toContain("dubaiBurjKhalifaSunset");
    expect(liveAssets).toContain("dubai-burj-khalifa-sunset-unsplash-original.webp");
    expect(desktopStoryHome).toContain("src: aixcoLiveImages.dubaiBurjKhalifaSunset");
    expect(desktopStoryHome).toContain('alt: tx("Burj Khalifa and Dubai skyline at sunset")');
    expect(desktopStoryHome).toContain('sizes: "(min-width: 1280px) 82vw, 100vw"');
    expect(desktopStoryHome).not.toContain('title: tx("Dubai legacy portfolio video")');
    expect(desktopStoryHome).toContain("src={isRevealed ? aixcoDubaiHeroVideo.src : undefined}");
  });

  it("requests high-density images for tall cropped story panels", () => {
    expect(desktopStoryHome).toContain('sizes: "(min-width: 1280px) 140vw, 100vw"');
    expect(desktopStoryHome).toContain('sizes: "(max-width: 767px) 170vw, 100vw"');
    expect(desktopStoryHome).toContain("src={aixcoLiveImages.batumiMosaicSunsetPanorama}");
    expect(desktopStoryHome).toContain("src={aixcoLiveImages.batumiSeafrontPoster}");
    expect(desktopStoryHome).toContain('sizes="(max-width: 1279px) 140vw, 1px"');
    expect(desktopStoryHome).toContain('sizes="(min-width: 1280px) 120vw, 1px"');
    expect(desktopStoryHome).toContain('sizes="(min-width: 1280px) 100vw, 100vw"');
    expect(desktopStoryHome).toContain("src={image.thumbnailSrc}");
    expect(desktopStoryHome).toContain('sizes="(min-width: 1280px) 9rem, 34vw"');
  });

  it("keeps partner modal logo panels opaque", () => {
    const partnerModalLogoStage = cssBlock(".partner-modal-logo-stage");

    expect(partnerModalLogoStage).toContain("linear-gradient(145deg, hsl(220 15% 40%), hsl(220 16% 25%))");
    expect(partnerModalLogoStage).not.toContain("hsl(220 15% 40% /");
    expect(partnerModalLogoStage).not.toContain("hsl(220 16% 25% /");
    expect(partnerModalLogoStage).not.toContain("backdrop-filter");
  });

  it("keeps hero safe-area support without tablet placement overrides", () => {
    expect(css).toMatch(/\[data-hero-shell=['"]true['"]\]/);
    expect(css).toContain("min-height: 100svh");
    expect(css).toContain("env(safe-area-inset-top, 0px)");
    expect(css).toContain("env(safe-area-inset-bottom, 0px)");
    expect(css).not.toContain("@media (max-height: 840px) and (min-width: 768px) and (max-width: 1180px)");
    expect(css).not.toContain("transform: translateY(-1rem) !important");
    expect(css).not.toContain("font-size: clamp(3.7rem, 8.4vw, 5.45rem) !important");
    expect(css).not.toContain("bottom: 2.75rem !important");
  });

  it("keeps the desktop hero scroll cue clear of the price lockup", () => {
    expect(css).toContain("@media (min-width: 1181px) and (min-height: 760px)");
    expect(css).toContain("bottom: clamp(0.75rem, 2svh, 1.5rem) !important");
    expect(css).toContain("height: 5.25rem !important");
    expect(css).toContain("height: 5rem !important");
  });

  it("keeps the full hero visible in compact landscape browser viewports", () => {
    expect(css).toContain("@media (orientation: landscape) and (max-height: 520px)");
    expect(css).toContain("height: 3.5rem !important");
    expect(css).toContain("height: 100svh");
    expect(css).toContain("align-items: flex-start !important");
    expect(css).toContain("font-size: clamp(2.05rem, 7.35vw, 3.8rem) !important");
    expect(css).toContain("bottom: max(0.15rem, env(safe-area-inset-bottom, 0px)) !important");
  });

  it("keeps the scroll cue clear in narrow iPad landscape windows", () => {
    expect(css).toContain("@media (min-width: 560px) and (max-width: 767px) and (max-height: 780px)");
    expect(css).toContain("height: 100svh");
    expect(css).toContain("bottom: max(0.25rem, env(safe-area-inset-bottom, 0px)) !important");
    expect(css).toContain("height: 2.4rem !important");
    expect(css).toContain("height: 2.25rem !important");
  });

  it("keeps the scroll cue visible on very short phone viewports", () => {
    expect(css).toContain("@media (max-width: 559px) and (max-height: 560px)");
    expect(css).toContain("bottom: max(0.5rem, env(safe-area-inset-bottom, 0px)) !important");
    expect(css).toContain("height: 2.75rem !important");
    expect(css).toContain("height: 2.55rem !important");
    expect(css).toContain("padding-bottom: max(4.85rem, env(safe-area-inset-bottom, 0px))");
    expect(css).toContain("font-size: clamp(2.08rem, 10.8vw, 2.75rem)");
    expect(css).toContain("min-height: 2.72rem");
  });

  it("keeps asset detail CTAs large enough for mobile touch targets", () => {
    const assetDetailCta = cssBlock(".asset-detail-cta");

    expect(assetDetailCta).toContain("min-height: 2.75rem");
    expect(assetDetailCta).toContain("padding-block: 0.75rem");
    expect(cssBlock(".asset-detail-cta__label")).toContain("overflow-wrap: anywhere");
  });
  it("loads the hero directly without the temporary black intro logo overlay", () => {
    expect(css).not.toContain(".story-hero-intro-loader");
    expect(css).not.toContain("story-hero-official-mark-in");
    expect(css).not.toContain("story-hero-wordmark-under-in");
    expect(liveAssets).toContain("AIXW.webp");
    expect(appLayout).toContain('href="/aixco-global-op2/images/AIXW.webp"');
    expect(appLayout).toContain('fetchPriority="high"');
    expect(appLayout).not.toContain("homeStoryBootScript");
    expect(desktopStoryHome).not.toContain("StoryHeroIntroLoader");
    expect(desktopStoryHome).not.toContain("useStoryHeroIntroGate");
    expect(desktopStoryHome).not.toContain("data-logo-ready");
  });

  it("keeps the original cinematic hero-to-about transition blend", () => {
    const heroAfter = cssBlock("[data-story-section='hero']::after");
    const aboutBefore = cssBlock("[data-story-section='about']::before");

    expect(desktopStoryHome).toContain("heroBackdropVisible");
    expect(desktopStoryHome).not.toContain("<FixedHeroBackdrop visible={activeIndex === 0}");
    expect(css).toContain("[data-story-section='about']::before");
    expect(heroAfter).toContain("height: clamp(7rem, 24svh, 18rem)");
    expect(heroAfter).toContain("rgb(17 16 14 / 0.36) 56%");
    expect(heroAfter).toContain("rgb(17 16 14) 100%");
    expect(aboutBefore).toContain("z-index: 4");
    expect(aboutBefore).toContain("height: clamp(6rem, 18svh, 13rem)");
    expect(aboutBefore).toContain("rgb(17 16 14) 0%");
    expect(aboutBefore).toContain("rgb(17 16 14 / 0.54) 42%");
  });

  it("keeps smooth transition blends below later story content", () => {
    const blendedSections = [
      "philosophy",
      "philosophyOrigins",
      "philosophyPlatform",
      "aboutObjectives",
      "aboutAccess",
      "legacy",
      "dubai",
      "batumi",
      "materials",
      "participate",
      "how",
      "team",
      "partners",
      "faqs",
    ];

    for (const section of blendedSections) {
      expect(css).toContain(`[data-story-section='${section}']`);
    }

    expect(css).toContain("[data-story-section]:not([data-story-section='hero']):not([data-story-section='about']) > div");
    expect(css).toContain("--story-section-blend-from: var(--story-section-bg)");
    expect(css).toContain("--story-section-blend-to: var(--story-section-bg)");
    expect(css).toContain("--story-section-blend-entry: clamp(4.6rem, 10svh, 7.25rem)");
    expect(css).toContain("color-mix(in srgb, var(--story-section-bg) 82%, var(--story-section-blend-from) 18%) 2.5rem");
    expect(css).toContain("color-mix(in srgb, var(--story-section-bg) 82%, var(--story-section-blend-to) 18%) calc(100% - 2.5rem)");
    expect(css).toContain("[data-story-section]:not([data-story-section='hero']):not([data-story-section='about']) [data-story-scene-media]");
    expect(css).toContain("mask-image: linear-gradient(\n      180deg,\n      transparent 0%,\n      rgb(0 0 0 / 0.64) 2.4rem");
    expect(css).not.toContain("[data-story-section='batumi']::before");
    expect(css).not.toContain("[data-story-section='batumi']::after");
    expect(css).not.toContain("[data-story-section='dubai']::after");
  });

  it("keeps the about-to-philosophy handoff dark and compact", () => {
    const aboutExit = cssBlock("[data-story-section='about']::after");
    const philosophyBlend = cssBlock("[data-story-section='philosophy']");

    expect(aboutExit).toContain("height: clamp(5.5rem, 15svh, 11rem)");
    expect(aboutExit).toContain("rgb(17 16 14 / 0.82) 78%");
    expect(aboutExit).toContain("rgb(17 16 14) 100%");
    expect(aboutExit).not.toContain("hsl(var(--surface)");
    expect(philosophyBlend).toContain("--story-section-blend-from: var(--story-tone-dark)");
    expect(philosophyBlend).toContain("--story-section-blend-to: var(--story-tone-surface)");
    expect(css).not.toContain("[data-story-section='philosophy']::before");
    expect(css).toContain("[data-story-section='philosophy'] [data-story-scene-column] {\n      padding-top: clamp(1.5rem, 3.5svh, 2.6rem);");
  });

  it("keeps phone hero and about sections compact enough for a demo viewport", () => {
    expect(css).toContain("@media (max-width: 559px)");
    expect(css).toContain("font-size: clamp(2.18rem, 11.2vw, 2.95rem) !important");
    expect(css).toContain("font-size: clamp(2.35rem, 12.4vw, 3.35rem)");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(css).toContain("width: min(100%, 21.5rem)");
    expect(css).toContain("font-size: clamp(0.72rem, 2.9vw, 0.86rem)");
    expect(css).toContain("justify-content: center");
    expect(css).toContain("[data-story-section='about'] .story-about-cinematic-copy");
    expect(css).toContain("padding: clamp(5.25rem, 9svh, 5.9rem) clamp(1.15rem, 5vw, 1.45rem)");
    expect(css).toContain("[data-story-section='about'] .story-about-cinematic-copy::before");
    expect(css).toContain("linear-gradient(180deg, rgb(17 16 14 / 0), rgb(17 16 14 / 0.72))");
    expect(css).toContain("[data-story-section='about'] dl");
    expect(css).toContain("gap: 0.65rem 0.7rem");
    expect(css).toContain("[data-story-section='dubai']\n      [data-story-scene-copy]\n      [data-layout='story-dubai-marquee']");
    expect(css).toContain("[data-story-section='dubai']\n      [data-story-scene-copy]\n      [data-layout='story-dubai-marquee']\n      .dubai-gallery-tile");
    expect(css).toContain("flex-basis: clamp(10.8rem, 47vw, 12.5rem)");
  });

  it("keeps dense story sections readable on short phone demo viewports", () => {
    expect(css).toContain("@media (max-width: 559px) and (max-height: 740px)");
    expect(css).toContain("[data-story-section='participate'] [data-layout='story-participation-routes'] button");
    expect(css).toContain("grid-template-columns: 2.1rem minmax(0, 1fr) auto");
    expect(css).toContain("[data-story-section='how'] [data-layout='story-journeys']");
    expect(css).toContain("[data-story-section='team'] [data-layout='story-team-list'] > button");
    expect(css).toContain("[data-story-section='contact'] .story-contact-card");
    expect(css).toContain("@media (min-width: 768px) and (max-width: 1023px)");
    expect(css).toContain("[data-story-section='philosophyPlatform'] .story-philosophy-panel");
    expect(css).toContain("min-height: auto");
  });
});
