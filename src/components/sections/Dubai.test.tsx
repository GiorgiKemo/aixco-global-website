import { render, screen, within } from "@testing-library/react";
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

  it("uses a dense gallery layout without staggered column gaps", () => {
    renderDubai();

    const gallery = screen.getByLabelText("Fund I Eden House gallery");
    const firstImage = screen.getByAltText("Fund I Eden House gallery 1");

    expect(gallery).toHaveAttribute("data-layout", "dense-masonry");
    expect(gallery.className).toContain("columns-1");
    expect(gallery.className).not.toContain("pt-16");
    expect(firstImage.className).toContain("transition-transform");
    expect(firstImage.className).toContain("duration-500");
    expect(firstImage.className).not.toContain("duration-700");
  });

  it("uses still images instead of Dubai fund videos", () => {
    const { container } = renderDubai();

    const rail = screen.getByLabelText("Dubai fund images");
    const railImage = screen.getByAltText("Eden House construction view");

    expect(rail).toHaveAttribute("data-layout", "viewport-fit-image-rail");
    expect(rail.className).toContain("grid-cols-3");
    expect(rail.className).toContain("lg:max-h-[calc(100svh-8rem)]");
    expect(rail.className).toContain("lg:grid-rows-3");
    expect(railImage.className).toContain("transition-transform");
    expect(railImage.className).toContain("duration-500");
    expect(railImage.className).not.toContain("duration-700");
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
});
