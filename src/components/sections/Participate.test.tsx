import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "@/components/ui-state";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Participate } from "./Participate";

function renderParticipate() {
  return render(
    <I18nProvider>
      <UIProvider>
        <MemoryRouter>
          <Participate />
        </MemoryRouter>
      </UIProvider>
    </I18nProvider>,
  );
}

describe("Participate", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses alternating Dubai/Batumi-style split cards instead of a two-card grid", () => {
    const { container } = renderParticipate();

    const section = container.querySelector("section#participate");
    const cardGrid = container.querySelector("[data-layout='alternating-participation-cards']");
    const bondCard = container.querySelector("[data-participation-card='bond']");
    const apartmentCard = container.querySelector("[data-participation-card='apartment']");
    const bondMedia = bondCard?.querySelector("[data-participation-media]");
    const bondCopy = bondCard?.querySelector("[data-participation-copy]");
    const apartmentMedia = apartmentCard?.querySelector("[data-participation-media]");
    const apartmentCopy = apartmentCard?.querySelector("[data-participation-copy]");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("scroll-mt-16");
    expect(section?.className).toContain("md:scroll-mt-20");
    expect(section?.className).toContain("lg:py-16");
    expect(cardGrid).toBeInTheDocument();
    expect(cardGrid?.className).not.toContain("md:grid-cols-2");
    expect(bondCard).toHaveAttribute("data-design-source", "dubai-batumi-split-card-reference");
    expect(apartmentCard).toHaveAttribute("data-design-source", "dubai-batumi-split-card-reference");
    expect(bondCard).not.toHaveAttribute("id", "participate");
    expect(bondCard).toHaveAttribute("data-image-position", "right");
    expect(apartmentCard).toHaveAttribute("data-image-position", "left");
    expect(bondCard?.className).toContain("md:grid-cols-12");
    expect(bondCard?.className).toContain("md:min-h-[clamp(28rem,calc(100svh-24rem),34rem)]");
    expect(apartmentCard?.className).toContain("md:grid-cols-12");
    expect(bondCard?.className).not.toContain("mac-card");
    expect(bondMedia?.className).toContain("md:order-2");
    expect(bondMedia?.className).toContain("md:col-span-5");
    expect(bondCopy?.className).toContain("md:order-1");
    expect(bondCopy?.className).toContain("md:col-span-7");
    expect(bondCopy?.className).toContain("justify-start");
    expect(bondCopy?.className).not.toContain("justify-center");
    expect(apartmentMedia?.className).toContain("md:order-1");
    expect(apartmentMedia?.className).toContain("md:col-span-5");
    expect(apartmentCopy?.className).toContain("md:order-2");
    expect(apartmentCopy?.className).toContain("md:col-span-7");
    expect(within(bondCopy as HTMLElement).getByText("01")).toBeInTheDocument();
    expect(within(apartmentCopy as HTMLElement).getByText("02")).toBeInTheDocument();
    expect(within(bondCopy as HTMLElement).getByRole("heading", { name: "Buy the AIXCO 6% Bond" })).toHaveClass(
      "text-3xl",
    );
    expect(within(apartmentCopy as HTMLElement).getByRole("heading", { name: "Buy an Apartment in Batumi" })).toHaveClass(
      "text-3xl",
    );
    expect(within(bondCopy as HTMLElement).getByRole("button", { name: /Register/ })).toHaveClass("self-start");
    expect(within(bondCopy as HTMLElement).getByRole("button", { name: /Register/ }).className).not.toContain("w-full");
    expect(screen.getByLabelText("Buy the AIXCO 6% Bond")).toHaveClass("object-cover");
    expect(screen.getByLabelText("Buy an Apartment in Batumi")).toHaveClass("object-cover");
  });
});
