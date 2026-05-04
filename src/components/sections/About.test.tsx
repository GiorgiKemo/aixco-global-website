import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { About } from "./About";

function renderAbout() {
  return render(
    <I18nProvider>
      <About />
    </I18nProvider>,
  );
}

describe("About", () => {
  it("uses a balanced two-column layout with story media on the left and metrics on the right", () => {
    const { container } = renderAbout();

    expect(container.querySelector('[data-section-layout="about-balanced-two-column"]')).toBeInTheDocument();
    expect(screen.getByLabelText("About AIXCO story and media")).toBeInTheDocument();
    expect(screen.getByLabelText("AIXCO performance metrics")).toHaveAttribute("data-density", "compact");
    expect(screen.getByRole("heading", { name: "AIXCO - Product Powerhouse" })).toHaveAttribute(
      "data-scale",
      "reduced",
    );

    const storyImage = screen.getByRole("img", {
      name: "Batumi skyline and landmark towers from the live AIXCO site",
    });
    expect(storyImage).toHaveAttribute("src", expect.stringContaining("batumip.webp"));
    expect(storyImage).toHaveAttribute("width", "1448");
    expect(storyImage).toHaveAttribute("height", "1086");
    expect(storyImage).toHaveAttribute("data-frame", "tall");
    expect(storyImage).toHaveAttribute("data-image-treatment", "uncropped");
  });
});
