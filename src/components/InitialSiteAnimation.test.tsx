import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { InitialSiteAnimation } from "./InitialSiteAnimation";

describe("InitialSiteAnimation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
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
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.siteIntro;
    delete document.documentElement.dataset.siteIntroSeen;
  });

  it("uses dedicated four-second landscape and portrait motion sources", async () => {
    const { container } = render(<InitialSiteAnimation />);

    expect(screen.getByRole("status", { name: "AIXCO.Global loading animation" })).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector("video")).toBeInTheDocument());
    expect(container.querySelector("video")).toHaveAttribute("autoplay");
    expect(container.querySelector("video")).toHaveAttribute("playsinline");
    expect(container.querySelector("video")).toHaveAttribute(
      "poster",
      "/aixco-global-op2/media/aixco-intro-black-poster-hd.webp",
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
      "/aixco-global-op2/media/aixco-intro-black-poster-hd.webp",
    );
    expect(window.localStorage.getItem("aixco-site-intro-v1")).toBe("seen");
  });

  it("does not replay after it has already run in this browser", async () => {
    window.localStorage.setItem("aixco-site-intro-v1", "seen");

    const { container } = render(<InitialSiteAnimation />);

    await waitFor(() => expect(container.querySelector("[data-site-intro]")).not.toBeInTheDocument());
    expect(document.documentElement.dataset.siteIntro).toBe("complete");
  });

  it("recognizes an existing language preference as a returning visitor", async () => {
    window.localStorage.setItem("aixco-lang", "en");

    const { container } = render(<InitialSiteAnimation />);

    await waitFor(() => expect(container.querySelector("[data-site-intro]")).not.toBeInTheDocument());
    expect(window.localStorage.getItem("aixco-site-intro-v1")).toBe("seen");
    expect(document.documentElement.dataset.siteIntro).toBe("complete");
  });

  it("migrates the former session marker without replaying the intro", async () => {
    window.sessionStorage.setItem("aixco-site-intro-v1", "seen");

    const { container } = render(<InitialSiteAnimation />);

    await waitFor(() => expect(container.querySelector("[data-site-intro]")).not.toBeInTheDocument());
    expect(window.localStorage.getItem("aixco-site-intro-v1")).toBe("seen");
    expect(document.documentElement.dataset.siteIntro).toBe("complete");
  });
});
