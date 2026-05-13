import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { aixcoHeroBackgroundVideo } from "@/lib/aixco-live-assets";
import { Hero, getHeroLottieArrowPath, getHeroVideoPanelLimit, shouldShowHeroVideoPoster, shouldUseHeroVideoWall } from "./Hero";

function renderHero() {
  return render(
    <I18nProvider>
      <Hero />
    </I18nProvider>,
  );
}

function renderedImageSrc(image: Element) {
  return decodeURIComponent(image.getAttribute("src") ?? "");
}

describe("Hero", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("resolves the hero arrow animation from the app base URL", () => {
    expect(getHeroLottieArrowPath("/")).toBe("/animations/arrow-down-gold.json");
    expect(getHeroLottieArrowPath("/aixco-global-website/")).toBe("/aixco-global-website/animations/arrow-down-gold.json");
    expect(getHeroLottieArrowPath("/aixco-global-website")).toBe("/aixco-global-website/animations/arrow-down-gold.json");
  });

  it("enables the video wall across viewport sizes unless media constraints ask for lighter loading", () => {
    expect(shouldUseHeroVideoWall({ reduceMotion: true, viewportWidth: 1440 })).toBe(true);
    expect(shouldUseHeroVideoWall({ reduceMotion: false, viewportWidth: 390 })).toBe(true);
    expect(shouldUseHeroVideoWall({ reduceMotion: false, viewportWidth: 1440, saveData: true })).toBe(false);
    expect(shouldUseHeroVideoWall({ reduceMotion: false, viewportWidth: 1440, effectiveType: "3g" })).toBe(false);
    expect(shouldUseHeroVideoWall({ reduceMotion: false, viewportWidth: 1440, deviceMemory: 2 })).toBe(false);
    expect(shouldUseHeroVideoWall({ reduceMotion: false, viewportWidth: 1440, effectiveType: "4g", deviceMemory: 8 })).toBe(true);
  });

  it("uses the single hero background video across viewport sizes", () => {
    expect(getHeroVideoPanelLimit({ viewportWidth: 390 })).toBe(1);
    expect(getHeroVideoPanelLimit({ viewportWidth: 1440 })).toBe(1);
  });

  it("keeps each hero poster visible until its matching video is frame-ready", () => {
    expect(shouldShowHeroVideoPoster({ shouldUseVideoWall: true, isHeroInFocus: true, isVideoReady: false })).toBe(true);
    expect(shouldShowHeroVideoPoster({ shouldUseVideoWall: true, isHeroInFocus: true, isVideoReady: true })).toBe(false);
  });

  it("keeps hero posters visible when the video wall is disabled or outside focus", () => {
    const dataSaverAllowsVideo = shouldUseHeroVideoWall({
      reduceMotion: false,
      viewportWidth: 1440,
      saveData: true,
    });

    expect(dataSaverAllowsVideo).toBe(false);
    expect(shouldShowHeroVideoPoster({ shouldUseVideoWall: dataSaverAllowsVideo, isHeroInFocus: true, isVideoReady: true })).toBe(true);
    expect(shouldShowHeroVideoPoster({ shouldUseVideoWall: true, isHeroInFocus: false, isVideoReady: true })).toBe(true);
  });

  it("uses the centered reference-style AIXCO.Global hero composition", () => {
    const { container } = renderHero();

    const hero = container.querySelector("section");
    expect(hero).not.toBeNull();
    const composition = container.querySelector("[data-hero-composition='reference-center']");
    const contentStack = container.querySelector("[data-hero-content-stack='true']");
    const standaloneMark = container.querySelector("[data-hero-brand-mark='standalone']");
    const heading = within(hero).getByRole("heading", { level: 1 });
    const brandDot = heading.querySelector("[data-hero-brand-dot='true']");
    const introCopy = within(hero).getByText(
      "Participate where growth, stability, and long term value creation meet. AIXCO gives private partners a simple and transparent way to join selected real estate projects.",
    );
    const priceLockup = container.querySelector("[data-hero-price-lockup='true']");
    const priceText = container.querySelector("[data-hero-price-text='true']");
    const scrollLink = within(hero).getByLabelText("Scroll to About section");
    const heroVideoWall = container.querySelector("[data-hero-video-wall='true']");
    const heroVideoPanels = Array.from(container.querySelectorAll("[data-hero-video-panel='true']"));
    const heroPosterImages = Array.from(container.querySelectorAll("[data-hero-video-poster='true']"));

    expect(composition).toBeInTheDocument();
    expect(composition?.className).toContain("items-center");
    expect(composition?.className).toContain("justify-center");
    expect(composition?.className).toContain("text-center");
    expect(contentStack).toBeInTheDocument();
    expect(contentStack?.className).toContain("translate-y-[clamp(1rem,4svh,3.5rem)]");
    const qualityLine = within(hero).getByText("Quality Real Estate Participation");
    expect(qualityLine).toBeInTheDocument();
    expect(qualityLine.className).toContain("self-start");
    expect(qualityLine.className).toContain("sm:ml-[clamp(0rem,20vw,18rem)]");
    expect(within(hero).queryByText("GLOBAL VISION. INFINITE VALUE")).not.toBeInTheDocument();
    expect(standaloneMark).toBeInTheDocument();
    expect(standaloneMark?.className).toContain("self-start");
    expect(standaloneMark?.className).toContain("sm:ml-[clamp(0rem,20vw,18rem)]");
    expect(standaloneMark?.parentElement).not.toBe(heading);
    expect(heading.querySelector("img[aria-hidden='true']")).not.toBeInTheDocument();
    expect(heading).toHaveTextContent("AIXCO.Global");
    expect(heading).not.toHaveTextContent("Starting from");
    expect(introCopy).toBeInTheDocument();
    expect(introCopy.className).toContain("max-w-[50rem]");
    expect(introCopy.className).toContain("text-[clamp(1.08rem,2.55vw,1.46rem)]");
    expect(introCopy.className).toContain("font-normal");
    expect(introCopy.className).toContain("text-white/90");
    expect(priceLockup).toBeInTheDocument();
    expect(priceLockup).toHaveAttribute("href", "#faqs");
    expect(priceLockup?.className).toContain("hover:text-primary-glow");
    expect(priceLockup?.className).toContain("focus-visible:outline");
    expect(container.querySelector("[data-hero-price-rule='true']")).not.toBeInTheDocument();
    expect(within(priceLockup as HTMLElement).getByText("Starting from €1,000")).toBeInTheDocument();
    expect(priceText?.className).toContain("text-[clamp(1.2rem,5vw,3.5rem)]");
    expect(priceText?.className).toContain("uppercase");
    expect(scrollLink).toHaveAttribute("data-hero-scroll-cue", "viewport");
    expect(scrollLink.parentElement).toHaveAttribute("data-hero-composition", "reference-center");
    expect(scrollLink.closest("[data-hero-content-stack='true']")).not.toBeInTheDocument();
    expect(scrollLink.className).toContain("absolute");
    expect(scrollLink.className).toContain("inset-x-0");
    expect(scrollLink.className).toContain("bottom-[clamp(1rem,4svh,2.75rem)]");
    expect(scrollLink.className).toContain("mx-auto");
    expect(scrollLink.className).not.toContain("mt-7");
    expect(scrollLink.className).not.toContain("sm:mt-12");
    expect(scrollLink.className).toContain("transition-colors");
    expect(scrollLink.className).toContain("duration-200");
    expect(brandDot).toHaveTextContent(".");
    expect(brandDot?.className).toContain("text-primary-glow");
    expect(heading).not.toHaveTextContent("AIXCO.GLOBAL");
    expect(heading).not.toHaveTextContent("AIXCO Global");
    expect(heroVideoWall).toBeInTheDocument();
    expect(heroVideoWall?.className).toContain("hero-video-wall");
    expect(heroVideoWall).toHaveAttribute("data-hero-video-mode", "poster");
    expect(heroVideoPanels).toHaveLength(1);
    expect(heroPosterImages).toHaveLength(1);
    expect(renderedImageSrc(heroPosterImages[0])).toContain("/media/batumi-hero-landscape-poster.jpg");
    expect(aixcoHeroBackgroundVideo.src).toContain("batumi-hero-landscape-optimized.mp4");
    expect(container.querySelectorAll("video source")).toHaveLength(0);
    expect(container.innerHTML).not.toContain("hero-batumi-night-skyline");
    expect(container.innerHTML).not.toContain("hero-benji-video");
    expect(container.innerHTML).not.toContain("hero-gateway-video");
    expect(container.innerHTML).not.toContain("giorgikemo.github.io");
  });

  it("translates the hero entry price text", () => {
    localStorage.setItem("aixco-lang", "de");

    const { container } = renderHero();
    const priceLockup = container.querySelector("[data-hero-price-lockup='true']");

    expect(within(priceLockup as HTMLElement).getByText("Ab 1.000 €")).toBeInTheDocument();
    expect(within(priceLockup as HTMLElement).queryByText("Starting from €1,000")).not.toBeInTheDocument();
  });
});
