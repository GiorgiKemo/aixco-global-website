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
    expect(fundOne?.className).toContain("lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]");
    expect(fundOneMedia?.className).toContain("lg:order-1");
    expect(fundOneCopy?.className).toContain("lg:order-2");
    expect(fundTwo).toHaveAttribute("data-image-position", "right");
    expect(fundTwo?.className).toContain("lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]");
    expect(fundTwoMedia?.className).toContain("lg:order-2");
    expect(fundTwoCopy?.className).toContain("lg:order-1");
  });

  it("uses a dense gallery layout without staggered column gaps", () => {
    renderDubai();

    const gallery = screen.getByLabelText("Fund I Eden House gallery");

    expect(gallery).toHaveAttribute("data-layout", "dense-masonry");
    expect(gallery.className).toContain("columns-1");
    expect(gallery.className).not.toContain("pt-16");
  });

  it("uses still images instead of Dubai fund videos", () => {
    const { container } = renderDubai();

    const rail = screen.getByLabelText("Dubai fund images");

    expect(rail).toHaveAttribute("data-layout", "viewport-fit-image-rail");
    expect(rail.className).toContain("grid-cols-3");
    expect(rail.className).toContain("lg:max-h-[calc(100svh-8rem)]");
    expect(rail.className).toContain("lg:grid-rows-3");
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("promotes Fund I headline metrics into visual highlight tiles", () => {
    const { container } = renderDubai();

    const highlightGrid = container.querySelector("[data-fund-highlight-grid='fund-1']");
    expect(highlightGrid).toBeInTheDocument();
    expect(highlightGrid?.className).toContain("sm:grid-cols-2");
    expect(highlightGrid?.className).toContain("gap-4");
    expect(highlightGrid?.className).toContain("pt-7");

    const unitsTile = within(highlightGrid as HTMLElement).getByText("600+").closest("[data-fund-highlight-tile]");
    const totalTile = within(highlightGrid as HTMLElement).getByText("462m").closest("[data-fund-highlight-tile]");
    const performanceTile = within(highlightGrid as HTMLElement).getByText("4.9x").closest("[data-fund-highlight-tile]");

    expect(unitsTile).toHaveTextContent("Units");
    expect(totalTile).toHaveTextContent("Total");
    expect(totalTile).toHaveTextContent("USD");
    expect(totalTile).toHaveTextContent("462m");
    expect(performanceTile).toHaveTextContent("Performance");
    expect(performanceTile?.className).toContain("border-primary");
  });
});
