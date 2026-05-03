import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
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
    const details = marketCard?.querySelector("[data-batumi-detail-notes]");

    expect(anchor).toHaveAttribute("id", "batumi");
    expect(anchor).toHaveAttribute("data-viewport-fit", "first-view");
    expect(anchor.className).toContain("min-h-[calc(100svh-4rem)]");
    expect(anchor.className).toContain("md:min-h-[calc(100svh-5rem)]");
    expect(anchor.className).not.toContain("lg:auto-rows");
    expect(firstViewport).toBeInTheDocument();
    expect(marketCard).toHaveAttribute("data-design-source", "dubai-card-reference");
    expect(marketCard).toHaveAttribute("data-image-position", "right");
    expect(marketCard?.className).toContain("batumi-market-card");
    expect(marketCard?.className).toContain("md:h-[clamp(30rem,calc(100svh-13rem),42rem)]");
    expect(marketCard?.className).toContain("md:grid-cols-12");
    expect(media?.className).toContain("md:col-span-5");
    expect(copy?.className).toContain("md:col-span-7");
    expect(metricGrid?.className).toContain("md:grid-cols-3");
    expect(details).toHaveAttribute("data-layout", "prestige-highlights");
    expect(details?.className).toContain("md:grid-cols-2");
    expect(details?.className).toContain("xl:grid-cols-4");
    expect(details?.querySelectorAll("[data-batumi-detail-icon]").length).toBe(4);
    expect(screen.getByLabelText("Batumi overview media")).toHaveAttribute(
      "data-media-frame",
      "dubai-style-split-media",
    );
    expect(screen.getByLabelText("Batumi")).toHaveClass("object-contain");
    expect(screen.getByLabelText("Batumi")).toHaveAttribute(
      "poster",
      expect.stringContaining("batumi-gallery/batumi2-poster.webp"),
    );
    expect(container.querySelector('section[id="batumi"]')).not.toBeInTheDocument();
  });

  it("renders Guru and Otium as alternating Dubai-style project profile cards", () => {
    const { container } = renderBatumi();

    const profileGrid = container.querySelector("[data-layout='batumi-project-profile-cards']");
    const guruCard = container.querySelector("[data-batumi-property-card='guru']");
    const otiumCard = container.querySelector("[data-batumi-property-card='otium']");
    const guruMedia = guruCard?.querySelector("[data-batumi-property-media]");
    const otiumMedia = otiumCard?.querySelector("[data-batumi-property-media]");

    expect(profileGrid).toBeInTheDocument();
    expect(guruCard).toHaveAttribute("data-design-source", "dubai-card-reference");
    expect(otiumCard).toHaveAttribute("data-design-source", "dubai-card-reference");
    expect(guruCard).toHaveAttribute("data-image-position", "left");
    expect(otiumCard).toHaveAttribute("data-image-position", "right");
    expect(guruCard).toHaveAttribute("data-density", "standard");
    expect(guruCard?.className).toContain("md:grid-cols-12");
    expect(guruMedia?.className).toContain("md:col-span-5");
    expect(otiumMedia?.className).toContain("md:order-2");
    expect(within(guruCard as HTMLElement).getByRole("heading", { name: "Guru" })).toBeInTheDocument();
    expect(within(otiumCard as HTMLElement).getByRole("heading", { name: "Otium" })).toBeInTheDocument();
    expect(within(guruCard as HTMLElement).getByRole("button", { name: /Play video: Guru/ })).toBeInTheDocument();
    expect(within(otiumCard as HTMLElement).getByRole("button", { name: /Play video: Otium/ })).toBeInTheDocument();
    expect(within(guruCard as HTMLElement).getByRole("link", { name: /Open Guru profile/ })).toHaveAttribute(
      "href",
      expect.stringContaining("guru.pdf"),
    );
    expect(within(otiumCard as HTMLElement).getByRole("link", { name: /Open Otium profile/ })).toHaveAttribute(
      "href",
      expect.stringContaining("otium.pdf"),
    );
    expect(screen.queryByRole("button", { name: "Guru" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Otium" })).not.toBeInTheDocument();
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
});
