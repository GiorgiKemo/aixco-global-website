import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("home page performance structure", () => {
  it("keeps the measured continuous-scroll profile for the story page", () => {
    const scrollManagerSource = readSource("src/components/ScrollManager.tsx");

    expect(scrollManagerSource).toContain("storyEasing: 0.22");
    expect(scrollManagerSource).toContain("storyMultiplier: 0.9");
    expect(scrollManagerSource).toContain("storyWheelCarry: 0");
    expect(scrollManagerSource).not.toContain("storyWheelCarry: 0.1");
  });

  it("keeps the legacy native section stack out of the home module", () => {
    const homeSource = readSource("src/views/HomePage.tsx");

    expect(homeSource).toContain('import { HomeExperience } from "@/components/sections/HomeExperience"');
    expect(homeSource).not.toContain('import { Nav }');
    expect(homeSource).not.toContain('import { Footer }');
    expect(homeSource).not.toContain('from "@/components/sections/Hero"');
    expect(homeSource).not.toContain('from "@/components/sections/About"');
    expect(homeSource).not.toContain('from "@/components/sections/DeferredHomeSections"');
    expect(homeSource).not.toContain('from "@/components/sections/Dubai"');
    expect(homeSource).not.toContain('from "@/components/sections/Batumi"');
    expect(homeSource).not.toContain('from "@/components/sections/Participate"');
    expect(homeSource).not.toContain('from "@/components/sections/Team"');
  });

  it("keeps philosophy content inside the home experience instead of a separate page", () => {
    const homeSource = readSource("src/views/HomePage.tsx");
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const sitemapSource = readSource("src/app/sitemap.ts");

    expect(homeSource).toContain("<HomeExperience />");
    expect(desktopStorySource).toContain('{ key: "philosophy", id: "philosophy", label: "Philosophy" }');
    expect(desktopStorySource).toContain('{ key: "philosophyOrigins", id: "philosophy-origins", label: "Origins" }');
    expect(desktopStorySource).toContain('{ key: "philosophyPlatform", id: "philosophy-platform", label: "Principles" }');
    expect(desktopStorySource).toContain("<MemoizedPhilosophyScene");
    expect(desktopStorySource).toContain("<MemoizedPhilosophyDetailScene");
    expect(desktopStorySource).toContain('id: "philosophy"');
    expect(sitemapSource).not.toContain("/aixco-philosophy");
  });

  it("keeps the in-page philosophy story section compact and media-backed", () => {
    const philosophySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(philosophySource).toContain("function PhilosophyScene");
    expect(philosophySource).toContain("function PhilosophyDetailScene");
    expect(philosophySource).toContain("function PhilosophyPlatformScene");
    expect(philosophySource).toContain("philosophyHero.title");
    expect(philosophySource).toContain("philosophyOwnershipSections");
    expect(philosophySource).toContain("philosophyPlatformSections");
    expect(philosophySource).toContain("aixcoLiveImages.aboutArchitecture");
    expect(philosophySource).toContain('data-layout="story-philosophy-stats"');
    expect(philosophySource).toContain('data-layout="story-philosophy-principles"');
    expect(philosophySource).toContain('data-layout="story-philosophy-detail"');
    expect(philosophySource).toContain('data-layout="story-philosophy-platform-stats"');
    expect(philosophySource).toContain('data-layout="story-philosophy-platform-panels"');
    expect(philosophySource).toContain("fitContent={false}");
  });

  it("keeps the about-to-philosophy media handoff from becoming a flat black block", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const aboutSceneStart = desktopStorySource.indexOf("function AboutScene");
    const philosophySceneStart = desktopStorySource.indexOf("function PhilosophyScene");
    const aboutSceneSource = desktopStorySource.slice(aboutSceneStart, philosophySceneStart);

    expect(aboutSceneStart).toBeGreaterThanOrEqual(0);
    expect(philosophySceneStart).toBeGreaterThan(aboutSceneStart);
    expect(aboutSceneSource).toContain("rgba(17,16,14,0.26)_46%");
    expect(aboutSceneSource).toContain("rgba(17,16,14,0.70))");
    expect(aboutSceneSource).toContain("rgba(17,16,14,0.14),rgba(17,16,14,0.62))");
    expect(aboutSceneSource).not.toContain("rgba(17,16,14,0.78)");
  });

  it("keeps client-approach body copy at one consistent contrast", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const sectionStart = desktopStorySource.indexOf("function AboutAccessScene");
    const sectionEnd = desktopStorySource.indexOf("function LegacyScene");
    const sectionSource = desktopStorySource.slice(sectionStart, sectionEnd);

    expect(sectionSource).not.toContain("text-white/80");
    expect(sectionSource).not.toContain("text-white/72");
    expect(sectionSource.match(/leading-\[1\.65\] text-white/g)).toHaveLength(3);
  });

  it("starts the about video immediately and releases it beyond the two-section buffer", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const aboutSceneStart = desktopStorySource.indexOf("function AboutScene");
    const philosophySceneStart = desktopStorySource.indexOf("function PhilosophyScene");
    const aboutSceneSource = desktopStorySource.slice(aboutSceneStart, philosophySceneStart);

    expect(aboutSceneStart).toBeGreaterThanOrEqual(0);
    expect(philosophySceneStart).toBeGreaterThan(aboutSceneStart);
    expect(aboutSceneSource).toContain("const shouldAttachVideo = shouldStartVideo;");
    expect(aboutSceneSource).toContain("if (!shouldAttachVideo)");
    expect(aboutSceneSource).toContain('video.removeAttribute("src");');
    expect(aboutSceneSource).toContain("setVideoStarted(false);");
    expect(aboutSceneSource).toContain("src={shouldAttachVideo ? aixcoDubaiHeroVideo.src : undefined}");
    expect(aboutSceneSource).toContain("autoPlay={shouldAttachVideo}");
    expect(aboutSceneSource).toContain("loop");
    expect(aboutSceneSource).toContain('preload={shouldAttachVideo ? "auto" : "none"}');
    expect(aboutSceneSource).toContain('style={{ visibility: shouldAttachVideo ? "visible" : "hidden" }}');
    expect(aboutSceneSource).toContain('data-video-started={videoStarted && shouldAttachVideo ? "true" : "false"}');
    expect(aboutSceneSource).not.toContain("poster={aixcoDubaiHeroVideo.poster}");
    expect(desktopStorySource).toContain("shouldStartVideo={sectionPresence[1] ?? true}");
    expect(desktopStorySource).not.toContain("shouldExposeVideo");
    expect(desktopStorySource).toContain("storyChapters.map((_, index) => index <= 1)");
    expect(aboutSceneSource).not.toContain("if (!shouldPrimeVideo)");
    expect(aboutSceneSource).not.toContain("shouldReduceMotion");
    expect(aboutSceneSource).toContain("video.pause();");
    expect(aboutSceneSource).toContain('document.addEventListener("visibilitychange", recoverPlayback);');
    expect(aboutSceneSource).toContain('window.addEventListener("focus", recoverPlayback);');
    expect(aboutSceneSource).toContain("onPause={(event) => {");
  });

  it("pauses only the decorative hero video while native mobile scrolling is active", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const backdropStart = desktopStorySource.indexOf("function FixedHeroBackdrop");
    const backdropEnd = desktopStorySource.indexOf("function StorySceneBody");
    const backdropSource = desktopStorySource.slice(backdropStart, backdropEnd);

    expect(backdropStart).toBeGreaterThanOrEqual(0);
    expect(backdropEnd).toBeGreaterThan(backdropStart);
    expect(backdropSource).toContain("mobileScrollResumeTimerRef");
    expect(backdropSource).toContain("pauseHeroDuringMobileScroll");
    expect(backdropSource).toContain('window.matchMedia(heroMobileVideoQuery).matches');
    expect(backdropSource).toContain('window.addEventListener("touchstart", pauseHeroDuringMobileScroll, { passive: true });');
    expect(backdropSource).toContain('window.addEventListener("scroll", pauseHeroDuringMobileScroll, { passive: true });');
    expect(backdropSource).toContain("if (!video.paused) video.pause();");
    expect(backdropSource).toContain("void video.play().catch(() => undefined);");
    expect(backdropSource).toContain("}, 180);");
  });

  it("does not mount heavy story media before its section is revealed", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(desktopStorySource).toContain("const shouldRenderMedia = Boolean(isRevealed || isActive || preloadMedia);");
    expect(desktopStorySource).toContain("const shouldRevealMedia = Boolean(isRevealed || isActive);");
    expect(desktopStorySource).toContain("<StoryMediaReveal isActive={shouldRevealMedia}");
    expect(desktopStorySource).toContain("<StoryMediaPanel media={media} isActive={shouldRevealMedia}");
    expect(desktopStorySource).toContain('loading={shouldLoadEagerly ? "eager" : "lazy"}');
    expect(desktopStorySource).toContain("unoptimized");
    expect(desktopStorySource).toContain("shouldRenderMedia && mediaContent");
    expect(desktopStorySource).toContain("shouldRenderMedia && media");
    expect(desktopStorySource).toContain("media && isRevealed");
  });

  it("keeps legacy insight articles unpublished until the copy is rewritten", () => {
    const articleSource = readSource("src/app/aixco-global-op2/[slug]/page.tsx");

    expect(articleSource).toContain("generateStaticParams");
    expect(articleSource).toContain("getPropertyBySlug");
    expect(articleSource).toContain("PropertyPageContent");
    expect(articleSource).toContain("notFound()");
    expect(articleSource).not.toContain("<Nav />");
    expect(articleSource.indexOf("<PropertyChrome />")).toBeLessThan(articleSource.indexOf('<main id="main-content"'));
  });

  it("keeps the not-found page aligned with the public brand layout", () => {
    const notFoundSource = readSource("src/views/NotFoundView.tsx");

    expect(notFoundSource).not.toContain("<Nav />");
    expect(notFoundSource).not.toContain("<Footer />");
    expect(notFoundSource).toContain("aixcoLiveLogos.aixcoHorizontalLight");
    expect(notFoundSource).toContain("bg-[#11100e]");
    expect(notFoundSource).toContain("btn-gold");
  });

  it("server-renders a meaningful branded shell while the story bundle loads", () => {
    const homeExperienceSource = readSource("src/components/sections/HomeExperience.tsx");
    const appLayoutSource = readSource("src/app/layout.tsx");

    expect(homeExperienceSource).toContain("function StoryBootSurface");
    expect(homeExperienceSource).toContain('data-home-ssr-shell="true"');
    expect(homeExperienceSource).toContain("Wise selection. Recurring income generation.");
    expect(homeExperienceSource).toContain('href="#contact"');
    expect(homeExperienceSource).not.toContain("ssr: false");
    expect(appLayoutSource).not.toContain("homeStoryBootScript");
    expect(appLayoutSource).not.toContain("home-desktop-story-boot");
  });

  it("marks the story scroll mode before the lazy story component hydrates", () => {
    const homeExperienceSource = readSource("src/components/sections/HomeExperience.tsx");
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(homeExperienceSource).toContain('document.documentElement.dataset.homeExperience = "story"');
    expect(homeExperienceSource).toContain("previousHomeExperience");
    expect(desktopStorySource).not.toContain("const chapterHashDelays =");
  });

  it("uses native scroll timelines with one shared observer fallback", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const revealComponentStart = desktopStorySource.indexOf("function StoryTextReveal");
    const revealComponentEnd = desktopStorySource.indexOf("function StoryCrossfadeMediaPanel");
    const revealComponentSource = desktopStorySource.slice(revealComponentStart, revealComponentEnd);

    expect(revealComponentStart).toBeGreaterThanOrEqual(0);
    expect(revealComponentSource).toContain("active: boolean;");
    expect(revealComponentSource).toContain('data-text-reveal-engine="scroll-linked-with-observer-fallback"');
    expect(revealComponentSource).toContain("supportsStoryTitleScrollTimeline()");
    expect(desktopStorySource.match(/new window\.IntersectionObserver/g)).toHaveLength(1);
    expect(desktopStorySource).toContain("storyTitleRevealListeners");
    expect(desktopStorySource).toContain('rootMargin: "0px 0px -20% 0px"');
    expect(desktopStorySource).toContain("threshold: [0, 0.2]");
    expect(revealComponentSource).toContain("observeStoryTitle(element, handleRevealZoneChange)");
    expect(desktopStorySource).not.toContain("function useStoryTextInView");
    expect(revealComponentSource).not.toContain('window.addEventListener("scroll"');
  });

  it("uses one whole-title animation instead of per-glyph or compact fallbacks", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const revealComponentStart = desktopStorySource.indexOf("function StoryTextReveal");
    const revealComponentEnd = desktopStorySource.indexOf("function StoryCrossfadeMediaPanel");
    const revealComponentSource = desktopStorySource.slice(revealComponentStart, revealComponentEnd);

    expect(revealComponentSource).toContain('className="story-title-reveal__text"');
    expect(revealComponentSource).not.toContain("story-letter-reveal__char");
    expect(revealComponentSource).not.toContain("story-letter-reveal--compact");
    expect(revealComponentSource).not.toContain("story-text-reveal__tiny-plain");
    expect(revealComponentSource).not.toContain("story-text-reveal__mobile-plain");
  });

  it("replays each story title when its section becomes active again", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const revealComponentStart = desktopStorySource.indexOf("function StoryTextReveal");
    const revealComponentEnd = desktopStorySource.indexOf("function StoryCrossfadeMediaPanel");
    const revealComponentSource = desktopStorySource.slice(revealComponentStart, revealComponentEnd);

    expect(revealComponentSource).toContain("active: boolean;");
    expect(revealComponentSource).toContain('"idle" | "animating" | "played" | "scroll-linked"');
    expect(revealComponentSource).toContain('setAnimationState("scroll-linked")');
    expect(revealComponentSource).toContain('isPending && "story-title-reveal--pending"');
    expect(revealComponentSource).toContain("storyTitleRevealDurationMs + storyTitleRevealFallbackBufferMs");
    expect(revealComponentSource).toContain('addEventListener("animationcancel", handleAnimationCancel)');
    expect(revealComponentSource).toContain("const isInRevealZoneRef = useRef(false);");
    expect(revealComponentSource).toContain("isInRevealZone && !isInRevealZoneRef.current");
    expect(revealComponentSource).toContain("isInRevealZoneRef.current = isInRevealZone;");
    expect(revealComponentSource).not.toContain("}, [label, mobileLabel]);");
    expect(desktopStorySource).toContain("<StoryTextReveal active={isActive}");
  });

  it("keeps scroll progress on compositor-friendly transforms", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(desktopStorySource).toContain("pageProgressBarRef.current.style.transform");
    expect(desktopStorySource).toContain('style={{ transform: "scaleX(0)" }}');
    expect(desktopStorySource).not.toContain("--story-page-progress-scale");
    expect(desktopStorySource).not.toContain('style={{ width: "var(--story-page-progress, 0%)" }}');
  });

  it("stops offscreen decorative rails from consuming scroll frames", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const globalStyles = readSource("src/index.css");

    expect(desktopStorySource).toContain("section.dataset.storyInViewport = nextInViewport");
    expect(globalStyles).toContain("[data-story-in-viewport='false'] .story-batumi-gallery__track");
    expect(globalStyles).toContain("[data-story-in-viewport='false'] .partner-marquee-track");
    expect(globalStyles).toContain("[data-story-in-viewport='false'] .story-journeys-track");
  });

  it("memoizes story scenes so a chapter boundary does not rerender the full page", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(desktopStorySource).toContain("const MemoizedHeroScene = memo(HeroScene)");
    expect(desktopStorySource).toContain("const MemoizedDubaiScene = memo(DubaiScene)");
    expect(desktopStorySource).toContain("const MemoizedContactScene = memo(ContactScene)");
    expect(desktopStorySource).toContain("<MemoizedDubaiScene");
  });

  it("does not dispatch duplicate custom frame events during scroll", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const smoothScrollSource = readSource("src/lib/smooth-scroll.ts");

    expect(desktopStorySource).not.toContain("glideScrollFrameEvent");
    expect(smoothScrollSource).not.toContain("window.dispatchEvent(new CustomEvent");
  });

  it("keeps story team rows wired to the team detail modal", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const modalSource = readSource("src/components/Modals.tsx");

    expect(desktopStorySource).toContain("const { openTeam } = useUI();");
    expect(desktopStorySource).toContain("openTeam(member);");
    expect(modalSource).toContain('{modal === "team" && <TeamDetail');
  });

  it("keeps leadership portrait rotation calm instead of snap-fast", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(desktopStorySource).toContain("duration: 1.35");
    expect(desktopStorySource).toContain("const storyTeamSwitchIntervalMs = 6800;");
    expect(desktopStorySource).toContain("const storyTeamResumeDelayMs = 9000;");
    expect(desktopStorySource).toContain("storyMediaSwitchReducedMotionTransition");
    expect(desktopStorySource).not.toContain("const storyTeamSwitchIntervalMs = 2400;");
  });

  it("keeps download-material numbering ordered in both marquee sets", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(desktopStorySource).toContain("order={materialIndex + 1}");
    expect(desktopStorySource).toContain('"data-material-order": String(order)');
    expect(desktopStorySource).toContain('String(order).padStart(2, "0")');
    expect(desktopStorySource).toContain('className="story-material-card__number');
    expect(desktopStorySource).toContain("const isMaterialsStatic = materials.length <= 3;");
    expect(desktopStorySource).toContain("(isMaterialsStatic ? [0] : [0, 1]).map");
  });
});
