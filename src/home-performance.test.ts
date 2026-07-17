import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("home page performance structure", () => {
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
    expect(desktopStorySource).toContain("<PhilosophyScene");
    expect(desktopStorySource).toContain("<PhilosophyDetailScene");
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

  it("primes the about video before its section and pauses it two chapters later", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const aboutSceneStart = desktopStorySource.indexOf("function AboutScene");
    const philosophySceneStart = desktopStorySource.indexOf("function PhilosophyScene");
    const aboutSceneSource = desktopStorySource.slice(aboutSceneStart, philosophySceneStart);

    expect(aboutSceneStart).toBeGreaterThanOrEqual(0);
    expect(philosophySceneStart).toBeGreaterThan(aboutSceneStart);
    expect(aboutSceneSource).toContain("const [motionPreferenceResolved, setMotionPreferenceResolved] = useState(false);");
    expect(aboutSceneSource).toContain("const shouldLoadVideo = motionPreferenceResolved && shouldReduceMotion !== true;");
    expect(aboutSceneSource).toContain("const shouldPrimeVideo = shouldLoadVideo && shouldPlayVideo;");
    expect(aboutSceneSource).toContain("src={shouldLoadVideo ? aixcoDubaiHeroVideo.src : undefined}");
    expect(aboutSceneSource).toContain("autoPlay={shouldPrimeVideo}");
    expect(aboutSceneSource).toContain("loop");
    expect(aboutSceneSource).toContain('preload={shouldLoadVideo ? "auto" : "none"}');
    expect(desktopStorySource).toContain("shouldPlayVideo={activeIndex < 3}");
    expect(desktopStorySource).toContain("storyChapters.map((_, index) => index <= 1)");
    expect(aboutSceneSource).toContain("if (!shouldPrimeVideo) {");
    expect(aboutSceneSource).toContain("video.pause();");
  });

  it("does not mount heavy story media before its section is revealed", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(desktopStorySource).toContain("const shouldRenderMedia = Boolean(isRevealed || isActive || preloadMedia);");
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

  it("drives title reveals from the existing chapter state without per-heading observers", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const revealComponentStart = desktopStorySource.indexOf("function StoryTextReveal");
    const revealComponentEnd = desktopStorySource.indexOf("function getMaterialIcon");
    const revealComponentSource = desktopStorySource.slice(revealComponentStart, revealComponentEnd);

    expect(revealComponentStart).toBeGreaterThanOrEqual(0);
    expect(revealComponentSource).toContain("active: boolean;");
    expect(revealComponentSource).toContain('data-text-reveal-engine="unified-transform"');
    expect(desktopStorySource).not.toContain("function useStoryTextInView");
    expect(revealComponentSource).not.toContain("IntersectionObserver");
    expect(revealComponentSource).not.toContain('window.addEventListener("scroll"');
  });

  it("uses one whole-title animation instead of per-glyph or compact fallbacks", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const revealComponentStart = desktopStorySource.indexOf("function StoryTextReveal");
    const revealComponentEnd = desktopStorySource.indexOf("function getMaterialIcon");
    const revealComponentSource = desktopStorySource.slice(revealComponentStart, revealComponentEnd);

    expect(revealComponentSource).toContain('className="story-title-reveal__text"');
    expect(revealComponentSource).not.toContain("story-letter-reveal__char");
    expect(revealComponentSource).not.toContain("story-letter-reveal--compact");
    expect(revealComponentSource).not.toContain("story-text-reveal__tiny-plain");
    expect(revealComponentSource).not.toContain("story-text-reveal__mobile-plain");
  });

  it("plays each story title once when its chapter first becomes active", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const revealComponentStart = desktopStorySource.indexOf("function StoryTextReveal");
    const revealComponentEnd = desktopStorySource.indexOf("function getMaterialIcon");
    const revealComponentSource = desktopStorySource.slice(revealComponentStart, revealComponentEnd);

    expect(revealComponentSource).toContain("active: boolean;");
    expect(revealComponentSource).toContain('setAnimationState("idle");');
    expect(revealComponentSource).toContain('if (!active || animationState !== "idle") return;');
    expect(revealComponentSource).not.toContain('if (!active) {\n      if (animationState === "played")');
    expect(desktopStorySource).toContain("<StoryTextReveal active={isActive}");
  });

  it("keeps scroll progress on compositor-friendly transforms", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(desktopStorySource).toContain("--story-page-progress-scale");
    expect(desktopStorySource).toContain("scaleX(var(--story-page-progress-scale, 0))");
    expect(desktopStorySource).not.toContain('style={{ width: "var(--story-page-progress, 0%)" }}');
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
});
