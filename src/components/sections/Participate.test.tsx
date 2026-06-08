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
    const firstViewport = container.querySelector("[data-layout='participate-first-viewport']");
    const cardGrid = container.querySelector("[data-layout='alternating-participation-cards']");
    const brokerageCard = container.querySelector("[data-participation-card='brokerage']");
    const managementCard = container.querySelector("[data-participation-card='management']");
    const apartmentCard = container.querySelector("[data-participation-card='apartment']");
    const brokerageMedia = brokerageCard?.querySelector("[data-participation-media]");
    const brokerageCopy = brokerageCard?.querySelector("[data-participation-copy]");
    const apartmentMedia = apartmentCard?.querySelector("[data-participation-media]");
    const apartmentCopy = apartmentCard?.querySelector("[data-participation-copy]");
    const apartmentCopyStack = apartmentCopy?.firstElementChild;
    const apartmentVideoWrapper = apartmentMedia?.querySelector("[data-video-state]");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("scroll-mt-16");
    expect(section?.className).toContain("md:scroll-mt-20");
    expect(section?.className).toContain("md:py-0");
    expect(section?.className).toContain("lg:pb-24");
    expect(container.querySelector("[data-viewport-fit='first-view']")).toHaveClass("md:h-[calc(100svh-5rem)]");
    expect(firstViewport).toBeInTheDocument();
    expect(cardGrid).toBeInTheDocument();
    expect(cardGrid).toHaveClass("gap-16");
    expect(cardGrid?.className).not.toContain("md:grid-cols-2");
    expect(brokerageCard).toHaveAttribute("data-design-source", "dubai-batumi-split-card-reference");
    expect(managementCard).toHaveAttribute("data-design-source", "dubai-batumi-split-card-reference");
    expect(apartmentCard).toHaveAttribute("data-design-source", "dubai-batumi-split-card-reference");
    expect(brokerageCard).not.toHaveAttribute("id", "participate");
    expect(apartmentCard).toHaveAttribute("data-image-position", "right");
    expect(brokerageCard).toHaveAttribute("data-image-position", "left");
    expect(brokerageCard?.className).toContain("md:grid-cols-12");
    expect(brokerageCard?.className).toContain("scroll-mt-24");
    expect(apartmentCard?.className).toContain("md:flex-1");
    expect(apartmentCard?.className).toContain("md:max-h-full");
    expect(apartmentCard?.className).not.toContain("md:h-[calc(100svh-5rem)]");
    expect(brokerageCard?.className).toContain("md:grid-cols-12");
    expect(brokerageCard?.className).not.toContain("md:h-[calc(100svh-5rem)]");
    expect(brokerageCard?.className).not.toContain("mac-card");
    expect(firstViewport?.querySelector("[data-participation-card='apartment']")).toBe(apartmentCard);
    expect(cardGrid?.querySelector("[data-participation-card='brokerage']")).toBe(brokerageCard);
    expect(cardGrid?.querySelector("[data-participation-card='management']")).toBe(managementCard);
    expect(apartmentMedia?.className).toContain("md:order-2");
    expect(apartmentMedia?.className).toContain("md:col-span-4");
    expect(apartmentMedia?.className).toContain("md:self-stretch");
    expect(apartmentVideoWrapper?.className).toContain("!absolute");
    expect(apartmentVideoWrapper?.className).toContain("!inset-0");
    expect(apartmentVideoWrapper?.className).toContain("!h-full");
    expect(apartmentCopy?.className).toContain("md:order-1");
    expect(apartmentCopy?.className).toContain("md:col-span-8");
    expect(apartmentCopyStack?.className).toContain("gap-5");
    expect(apartmentCopyStack?.className).toContain("max-w-[38rem]");
    expect(apartmentCopyStack?.className).toContain("md:h-full");
    expect(apartmentCopyStack?.className).toContain("md:justify-between");
    expect(brokerageMedia?.className).toContain("md:order-1");
    expect(brokerageMedia?.className).toContain("md:col-span-5");
    expect(brokerageCopy?.className).toContain("md:order-2");
    expect(brokerageCopy?.className).toContain("md:col-span-7");
    expect(apartmentCopy?.className).not.toContain("justify-center");
    expect(brokerageCopy?.className).not.toContain("md:justify-center");
    expect(apartmentCopyStack?.className).toContain("max-w-[38rem]");
    expect(within(apartmentCopy as HTMLElement).getByText("01")).toBeInTheDocument();
    expect(within(brokerageCopy as HTMLElement).getByText("02")).toBeInTheDocument();
    expect(within(brokerageCopy as HTMLElement).getByRole("heading", { name: "Broker Real Estate with AIXCO" })).toHaveClass(
      "text-[clamp(2.45rem,2.85vw,3rem)]",
    );
    expect(within(apartmentCopy as HTMLElement).getByRole("heading", { name: "Buy an Apartment in Batumi" })).toHaveClass(
      "text-[clamp(2.45rem,2.85vw,3rem)]",
    );
    expect(within(apartmentCopy as HTMLElement).getByText("Entry pricing")).toBeInTheDocument();
    expect(within(apartmentCopy as HTMLElement).getByText("Approx. net rental yields")).toBeInTheDocument();
    expect(within(apartmentCopy as HTMLElement).getByText("Bank financing")).toBeInTheDocument();
    expect(within(apartmentCopy as HTMLElement).getByText("Foreign ownership")).toBeInTheDocument();
    expect(within(brokerageCopy as HTMLElement).getByRole("button", { name: /Register/ }).className).not.toContain("mt-auto");
    expect(within(brokerageCopy as HTMLElement).getByRole("button", { name: /Register/ })).toHaveClass("self-start");
    expect(within(brokerageCopy as HTMLElement).getByRole("button", { name: /Register/ }).className).not.toContain("w-full");
    expect(screen.getAllByLabelText("Broker Real Estate with AIXCO")[0]).toHaveClass("object-cover");
    expect(screen.getByLabelText("Buy an Apartment in Batumi")).toHaveClass("object-cover");
    expect(container.querySelector(".scroll-reveal.mt-10")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "How AIXCO Works" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Register/ })).toHaveLength(3);
  });

  it("allows the slash-separated participation headline to wrap on narrow phones", () => {
    const { container } = renderParticipate();

    const heading = screen.getByRole("heading", { name: /Customers\/\s*Partners Work/ });

    expect(heading).toHaveClass("[overflow-wrap:anywhere]");
    expect(heading.querySelector("wbr")).toBeInTheDocument();
    expect(container.querySelector("section#participate")).toHaveClass("overflow-x-hidden");
    expect(container.querySelector("section#participate")).toHaveClass("md:pb-20");
    expect(container.querySelector("[data-layout='alternating-participation-cards']")).toHaveClass("md:pb-8");
  });
});
