import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Dubai } from "./Dubai";

function renderDubai() {
  return render(
    <I18nProvider>
      <Dubai />
    </I18nProvider>,
  );
}

function renderedImageSrc(image: HTMLElement) {
  return decodeURIComponent(image.getAttribute("src") ?? "");
}

function mockGalleryAnimationFrames() {
  const callbacks: FrameRequestCallback[] = [];

  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

  return {
    runQueuedFrames(time: number) {
      const queued = callbacks.splice(0);
      act(() => {
        queued.forEach((callback) => callback(time));
      });
    },
  };
}

describe("Dubai", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lays out fund cards as alternating image and copy columns", () => {
    const { container } = renderDubai();

    const fundGrid = container.querySelector("[data-layout='alternating-fund-cards']");
    const fundOne = container.querySelector("[data-fund-card='fund-1']");
    const fundTwo = container.querySelector("[data-fund-card='fund-2']");
    const fundOneMedia = fundOne?.querySelector("[data-fund-media]");
    const fundOneCopy = fundOne?.querySelector("[data-fund-copy]");
    const fundTwoMedia = fundTwo?.querySelector("[data-fund-media]");
    const fundTwoCopy = fundTwo?.querySelector("[data-fund-copy]");

    expect(fundGrid).toBeInTheDocument();
    expect(fundGrid?.className).not.toContain("lg:grid-cols-2");
    expect(fundOne).toHaveAttribute("data-image-position", "left");
    expect(fundOne).toHaveAttribute("data-design-source", "eden-house-portfolio-reference");
    expect(fundOne?.className).toContain("transition-[transform,box-shadow,border-color]");
    expect(fundOne?.className).not.toContain("transition-all");
    expect(fundOne?.className).toContain("md:grid-cols-12");
    expect(fundOne?.className).toContain("lg:grid-cols-12");
    expect(fundOneMedia?.className).toContain("md:order-1");
    expect(fundOneMedia?.className).toContain("md:col-span-5");
    expect(fundOneMedia?.className).toContain("lg:order-1");
    expect(fundOneMedia?.className).toContain("lg:col-span-5");
    expect(fundOneCopy?.className).toContain("md:order-2");
    expect(fundOneCopy?.className).toContain("md:col-span-7");
    expect(fundOneCopy?.className).toContain("lg:order-2");
    expect(fundOneCopy?.className).toContain("lg:col-span-7");
    expect(fundTwo).toHaveAttribute("data-image-position", "right");
    expect(fundTwo?.className).toContain("md:grid-cols-12");
    expect(fundTwo?.className).toContain("lg:grid-cols-12");
    expect(fundTwoMedia?.className).toContain("md:order-2");
    expect(fundTwoMedia?.className).toContain("md:col-span-5");
    expect(fundTwoMedia?.className).toContain("lg:order-2");
    expect(fundTwoMedia?.className).toContain("lg:col-span-5");
    expect(fundTwoCopy?.className).toContain("md:order-1");
    expect(fundTwoCopy?.className).toContain("md:col-span-7");
    expect(fundTwoCopy?.className).toContain("lg:order-1");
    expect(fundTwoCopy?.className).toContain("lg:col-span-7");
  });

  it("uses the Eden House portfolio visual system for fund cards", () => {
    const { container } = renderDubai();

    const fundOne = container.querySelector("[data-fund-card='fund-1']");
    const title = within(fundOne as HTMLElement).getByRole("heading", {
      name: "Fund I Eden House The Canal & Eden House The Park",
    });
    const highlightGrid = container.querySelector("[data-fund-highlight-grid='fund-1']");
    const details = container.querySelector("[data-fund-detail-notes='fund-1']");
    const performanceTile = within(highlightGrid as HTMLElement).getByText("4.9x").closest("[data-fund-highlight-tile]");
    const performanceAccent = performanceTile?.lastElementChild as HTMLElement | null;
    const titleAccent = within(title).getByText("The Canal");

    expect(fundOne?.className).toContain("bg-white");
    expect(title.className).toContain("font-display");
    expect(title.className).not.toContain("font-serif-display");
    expect(titleAccent.className).toContain("text-primary");
    expect(titleAccent.className).not.toContain("italic");
    expect(within(fundOne as HTMLElement).getByRole("img", { name: "Fund I Eden House The Canal & Eden House The Park" })).toHaveAttribute(
      "loading",
      "lazy",
    );
    expect(fundOne?.querySelector("[class*='font-serif-display']")).not.toBeInTheDocument();
    expect(highlightGrid?.className).toContain("grid-cols-1");
    expect(highlightGrid?.className).toContain("md:grid-cols-3");
    expect(performanceTile?.className).toContain("bg-foreground");
    expect(performanceTile?.className).toContain("transition-[background-color,border-color,box-shadow,color]");
    expect(performanceTile?.className).not.toContain("transition-all");
    expect(performanceAccent?.className).toContain("transition-[width,background-color]");
    expect(performanceAccent?.className).toContain("[transition-duration:400ms]");
    expect(performanceAccent?.className).not.toContain("duration-400");
    expect(details).toHaveAttribute("data-layout", "prestige-highlights");
    expect(details?.className).toContain("bg-surface/45");
    expect(details?.querySelectorAll("[data-fund-detail-icon]").length).toBe(3);
  });

  it("keeps the Dubai hash landing focused on Fund I instead of exposing the next card", () => {
    const { container } = renderDubai();

    const dubaiAnchor = container.querySelector("#dubai");
    const landingViewport = container.querySelector("[data-layout='dubai-first-viewport']");
    const remainingCards = container.querySelector("[data-layout='remaining-dubai-fund-cards']");
    const fundOne = landingViewport?.querySelector("[data-fund-card='fund-1']");
    const fundOneGallery = landingViewport?.querySelector("[data-fund-asset-gallery='fund-1']");
    const fundTwo = remainingCards?.querySelector("[data-fund-card='fund-2']");

    expect(dubaiAnchor?.className).toContain("min-h-[calc(100svh-4rem)]");
    expect(dubaiAnchor?.className).toContain("md:min-h-[calc(100svh-5rem)]");
    expect(dubaiAnchor?.className).not.toContain("min-h-[100svh]");
    expect(landingViewport).toBeInTheDocument();
    expect(fundOne).toBeInTheDocument();
    expect(fundOne).toHaveAttribute("data-density", "viewport-fit");
    expect(fundOneGallery).toHaveAttribute("data-viewport-offset", "landing-gallery");
    expect(fundOneGallery?.className).toContain("mt-28");
    expect(fundOneGallery?.className).toContain("md:mt-32");
    expect(fundTwo).toHaveAttribute("data-density", "standard");
    expect(landingViewport?.querySelector("[data-fund-card='fund-2']")).not.toBeInTheDocument();
    expect(remainingCards?.querySelector("[data-fund-card='fund-2']")).toBeInTheDocument();
    expect(remainingCards?.querySelector("[data-fund-card='fund-1']")).not.toBeInTheDocument();
  });

  it("removes the old duplicate Dubai gallery section below the fund cards", () => {
    const { container } = renderDubai();

    expect(screen.queryByLabelText("Fund I Eden House gallery")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Dubai fund images")).not.toBeInTheDocument();
    expect(container.querySelector("[data-layout='dense-masonry']")).not.toBeInTheDocument();
    expect(container.querySelector("[data-layout='viewport-fit-image-rail']")).not.toBeInTheDocument();
  });

  it("uses horizontal infinite image rails instead of vertical gallery columns", () => {
    const { container } = renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");
    const railTrack = parkRail.querySelector("[data-gallery-track='framer-motion-loop']");
    const railSets = parkRail.querySelectorAll("[data-gallery-set]");

    expect(parkRail).toHaveAttribute("data-layout", "horizontal-infinite-gallery");
    expect(parkRail.className).toContain("dubai-image-marquee");
    expect(parkRail.className).not.toContain("columns-");
    expect(railTrack).toBeInTheDocument();
    expect(railTrack?.className).toContain("dubai-image-marquee-track");
    expect(railSets).toHaveLength(2);
    expect(railSets[1]).toHaveAttribute("aria-hidden", "true");
    const primaryRailImage = within(railSets[0] as HTMLElement).getByAltText("Eden House The Park construction progress");
    const duplicateRailImage = (railSets[1] as HTMLElement).querySelector("img");

    expect(primaryRailImage).toHaveAttribute("draggable", "false");
    expect(renderedImageSrc(primaryRailImage)).not.toContain("/_next/image");
    expect(primaryRailImage).toHaveAttribute("loading", "eager");
    expect(duplicateRailImage).toHaveAttribute("loading", "eager");
    expect(container.querySelectorAll("[data-gallery-tile]").length).toBeGreaterThan(0);
  });

  it("uses Framer Motion-controlled image rails instead of direct native scroll stepping", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");
    const railTrack = parkRail.querySelector("[data-gallery-track='framer-motion-loop']");

    Object.defineProperty(parkRail, "clientWidth", { configurable: true, value: 520 });
    Object.defineProperty(parkRail, "scrollWidth", { configurable: true, value: 2080 });
    parkRail.scrollLeft = 0;

    fireEvent.wheel(parkRail, { deltaX: 0, deltaY: 180 });

    expect(parkRail.closest("section")?.className).toContain("min-w-0");
    expect(parkRail).toHaveAttribute("data-motion-engine", "framer-motion");
    expect(parkRail).toHaveAttribute("data-visual-scroll", "framer-transform");
    expect(parkRail).toHaveAttribute("data-glide-scroll-native", "true");
    expect(parkRail).not.toHaveAttribute("data-native-scroll");
    expect(parkRail).toHaveAttribute("data-scroll-mode", "framer-motion-glide-loop");
    expect(parkRail).toHaveAttribute("data-scroll-easing", "true");
    expect(parkRail).toHaveAttribute("data-drag-scroll", "pointer-capture");
    expect(parkRail.className).toContain("cursor-grab");
    expect(railTrack).toBeInTheDocument();
    expect(parkRail.scrollLeft).toBe(0);
  });

  it("auto-advances image rails on animation frames", () => {
    const frames = mockGalleryAnimationFrames();
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");

    Object.defineProperty(parkRail, "clientWidth", { configurable: true, value: 520 });
    Object.defineProperty(parkRail, "scrollWidth", { configurable: true, value: 2080 });
    parkRail.scrollLeft = 0;

    frames.runQueuedFrames(1000);
    frames.runQueuedFrames(2000);

    expect(parkRail).toHaveAttribute("data-auto-scroll", "continuous");
    expect(parkRail).toHaveAttribute("data-motion-engine", "framer-motion");
  });

  it("glides backward wheel input into the loop tail instead of crawling forward through the rail", () => {
    const frames = mockGalleryAnimationFrames();
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");

    Object.defineProperty(parkRail, "clientWidth", { configurable: true, value: 520 });
    Object.defineProperty(parkRail, "scrollWidth", { configurable: true, value: 2080 });
    parkRail.scrollLeft = 0;

    frames.runQueuedFrames(1000);
    fireEvent.wheel(parkRail, { deltaX: 0, deltaY: -180 });
    frames.runQueuedFrames(1016);

    expect(parkRail).toHaveAttribute("data-scroll-mode", "framer-motion-glide-loop");
    expect(parkRail).toHaveAttribute("data-motion-engine", "framer-motion");
    expect(parkRail.scrollLeft).toBe(0);
  });

  it("lets users drag image rails horizontally with the left mouse button", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");

    Object.defineProperty(parkRail, "clientWidth", { configurable: true, value: 520 });
    Object.defineProperty(parkRail, "scrollWidth", { configurable: true, value: 2080 });
    parkRail.scrollLeft = 600;

    fireEvent.pointerDown(parkRail, { button: 0, pointerId: 3, pointerType: "mouse", clientX: 300, clientY: 24 });
    fireEvent.pointerMove(parkRail, { pointerId: 3, pointerType: "mouse", clientX: 220, clientY: 24 });
    fireEvent.pointerUp(parkRail, { pointerId: 3, pointerType: "mouse", clientX: 220, clientY: 24 });

    expect(parkRail).toHaveAttribute("data-drag-scroll", "pointer-capture");
    expect(parkRail).toHaveAttribute("data-motion-engine", "framer-motion");
  });

  it("lets users drag image rails horizontally with pointer-captured touch input", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");

    Object.defineProperty(parkRail, "clientWidth", { configurable: true, value: 520 });
    Object.defineProperty(parkRail, "scrollWidth", { configurable: true, value: 2080 });

    fireEvent.pointerDown(parkRail, { pointerId: 7, pointerType: "touch", clientX: 300, clientY: 24 });
    fireEvent.pointerMove(parkRail, { pointerId: 7, pointerType: "touch", clientX: 220, clientY: 26 });
    fireEvent.pointerUp(parkRail, { pointerId: 7, pointerType: "touch", clientX: 220, clientY: 26 });

    expect(parkRail).toHaveAttribute("data-drag-scroll", "pointer-capture");
    expect(parkRail).toHaveAttribute("data-motion-engine", "framer-motion");
  });

  it("keeps gallery image buttons draggable and only expands them on a real click or tap", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");
    const imageButton = within(parkRail).getByRole("button", {
      name: "Expand image: Eden House The Park construction progress",
    });

    fireEvent.mouseDown(imageButton, { button: 0, clientX: 320, clientY: 24 });
    fireEvent.mouseMove(window, { clientX: 250, clientY: 24 });
    fireEvent.mouseUp(window, { clientX: 250, clientY: 24 });
    fireEvent.click(imageButton);

    expect(screen.queryByRole("dialog", { name: "Expanded image: Eden House The Park construction progress" })).not.toBeInTheDocument();

    fireEvent.click(imageButton);

    expect(screen.getByRole("dialog", { name: "Expanded image: Eden House The Park construction progress" })).toBeInTheDocument();
  });

  it("expands gallery images after a pointer tap without horizontal movement", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");
    const imageButton = within(parkRail).getByRole("button", {
      name: "Expand image: Eden House The Park construction progress",
    });

    fireEvent.pointerDown(imageButton, { pointerId: 9, pointerType: "touch", clientX: 320, clientY: 24 });
    fireEvent.pointerUp(imageButton, { pointerId: 9, pointerType: "touch", clientX: 320, clientY: 24 });
    fireEvent.click(imageButton);

    expect(screen.getByRole("dialog", { name: "Expanded image: Eden House The Park construction progress" })).toBeInTheDocument();
  });

  it("expands gallery images after a left mouse click without horizontal movement", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");
    const imageButton = within(parkRail).getByRole("button", {
      name: "Expand image: Eden House The Park construction progress",
    });

    fireEvent.pointerDown(imageButton, { button: 0, pointerId: 11, pointerType: "mouse", clientX: 320, clientY: 24 });
    fireEvent.pointerUp(imageButton, { button: 0, pointerId: 11, pointerType: "mouse", clientX: 320, clientY: 24 });
    fireEvent.click(imageButton, { button: 0, clientX: 320, clientY: 24 });

    expect(screen.getByRole("dialog", { name: "Expanded image: Eden House The Park construction progress" })).toBeInTheDocument();
  });

  it("does not expand gallery images from the click generated after a touch swipe", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");
    const imageButton = within(parkRail).getByRole("button", {
      name: "Expand image: Eden House The Park construction progress",
    });

    fireEvent.touchStart(imageButton, { touches: [{ clientX: 320, clientY: 24 }] });
    fireEvent.touchMove(window, { touches: [{ clientX: 250, clientY: 24 }] });
    fireEvent.touchEnd(window);
    fireEvent.click(imageButton);

    expect(screen.queryByRole("dialog", { name: "Expanded image: Eden House The Park construction progress" })).not.toBeInTheDocument();

    fireEvent.click(imageButton);

    expect(screen.getByRole("dialog", { name: "Expanded image: Eden House The Park construction progress" })).toBeInTheDocument();
  });

  it("uses still images instead of Dubai fund videos", () => {
    const { container } = renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const fundTwoGallery = screen.getByLabelText("Fund II asset image gallery");

    expect(within(fundOneGallery).getByAltText("Eden House The Canal aerial overview")).toBeInTheDocument();
    expect(within(fundTwoGallery).getByAltText("Dubai Healthcare City asset image")).toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("expands Dubai card and gallery images when clicked", () => {
    const { container } = renderDubai();

    const fundOne = container.querySelector("[data-fund-card='fund-1']");
    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");

    fireEvent.click(within(fundOne as HTMLElement).getByRole("button", { name: /Expand image: Fund I Eden House/i }));

    const fundOneDialog = screen.getByRole("dialog", { name: /Expanded image: Fund I Eden House/i });
    expect(fundOneDialog).toBeInTheDocument();
    expect(within(fundOneDialog).getByAltText("Fund I Eden House The Canal & Eden House The Park")).toHaveAttribute(
      "src",
      expect.stringContaining("/aixco-global-op2/images/fund/fund1.jpeg"),
    );

    fireEvent.keyDown(window, { key: "Escape" });

    fireEvent.click(within(fundOneGallery).getByRole("button", { name: "Expand image: Eden House The Canal aerial overview" }));

    expect(screen.getByRole("dialog", { name: "Expanded image: Eden House The Canal aerial overview" })).toBeInTheDocument();
    expect(screen.getAllByAltText("Eden House The Canal aerial overview").some((image) => image.closest("[role='dialog']"))).toBe(true);
  });

  it("enriches Fund II with source facts and multiple Dubai Healthcare City visuals", () => {
    const { container } = renderDubai();

    const fundTwo = container.querySelector("[data-fund-card='fund-2']");
    const fundTwoGallery = screen.getByLabelText("Fund II asset image gallery");

    expect(fundTwo).toHaveTextContent("Target Net IRR");
    expect(fundTwo).toHaveTextContent("~20%");
    expect(fundTwo).toHaveTextContent("Investment Period");
    expect(fundTwo).toHaveTextContent("4 years");
    expect(fundTwo).toHaveTextContent("Location");
    expect(fundTwo).toHaveTextContent("Dubai Creek - Dubai, UAE");
    expect(fundTwo).toHaveTextContent("Mixed-use masterplan combining Build-to-Rent and Build-to-Sell models");
    expect(within(fundTwoGallery).getByAltText("Dubai Healthcare City source site image")).toBeInTheDocument();
    expect(within(fundTwoGallery).getByAltText("Dubai Healthcare City skyline site context")).toBeInTheDocument();
    expect(within(fundTwoGallery).getByAltText("Dubai Healthcare City fund location map")).toBeInTheDocument();
  });

  it("promotes Fund I headline metrics into visual highlight tiles", () => {
    const { container } = renderDubai();

    const highlightGrid = container.querySelector("[data-fund-highlight-grid='fund-1']");
    expect(highlightGrid).toBeInTheDocument();
    expect(highlightGrid?.className).toContain("grid-cols-1");
    expect(highlightGrid?.className).toContain("md:grid-cols-3");

    const detailNotes = container.querySelector("[data-fund-detail-notes='fund-1']");
    expect(detailNotes?.className).toContain("sm:grid-cols-2");
    expect(detailNotes?.className).toContain("xl:grid-cols-3");
    expect(detailNotes).toHaveAttribute("data-layout", "prestige-highlights");

    const unitsTile = within(highlightGrid as HTMLElement).getByText("600").closest("[data-fund-highlight-tile]");
    const totalTile = within(highlightGrid as HTMLElement).getByText("462").closest("[data-fund-highlight-tile]");
    const performanceTile = within(highlightGrid as HTMLElement).getByText("4.9x").closest("[data-fund-highlight-tile]");

    expect(unitsTile).toHaveTextContent("Units");
    expect(unitsTile).toHaveTextContent("+");
    expect(totalTile).toHaveTextContent("Total");
    expect(totalTile).toHaveTextContent("m USD");
    expect(performanceTile).toHaveTextContent("Performance");
    expect(performanceTile?.className).toContain("bg-foreground");
    expect(performanceTile?.className).not.toContain("transition-all");
  });

  it("does not render oversized numbering over Dubai fund media", () => {
    const { container } = renderDubai();

    const fundCards = container.querySelectorAll("[data-fund-card]");

    expect(fundCards).toHaveLength(2);
    expect(fundCards[0].querySelector("[data-fund-media]")).not.toHaveTextContent("01");
    expect(fundCards[1].querySelector("[data-fund-media]")).not.toHaveTextContent("02");
  });

  it("renders matching Dubai fund asset galleries directly below their fund cards", () => {
    const { container } = renderDubai();

    const fundOneShell = container.querySelector("[data-fund-card-shell='fund-1']");
    const fundTwoShell = container.querySelector("[data-fund-card-shell='fund-2']");
    const fundOne = within(fundOneShell as HTMLElement).getByRole("article");
    const fundTwo = within(fundTwoShell as HTMLElement).getByRole("article");
    const fundOneGallery = within(fundOneShell as HTMLElement).getByLabelText("Fund I asset image gallery");
    const fundTwoGallery = within(fundTwoShell as HTMLElement).getByLabelText("Fund II asset image gallery");
    const fundOneAssetLink = within(fundOne).getByRole("link", { name: /View Asset Details: Fund I/ });
    const fundTwoAssetLink = within(fundTwo).getByRole("link", { name: /View Asset Details: Fund II/ });

    expect(fundOneGallery).toBeInTheDocument();
    expect(fundOneGallery.previousElementSibling).toBe(fundOne);
    expect(fundOneGallery).toHaveAttribute("data-gallery-source", "eden-house-and-park");
    expect(fundOneGallery.className).toContain("scroll-mt-16");
    expect(fundOneGallery.className).toContain("md:scroll-mt-20");
    expect(fundOneAssetLink).toHaveAttribute("href", "#dubai-asset-gallery-fund-1");
    expect(fundOneAssetLink).toHaveClass("asset-detail-cta");
    expect(fundOneAssetLink.className).not.toContain("bottom-8");
    expect(fundOneAssetLink.querySelector(".asset-detail-cta__label")).toHaveTextContent("View Asset Details");
    expect(fundOneAssetLink.querySelector(".asset-detail-cta__icon")).toBeInTheDocument();
    expect(within(fundOneGallery as HTMLElement).getByRole("heading", { name: "Eden House The Canal" })).toBeInTheDocument();
    expect(within(fundOneGallery as HTMLElement).getByRole("heading", { name: "Eden House The Park" })).toBeInTheDocument();
    expect(renderedImageSrc(within(fundOneGallery as HTMLElement).getByAltText("Eden House The Canal aerial overview"))).toContain(
      "/aixco-global-op2/images/fund1.png",
    );
    expect(within(fundOneGallery as HTMLElement).getByAltText("Eden House The Canal aerial overview")).toHaveAttribute(
      "loading",
      "eager",
    );
    expect(renderedImageSrc(within(fundOneGallery as HTMLElement).getByAltText("Eden House The Park construction progress"))).toContain(
      "/aixco-global-op2/images/fund/fund1.jpeg",
    );

    expect(fundTwoGallery).toBeInTheDocument();
    expect(fundTwoGallery.previousElementSibling).toBe(fundTwo);
    expect(fundTwoGallery).toHaveAttribute("data-gallery-source", "dubai-healthcare-city");
    expect(fundTwoAssetLink).toHaveAttribute("href", "#dubai-asset-gallery-fund-2");
    expect(fundTwoAssetLink).toHaveClass("asset-detail-cta");
    expect(within(fundTwoGallery as HTMLElement).getByRole("heading", { name: "Dubai Healthcare City" })).toBeInTheDocument();
    expect(renderedImageSrc(within(fundTwoGallery as HTMLElement).getByAltText("Dubai Healthcare City asset image"))).toContain(
      "/aixco-global-op2/images/fund2.png",
    );
  });
});
