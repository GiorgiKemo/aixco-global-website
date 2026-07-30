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
const partnerMarquee = readSource("src/components/partners/PartnerMarquee.tsx");
const dubaiImageMarquee = readSource("src/components/sections/dubai/DubaiImageMarquee.tsx");
const socialLinks = readSource("src/components/SocialLinks.tsx");
const liveAssets = readSource("src/lib/aixco-live-assets.ts");
const tailwindConfig = readSource("tailwind.config.ts");
const germanTranslationFixes = readSource("src/i18n/german-translation-fixes.ts");
const propertyPage = readSource("src/app/aixco-global-op2/[slug]/page.tsx");

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

  it("keeps partner marquees continuously looping without hover or focus stalls", () => {
    expect(css).toContain("--partner-marquee-duration: 58s;");
    expect(css).toContain("animation: partner-marquee var(--partner-marquee-duration) linear infinite;");
    expect(css).not.toContain(".partner-marquee:hover .partner-marquee-track");
    expect(css).not.toContain(".partner-marquee:focus-within .partner-marquee-track");
    expect(css).not.toContain(".partner-marquee-track {\n      animation: none !important;");
    expect(partnerMarquee).toContain("{[0, 1].map((setIndex) => (");
    expect(desktopStoryHome).not.toContain('data-hero-motion-control="true"');
    expect(desktopStoryHome).not.toContain('aria-label={tx(isPaused ? "Play background video" : "Pause background video")}');
    expect(desktopStoryHome).not.toContain("aria-pressed={isPaused}");
    expect(desktopStoryHome).toContain("const [shouldRenderVideo, setShouldRenderVideo] = useState(false);");
    expect(desktopStoryHome).toContain("shouldRenderVideo && canAnimate && videoSrc");
    expect(desktopStoryHome).not.toContain("fixed bottom-20 end-4 z-30 inline-flex min-h-11 items-center gap-2");
  });

  it("keeps the current-project gallery slow, seamless, and draggable in both pointer modes", () => {
    const projectCarousel = cssBlock(".story-batumi-gallery__carousel");

    expect(projectCarousel).toContain("cursor: grab;");
    expect(projectCarousel).toContain("touch-action: pan-y pinch-zoom;");
    expect(projectCarousel).toContain("contain: layout paint style;");
    expect(cssBlock(".story-batumi-gallery__track")).toContain("will-change: transform;");
    expect(cssBlock(".story-batumi-gallery__track")).toContain("backface-visibility: hidden;");
    expect(css).not.toContain("animation: story-batumi-gallery-loop");
    expect(desktopStoryHome).toContain("elapsed * 0.014");
    expect(desktopStoryHome).toContain("[...galleryImages, ...galleryImages, ...galleryImages]");
    expect(desktopStoryHome).toContain("track.style.transform = `translate3d(${-position}px, 0, 0)`;");
    expect(desktopStoryHome).toContain("onPointerDown={handleCarouselPointerDown}");
    expect(desktopStoryHome).toContain("onPointerMove={handleCarouselPointerMove}");
    expect(desktopStoryHome).toContain("onPointerUp={finishCarouselDrag}");
    expect(desktopStoryHome).toContain("performance.now() + 1600");
    expect(desktopStoryHome).toContain("if (!dragState.moved) return;");
    expect(desktopStoryHome).toContain("onPointerEnter={pauseCarouselInteraction}");
    expect(desktopStoryHome).toContain("onPointerLeave={resumeCarouselInteraction}");
    expect(desktopStoryHome).toContain("onFocus={pauseCarouselInteraction}");
    expect(desktopStoryHome).toContain("performance.now() + 600");
    expect(desktopStoryHome).toContain('data-gallery-image-key={image.key}');
    expect(desktopStoryHome).toContain('data-gallery-copy={isMirroredImage ? "mirrored" : "primary"}');

    const pointerDownBlock = desktopStoryHome.slice(
      desktopStoryHome.indexOf("const handleCarouselPointerDown"),
      desktopStoryHome.indexOf("const handleCarouselPointerMove"),
    );
    const pointerMoveBlock = desktopStoryHome.slice(
      desktopStoryHome.indexOf("const handleCarouselPointerMove"),
      desktopStoryHome.indexOf("const finishCarouselDrag"),
    );
    expect(pointerDownBlock).not.toContain("setPointerCapture");
    expect(pointerMoveBlock).toContain("setPointerCapture");
  });

  it("does not render pause or resume controls for automatic website motion", () => {
    expect(desktopStoryHome).not.toContain('data-hero-motion-control="true"');
    expect(partnerMarquee).not.toContain("partner-marquee-motion-toggle");
    expect(partnerMarquee).not.toContain("Pause partner movement");
    expect(dubaiImageMarquee).not.toContain("dubai-image-marquee__motion-toggle");
    expect(dubaiImageMarquee).not.toContain("Pause gallery movement");
    expect(css).not.toContain(".partner-marquee-motion-toggle");
    expect(css).not.toContain(".dubai-image-marquee__motion-toggle");
  });

  it("shows story text without animation when the browser prefers reduced motion", () => {
    expect(desktopStoryHome).toContain('const isAnimating = animationState === "animating";');
    expect(desktopStoryHome).toContain('const hasPlayed = animationState === "played";');
    expect(desktopStoryHome).toContain("if (shouldReduceMotion) {");
    expect(desktopStoryHome).toContain('setAnimationState("played");');
    expect(desktopStoryHome).toContain('<span className="sr-only">{label}</span>');
    expect(desktopStoryHome).not.toContain("aria-label={label}");
    expect(css).toContain(".story-title-reveal--pending .story-title-reveal__text,");
    expect(css).toContain(".story-title-reveal--active .story-title-reveal__text,");
    expect(css).toContain("animation: none !important;");
  });

  it("uses one compositor-only whole-title reveal on every viewport", () => {
    const titleKeyframesStart = css.indexOf("@keyframes story-title-reveal");
    const titleKeyframesEnd = css.indexOf("html:is([lang='ka'], [lang='ar']) .story-title-reveal", titleKeyframesStart);
    const titleKeyframes = css.slice(titleKeyframesStart, titleKeyframesEnd);

    expect(desktopStoryHome).toContain("mobileLabel?: string");
    expect(desktopStoryHome).toContain('mobileLabel={tx("ACQUIRE.PARTNER.CREATE VALUE.").replace(/\\./g, ".\\u200B")}');
    expect(desktopStoryHome).toContain('data-text-reveal-engine="scroll-linked-with-observer-fallback"');
    expect(desktopStoryHome).toContain('className="story-title-reveal__text"');
    expect(desktopStoryHome).not.toContain("story-letter-reveal__char");
    expect(desktopStoryHome).not.toContain("story-letter-reveal--compact");
    expect(css).toContain("@keyframes story-title-reveal");
    expect(css).toContain("animation: story-title-reveal var(--story-title-reveal-duration, 1700ms)");
    expect(css).toContain("cubic-bezier(0.4, 0, 0.2, 1) both;");
    expect(css).toContain(".story-title-reveal--pending .story-title-reveal__text {");
    expect(css).toContain("transform: translate3d(0, 0.36em, 0);");
    expect(css).toContain("animation-timeline: view(block);");
    expect(css).toContain("animation-range: entry 0% cover 42%;");
    expect(css).toContain(".story-title-reveal[data-text-reveal-state='scroll-linked']");
    expect(css).toContain("@keyframes story-title-scroll-reveal");
    expect(desktopStoryHome).toContain("story-objectives-stage relative flex min-h-[100svh] items-center overflow-clip");
    expect(desktopStoryHome).toContain("story-about-access-stage relative min-h-[100svh] overflow-clip");
    expect(css).toContain("overflow: clip;");
    expect(css).toContain("will-change: opacity, transform;");
    expect(titleKeyframesStart).toBeGreaterThanOrEqual(0);
    expect(titleKeyframes).not.toContain("filter:");
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
    expect(desktopStoryHome).toContain('isHeaderTransparent && "story-mobile-header--transparent"');
    expect(css).toContain(".story-mobile-header::before");
    expect(css).toContain("height: calc(100% + clamp(1.5rem, 4svh, 2.8rem))");
    expect(css).toContain("backdrop-filter: blur(14px) saturate(128%)");
    expect(css).toContain("--story-mobile-header-bg-start: rgb(17 16 14 / 0.96);");
    expect(css).toContain("border-bottom-color: rgb(255 255 255 / 0.14) !important;");
    expect(css).toContain(".story-mobile-header.story-mobile-header--transparent");
    expect(css).toContain("background: transparent !important;");
    expect(css).toContain(".story-mobile-header.story-mobile-header--transparent::before");
    expect(css).toContain("opacity: 0;");
    expect(css).toContain("width: clamp(7.75rem, 37vw, 10rem) !important;");
    expect(css).toContain("min-height: 2.75rem !important;");
    expect(desktopStoryHome).toContain('className="flex shrink-0 items-center gap-1.5"');
    expect(desktopStoryHome).toContain('<Globe className="h-3 w-3" aria-hidden />');
  });

  it("keeps the language menu inside very narrow phone viewports", () => {
    expect(desktopStoryHome).toContain('className="story-mobile-language-list');
    expect(css).toContain(".story-mobile-language-list {");
    expect(css).toContain("inset-inline-end: max(0.75rem, var(--safe-inline-end)) !important;");
    expect(css).toContain("width: min(16rem, calc(100%");
  });

  it("prevents automatic mobile hyphenation in story copy", () => {
    expect(css).toContain(".story-body,\n    .story-card-title,\n    .story-metric-label,\n    .story-batumi-benefit__label");
    expect(css).toContain("overflow-wrap: break-word");
    expect(css).toContain("hyphens: none");
  });

  it("renders metric symbols with a complete system font and no artificial spacing", () => {
    expect(desktopStoryHome).toContain("<StoryMetricText value={localizedValue} />");
    expect(desktopStoryHome).not.toContain("numericValue.split(/([.,])/u)");
    expect(desktopStoryHome).not.toContain('"story-philosophy-stat__punctuation"');
    expect(css).toContain(".story-standard-number .story-currency-token {");
    expect(css).toContain("font: inherit !important;");
    expect(css).toContain("letter-spacing: inherit;");
    expect(css).toContain("white-space: nowrap;");
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
    const sharedContactValueClass = 'className="story-contact-detail min-w-0 [overflow-wrap:anywhere]"';

    expect(desktopStoryHome.split(sharedContactValueClass)).toHaveLength(3);
    expect(css).toContain("[data-story-section='contact'] .story-contact-detail");
    expect(css).toContain("font-family: var(--font-brand-sans);");
    expect(css).toContain("font-synthesis: none;");
  });

  it("uses the selected labeled social rail with rounded contact cards", () => {
    const selectedContactStart = css.lastIndexOf(
      "/* Selected contact-panel composition:",
    );
    const selectedContact = css.slice(selectedContactStart);

    expect(desktopStoryHome).toContain('{tx("SOCIAL MEDIA")}');
    expect(desktopStoryHome).toContain('className="story-contact-social-links"');
    expect(css).toContain("[data-story-section='contact'] .story-contact-social-links > a");
    expect(css).toContain("[data-story-section='contact'] .story-contact-social-links .social-link__icon");
    expect(css).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));");
    expect(css).toContain(".social-link__label");
    expect(selectedContactStart).toBeGreaterThanOrEqual(0);
    expect(selectedContact).toContain("border-radius: 1.25rem !important;");
    expect(selectedContact).toContain("white-space: nowrap;");
    expect(selectedContact).toContain("border-radius: 0 !important;");
    expect(selectedContact).toContain("background: transparent;");
    expect(selectedContact).toContain(
      "--story-contact-content-font-size: 1.05rem;",
    );
    expect(selectedContact).toContain(
      ":is(.story-contact-detail, .story-contact-social-links .social-link__label)",
    );
    expect(selectedContact).toContain(
      "grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);",
    );
  });

  it("keeps the FAQ heading left-aligned while spreading the question grid evenly", () => {
    expect(css).not.toContain("[data-story-section='faqs'] [data-story-scene-copy] {\n    width: min(100%, 72rem);");
    expect(css).toContain("[data-story-section='faqs'] [data-layout='story-faq-list'] {\n    width: 100%;\n    margin-inline: auto;\n    padding-inline: 0;");
    expect(css).not.toContain("[data-story-section='faqs'] [data-layout='story-faq-list'],\n  [data-story-section='contact']");
  });

  it("starts the About video on demand and keeps playback continuous after activation", () => {
    expect(desktopStoryHome).toContain("const [videoRequested, setVideoRequested] = useState(false);");
    expect(desktopStoryHome).toContain("const shouldAttachVideo = videoRequested;");
    expect(desktopStoryHome).toContain("if (shouldStartVideo)");
    expect(desktopStoryHome).toContain("src={shouldAttachVideo ? aixcoDubaiHeroVideo.src : undefined}");
    expect(desktopStoryHome).toContain('preload={shouldAttachVideo ? "auto" : "none"}');
    expect(desktopStoryHome).toContain("autoPlay={shouldAttachVideo}");
    expect(desktopStoryHome).toContain("loop");
    expect(desktopStoryHome).toContain("shouldStartVideo={activeIndex >= 1}");
    expect(desktopStoryHome).toContain("storyChapters.map((_, index) => index <= 1)");
    expect(desktopStoryHome).not.toContain("if (!shouldPrimeVideo)");
    expect(desktopStoryHome).not.toContain("setVideoStarted(false);");
    expect(desktopStoryHome).toContain("if (shouldAttachVideo) {\n                    void event.currentTarget.play().catch(() => undefined);");
    expect(desktopStoryHome).toContain("onPlaying={markVideoStarted}");
    expect(desktopStoryHome).toContain('data-about-video-poster=""');
    expect(desktopStoryHome).toContain('data-video-started={videoStarted && shouldExposeVideo ? "true" : "false"}');
    expect(desktopStoryHome).toContain('style={{ visibility: shouldExposeVideo ? "visible" : "hidden" }}');
    expect(desktopStoryHome).toContain("shouldExposeVideo={activeIndex === 1}");
    expect(desktopStoryHome).not.toContain("shouldExposeVideo={activeIndex === 1 && !heroBackdropVisible}");
    expect(desktopStoryHome).not.toContain("poster={aixcoDubaiHeroVideo.poster}");
    expect(desktopStoryHome).toContain('fetchPriority="high"');
    expect(css).toContain("[data-story-section='about'] .story-about-cinematic-poster");
    expect(css).toContain(".story-about-cinematic-poster[data-video-started='true']");
    expect(css).toContain("transition: opacity 900ms var(--ease-apple)");
    expect(desktopStoryHome).toContain('document.addEventListener("visibilitychange", recoverPlayback);');
    expect(desktopStoryHome).toContain('window.addEventListener("focus", recoverPlayback);');
    expect(desktopStoryHome).toContain("onPause={(event) => {");
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
    expect(desktopStoryHome).toContain("src={shouldAttachVideo ? aixcoDubaiHeroVideo.src : undefined}");
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

  it("renders Dubai metric affixes with the exact same brand treatment as their values", () => {
    const metricValueStart = css.indexOf(".story-dubai-portfolio-card__metric .story-metric-value {");
    const metricAffixStart = css.indexOf(".story-dubai-metric-affix {");
    const metricValue = css.slice(metricValueStart, css.indexOf("\n}", metricValueStart));
    const metricAffix = css.slice(metricAffixStart, css.indexOf("\n}", metricAffixStart));

    expect(metricValueStart).toBeGreaterThanOrEqual(0);
    expect(metricAffixStart).toBeGreaterThanOrEqual(0);
    expect(desktopStoryHome).toContain("story-dubai-metric-number story-dubai-metric-affix");
    expect(desktopStoryHome).not.toContain("text-[0.58em]");
    expect(metricValue).toContain("color: hsl(var(--primary))");
    expect(metricValue).toContain("font-family: var(--font-brand-display)");
    expect(metricValue).toContain("font-weight: 500");
    expect(metricAffix).toContain("color: inherit");
    expect(metricAffix).toContain("font-family: inherit");
    expect(metricAffix).toContain("font-size: 1em");
    expect(metricAffix).toContain("font-weight: inherit");
    expect(metricAffix).toContain("line-height: inherit");
    expect(metricAffix).toContain("letter-spacing: inherit");
    expect(metricAffix).toContain("vertical-align: baseline");
  });

  it("softens the objectives-to-access handoff without letting prior text bleed through", () => {
    const canonicalStart = css.lastIndexOf("/* Canonical Objectives -> Client Approach handoff.");
    const canonical = css.slice(canonicalStart);

    expect(canonicalStart).toBeGreaterThanOrEqual(0);
    expect(canonical).toContain("--story-access-entry-overlap: clamp(5.5rem, 12svh, 8rem);");
    expect(canonical).toContain("margin-top: calc(var(--story-access-entry-overlap) * -1) !important;");
    expect(canonical).toContain("background: transparent !important;");
    expect(canonical).toContain("-webkit-mask-image: linear-gradient(");
    expect(canonical).toContain("rgb(0 0 0 / 0.62) calc(var(--story-access-entry-feather) * 0.56)");
    expect(canonical).toContain("#000 calc(var(--story-access-entry-feather) * 0.76)");
    expect(canonical).toContain("-webkit-mask-size: 100% 100% !important;");
    expect(canonical).toContain("mask-repeat: no-repeat !important;\n  pointer-events: none;");
    expect(canonical).toContain("-webkit-mask-image: none !important;");
    expect(canonical).toContain("mask-image: none !important;");
    expect(canonical).toContain("height: var(--story-access-entry-feather) !important;");
    expect(canonical).toContain("hsl(var(--surface) / 0.2) 0%");
    expect(canonical).toContain("hsl(var(--surface) / 0) 86%");
    expect(canonical).toContain("pointer-events: none;");
    expect(canonical).toContain("z-index: 8;");
    expect(canonical).toContain(".story-scene-reveal {\n  position: relative;\n  z-index: 10;\n  pointer-events: none;");
    expect(canonical).toContain("calc(var(--story-access-entry-feather) + 0.75rem)");
    expect(canonical).toContain("[data-layout='story-about-access'] {\n  pointer-events: auto;");
    expect(canonical).toContain("--story-access-entry-overlap: clamp(4rem, 9svh, 5rem);");
    expect(canonical).toContain("--story-access-entry-feather: clamp(4.75rem, 18svh, 6rem);");
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
    expect(css).toContain("[data-layout='story-journeys']:hover .story-journeys-track");
    expect(css).toContain("animation-play-state: paused");
    expect(desktopStoryHome).toContain("onPointerDown={handleJourneyPointerDown}");
    expect(desktopStoryHome).toContain("onPointerMove={handleJourneyPointerMove}");
    expect(desktopStoryHome).toContain("drag.animation.currentTime");
    expect(css).toContain(".story-journeys-set[data-journey-set='duplicate'] {\n  display: none;");
    expect(css).toContain("[data-story-section='how'] .story-journeys-set[data-journey-set='duplicate'] {\n    display: flex;");
    expect(css).toContain("@media (prefers-reduced-motion: reduce) {");
    expect(css).toContain("[data-story-section='how'] [data-layout='story-journeys']:focus-within .story-journeys-track");
    expect(css).toContain("[data-story-section='how'] .story-journeys-track {\n      animation: none !important;");
    expect(css).toContain("[data-story-section='how'] .story-journeys-set[data-journey-set='duplicate'] {\n      display: none !important;");
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

  it("uses the selected portrait-phone hero composition without changing wider layouts", () => {
    expect(css).toContain("@media (max-width: 767px) and (orientation: portrait)");
    expect(css).toContain("justify-content: flex-start");
    expect(css).toContain("14.5svh");
    expect(css).toContain("[data-story-section='hero'] .story-hero-lockup {\n    width: 100%;");
    expect(css).toContain("[data-story-section='hero'] .story-hero-statement {\n    width: 100%;\n    align-items: flex-start;");
    expect(css).toContain("[data-story-section='hero'] .story-hero-statement__note {\n    max-width: 21rem;");
  });

  it("balances the Dubai snapshot and lets its skyline scroll with the page", () => {
    expect(css).toContain("/* Keep the Dubai snapshot as one balanced scene so both columns travel together. */");
    expect(css).toContain("[data-story-section='dubai'] .story-scene-reveal {\n    justify-content: center !important;");
    expect(css).toContain("[data-story-section='dubai'] [data-story-scene-media] {\n    position: relative !important;\n    top: auto !important;");
  });

  it("uses the Philosophy number treatment across the requested metric sections", () => {
    expect(desktopStoryHome).toContain("story-batumi-benefit__metric story-standard-number");
    expect(desktopStoryHome).toContain("story-philosophy-stat__value story-standard-number");
    expect(desktopStoryHome).toContain('className="story-standard-number story-dubai-metric-number"');
    expect(desktopStoryHome).toContain('className="story-metric-value"');
    expect(desktopStoryHome).not.toContain('<p className="story-metric-value story-standard-number">');
    expect(desktopStoryHome).toContain("story-standard-number story-legacy-number");
    expect(css).toContain("/* One locally bundled AIXCO number face across the site.");
    expect(css).toContain(
      "font-family: var(--font-brand-sans) !important;",
    );
    expect(css).toContain("font-size: clamp(1.8rem, 2.8vw, 3.2rem) !important;");
    expect(css).toContain("font-weight: 400 !important;");
    expect(css).toContain("font-variant-numeric: lining-nums tabular-nums;");
    expect(css).toContain("white-space: nowrap;");
  });

  it("top-aligns paired Batumi metrics when one supporting label wraps", () => {
    expect(desktopStoryHome).toContain(
      'className="story-batumi-benefit__copy min-w-0"',
    );
    expect(css).toContain(".story-batumi-benefit__copy {");
    expect(css).toContain("align-self: start;");
  });

  it("keeps currency symbols on the exact same typographic line as their figures", () => {
    const currencyTokenStart = css.indexOf(
      ".story-standard-number .story-currency-token {",
    );
    const currencyTokenBlock = css.slice(
      currencyTokenStart,
      css.indexOf("\n}", currencyTokenStart),
    );

    expect(currencyTokenStart).toBeGreaterThanOrEqual(0);
    expect(currencyTokenBlock).toContain("font: inherit !important;");
    expect(currencyTokenBlock).toContain("opacity: 1;");
    expect(currencyTokenBlock).toContain("line-height: inherit !important;");
    expect(currencyTokenBlock).toContain("vertical-align: baseline;");
    expect(currencyTokenBlock).toContain("transform: none;");
    expect(currencyTokenBlock).not.toContain("font-size: 0.82em");
    expect(currencyTokenBlock).not.toContain("vertical-align: 0.055em");
    expect(desktopStoryHome).toContain("story-currency-token--dollar");
    expect(desktopStoryHome).toContain("story-currency-symbol--dollar");
    expect(desktopStoryHome).not.toContain("story-philosophy-stat__number-part");

    const dollarStart = css.indexOf(
      ".story-standard-number\n  :is(.story-currency-token--dollar, .story-currency-token--euro) {",
    );
    const dollarBlock = css.slice(dollarStart, css.indexOf("\n}", dollarStart));

    expect(dollarStart).toBeGreaterThanOrEqual(0);
    expect(dollarBlock).toContain(
      "font-family: var(--font-brand-sans) !important;",
    );
    expect(dollarBlock).toContain("font-size: inherit !important;");
    expect(dollarBlock).toContain("font-weight: 400 !important;");
    expect(dollarBlock).toContain("font-synthesis: none;");
    expect(dollarBlock).toContain("line-height: inherit !important;");
    expect(dollarBlock).not.toContain("top:");
    expect(dollarBlock).not.toContain("transform:");

    expect(dollarBlock).toContain(".story-currency-token--euro");
    expect(dollarBlock).not.toContain("top:");
    expect(css).not.toContain("scaleX(1.45)");

    const childStart = css.indexOf(
      ".story-standard-number .story-currency-symbol,\n.story-standard-number .story-currency-value {",
    );
    const childBlock = css.slice(childStart, css.indexOf("\n}", childStart));
    expect(childStart).toBeGreaterThanOrEqual(0);
    expect(childBlock).toContain("display: inline;");
    expect(childBlock).toContain("margin: 0;");
    expect(childBlock).toContain("font: inherit !important;");
    expect(childBlock).toContain("position: static;");
    expect(childBlock).toContain("transform: none;");

    const euroStart = css.indexOf(
      ".story-standard-number .story-currency-symbol--euro {",
    );
    const euroBlock = css.slice(euroStart, css.indexOf("\n}", euroStart));
    expect(euroStart).toBeGreaterThanOrEqual(0);
    expect(euroBlock).toContain("display: inline;");
    expect(euroBlock).toContain("font-size: inherit !important;");
    expect(euroBlock).toContain("line-height: inherit !important;");
    expect(euroBlock).toContain("transform: none;");

    const dollarSymbolStart = css.indexOf(
      ".story-standard-number .story-currency-symbol--dollar {",
    );
    const dollarSymbolBlock = css.slice(
      dollarSymbolStart,
      css.indexOf("\n}", dollarSymbolStart),
    );
    expect(dollarSymbolStart).toBeGreaterThanOrEqual(0);
    expect(dollarSymbolBlock).toContain("display: inline;");
    expect(dollarSymbolBlock).toContain("position: static;");
    expect(dollarSymbolBlock).toContain(
      "font-family: var(--font-brand-sans) !important;",
    );
    expect(dollarSymbolBlock).toContain("font-weight: 300 !important;");
    expect(dollarSymbolBlock).toContain("-webkit-text-fill-color: currentColor;");
    expect(css).not.toContain(
      ".story-standard-number .story-currency-symbol--dollar::before",
    );
    expect(css).not.toContain(
      ".story-standard-number .story-currency-symbol--dollar::after",
    );
  });

  it("aligns the wrapped construction qualifier with the scope copy on English laptops", () => {
    const constructionAlignmentStart = css.indexOf(
      "html[lang='en']\n    .story-dubai-portfolio-card__metric[data-metric-layout='progress']\n    .story-dubai-metric-copy--construction {",
    );
    const constructionAlignmentBlock = css.slice(
      constructionAlignmentStart,
      css.indexOf("\n  }", constructionAlignmentStart),
    );

    expect(constructionAlignmentStart).toBeGreaterThanOrEqual(0);
    expect(constructionAlignmentBlock).toContain("position: relative;");
    expect(constructionAlignmentBlock).toContain("top: -0.5rem;");
    expect(constructionAlignmentBlock).toContain("line-height: 1 !important;");
    expect(desktopStoryHome).toContain(
      'className="story-dubai-metric-copy story-dubai-metric-copy--construction"',
    );
    expect(desktopStoryHome).toContain('aria-label="under construction"');
    expect(desktopStoryHome).toContain('<span aria-hidden="true">under</span>');
    expect(desktopStoryHome).toContain('<span aria-hidden="true">construction</span>');
  });

  it("normalizes inline Batumi euro tokens without changing their copy", () => {
    expect(desktopStoryHome).toContain("function StoryInlineCurrencyText");
    expect(desktopStoryHome).toContain('data-inline-currency-token="euro"');
    expect(desktopStoryHome).toContain('data-batumi-intro-copy="true"');
    expect(desktopStoryHome).toContain(
      "<StoryInlineCurrencyText value={tx(label)} />",
    );
    expect(desktopStoryHome).toContain(
      "<StoryInlineCurrencyText value={tx(chapter.highlight)} />",
    );
    expect(css).toContain(".story-inline-currency-token {");
    expect(css).toContain(
      "font-family: var(--font-brand-sans) !important;",
    );
    expect(css).toContain("white-space: nowrap;");
    expect(css).toContain(".story-inline-currency-symbol--euro {");
    expect(css).toContain("font: inherit !important;");
    expect(css).not.toContain("top: -0.004364rem;");
    expect(css).not.toContain("transform: scaleX(1.45)");
  });

  it("matches Dubai card typography to the Philosophy card scale", () => {
    expect(desktopStoryHome).toContain('data-metric-layout={metricLayout}');
    expect(desktopStoryHome).toContain('className="story-dubai-metric-copy"');
    expect(desktopStoryHome).toContain('className="story-dubai-metric-prefix"');
    expect(desktopStoryHome).toContain('className="story-dubai-status__state"');
    expect(desktopStoryHome).toContain('/^[$€]/u.test(part) ? (');
    expect(desktopStoryHome).toContain(
      '<StoryMetricText value={part} ariaHidden={false} />',
    );
    expect(desktopStoryHome).toContain("aria-hidden={ariaHidden || undefined}");
    expect(desktopStoryHome).toContain("data-metric-label={detail.label}");
    expect(css).toContain("min-height: clamp(10.5rem, 22svh, 11.5rem) !important;");
    expect(css).toContain("justify-content: flex-start !important;");
    expect(css).toContain("gap: clamp(0.68rem, 1.2svh, 0.88rem) !important;");
    expect(css).toContain("font-size: clamp(0.72rem, 0.74vw, 0.8rem) !important;");
    expect(css).toContain("font-size: clamp(0.95rem, 0.98vw, 1.06rem) !important;");
    expect(css).toContain("font-size: clamp(1.8rem, 2.8vw, 3.2rem) !important;");
    expect(css).toContain("font-weight: 500 !important;");
    expect(css).toContain("font-weight: 400 !important;");
    expect(css).toContain("line-height: 1.5 !important;");
    expect(css).toContain(".story-standard-number.story-dubai-metric-number {");
    expect(css).toContain("grid-template-columns: max-content minmax(0, 1fr);");
    expect(css).toContain("@media (min-width: 768px) and (max-width: 1279px)");
    expect(css).toContain(".story-dubai-portfolio-card__metric[data-metric-layout='progress']");
    expect(css).toContain("align-items: start;\n  column-gap: 0.25rem;");
    expect(css).toContain("padding-top: clamp(0.18rem, 0.32vw, 0.28rem);");
    expect(css).toContain("line-height: 1.34 !important;");
    expect(css).toContain("@media (max-width: 479px)");
    expect(css).toContain("display: grid;");
    expect(css).toContain("overflow-wrap: anywhere;");
  });

  it("keeps German Dubai metrics compact and aligned on laptop screens", () => {
    expect(germanTranslationFixes).toContain('"USD 462m": { de: "$462M" }');
    expect(germanTranslationFixes).toContain(
      '"USD 350m mixed-use program": { de: "$350M Mischnutzungsprogramm" }',
    );
    expect(germanTranslationFixes).toContain(
      '"USD 800m+ development volume": { de: "$800M+ Entwicklungsvolumen" }',
    );
    expect(germanTranslationFixes).toContain(
      '"~20% developed, ~80% under construction": { de: "~20% entwickelt, ~80% im Bau" }',
    );
    expect(css).toContain("/* German laptop cards use the same compact international value language");
    expect(css).toContain("html[lang='de']\n  .story-dubai-portfolio-card__metric[data-metric-layout='number']");
    expect(css).toContain("flex-wrap: nowrap;");
    expect(css).toContain("html[lang='de']\n  .story-dubai-portfolio-card__metric[data-metric-layout='scope']");
    expect(css).toContain("flex-direction: column;");
    expect(css).toContain("html[lang='de']\n  .story-dubai-portfolio-card__metric[data-metric-layout='progress']");
    expect(css).toContain("align-items: baseline;");
    expect(css).toContain("padding-top: 0;");
  });

  it("keeps the current project reachable only from the hero CTA", () => {
    expect(desktopStoryHome).toContain('const currentProjectHref = "/aixco-global-op2/current-project";');
    expect(desktopStoryHome.match(/href=\{currentProjectHref\}/g)).toHaveLength(1);
    expect(desktopStoryHome).toContain('{ key: "batumi", id: "batumi", label: "Current project" }');
    expect(desktopStoryHome).toContain('className="btn-gold"');
    expect(desktopStoryHome).toContain('{tx("Current project")}');
    expect(desktopStoryHome).not.toContain("story-desktop-current-project-link");
    expect(desktopStoryHome).not.toContain("story-mobile-current-project-link");
    expect(desktopStoryHome).not.toContain("story-desktop-nav-menu-link--featured");
    expect(css).not.toContain(".story-desktop-current-project-link");
    expect(css).not.toContain(".story-mobile-current-project-link");
  });

  it("makes the Batumi project card explicit and removes the old circular arrow CTA", () => {
    expect(desktopStoryHome).toContain('data-batumi-project-cta="explore"');
    expect(desktopStoryHome).toContain('className="btn-gold story-batumi-property__explore w-fit shrink-0"');
    expect(desktopStoryHome).toContain('className="story-batumi-property-link grid w-full justify-items-start');
    expect(desktopStoryHome).toContain('className="story-batumi-property-copy block w-full');
    expect(desktopStoryHome).not.toContain('story-batumi-property-link flex w-full items-center justify-between');
    expect(desktopStoryHome).toContain('property.id === "current-project"');
    expect(desktopStoryHome).toContain('? tx("Project Reverance").toUpperCase()');
    expect(desktopStoryHome).toContain(': tx(property.name)');
    expect(desktopStoryHome).toContain('{tx("Explore")}');
    expect(desktopStoryHome).not.toContain('className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full');
    expect(css).toContain(".story-batumi-property-link:hover .story-batumi-property-copy {");
    expect(css).toContain("[data-story-section='batumi'] .story-batumi-property__explore {");
    expect(css).toContain("[data-story-section='batumi'] [data-layout='story-batumi-properties'] {");
    expect(css).toContain("clamp(1rem, calc(2.375rem - 2.14svh), 1.5rem)");
    expect(css).toContain("gap: clamp(0.45rem, 0.9svh, 0.72rem);");
  });

  it("keeps the shared scroll-to-top arrow available on the main story page", () => {
    expect(css).not.toContain("html[data-home-experience='story'] [data-scroll-to-top-button='true']");
  });

  it("uses the exact AIXCO brandbook palette and Gilroy across legacy components", () => {
    expect(css).toContain("--background: 40 42.9% 91.8%");
    expect(css).toContain("--foreground: 0 0% 8.6%");
    expect(css).toContain("--primary: 42.5 44.4% 42.4%");
    expect(css).toContain("--primary-glow: 45.8 71.7% 65.3%");
    expect(css).toContain("--secondary: 212.1 100% 13.9%");
    expect(css).toContain("--muted-foreground: 0 0% 60.4%");
    expect(css).toContain("--font-legacy-ui: var(--font-brand-sans)");
    expect(css).toContain("--font-legacy-display: var(--font-brand-display)");
    expect(css).toContain("hsl(var(--primary-glow)) 0%");
    expect(css).toContain("hsl(var(--primary)) 58%");
    expect(css).toContain("[data-brand-lockup='story-hero'] {\n  width: min(100%, 44rem);\n  filter: none;");
    expect(css).toContain("[data-story-hero-title-mark='true'] {\n  filter: none;");
  });

  it("uses the complete Gilroy brand build for every German glyph", () => {
    const germanSelector = "html[lang='de']";
    const germanOverrideStart = css.indexOf(`${germanSelector} {`);
    const germanOverride = css.slice(
      germanOverrideStart,
      css.indexOf("\n}", germanOverrideStart),
    );

    expect(germanOverrideStart).toBeGreaterThanOrEqual(0);
    expect(germanOverride).toContain("var(--font-gilroy-german)");
    expect(germanOverride).toContain("font-synthesis: none;");
    expect(appLayout).toContain('variable: "--font-gilroy-german"');
    expect(appLayout).toContain("Gilroy-Regular-German.woff2");
    expect(appLayout).toContain("Gilroy-Black-German.woff2");
  });

  it("uses only real bundled font weights and keeps repeated body copy neutral", () => {
    const bodyRule = cssBlock("body");
    const storyBodyRule = cssBlock(".story-body");
    const teamSummaryRule = cssBlock(".story-team-member__summary");

    expect(bodyRule).toContain("font-synthesis: none;");
    expect(bodyRule).toContain("font-weight: 400;");
    expect(storyBodyRule).toContain("font-family: var(--font-brand-sans);");
    expect(storyBodyRule).toContain("font-synthesis: none;");
    expect(storyBodyRule).toContain("font-weight: 400;");
    expect(teamSummaryRule).toContain(
      "color: hsl(var(--foreground) / 0.64);",
    );
    expect(css).not.toMatch(/font-weight:\s*(?:650|700);/);
    expect(desktopStoryHome).toContain(
      'className="story-team-member__summary story-body"',
    );
  });

  it("renders other supported localized glyphs with one complete platform stack", () => {
    const localeSelector =
      "html:is([lang='pl'], [lang='sl'], [lang='ru'])";
    const localeOverrideStart = css.indexOf(`${localeSelector} {`);
    const localeOverride = css.slice(
      localeOverrideStart,
      css.indexOf("\n}", localeOverrideStart),
    );

    expect(localeOverrideStart).toBeGreaterThanOrEqual(0);
    expect(localeOverride).toContain("--font-brand-sans:");
    expect(localeOverride).toContain("--font-brand-display:");
    expect(localeOverride).toContain("--font-legacy-ui:");
    expect(localeOverride).toContain("--font-legacy-display:");
    expect(localeOverride).toContain("--font-sans: var(--font-brand-sans);");
    expect(localeOverride).toContain("--font-display: var(--font-brand-display);");
    expect(localeOverride).toContain(
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
    );
    expect(localeOverride).toContain("font-synthesis: none;");
    expect(localeOverride).not.toMatch(/font-gilroy/i);
    expect(localeOverride).not.toMatch(/avenir/i);
    expect(tailwindConfig).toContain('"var(--font-brand-display)"');
    expect(tailwindConfig).toContain('"var(--font-brand-sans)"');
    expect(tailwindConfig).not.toContain('"var(--font-gilroy)"');
  });

  it("keeps localized controls and animated letters on identical typography", () => {
    expect(css).toContain(
      "html:is([lang='de'], [lang='pl'], [lang='sl'], [lang='ru'])\n  :is(button, input, textarea, select, option)",
    );
    expect(css).toContain(
      "html:is([lang='de'], [lang='pl'], [lang='sl'], [lang='ru'])\n  [data-story-section]\n  :is(",
    );
    expect(css).toContain(".story-title-reveal__text,");
    expect(css).toContain(".story-letter-reveal__word,");
    expect(css).toContain(".story-letter-reveal__char");
    expect(css).toContain("font-family: inherit;");
    expect(css).toContain("font-size: inherit;");
    expect(css).toContain("font-weight: inherit;");
    expect(css).toContain("font-synthesis: none;");
  });

  it("uses one complete face for every language name", () => {
    const languageOptionStart = css.indexOf("html button[data-lang] {");
    const languageOptionRule = css.slice(
      languageOptionStart,
      css.indexOf("\n}", languageOptionStart),
    );
    const languageLabelStart = css.indexOf(
      "html button[data-lang] .language-option-label {",
    );
    const languageLabelRule = css.slice(
      languageLabelStart,
      css.indexOf("\n}", languageLabelStart),
    );

    expect(languageOptionStart).toBeGreaterThanOrEqual(0);
    expect(languageOptionRule).toContain(
      "font-family: 'Segoe UI', Arial, system-ui, sans-serif",
    );
    expect(languageOptionRule).toContain("font-synthesis: none;");
    expect(languageLabelStart).toBeGreaterThanOrEqual(0);
    expect(languageLabelRule).toContain(
      "font-family: 'Segoe UI', Arial, system-ui, sans-serif !important;",
    );
    expect(languageLabelRule).toContain("unicode-bidi: isolate;");
    expect(languageLabelRule).toContain("white-space: nowrap;");
    expect(
      desktopStoryHome.match(
        /className="language-option-label notranslate"/g,
      ),
    ).toHaveLength(2);
    expect(
      desktopStoryHome.match(/\n\s+lang=\{option\.code\}/g),
    ).toHaveLength(2);
    expect(desktopStoryHome.match(/translate="no"/g)).toHaveLength(4);
  });

  it("keeps multiline localized display headings from colliding", () => {
    const safeLeadingStart = css.indexOf(
      "/* Complete-font locales use platform font metrics",
    );
    const safeLeadingRules = css.slice(safeLeadingStart);

    expect(safeLeadingStart).toBeGreaterThanOrEqual(0);
    expect(safeLeadingRules).toContain(".story-hero-statement__line {");
    expect(safeLeadingRules).toContain("line-height: 1.08 !important;");
    expect(safeLeadingRules).toContain(".story-philosophy-detail-title");
    expect(safeLeadingRules).toContain(".story-objectives-title");
    expect(safeLeadingRules).toContain(".story-mobile-materials-title");
    expect(safeLeadingRules).toContain(":is(.property-hero__title, .property-highlights__title)");
    expect(safeLeadingRules).toContain("@media (max-width: 767px)");
    expect(safeLeadingRules).toContain("line-height: 1.12 !important;");
    expect(propertyPage).toContain('className="property-highlights__title ');
  });

  it("keeps German philosophy copy clear of the transition on short laptops", () => {
    const shortLaptopStart = css.indexOf(
      "/* German philosophy copy wraps onto additional lines",
    );
    const shortLaptopRules = css.slice(shortLaptopStart);

    expect(shortLaptopStart).toBeGreaterThanOrEqual(0);
    expect(shortLaptopRules).toContain(
      "@media (min-width: 1024px) and (max-height: 48rem)",
    );
    expect(shortLaptopRules).toContain(
      "html[lang='de'] [data-story-section='philosophyOrigins']",
    );
    expect(shortLaptopRules).toContain("container-type: inline-size;");
    expect(shortLaptopRules).toContain(
      "padding-bottom: clamp(3.5rem, 8svh, 4.5rem);",
    );
  });
});
