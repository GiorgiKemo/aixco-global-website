import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { partners } from "@/data/site";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Partners } from "./Partners";

const uiMocks = vi.hoisted(() => ({
  openPartner: vi.fn(),
}));

vi.mock("../ui-state", () => ({
  useUI: () => ({
    openPartner: uiMocks.openPartner,
  }),
}));

function renderPartners() {
  return render(
    <I18nProvider>
      <Partners />
    </I18nProvider>,
  );
}

describe("Partners", () => {
  beforeEach(() => {
    uiMocks.openPartner.mockClear();
  });

  it("renders premium partner cards inside the scrolling marquees", () => {
    const { container } = renderPartners();

    const groupMarquee = screen.getByLabelText("Group companies");
    const strategicMarquee = screen.getByLabelText("Strategic partners");
    const card = container.querySelector(".partner-marquee-item");

    expect(groupMarquee).toBeInTheDocument();
    expect(strategicMarquee).toBeInTheDocument();
    expect(container.querySelector(".scroll-reveal.mac-card.mb-10")).not.toBeInTheDocument();
    expect(card).toBeInTheDocument();
    expect(card?.querySelector(".partner-marquee-item__logo-stage img")).toBeInTheDocument();
    expect(card?.querySelector(".partner-marquee-item__logo-stage img")).toHaveAttribute("loading", "lazy");
    expect(card?.querySelector(".partner-marquee-item__name")).toHaveTextContent("Global Partners");
    expect(container.querySelectorAll(".partner-marquee-set")).toHaveLength(4);
  });

  it("opens the partner profile when a real marquee card is clicked", () => {
    renderPartners();

    fireEvent.click(screen.getByRole("button", { name: "Global Partners" }));

    expect(uiMocks.openPartner).toHaveBeenCalledWith(partners[0]);
  });
});
