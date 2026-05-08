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
    expect(storyImage).toHaveAttribute("data-image-treatment", "fill-card");
    expect(storyImage.className).toContain("object-cover");
    expect(storyImage.className).not.toContain("object-contain");
  });

  it("centers the desktop About layout inside the navbar-aware viewport", () => {
    const { container } = renderAbout();

    const section = container.querySelector("section#about");
    const layout = container.querySelector('[data-section-layout="about-balanced-two-column"]');
    const story = screen.getByLabelText("About AIXCO story and media");
    const metrics = screen.getByLabelText("AIXCO performance metrics");
    const storyImage = screen.getByRole("img", {
      name: "Batumi skyline and landmark towers from the live AIXCO site",
    });

    expect(section?.className).toContain("lg:flex");
    expect(section?.className).toContain("lg:min-h-[calc(100svh-5rem)]");
    expect(section?.className).toContain("lg:items-center");
    expect(section?.className).toContain("lg:py-0");
    expect(section?.className).not.toContain("lg:py-24");
    expect(layout?.className).toContain("lg:items-center");
    expect(story.className).toContain("lg:self-center");
    expect(metrics.className).toContain("lg:self-center");
    expect(storyImage.parentElement?.className).toContain("aspect-[4/3]");
    expect(storyImage.parentElement?.className).not.toContain("lg:aspect-[16/9]");
  });

  it("keeps the About image clean without a blurred duplicate background", () => {
    const { container } = renderAbout();

    const imageFrame = screen
      .getByRole("img", { name: "Batumi skyline and landmark towers from the live AIXCO site" })
      .parentElement;

    expect(imageFrame?.querySelectorAll('img[src*="batumip.webp"]')).toHaveLength(1);
    expect(imageFrame?.querySelector("[class*='blur']")).not.toBeInTheDocument();
  });
});
