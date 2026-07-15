import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8").replace(/\r\n/g, "\n");
}

const css = readSource("src/index.css");
const appLayout = readSource("src/app/layout.tsx");
const desktopStoryHome = readSource("src/components/sections/DesktopStoryHome.tsx");
const homeExperience = readSource("src/components/sections/HomeExperience.tsx");
const socialLinks = readSource("src/components/SocialLinks.tsx");
const liveAssets = readSource("src/lib/aixco-live-assets.ts");

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

  it("stops continuous marquees when reduced motion is preferred", () => {
    expect(css).toContain("--partner-marquee-duration: 58s;");
    expect(css).toContain(".partner-marquee-track {\n      animation: none !important;");
    expect(css).toContain(".partner-marquee--story .partner-marquee-track {\n      animation-play-state: paused !important;");
    expect(desktopStoryHome).toContain('aria-label={isPaused ? "Play background video" : "Pause background video"}');
  });

  it("shows story text without animation when the browser prefers reduced motion", () => {
    expect(desktopStoryHome).toContain('const isAnimating = animationState === "animating";');
    expect(desktopStoryHome).toContain('const hasPlayed = animationState === "played";');
    expect(desktopStoryHome).toContain("if (shouldReduceMotion) {");
    expect(desktopStoryHome).toContain('setAnimationState("played");');
    expect(desktopStoryHome).toContain('<span className="sr-only">{label}</span>');
    expect(desktopStoryHome).not.toContain("aria-label={label}");
    expect(css).toContain(".story-letter-reveal--active .story-letter-reveal__char,");
    expect(css).toContain("animation: none !important;");
  });

  it("uses the split-letter layer on phones so wrapped lines reveal in reading order", () => {
    expect(desktopStoryHome).toContain("mobileLabel?: string");
    expect(desktopStoryHome).toContain('mobileLabel={tx("ACQUIRE.PARTNER.CREATE VALUE.").replace(/\\./g, ".\\u200B")}');
    expect(desktopStoryHome).toContain(".split(/(\\s+|\\u200B)/u)");
    expect(desktopStoryHome).toContain("characters.length <= 14");
    expect(desktopStoryHome).toContain('"\\u200B"');
    expect(desktopStoryHome).toContain("!/[\\s\\u200B]/u.test(character)");
    expect(desktopStoryHome).toContain("Math.max(1900, letterCount * 30 + 980)");
    expect(desktopStoryHome).toContain('"--story-mobile-title-duration": `${animationDurationMs}ms`');
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain(".story-text-reveal__mobile-plain");
    expect(css).toContain("--story-char-step: 30ms;");
    expect(css).toContain(".story-text-reveal__mobile-plain {\n      display: none !important;");
    expect(css).toContain(".story-letter-reveal__text {\n      display: inline-block !important;");
    expect(css).toContain("animation-delay: calc(var(--story-char-index) * var(--story-char-step));");
    expect(css).not.toContain("animation: story-mobile-title-reveal");
    expect(css).not.toContain("@keyframes story-mobile-title-reveal");
  });

  it("keeps phone story sections compact enough for smooth reveal entry", () => {
    expect(css).toContain("[data-story-scene-copy] {\n      padding-top: clamp(4.85rem, 9svh, 5.55rem);");
    expect(css).toContain("font-size: clamp(2rem, 8.9vw, 2.48rem);");
    expect(css).toContain("[data-story-section='philosophy'] .story-philosophy-title {\n      max-width: min(100%, 13ch);");
  });

  it("keeps the mobile ownership copy inside its dark section", () => {
    expect(css).toContain("--story-mobile-access-exit-clearance: clamp(6rem, 12svh, 8.5rem);");
    expect(css).toContain(
      "[data-story-section]:not([data-story-section='hero']):not([data-story-section='about']):not([data-story-section='aboutAccess'])",
    );
    expect(css).toContain(
      "var(--story-mobile-access-exit-clearance) +\n          max(1.25rem, env(safe-area-inset-bottom, 0px))",
    );
  });

  it("blocks scrolled content behind the fixed mobile story header", () => {
    expect(desktopStoryHome).toContain("story-mobile-header fixed inset-x-0 top-0");
    expect(desktopStoryHome).toContain("story-mobile-header--light");
    expect(desktopStoryHome).toContain("story-mobile-header--dark");
    expect(css).toContain(".story-mobile-header::before");
    expect(css).toContain("height: calc(100% + clamp(1.5rem, 4svh, 2.8rem))");
    expect(css).toContain("backdrop-filter: blur(14px) saturate(128%)");
    expect(css).toContain("--story-mobile-header-bg-start: rgb(17 16 14 / 0.96);");
    expect(css).toContain("border-bottom-color: rgb(255 255 255 / 0.14) !important;");
    expect(css).not.toContain(".story-mobile-header--dark::before {\n    background: transparent !important;");
  });

  it("prevents automatic mobile hyphenation in story copy", () => {
    expect(css).toContain(".story-body,\n    .story-card-title,\n    .story-metric-label,\n    .story-batumi-benefit__label");
    expect(css).toContain("overflow-wrap: break-word");
    expect(css).toContain("hyphens: none");
  });

  it("renders metric symbols with a complete system font and no artificial spacing", () => {
    expect(desktopStoryHome).toContain('numericValue.split(/([.,])/u).filter(Boolean)');
    expect(desktopStoryHome).toContain('"story-philosophy-stat__punctuation"');
    expect(css).toContain(".story-philosophy-stat__punctuation,\n  .story-philosophy-stat__affix");
    expect(css).toContain("font-family: var(--font-legacy-display);");
    expect(css).toContain(".story-philosophy-stat__affix--prefix {\n    margin-right: 0;");
    expect(css).toContain(".story-philosophy-stat__affix--suffix {\n    margin-left: 0;");
  });

  it("registers the supplied AIXCO SVG icons for contact/social slots", () => {
    expect(liveAssets).toContain("AIXCO_icons-01.svg");
    expect(liveAssets).toContain("AIXCO_icons-02.svg");
    expect(liveAssets).toContain("AIXCO_icons-03.svg");
    expect(liveAssets).toContain("AIXCO_icons-04.svg");
    expect(liveAssets).toContain("AIXCO_icons-05.svg");
    expect(socialLinks).toContain("aixcoLiveIcons.website");
    expect(socialLinks).toContain("aixcoLiveIcons.linkedin");
    expect(socialLinks).toContain("aixcoLiveIcons.instagram");
    expect(socialLinks).toContain("aixcoLiveIcons.facebook");
    expect(desktopStoryHome).toContain("aixcoLiveIcons.email");
    expect(css).toContain(".story-contact-card__svg-icon");
  });

  it("keeps the email and address values on identical typography", () => {
    const sharedContactValueClass =
      'className="story-body story-glyph-safe min-w-0 text-foreground/82 [overflow-wrap:anywhere]"';

    expect(desktopStoryHome.split(sharedContactValueClass)).toHaveLength(3);
  });

  it("defers the About video until its section is active", () => {
    expect(desktopStoryHome).toContain("const shouldPrimeVideo = isActive && shouldReduceMotion !== true;");
    expect(desktopStoryHome).toContain("src={shouldPrimeVideo ? aixcoDubaiHeroVideo.src : undefined}");
    expect(desktopStoryHome).toContain('preload={shouldPrimeVideo ? "metadata" : "none"}');
    expect(desktopStoryHome).toContain("autoPlay={shouldPrimeVideo}");
    expect(desktopStoryHome).toContain("storyChapters.map((_, index) => index <= 1)");
    expect(desktopStoryHome).not.toContain("const shouldPrimeVideo = isRevealed || isActive;");
    expect(desktopStoryHome).toContain("if (!shouldPrimeVideo) {");
    expect(desktopStoryHome).toContain("setVideoStarted(false);");
    expect(desktopStoryHome).toContain("if (shouldPrimeVideo) {\n                    void event.currentTarget.play().catch(() => undefined);");
    expect(desktopStoryHome).toContain("onPlaying={markVideoStarted}");
    expect(desktopStoryHome).toContain('data-about-video-poster=""');
    expect(desktopStoryHome).toContain('data-video-started={videoStarted ? "true" : "false"}');
    expect(desktopStoryHome).toContain('fetchPriority="low"');
    expect(css).toContain("[data-story-section='about'] .story-about-cinematic-poster");
    expect(css).toContain(".story-about-cinematic-poster[data-video-started='true']");
    expect(css).toContain("transition: opacity 900ms var(--ease-apple)");
    expect(desktopStoryHome).toContain('video.removeAttribute("src");');
    expect(desktopStoryHome).toContain("function useHeroBackdropVideoSrc()");
    expect(desktopStoryHome).toContain("mediaQuery.matches ? aixcoHeroBackgroundVideo.mobileSrc : aixcoHeroBackgroundVideo.src");
    expect(desktopStoryHome).toContain("src={videoSrc}");
    expect(liveAssets).toContain("hero-02-mobile.mp4");
    expect(liveAssets).toContain("hero-02-poster.webp");
    expect(liveAssets).toContain("aixco-group-dubai-hero-poster-ultra.webp");
  });

  it("uses a static Dubai image on the legacy Dubai page while keeping the hero video for About", () => {
    expect(liveAssets).toContain("dubaiBurjKhalifaSunset");
    expect(liveAssets).toContain("dubai-burj-khalifa-sunset-unsplash-original.webp");
    expect(desktopStoryHome).toContain("src: aixcoLiveImages.dubaiBurjKhalifaSunset");
    expect(desktopStoryHome).toContain('alt: tx("Burj Khalifa and Dubai skyline at sunset")');
    expect(desktopStoryHome).toContain('sizes: "(min-width: 1280px) 82vw, 100vw"');
    expect(desktopStoryHome).not.toContain('title: tx("Dubai legacy portfolio video")');
    expect(desktopStoryHome).toContain("src={shouldPrimeVideo ? aixcoDubaiHeroVideo.src : undefined}");
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
    expect(desktopStoryHome).toContain('sizes="(min-width: 1280px) 144px, 34vw"');
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
    expect(liveAssets).toContain("AIXW-transparent.webp");
    expect(liveAssets).toContain("aixco-group-dubai-hero.mp4");
    expect(homeExperience).toContain("aixcoLiveLogos.aixcoHorizontalLight");
    expect(appLayout).not.toContain('href="/aixco-global-op2/videos/aixco-group-dubai-hero.mp4"');
    expect(appLayout).not.toContain('as="video"');
    expect(homeExperience).toContain('fetchPriority="high"');
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
    expect(heroAfter).toContain("height: clamp(8rem, 20svh, 15rem)");
    expect(heroAfter).toContain("rgb(17 16 14 / 0.38) 72%");
    expect(heroAfter).toContain("rgb(17 16 14 / 0.16) 100%");
    expect(aboutBefore).toContain("z-index: 4");
    expect(aboutBefore).toContain("height: clamp(7rem, 16svh, 12rem)");
    expect(aboutBefore).toContain("rgb(17 16 14 / 0.58) 0%");
    expect(aboutBefore).toContain("rgb(17 16 14 / 0.28) 42%");
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
    expect(css).toContain("--story-section-blend-entry: clamp(8rem, 17svh, 12.5rem)");
    expect(css).toContain("--story-section-blend-soft: clamp(4.25rem, 8.8svh, 6.5rem)");
    expect(css).toContain("color-mix(in oklab, var(--story-section-blend-from) 88%, var(--story-section-bg) 12%) var(--story-section-blend-edge)");
    expect(css).toContain("color-mix(in oklab, var(--story-section-blend-from) 42%, var(--story-section-bg) 58%) var(--story-section-blend-soft)");
    expect(css).toContain("color-mix(in oklab, var(--story-section-blend-to) 42%, var(--story-section-bg) 58%) calc(100% - var(--story-section-blend-soft))");
    expect(css).not.toContain("color-mix(in srgb, var(--story-section-bg) 82%, var(--story-section-blend-from) 18%) 2.5rem");
    expect(css).toContain("[data-story-section]:not([data-story-section='hero']):not([data-story-section='about']) [data-story-scene-media]");
    expect(css).toContain("-webkit-mask-image: none;");
    expect(css).toContain("mask-image: none;");
    expect(css).not.toContain("rgb(0 0 0 / 0.76) var(--story-section-blend-soft)");
    expect(css).not.toContain("black var(--story-section-blend-entry)");
    expect(css).not.toContain("[data-story-section='batumi']::before");
    expect(css).not.toContain("[data-story-section='batumi']::after");
    expect(css).not.toContain("[data-story-section='dubai']::after");
  });

  it("keeps shared story media visible below the desktop breakpoint", () => {
    expect(desktopStoryHome).toContain("data-story-scene-grid");
    expect(css).not.toContain("[data-story-scene-media] {\n      display: none;");
    expect(css).toContain("[data-story-scene-media] {\n      display: block;");
    expect(css).toContain("min-height: clamp(16rem, 42svh, 24rem)");
    expect(css).toContain("height: clamp(16rem, 42svh, 24rem)");
    expect(css).toContain("[data-story-scene-grid] {\n        grid-template-columns: minmax(0, 0.96fr) minmax(18rem, 0.74fr);");
    expect(css).toContain("[data-story-scene-media] {\n        min-height: 100svh;");
  });

  it("keeps the client approach eyebrow readable over the access image", () => {
    const eyebrow = cssBlock(".story-about-access-eyebrow");
    const eyebrowLine = cssBlock(".story-about-access-eyebrow::before");

    expect(desktopStoryHome).toContain("story-about-access-eyebrow");
    expect(desktopStoryHome).not.toContain('story-eyebrow text-white/78">{tx("Client approach")}');
    expect(eyebrow).toContain("color: rgb(255 255 255 / 0.94)");
    expect(eyebrow).toContain("text-shadow:");
    expect(eyebrowLine).toContain("background: rgb(255 255 255 / 0.76)");
    expect(eyebrowLine).toContain("box-shadow: 0 1px 8px");
  });

  it("keeps the legacy journey eyebrow readable over the surface blend", () => {
    const eyebrow = cssBlock(".story-legacy-eyebrow");
    const eyebrowLine = cssBlock(".story-legacy-eyebrow::before");
    const legacyInner = cssBlock("[data-story-section='legacy'] > div:not(.story-section-boundary)");

    expect(desktopStoryHome).toContain("story-legacy-eyebrow");
    expect(desktopStoryHome).not.toContain('className="eyebrow story-eyebrow">{tx("Our journey")}');
    expect(legacyInner).toContain("z-index: 25");
    expect(eyebrow).toContain("color: hsl(var(--foreground) / 0.94)");
    expect(eyebrow).toContain("position: relative");
    expect(eyebrow).toContain("z-index: 26");
    expect(eyebrow).toContain("text-shadow: 0 1px 0");
    expect(eyebrowLine).toContain("background: hsl(var(--foreground) / 0.62)");
  });

  it("keeps the desktop legacy image edge filled under its side blend", () => {
    const legacyMedia = cssBlock("[data-story-section='legacy'] [data-story-scene-media]");

    expect(legacyMedia).toContain("overflow: hidden");
    expect(css).toContain("[data-story-section='legacy'] [data-story-scene-media] .story-media-panel__stage {\n    width: calc(100% + var(--story-legacy-side-overlap));\n    max-width: none;");
    expect(css).toContain("inset-block: -1px;\n    inset-inline-start: auto;\n    inset-inline-end: 0;");
    expect(css).toContain("width: var(--story-legacy-side-blend)");
    expect(css).toContain("filter: blur(2px)");
    expect(css).not.toContain("inset-inline-end: calc(var(--story-legacy-side-overlap) * -1)");
    expect(css).not.toContain("rgb(220 232 234 / 0.06)");
  });

  it("softens the objectives-to-access handoff without letting prior text bleed through", () => {
    const accessMask = cssBlock("[data-story-section='aboutAccess'] > div:not(.story-section-boundary)");
    const objectivesPreview = cssBlock(".story-objectives-access-preview");
    const accessVeil = cssBlock(".story-about-access-stage::before");
    const objectivesBoundary = cssBlock("[data-story-section='aboutObjectives'] .story-section-boundary");

    expect(css).toContain("[data-story-section='aboutAccess'] {\n    margin-top: calc(clamp(9rem, 18svh, 12rem) * -1);");
    expect(accessMask).toContain("-webkit-mask-image: linear-gradient(");
    expect(accessMask).toContain("transparent 0%");
    expect(accessMask).toContain("rgb(0 0 0 / 0.68) clamp(6.25rem, 12svh, 8rem)");
    expect(accessMask).toContain("#000 clamp(10rem, 18svh, 12rem)");
    expect(objectivesPreview).toContain("display: none");
    expect(objectivesPreview).toContain("height: clamp(16rem, 34svh, 25rem)");
    expect(objectivesBoundary).toContain("display: block");
    expect(objectivesBoundary).toContain("rgb(232 213 183 / 0.72) 34%");
    expect(objectivesBoundary).toContain("rgb(44 33 25 / 0.42) 76%");
    expect(objectivesBoundary).toContain("filter: blur(22px)");
    expect(accessVeil).toContain("display: block");
    expect(accessVeil).toContain("height: clamp(11rem, 26svh, 17rem)");
    expect(accessVeil).toContain("hsl(var(--surface) / 0.22) 0%");
    expect(accessVeil).toContain("rgb(206 139 52 / 0.2) 38%");
    expect(accessVeil).toContain("backdrop-filter: none");
    expect(accessVeil).toContain("filter: none");
    expect(accessVeil).not.toContain("display: none");
  });

  it("blends the access-to-legacy handoff with a real overlap and surface wash", () => {
    const accessExit = cssBlock(".story-about-access-stage::after");
    const legacyTopVeil = cssBlock("[data-story-section='legacy']::before");

    expect(css).toContain("margin-top: calc(clamp(6rem, 12svh, 8.5rem) * -1)");
    expect(css).toContain("--story-section-blend-exit: clamp(9rem, 18svh, 12.5rem)");
    expect(css).toContain("--story-boundary-height: clamp(11rem, 22svh, 15.5rem)");
    expect(css).toContain("--story-boundary-overlap: clamp(5.6rem, 11svh, 8.25rem)");
    expect(css).toContain("[data-story-section='aboutAccess'] .story-section-boundary {\n    display: block;");
    expect(css).toContain("background: var(--story-boundary-gradient)");
    expect(desktopStoryHome).toContain("story-about-access-atmosphere");
    expect(css).toContain("[data-story-section='aboutAccess'] .story-about-access-atmosphere");
    expect(css).toContain("rgb(0 0 0 / 0.82) calc(100% - clamp(7rem, 13svh, 9rem))");
    expect(accessExit).toContain("height: clamp(11rem, 22svh, 15rem)");
    expect(accessExit).toContain("hsl(var(--surface) / 0.68) 76%");
    expect(accessExit).toContain("hsl(var(--surface) / 0.88) 100%");
    expect(accessExit).toContain("filter: blur(9px)");
    expect(legacyTopVeil).toContain("top: calc(clamp(5.5rem, 10svh, 7.5rem) * -1)");
    expect(legacyTopVeil).toContain("height: clamp(16rem, 32svh, 22rem)");
    expect(legacyTopVeil).toContain("rgb(17 16 14 / 0) 0%");
    expect(legacyTopVeil).toContain("hsl(var(--surface) / 0.74) 58%");
    expect(legacyTopVeil).toContain("filter: blur(12px)");
    expect(css).toContain("rgb(0 0 0 / 0.7) clamp(5.8rem, 11svh, 7.7rem)");
    expect(css).toContain("#000 clamp(8.5rem, 16svh, 11rem)");
  });

  it("blends the about-to-philosophy handoff through the outgoing video instead of a dark stripe", () => {
    const aboutExit = cssBlock("[data-story-section='about'] .story-about-cinematic-stage::after");
    const philosophyBlend = cssBlock("[data-story-section='philosophy']");
    const philosophyCover = cssBlock("[data-story-section='philosophy'] > div::before");

    expect(aboutExit).toContain("content: \"\"");
    expect(aboutExit).toContain("bottom: -1px");
    expect(aboutExit).toContain("height: calc(clamp(1.75rem, 4svh, 3rem) + 2px)");
    expect(aboutExit).toContain("hsl(var(--surface) / 0) 0%");
    expect(aboutExit).toContain("hsl(var(--surface) / 0.34) 68%");
    expect(aboutExit).toContain("hsl(var(--surface) / 0.82) 100%");
    expect(philosophyBlend).toContain("--story-section-blend-from: var(--story-tone-surface)");
    expect(philosophyBlend).toContain("--story-section-blend-to: var(--story-tone-surface)");
    expect(philosophyBlend).toContain("--story-section-cover-overlap: 0rem");
    expect(philosophyBlend).toContain("--story-section-blend-entry: clamp(2.5rem, 5.5svh, 4rem)");
    expect(philosophyCover).toContain("display: none");
    expect(philosophyCover).toContain("top: calc((var(--story-section-cover-overlap) * -1) - 1px)");
    expect(philosophyCover).toContain("height: calc(var(--story-section-cover-overlap) + 2px)");
    expect(philosophyCover).toContain("hsl(var(--surface) / 0.36) 46%");
    expect(philosophyCover).toContain("hsl(var(--surface) / 0.78) 78%");
    expect(philosophyCover).toContain("pointer-events: none");
    expect(css).not.toContain("[data-story-section='philosophy']::before");
    expect(css).toContain("[data-story-section='philosophy'] [data-story-scene-column] {\n      padding-top: clamp(1.5rem, 3.5svh, 2.6rem);");
  });

  it("keeps phone hero and about sections compact enough for a demo viewport", () => {
    expect(css).toContain("@media (max-width: 559px)");
    expect(css).toContain("font-size: clamp(2.18rem, 11.2vw, 2.95rem) !important");
    expect(css).toContain("font-size: clamp(2.05rem, 10.5vw, 3.05rem)");
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
    expect(css).toContain("[data-story-section='dubai']\n      [data-story-scene-copy]\n      [data-layout='story-dubai-marquee']\n      .dubai-image-marquee-set");
    expect(css).toContain("grid-auto-columns: clamp(10.8rem, 47vw, 12.5rem)");
  });

  it("sizes Dubai marquee loops from fixed tracks instead of image intrinsic widths", () => {
    expect(css).toContain(".dubai-image-marquee-set {\n    display: grid;");
    expect(css).toContain("grid-auto-flow: column");
    expect(css).toContain("grid-auto-columns: clamp(17rem, 34vw, 30rem)");
    expect(css).toContain(".dubai-gallery-tile {\n    width: 100%;\n    min-width: 0;");
  });

  it("keeps the complete portrait Dubai skyline visible on phones", () => {
    expect(css).toContain("[data-story-section='dubai'] [data-story-scene-media] {\n    height: auto !important;\n    min-height: 0 !important;\n    aspect-ratio: 2850 / 4032;");
    expect(css).toContain("[data-story-section='dubai'] .story-media-panel__image {\n    object-position: center top !important;");
  });

  it("keeps standard mobile section handoffs compact without stacked top padding", () => {
    expect(css).toContain("padding: clamp(1.75rem, 5vw, 2.25rem) var(--story-mobile-gutter)\n      var(--story-mobile-section-bottom) !important;");
    expect(css).toContain("[data-story-section]:not([data-story-section='hero']):not([data-story-section='about']):not([data-story-section='aboutAccess'])\n    [data-story-scene-copy] {\n    padding-top: 0 !important;");
    expect(css).toContain("[data-story-section='dubai'] [data-story-scene-column] {\n    padding-top: clamp(1.75rem, 5vw, 2.25rem) !important;");
    expect(css).toContain("[data-story-section='contact'] .container-x {\n    padding: clamp(1.75rem, 5vw, 2.25rem) var(--story-mobile-gutter)");
  });

  it("loops journey cards infinitely on phones while preserving the desktop grid", () => {
    expect(desktopStoryHome).toContain('className="story-journeys-track"');
    expect(desktopStoryHome).toContain('data-journey-set={setIndex === 0 ? "primary" : "duplicate"}');
    expect(desktopStoryHome).toContain("tabIndex={setIndex === 1 ? -1 : undefined}");
    expect(css).toContain("@keyframes story-mobile-journeys-loop");
    expect(css).toContain("animation: story-mobile-journeys-loop 32s linear infinite");
    expect(css).toContain(".story-journeys-set[data-journey-set='duplicate'] {\n  display: none;");
    expect(css).toContain("[data-story-section='how'] .story-journeys-set[data-journey-set='duplicate'] {\n    display: flex;");
    expect(css).not.toContain("@media (max-width: 767px) and (prefers-reduced-motion: reduce)");
    expect(css).not.toContain("[data-story-section='how'] .story-journeys-track {\n    animation: none;");
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
