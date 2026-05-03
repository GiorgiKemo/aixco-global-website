import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Hero } from "./Hero";

function renderHero() {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    </I18nProvider>,
  );
}

describe("Hero", () => {
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
    const heroVideos = Array.from(container.querySelectorAll("video"));
    const heroVideoWall = container.querySelector("[data-hero-video-wall='true']");
    const heroVideoPanels = Array.from(container.querySelectorAll("[data-hero-video-panel='true']"));
    const heroVideoSources = Array.from(container.querySelectorAll("video source"));

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
    expect(container.querySelector("[data-hero-price-rule='true']")).not.toBeInTheDocument();
    expect(within(priceLockup as HTMLElement).getByText("Starting from €1,000")).toBeInTheDocument();
    expect(priceText?.className).toContain("text-[clamp(2.1rem,4.85vw,4.45rem)]");
    expect(scrollLink.className).toContain("mt-7");
    expect(scrollLink.className).toContain("sm:mt-12");
    expect(brandDot).toHaveTextContent(".");
    expect(brandDot?.className).toContain("text-primary-glow");
    expect(heading).not.toHaveTextContent("AIXCO.GLOBAL");
    expect(heading).not.toHaveTextContent("AIXCO Global");
    expect(heroVideoWall).toBeInTheDocument();
    expect(heroVideoWall?.className).toContain("hero-video-wall");
    expect(heroVideos).toHaveLength(4);
    expect(heroVideoPanels).toHaveLength(4);
    expect(heroVideoSources).toHaveLength(4);
    expect(heroVideoSources.every((source) => source.getAttribute("src")?.includes("/media/batumi-gallery/batumi"))).toBe(true);
    expect(heroVideoSources.map((source) => source.getAttribute("src")).join(" ")).toContain("batumi1.mp4");
    expect(heroVideoSources.map((source) => source.getAttribute("src")).join(" ")).toContain("batumi4.mp4");
    expect(heroVideoSources.map((source) => source.getAttribute("src")).join(" ")).not.toContain("hero-batumi-night-aerial");
    expect(heroVideoSources.every((source) => source.getAttribute("media") === null)).toBe(true);
    expect(heroVideoSources.map((source) => source.getAttribute("src")).join(" ")).not.toContain("hero-batumi-night-skyline");
    expect(heroVideoSources.map((source) => source.getAttribute("src")).join(" ")).not.toContain("hero-benji-video");
    expect(heroVideoSources.map((source) => source.getAttribute("src")).join(" ")).not.toContain("hero-gateway-video");
    expect(heroVideoSources.map((source) => source.getAttribute("src")).join(" ")).not.toContain("giorgikemo.github.io");
  });
});
