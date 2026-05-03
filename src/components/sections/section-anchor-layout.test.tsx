import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "@/components/ui-state";
import { I18nProvider } from "@/i18n/I18nProvider";
import { About } from "./About";
import { Batumi } from "./Batumi";
import { Contact } from "./Contact";
import { Dubai } from "./Dubai";
import { FAQs } from "./FAQs";
import { HowItWorks } from "./HowItWorks";
import { Partners } from "./Partners";
import { Participate } from "./Participate";
import { Team } from "./Team";

function renderHomeSections() {
  return render(
    <I18nProvider>
      <UIProvider>
        <MemoryRouter>
          <About />
          <Dubai />
          <Batumi />
          <Participate />
          <HowItWorks />
          <Team />
          <Partners />
          <FAQs />
          <Contact />
        </MemoryRouter>
      </UIProvider>
    </I18nProvider>,
  );
}

describe("section anchor layout", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps every nav hash target below the fixed header instead of hiding the first content", () => {
    renderHomeSections();

    for (const id of ["about", "dubai", "batumi", "participate", "how", "team", "partners", "faqs", "contact"]) {
      const anchor = document.getElementById(id);

      expect(anchor, `Missing #${id}`).toBeInTheDocument();
      expect(anchor?.className, `#${id} should account for the fixed mobile nav`).toContain("scroll-mt-16");
      expect(anchor?.className, `#${id} should preserve tablet/desktop header clearance`).toContain("md:scroll-mt-20");
      expect(anchor?.className, `#${id} should not use a zero scroll margin`).not.toContain("scroll-mt-0");
    }
  });

  it("uses dedicated first-viewport landing anchors for media-heavy Dubai and Batumi sections", () => {
    const { container } = renderHomeSections();
    const dubaiAnchor = document.getElementById("dubai");
    const batumiAnchor = document.getElementById("batumi");

    expect(dubaiAnchor).toHaveAttribute("data-viewport-fit", "first-view");
    expect(batumiAnchor).toHaveAttribute("data-viewport-fit", "first-view");
    expect(container.querySelector("section#dubai")).not.toBeInTheDocument();
    expect(container.querySelector("section#batumi")).not.toBeInTheDocument();
  });
});
