import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "@/components/ui-state";
import { FAQs } from "./FAQs";

function renderFAQs() {
  return render(
    <I18nProvider>
      <UIProvider>
        <FAQs />
      </UIProvider>
    </I18nProvider>,
  );
}

describe("FAQs", () => {
  it("uses targeted, snappy accordion transitions", () => {
    renderFAQs();

    const trigger = screen.getByRole("button", { name: "What is the minimum investment amount?" });
    const icon = trigger.querySelector("svg");
    const panel = trigger.nextElementSibling as HTMLElement;

    expect(icon?.getAttribute("class")).toContain("transition-transform");
    expect(icon?.getAttribute("class")).toContain("duration-200");
    expect(panel.className).toContain("transition-[grid-template-rows,opacity,padding-bottom]");
    expect(panel.className).toContain("duration-300");
    expect(panel.className).not.toContain("transition-all");
    expect(panel.className).not.toContain("duration-500");
  });
});
