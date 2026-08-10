import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InitialSiteAnimation } from "./InitialSiteAnimation";

describe("InitialSiteAnimation", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.siteIntro;
  });

  it("uses dedicated four-second landscape and portrait motion sources", () => {
    const { container } = render(<InitialSiteAnimation />);

    expect(screen.getByRole("status", { name: "AIXCO.Global loading animation" })).toBeInTheDocument();
    expect(container.querySelector("video")).toHaveAttribute("autoplay");
    expect(container.querySelector("video")).toHaveAttribute("playsinline");

    const sources = Array.from(container.querySelectorAll("source"));
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute(
      "src",
      "/aixco-global-op2/media/aixco-intro-black-portrait-1080.mp4",
    );
    expect(sources[0]).toHaveAttribute(
      "media",
      "(max-width: 767px), (orientation: portrait) and (max-width: 1023px)",
    );
    expect(sources[1]).toHaveAttribute(
      "src",
      "/aixco-global-op2/media/aixco-intro-black-1080.mp4",
    );

    const logo = container.querySelector("img");
    expect(logo).toBeInTheDocument();
    expect(decodeURIComponent(logo?.getAttribute("src") ?? "")).toContain(
      "/aixco-global-op2/images/AIXCOGlobal-horizontal-light.webp",
    );
    expect(logo).toHaveAttribute("loading", "eager");
    expect(logo).toHaveAttribute("fetchpriority", "high");
  });
});
