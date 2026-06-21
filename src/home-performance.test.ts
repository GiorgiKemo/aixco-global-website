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

  it("keeps legacy insight articles unpublished until the copy is rewritten", () => {
    const articleSource = readSource("src/app/aixco-global-op2/[slug]/page.tsx");

    expect(articleSource).toContain("generateStaticParams");
    expect(articleSource).toContain("getPropertyBySlug");
    expect(articleSource).toContain("PropertyPageContent");
    expect(articleSource).toContain("notFound()");
    expect(articleSource).not.toContain("<Nav />");
  });

  it("keeps the not-found page aligned with the public brand layout", () => {
    const notFoundSource = readSource("src/views/NotFoundView.tsx");

    expect(notFoundSource).not.toContain("<Nav />");
    expect(notFoundSource).not.toContain("<Footer />");
    expect(notFoundSource).toContain("aixcoLiveLogos.aixcoMark");
    expect(notFoundSource).toContain("bg-[#11100e]");
    expect(notFoundSource).toContain("btn-gold");
  });

  it("keeps the story boot surface on the normal page background", () => {
    const homeExperienceSource = readSource("src/components/sections/HomeExperience.tsx");
    const appLayoutSource = readSource("src/app/layout.tsx");

    expect(homeExperienceSource).toContain("function StoryBootSurface");
    expect(homeExperienceSource).toContain('className="fixed inset-0 min-h-[100svh] bg-background"');
    expect(homeExperienceSource).not.toContain("bg-white");
    expect(homeExperienceSource).not.toContain("bg-black");
    expect(appLayoutSource).not.toContain("homeStoryBootScript");
    expect(appLayoutSource).not.toContain("home-desktop-story-boot");
    expect(homeExperienceSource).not.toContain("fixed inset-y-0 left-0");
  });

  it("marks the story scroll mode before the lazy story component hydrates", () => {
    const homeExperienceSource = readSource("src/components/sections/HomeExperience.tsx");
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");

    expect(homeExperienceSource).toContain('document.documentElement.dataset.homeExperience = "story"');
    expect(homeExperienceSource).toContain("previousHomeExperience");
    expect(desktopStorySource).not.toContain("const chapterHashDelays =");
  });

  it("keeps story text reveal observation out of the scroll hot path", () => {
    const desktopStorySource = readSource("src/components/sections/DesktopStoryHome.tsx");
    const revealHookStart = desktopStorySource.indexOf("function useStoryTextInView");
    const revealComponentStart = desktopStorySource.indexOf("function StoryTextReveal");
    const revealHookSource = desktopStorySource.slice(revealHookStart, revealComponentStart);

    expect(revealHookStart).toBeGreaterThanOrEqual(0);
    expect(revealComponentStart).toBeGreaterThan(revealHookStart);
    expect(revealHookSource).toContain("IntersectionObserver");
    expect(revealHookSource).not.toContain('window.addEventListener("scroll"');
    expect(revealHookSource).not.toContain("glideScrollFrameEvent");
    expect(revealHookSource).not.toContain('window.addEventListener("resize"');
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
});
