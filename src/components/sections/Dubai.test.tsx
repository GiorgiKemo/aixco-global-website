import { render, screen } from "@testing-library/react";
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
  it("uses a dense gallery layout without staggered column gaps", () => {
    renderDubai();

    const gallery = screen.getByLabelText("Fund I Eden House gallery");

    expect(gallery).toHaveAttribute("data-layout", "dense-masonry");
    expect(gallery.className).toContain("columns-1");
    expect(gallery.className).not.toContain("pt-16");
  });

  it("keeps the three fund videos in a viewport-fit rail on desktop", () => {
    renderDubai();

    const rail = screen.getByLabelText("Dubai fund videos");

    expect(rail).toHaveAttribute("data-layout", "viewport-fit-video-rail");
    expect(rail.className).toContain("grid-cols-3");
    expect(rail.className).toContain("lg:max-h-[calc(100svh-8rem)]");
    expect(rail.className).toContain("lg:grid-rows-3");
  });
});
