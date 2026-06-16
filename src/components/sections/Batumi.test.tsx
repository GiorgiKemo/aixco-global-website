import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SiteContentContext } from "@/data/site-content-context";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { aixcoLiveImages, aixcoLiveVideoPreviews, aixcoLiveVideos } from "@/lib/aixco-live-assets";
import { Batumi } from "./Batumi";

function renderBatumi() {
  return render(
    <I18nProvider>
      <Batumi />
    </I18nProvider>,
  );
}

describe("Batumi", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses a Dubai-style first viewport card for the Batumi overview", () => {
    const { container } = renderBatumi();

    const anchor = screen.getByLabelText("Batumi market overview");
    const firstViewport = container.querySelector("[data-layout='batumi-first-viewport']");
    const marketCard = container.querySelector("[data-batumi-card='market-overview']");
    const media = marketCard?.querySelector("[data-batumi-card-media]");
    const copy = marketCard?.querySelector("[data-batumi-card-copy]");
    const metricGrid = marketCard?.querySelector("[data-batumi-metric-grid]");
    const entryTile = within(metricGrid as HTMLElement).getByText("EUR 50k").closest("[data-batumi-metric-tile]");
    const entryAccent = entryTile?.lastElementChild as HTMLElement | null;
    const details = marketCard?.querySelector("[data-batumi-detail-notes]");

    expect(anchor).toHaveAttribute("id", "batumi");
    expect(anchor).toHaveAttribute("data-viewport-fit", "first-view");
    expect(anchor.className).toContain("min-h-[calc(100svh-4rem)]");
    expect(anchor.className).toContain("md:min-h-[calc(100svh-5rem)]");
    expect(anchor.className).not.toContain("lg:auto-rows");
    expect(firstViewport).toBeInTheDocument();
    expect(marketCard).toHaveAttribute("data-design-source", "dubai-card-reference");
    expect(marketCard).toHaveAttribute("data-image-position", "right");
    expect(marketCard?.className).toContain("transition-[transform,box-shadow,border-color]");
    expect(marketCard?.className).not.toContain("transition-all");
    expect(marketCard?.className).toContain("md:h-full");
    expect(marketCard?.className).toContain("md:max-h-full");
    expect(marketCard?.className).toContain("md:flex-1");
    expect(marketCard?.className).toContain("md:grid-cols-12");
    expect(media?.className).toContain("md:col-span-5");
    expect(media?.className).toContain("batumi-match-current-project-video-height");
    expect(media?.className).toContain("md:min-h-0");
    expect(copy?.className).toContain("md:col-span-7");
    expect(metricGrid?.className).toContain("md:grid-cols-3");
    expect(entryTile?.className).toContain("bg-foreground");
    expect(entryTile?.className).toContain("transition-[background-color,border-color,box-shadow,color]");
    expect(entryTile?.className).not.toContain("transition-all");
    expect(entryAccent?.className).toContain("transition-[width,background-color]");
    expect(entryAccent?.className).toContain("[transition-duration:400ms]");
    expect(entryAccent?.className).not.toContain("duration-400");
    expect(details).toHaveAttribute("data-layout", "prestige-highlights");
    expect(details?.className).toContain("md:grid-cols-2");
    expect(details?.className).toContain("lg:grid-cols-4");
    expect(details?.querySelectorAll("[data-batumi-detail-icon]").length).toBe(4);
    expect(screen.getByLabelText("Batumi overview media")).toHaveAttribute(
      "data-media-frame",
      "dubai-style-split-media",
    );
    expect(media?.querySelector("img[role='presentation']")).toBeInTheDocument();
    expect(media?.querySelector("img[role='presentation']")).toHaveAttribute("src");
    expect(screen.getByLabelText("Batumi")).toHaveAttribute("poster", aixcoLiveImages.batumiBuyPoster);
    expect(screen.getByLabelText("Batumi")).not.toHaveAttribute("src");
    expect(screen.getByLabelText("Batumi")).toHaveClass("object-cover");
    expect(aixcoLiveVideos.batumiBuy).toContain("/media/batumi-gallery/batumi1.mp4");
    expect(aixcoLiveVideoPreviews.batumiBuy).toContain("/media/batumi-gallery/previews/batumi1-preview.mp4");
    expect(container.querySelector('section[id="batumi"]')).not.toBeInTheDocument();
  });

  it("renders the current Batumi project profile card and excludes the retired Batumi project", () => {
    const { container } = renderBatumi();
    const retiredProjectId = ["g", "uru"].join("");
    const retiredProjectName = ["Gu", "ru"].join("");

    const profileGrid = container.querySelector("[data-layout='batumi-project-profile-cards']");
    const currentProjectCard = container.querySelector("[data-batumi-property-card='current-project']");
    const currentProjectMedia = currentProjectCard?.querySelector("[data-batumi-property-media]");
    const currentProjectMetrics = currentProjectCard?.querySelector("[data-batumi-property-highlight-grid='current-project']");
    const currentProjectDetails = currentProjectCard?.querySelector("[data-batumi-property-detail-notes='current-project']");
    const currentProjectTitle = currentProjectCard?.querySelector("[data-batumi-property-title]");

    expect(profileGrid).toBeInTheDocument();
    expect(container.querySelector(`[data-batumi-property-card='${retiredProjectId}']`)).not.toBeInTheDocument();
    expect(screen.queryByText(retiredProjectName)).not.toBeInTheDocument();
    expect(currentProjectCard).toHaveAttribute("data-design-source", "dubai-card-reference");
    expect(currentProjectCard).toHaveAttribute("data-image-position", "left");
    expect(currentProjectCard).toHaveAttribute("data-density", "standard");
    expect(currentProjectCard?.className).toContain("transition-[transform,box-shadow,border-color]");
    expect(currentProjectCard?.className).not.toContain("transition-all");
    expect(currentProjectCard?.className).toContain("md:grid-cols-12");
    expect(currentProjectMedia?.className).toContain("md:col-span-5");
    expect(currentProjectMedia?.className).toContain("min-h-[22rem]");
    expect(currentProjectMedia?.className).not.toContain("batumi-match-current-project-video-height");
    expect(within(currentProjectCard as HTMLElement).getByRole("heading", { name: "Current project" })).toBeInTheDocument();
    expect(currentProjectTitle?.querySelector("p")).not.toBeInTheDocument();
    expect(currentProjectCard).not.toHaveTextContent("59 Adlia Street");
    expect(currentProjectCard).toHaveTextContent("AIXCO-managed buyer guidance");
    expect(currentProjectCard).toHaveTextContent("408");
    expect(currentProjectCard).toHaveTextContent("total units");
    expect(currentProjectCard).toHaveTextContent("Jun 2028");
    expect(currentProjectMetrics).toHaveTextContent("17");
    expect(currentProjectMetrics).toHaveTextContent("408");
    expect(currentProjectMetrics).toHaveTextContent("Jun 2028");
    expect(currentProjectDetails).toHaveTextContent("25,000 sqm");
    expect(currentProjectDetails).toHaveTextContent("45,000 sqm");
    expect(currentProjectDetails).toHaveTextContent("$80/night");
    expect(currentProjectCard).not.toHaveTextContent("Current project PDF");
    expect(within(currentProjectCard as HTMLElement).getByRole("button", { name: /Play video: Current project/ })).toBeInTheDocument();
    expect(within(currentProjectCard as HTMLElement).queryByRole("link", { name: /View Asset Details: Current project/ })).not.toBeInTheDocument();
    expect(within(currentProjectCard as HTMLElement).queryByRole("link", { name: /Open current project profile/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: retiredProjectName })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Current project" })).not.toBeInTheDocument();
  });

  it("keeps the Batumi gallery and removes the old Queens and Serenade content", () => {
    renderBatumi();

    expect(screen.getByLabelText("Batumi video gallery")).toHaveAttribute("data-layout", "portrait-video-gallery");
    expect(screen.getAllByRole("button", { name: /Play video: Batumi gallery/ })).toHaveLength(6);
    expect(screen.getByLabelText("Batumi benefit highlights")).toHaveAttribute(
      "data-layout",
      "batumi-benefits-dubai-card",
    );
    expect(screen.queryByText("Queens")).not.toBeInTheDocument();
    expect(screen.queryByText("Serenade")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Queens/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Serenade/ })).not.toBeInTheDocument();
  });

  it("does not render oversized numbering over Batumi card media", () => {
    const { container } = renderBatumi();

    const marketMedia = container.querySelector("[data-batumi-card-media]");
    const propertyCards = container.querySelectorAll("[data-batumi-property-card]");

    expect(marketMedia).not.toHaveTextContent("01");
    expect(propertyCards[0].querySelector("[data-batumi-property-media]")).not.toHaveTextContent("02");
    expect(propertyCards).toHaveLength(1);
  });

  it("does not use a CMS property URL as an external asset link", () => {
    render(
      <I18nProvider>
        <SiteContentContext.Provider
          value={{
            ...siteContentDefaults,
            batumiProperties: [
              {
                ...siteContentDefaults.batumiProperties[0],
                url: "javascript:alert(1)",
              },
            ],
          }}
        >
          <Batumi />
        </SiteContentContext.Provider>
      </I18nProvider>,
    );

    expect(screen.queryByRole("link", { name: /View Asset Details: Current project/ })).not.toBeInTheDocument();
  });
});
