import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { aixcoHeroBackgroundVideo } from "@/lib/aixco-live-assets";
import {
  getHeroVideoStartDelay,
  getHeroVideoPanelLimit,
  shouldAttachHeroVideo,
  shouldShowHeroVideoPoster,
  shouldUseHeroVideoWall,
} from "./hero-video-policy";
import {
  Hero,
  getHeroLottieArrowPath,
} from "./Hero";

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
    expect(shouldUseHeroVideoWall({ viewportWidth: 1440 })).toBe(true);
    expect(shouldUseHeroVideoWall({ viewportWidth: 390 })).toBe(true);
    expect(shouldUseHeroVideoWall({ viewportWidth: 1440, saveData: true })).toBe(false);
    expect(shouldUseHeroVideoWall({ viewportWidth: 1440, effectiveType: "3g" })).toBe(false);
    expect(shouldUseHeroVideoWall({ viewportWidth: 1440, deviceMemory: 2 })).toBe(false);
    expect(shouldUseHeroVideoWall({ viewportWidth: 1440, effectiveType: "4g", deviceMemory: 8 })).toBe(true);
  });

  it("uses the single hero background video across viewport sizes", () => {
    expect(getHeroVideoPanelLimit({ viewportWidth: 390 })).toBe(1);
    expect(getHeroVideoPanelLimit({ viewportWidth: 1440 })).toBe(1);
  });

  it("delays mobile hero video startup longer than desktop startup", () => {
    expect(getHeroVideoStartDelay(390)).toBeGreaterThan(getHeroVideoStartDelay(1440));
    expect(getHeroVideoStartDelay(390)).toBeGreaterThanOrEqual(6000);
  });

  it("waits until idle before attaching the full hero background video", () => {
    expect(
      shouldAttachHeroVideo({
        shouldUseVideoWall: true,
        isHeroVideoIdleReady: false,
        panelIndex: 0,
        panelLimit: 1,
      }),
    ).toBe(false);
    expect(
      shouldAttachHeroVideo({
        shouldUseVideoWall: true,
        isHeroVideoIdleReady: true,
        panelIndex: 0,
        panelLimit: 1,
      }),
    ).toBe(true);
  });

  it("keeps each hero poster visible until its matching video is frame-ready", () => {
    expect(shouldShowHeroVideoPoster({ shouldUseVideoWall: true, isHeroInFocus: true, isVideoReady: false })).toBe(true);
    expect(shouldShowHeroVideoPoster({ shouldUseVideoWall: true, isHeroInFocus: true, isVideoReady: true })).toBe(false);
  });

  it("keeps hero posters visible when the video wall is disabled or outside focus", () => {
    const dataSaverAllowsVideo = shouldUseHeroVideoWall({
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
    expect(hero).toHaveAttribute("data-hero-shell", "true");
    expect((hero as HTMLElement).style.getPropertyValue("--hero-viewport-height")).toMatch(/^(100dvh|\d+px)$/);
    expect(hero?.className).toContain("h-[var(--hero-viewport-height,100dvh)]");
    expect(hero?.className).toContain("max-h-[var(--hero-viewport-height,100dvh)]");
    expect(hero?.className).toContain("min-h-[100svh]");
    const composition = container.querySelector("[data-hero-composition='reference-center']");
    const contentStack = container.querySelector("[data-hero-content-stack='true']");
    const standaloneMark = container.querySelector("[data-hero-brand-mark='standalone']");
    const heading = within(hero).getByRole("heading", { level: 1 });
    const heroKicker = container.querySelector("[data-hero-kicker='true']");
    const brandDot = heading.querySelector("[data-hero-brand-dot='true']");
    const introCopy = within(hero).getByText(
      "Buy, sell, and broker real estate with AIXCO—from apartment purchases in Batumi to end-to-end property administration.",
    );
    const priceLockup = container.querySelector("[data-hero-price-lockup='true']");
    const priceText = container.querySelector("[data-hero-price-text='true']");
    const priceFootnote = container.querySelector("[data-hero-price-footnote='true']");
    const scrollLink = within(hero).getByLabelText("Scroll to About section");
    const heroVideoWall = container.querySelector("[data-hero-video-wall='true']");
    const heroVideoPanels = Array.from(container.querySelectorAll("[data-hero-video-panel='true']"));
    const heroPosterImages = Array.from(container.querySelectorAll("[data-hero-video-poster='true']"));

    expect(composition).toBeInTheDocument();
    expect(composition?.className).toContain("h-[var(--hero-viewport-height,100dvh)]");
    expect(composition?.className).toContain("max-h-[var(--hero-viewport-height,100dvh)]");
    expect(composition?.className).toContain("min-h-[100svh]");
    expect(composition?.className).toContain("items-center");
    expect(composition?.className).toContain("justify-center");
    expect(composition?.className).toContain("text-center");
    expect(contentStack).toBeInTheDocument();
    expect(contentStack?.className).toContain("translate-y-[clamp(1rem,4svh,3.5rem)]");
    const qualityLine = within(hero).getByText("Quality Real Estate — Buy · Broker · Manage");
    expect(heroKicker).toBe(qualityLine);
    expect(qualityLine).toBeInTheDocument();
    expect(heading).toHaveAttribute("data-hero-title", "true");
    expect(qualityLine.className).toContain("self-start");
    expect(qualityLine.className).toContain("sm:ml-[clamp(0rem,20vw,18rem)]");
    expect(within(hero).queryByText("GLOBAL VISION. INFINITE VALUE")).not.toBeInTheDocument();
    expect(standaloneMark).toBeInTheDocument();
    expect(standaloneMark).toHaveAttribute("loading", "eager");
    expect(standaloneMark).toHaveAttribute("fetchpriority", "high");
    expect(standaloneMark?.className).toContain("self-start");
    expect(standaloneMark?.className).toContain("sm:ml-[clamp(0rem,20vw,18rem)]");
    expect(standaloneMark?.parentElement).not.toBe(heading);
    expect(heading.querySelector("img[aria-hidden='true']")).not.toBeInTheDocument();
    expect(heading).toHaveTextContent("AIXCO.Global");
    expect(heading).not.toHaveTextContent("Starting from");
    expect(introCopy).toBeInTheDocument();
    expect(introCopy.className).toContain("max-w-[50rem]");
    expect(introCopy.className).toContain("text-[clamp(0.98rem,2.4vw,1.46rem)]");
    expect(introCopy.className).toContain("font-normal");
    expect(introCopy.className).toContain("text-white/90");
    expect(priceLockup).toBeInTheDocument();
    expect(priceLockup).toHaveAttribute("href", "#faqs");
    expect(priceLockup?.className).toContain("hover:text-primary-glow");
    expect(priceLockup?.className).toContain("focus-visible:outline");
    expect(container.querySelector("[data-hero-price-rule='true']")).not.toBeInTheDocument();
    expect(within(priceLockup as HTMLElement).getByText("Starting from €10,000")).toBeInTheDocument();
    expect(priceText?.className).toContain("text-[clamp(1.2rem,5vw,3.5rem)]");
    expect(priceText?.className).toContain("uppercase");
    expect(priceFootnote).toBeInTheDocument();
    expect(priceFootnote?.className).toContain("text-base");
    expect(priceFootnote?.className).toContain("md:text-lg");
    expect(priceFootnote?.className).toContain("leading-relaxed");
    expect(priceFootnote?.className).toContain("text-white/88");
    expect(priceFootnote?.className).not.toContain("text-[0.72rem]");
    expect(priceFootnote?.className).not.toContain("text-white/75");
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
    expect(heroPosterImages[0]).toHaveAttribute("fetchpriority", "high");
    expect(aixcoHeroBackgroundVideo.src).toContain("batumi-hero-landscape-optimized.mp4");
    expect(container.querySelectorAll("video source")).toHaveLength(0);
    expect(container.innerHTML).not.toContain("hero-batumi-night-skyline");
    expect(container.innerHTML).not.toContain("hero-benji-video");
    expect(container.innerHTML).not.toContain("hero-gateway-video");
    expect(container.innerHTML).not.toContain("giorgikemo.github.io");
  });

  it("declares tablet breakpoint constraints directly on the hero Tailwind classes", () => {
    const { container } = renderHero();

    const hero = container.querySelector("section");
    const composition = container.querySelector("[data-hero-composition='reference-center']");
    const contentStack = container.querySelector("[data-hero-content-stack='true']");
    const heading = within(hero as HTMLElement).getByRole("heading", { level: 1 });
    const introCopy = within(hero as HTMLElement).getByText(
      "Buy, sell, and broker real estate with AIXCO—from apartment purchases in Batumi to end-to-end property administration.",
    );
    const priceLockup = container.querySelector("[data-hero-price-lockup='true']");
    const priceText = container.querySelector("[data-hero-price-text='true']");
    const priceFootnote = container.querySelector("[data-hero-price-footnote='true']");
    const scrollLink = within(hero as HTMLElement).getByLabelText("Scroll to About section");
    const arrow = container.querySelector("[data-hero-lottie-arrow='true']");

    expect(composition?.className).toContain("px-6");
    expect(composition?.className).toContain("md:px-8");
    expect(composition?.className).toContain("lg:px-24");
    expect(composition?.className).toContain("flex-col");
    expect(composition?.className).toContain("md:flex-col");
    expect(contentStack?.className).toContain("max-w-[calc(100vw-3rem)]");
    expect(contentStack?.className).toContain("md:max-w-[44rem]");
    expect(contentStack?.className).toContain("lg:max-w-[72rem]");
    expect(contentStack?.className).toContain("md:flex-col");
    expect(heading.className).toContain("break-words");
    expect(heading.className).toContain("md:text-[clamp(3.25rem,7.2vw,4.75rem)]");
    expect(heading.className).toContain("lg:text-[clamp(5rem,8vw,7.45rem)]");
    expect(introCopy.className).toContain("md:max-w-[42rem]");
    expect(introCopy.className).toContain("md:text-[clamp(1rem,1.9vw,1.2rem)]");
    expect(priceLockup?.className).toContain("md:mt-6");
    expect(priceLockup?.className).toContain("flex-col");
    expect(priceLockup?.className).toContain("gap-2");
    expect(priceText?.className).toContain("md:text-[clamp(2rem,4vw,3rem)]");
    expect(priceFootnote?.className).toContain("md:max-w-xl");
    expect(priceFootnote?.className).toContain("lg:max-w-2xl");
    expect(priceText?.className).toContain("lg:text-[clamp(2.8rem,3.8vw,4rem)]");
    expect(contentStack?.className).toContain("md:landscape:translate-y-0");
    expect(contentStack?.className).toContain("lg:landscape:-translate-y-[clamp(0.5rem,3svh,1.5rem)]");
    expect(scrollLink.className).toContain("md:landscape:!h-14");
    expect(scrollLink.className).toContain("md:landscape:!w-14");
    expect(arrow?.className).toContain("md:landscape:!h-12");
    expect(arrow?.className).toContain("md:landscape:!w-12");
  });

  it("translates the hero entry price text", () => {
    localStorage.setItem("aixco-lang", "de");

    const { container } = renderHero();
    const priceLockup = container.querySelector("[data-hero-price-lockup='true']");

    expect(within(priceLockup as HTMLElement).getByText("Ab 10.000 €")).toBeInTheDocument();
    expect(within(priceLockup as HTMLElement).queryByText("Starting from €10,000")).not.toBeInTheDocument();
  });

  it("translates hero kicker and intro copy in Georgian", () => {
    localStorage.setItem("aixco-lang", "ka");

    const { container } = renderHero();
    const hero = container.querySelector("section");

    expect(
      within(hero as HTMLElement).getByText("ხარისხიანი უძრავი ქონება — ყიდვა · ბროკერინგი · მართვა"),
    ).toBeInTheDocument();
    expect(
      within(hero as HTMLElement).getByText(
        "AIXCO-თან ერთად იყიდეთ, გაყიდეთ და დააბროკერეთ უძრავი ქონება—ბათუმში ბინების შეძენიდან ობიექტების სრულ ადმინისტრირებამდე.",
      ),
    ).toBeInTheDocument();
    expect(
      within(hero as HTMLElement).queryByText(
        "Buy, sell, and broker real estate with AIXCO—from apartment purchases in Batumi to end-to-end property administration.",
      ),
    ).not.toBeInTheDocument();
    expect(
      within(hero as HTMLElement).queryByText("უძრავ ქონებაში ხარისხიანი მონაწილეობა"),
    ).not.toBeInTheDocument();
  });

  it("keeps hero intro copy fluid on narrow viewports", () => {
    const { container } = renderHero();
    const introCopy = container.querySelector("[data-hero-intro-copy='true']");

    expect(introCopy?.className).toContain("w-full");
    expect(introCopy?.className).toContain("min-w-0");
    expect(introCopy?.className).not.toContain("w-[18rem]");
    expect(introCopy?.className).toContain("[overflow-wrap:anywhere]");
  });
});
