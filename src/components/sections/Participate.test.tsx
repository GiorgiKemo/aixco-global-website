import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "@/components/ui-state";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Participate } from "./Participate";

function renderParticipate() {
  return render(
    <I18nProvider>
      <UIProvider>
        <Participate />
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
    const bondCopyStack = bondCopy?.firstElementChild;
    const apartmentMedia = apartmentCard?.querySelector("[data-participation-media]");
    const apartmentCopy = apartmentCard?.querySelector("[data-participation-copy]");
    const apartmentCopyStack = apartmentCopy?.firstElementChild;
    const bondVideoWrapper = bondMedia?.querySelector("[data-video-state]");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("scroll-mt-16");
    expect(section?.className).toContain("md:scroll-mt-20");
    expect(section?.className).toContain("lg:py-0");
    expect(cardGrid).toBeInTheDocument();
    expect(cardGrid).toHaveClass("gap-16");
    expect(cardGrid?.className).not.toContain("md:grid-cols-2");
    expect(bondCard).toHaveAttribute("data-design-source", "dubai-batumi-split-card-reference");
    expect(apartmentCard).toHaveAttribute("data-design-source", "dubai-batumi-split-card-reference");
    expect(bondCard).not.toHaveAttribute("id", "participate");
    expect(bondCard).toHaveAttribute("data-image-position", "right");
    expect(apartmentCard).toHaveAttribute("data-image-position", "left");
    expect(bondCard?.className).toContain("md:grid-cols-12");
    expect(bondCard?.className).toContain("scroll-mt-24");
    expect(bondCard?.className).not.toContain("md:h-[calc(100svh-5rem)]");
    expect(bondCard?.className).not.toContain("md:min-h-[min(40rem,calc(100svh-7rem))]");
    expect(apartmentCard?.className).toContain("md:grid-cols-12");
    expect(apartmentCard?.className).toContain("md:h-[calc(100svh-5rem)]");
    expect(apartmentCard?.className).toContain("md:max-h-[calc(100svh-5rem)]");
    expect(bondCard?.className).not.toContain("mac-card");
    expect(bondMedia?.className).toContain("md:order-2");
    expect(bondMedia?.className).toContain("md:col-span-5");
    expect(bondMedia?.className).toContain("md:self-stretch");
    expect(bondVideoWrapper?.className).toContain("!absolute");
    expect(bondVideoWrapper?.className).toContain("!inset-0");
    expect(bondVideoWrapper?.className).toContain("!h-full");
    expect(bondCopy?.className).toContain("md:order-1");
    expect(bondCopy?.className).toContain("md:col-span-7");
    expect(bondCopyStack?.className).toContain("gap-5");
    expect(bondCopyStack?.className).not.toContain("max-w-[36rem]");
    expect(bondCopyStack?.className).not.toContain("flex-1");
    expect(bondCopyStack?.className).not.toContain("justify-between");
    expect(bondCopy?.className).not.toContain("justify-start");
    expect(bondCopy?.className).not.toContain("justify-center");
    expect(apartmentMedia?.className).toContain("md:order-1");
    expect(apartmentMedia?.className).toContain("md:col-span-5");
    expect(apartmentCopy?.className).toContain("md:order-2");
    expect(apartmentCopy?.className).toContain("md:col-span-7");
    expect(apartmentCopy?.className).not.toContain("md:justify-center");
    expect(apartmentCopyStack?.className).toContain("max-w-[38rem]");
    expect(apartmentCopyStack?.className).toContain("md:h-full");
    expect(apartmentCopyStack?.className).toContain("md:justify-between");
    expect(within(bondCopy as HTMLElement).getByText("01")).toBeInTheDocument();
    expect(within(apartmentCopy as HTMLElement).getByText("02")).toBeInTheDocument();
    expect(within(bondCopy as HTMLElement).getByRole("heading", { name: "Buy the AIXCO 6% Bond" })).toHaveClass(
      "text-[clamp(2.45rem,2.85vw,3rem)]",
    );
    expect(within(apartmentCopy as HTMLElement).getByRole("heading", { name: "Buy an Apartment in Batumi" })).toHaveClass(
      "text-[clamp(2.45rem,2.85vw,3rem)]",
    );
    expect(within(apartmentCopy as HTMLElement).getByText("Entry pricing")).toBeInTheDocument();
    expect(within(apartmentCopy as HTMLElement).getByText("Net rental yields")).toBeInTheDocument();
    expect(within(apartmentCopy as HTMLElement).getByText("Foreign ownership")).toBeInTheDocument();
    expect(within(bondCopy as HTMLElement).getByRole("button", { name: /Register/ }).className).not.toContain("mt-auto");
    expect(within(bondCopy as HTMLElement).getByRole("button", { name: /Register/ })).toHaveClass("self-start");
    expect(within(bondCopy as HTMLElement).getByRole("button", { name: /Register/ }).className).not.toContain("w-full");
    expect(screen.getByLabelText("Buy the AIXCO 6% Bond")).toHaveClass("object-cover");
    expect(screen.getByLabelText("Buy an Apartment in Batumi")).toHaveClass("object-cover");
    expect(container.querySelector(".scroll-reveal.mt-10")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "How AIXCO Works" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Register/ })).toHaveLength(2);
  });

  it("allows the slash-separated participation headline to wrap on narrow phones", () => {
    const { container } = renderParticipate();

    const heading = screen.getByRole("heading", { name: /Customers\/\s*Partners Profit/ });

    expect(heading).toHaveClass("[overflow-wrap:anywhere]");
    expect(heading.querySelector("wbr")).toBeInTheDocument();
    expect(container.querySelector("section#participate")).toHaveClass("overflow-hidden");
  });
});
