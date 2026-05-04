import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Dubai } from "./Dubai";

function renderDubai() {
  return render(
    <I18nProvider>
      <Dubai />
    </I18nProvider>,
  );
}

describe("Dubai", () => {
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
    const fundTwo = remainingCards?.querySelector("[data-fund-card='fund-2']");

    expect(dubaiAnchor?.className).toContain("min-h-[calc(100svh-4rem)]");
    expect(dubaiAnchor?.className).toContain("md:min-h-[calc(100svh-5rem)]");
    expect(dubaiAnchor?.className).not.toContain("min-h-[100svh]");
    expect(landingViewport).toBeInTheDocument();
    expect(fundOne).toBeInTheDocument();
    expect(fundOne).toHaveAttribute("data-density", "viewport-fit");
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
    const railTrack = parkRail.querySelector("[data-gallery-track='horizontal-loop']");
    const railSets = parkRail.querySelectorAll("[data-gallery-set]");

    expect(parkRail).toHaveAttribute("data-layout", "horizontal-infinite-gallery");
    expect(parkRail.className).toContain("dubai-image-marquee");
    expect(parkRail.className).not.toContain("columns-");
    expect(railTrack).toBeInTheDocument();
    expect(railTrack?.className).toContain("dubai-image-marquee-track");
    expect(railSets).toHaveLength(2);
    expect(railSets[1]).toHaveAttribute("aria-hidden", "true");
    expect(within(railSets[0] as HTMLElement).getByAltText("Eden House The Park construction progress")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-gallery-tile]").length).toBeGreaterThan(0);
  });

  it("makes the image rails real horizontal scroll containers", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");

    Object.defineProperty(parkRail, "clientWidth", { configurable: true, value: 520 });
    Object.defineProperty(parkRail, "scrollWidth", { configurable: true, value: 2080 });
    parkRail.scrollLeft = 0;

    fireEvent.wheel(parkRail, { deltaX: 0, deltaY: 180 });

    expect(parkRail.closest("section")?.className).toContain("min-w-0");
    expect(parkRail).toHaveAttribute("data-native-scroll", "true");
    expect(parkRail).toHaveAttribute("data-scroll-mode", "horizontal-smooth-glide-loop");
    expect(parkRail).toHaveAttribute("data-scroll-easing", "true");
    expect(parkRail).toHaveAttribute("data-drag-scroll", "left-mouse");
    expect(parkRail.className).toContain("cursor-grab");
    expect(parkRail.scrollLeft).toBeLessThan(180);
  });

  it("lets users drag image rails horizontally with the left mouse button", () => {
    renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const parkRail = within(fundOneGallery).getByLabelText("Eden House The Park images");

    Object.defineProperty(parkRail, "clientWidth", { configurable: true, value: 520 });
    Object.defineProperty(parkRail, "scrollWidth", { configurable: true, value: 2080 });
    parkRail.scrollLeft = 600;

    fireEvent.mouseDown(parkRail, { button: 0, clientX: 300 });
    fireEvent.mouseMove(window, { clientX: 220 });
    fireEvent.mouseUp(window, { clientX: 220 });

    expect(parkRail).toHaveAttribute("data-drag-scroll", "left-mouse");
    expect(parkRail.scrollLeft).toBeGreaterThan(600);
  });

  it("uses still images instead of Dubai fund videos", () => {
    const { container } = renderDubai();

    const fundOneGallery = screen.getByLabelText("Fund I asset image gallery");
    const fundTwoGallery = screen.getByLabelText("Fund II asset image gallery");

    expect(within(fundOneGallery).getByAltText("Eden House The Canal aerial overview")).toBeInTheDocument();
    expect(within(fundTwoGallery).getByAltText("Dubai Healthcare City asset image")).toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("promotes Fund I headline metrics into visual highlight tiles", () => {
    const { container } = renderDubai();

    const highlightGrid = container.querySelector("[data-fund-highlight-grid='fund-1']");
    expect(highlightGrid).toBeInTheDocument();
    expect(highlightGrid?.className).toContain("grid-cols-1");
    expect(highlightGrid?.className).toContain("md:grid-cols-3");

    const detailNotes = container.querySelector("[data-fund-detail-notes='fund-1']");
    expect(detailNotes?.className).toContain("md:grid-cols-3");
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

    expect(fundOneGallery).toBeInTheDocument();
    expect(fundOneGallery.previousElementSibling).toBe(fundOne);
    expect(fundOneGallery).toHaveAttribute("data-gallery-source", "eden-house-and-park");
    expect(fundOneGallery.className).toContain("scroll-mt-16");
    expect(fundOneGallery.className).toContain("md:scroll-mt-20");
    expect(within(fundOne).getByRole("link", { name: /View Asset Details: Fund I/ })).toHaveAttribute(
      "href",
      "#dubai-asset-gallery-fund-1",
    );
    expect(within(fundOneGallery as HTMLElement).getByRole("heading", { name: "Eden House The Canal" })).toBeInTheDocument();
    expect(within(fundOneGallery as HTMLElement).getByRole("heading", { name: "Eden House The Park" })).toBeInTheDocument();
    expect(within(fundOneGallery as HTMLElement).getByAltText("Eden House The Canal aerial overview")).toHaveAttribute(
      "src",
      expect.stringContaining("/aixco-global-op2/images/fund1.png"),
    );
    expect(within(fundOneGallery as HTMLElement).getByAltText("Eden House The Park construction progress")).toHaveAttribute(
      "src",
      expect.stringContaining("/aixco-global-op2/images/fund/fund1.jpeg"),
    );

    expect(fundTwoGallery).toBeInTheDocument();
    expect(fundTwoGallery.previousElementSibling).toBe(fundTwo);
    expect(fundTwoGallery).toHaveAttribute("data-gallery-source", "dubai-healthcare-city");
    expect(within(fundTwo).getByRole("link", { name: /View Asset Details: Fund II/ })).toHaveAttribute(
      "href",
      "#dubai-asset-gallery-fund-2",
    );
    expect(within(fundTwoGallery as HTMLElement).getByRole("heading", { name: "Dubai Healthcare City" })).toBeInTheDocument();
    expect(within(fundTwoGallery as HTMLElement).getByAltText("Dubai Healthcare City asset image")).toHaveAttribute(
      "src",
      expect.stringContaining("/aixco-global-op2/images/fund2.png"),
    );
  });
});
