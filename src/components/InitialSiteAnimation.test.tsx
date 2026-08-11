import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
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

  it("uses dedicated four-second landscape and portrait motion sources", async () => {
    const { container } = render(<InitialSiteAnimation />);

    expect(screen.getByRole("status", { name: "AIXCO.Global loading animation" })).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector("video")).toBeInTheDocument());
    expect(container.querySelector("video")).toHaveAttribute("autoplay");
    expect(container.querySelector("video")).toHaveAttribute("playsinline");
    expect(container.querySelector("video")).toHaveAttribute(
      "poster",
      "/aixco-global-op2/media/aixco-intro-black-poster.webp",
    );

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

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(decodeURIComponent(container.querySelector("img")?.getAttribute("src") ?? "")).toContain(
      "/aixco-global-op2/media/aixco-intro-black-poster.webp",
    );
  });
});
