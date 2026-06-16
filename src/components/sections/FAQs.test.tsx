import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "@/components/ui-state";
import { FAQs } from "./FAQs";
import { faqGroups } from "@/data/site";

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
  it("matches the FAQ copy from the latest AIXCO Batumi FAQ document", () => {
    expect(faqGroups).toEqual([
      {
        group: "Real Estate Investment",
        description: "Questions and answers for clients reviewing AIXCO real estate opportunities in Batumi.",
        items: [
          {
            q: "How do I get started?",
            a: "To get started, please register on our website. Once your account is created, you will receive all further information via email.",
          },
          {
            q: "What is the minimum investment amount?",
            a: "The minimum investment amount is €5,000.",
          },
          {
            q: "Why is Batumi an attractive location for real estate investment?",
            a: "Batumi is one of the fastest-growing coastal cities in Eastern Europe, offering tourism growth, modern infrastructure, and investor-friendly policies.",
          },
          {
            q: "Can foreigners buy property in Batumi, Georgia?",
            a: "Yes, foreigners can freely purchase and own real estate with minimal restrictions.",
          },
          {
            q: "What is the process of buying property in Batumi?",
            a: "The process is simple: sign agreement and register ownership, often within days.",
          },
          {
            q: "Are there additional costs when buying property?",
            a: "There are very low costs and no property purchase tax.",
          },
          {
            q: "How secure is a real estate investment in Batumi?",
            a: "Georgia offers strong legal protection and transparent ownership systems.",
          },
          {
            q: "Can I invest through a company or only as an individual?",
            a: "You can invest either as an individual or through a company, depending on your personal, tax, or investment objectives.",
          },
          {
            q: "What value increase can I calculate for my apartment?",
            a: "Independent market research from Colliers Georgia indicates that residential property prices in Batumi have historically increased by approximately 8-15% annually, depending on location and property type.",
          },
          {
            q: "What kind of reporting do I get?",
            a: "You will receive quarterly reports covering your property's performance and the general market.",
          },
          {
            q: "Is a credit check required for bank financing?",
            a: "For 60% financing a traditional credit check is not required. Higher financing amounts may require standard bank credit approval and income verification.",
          },
          {
            q: "How much equity do I need to have to purchase an apartment?",
            a: "Typically, buyers contribute 40% equity, with financing available for up to 60% of the property value. Depending on your financial profile and financing structure, the required equity contribution may be lower.",
          },
        ],
      },
    ]);
  });

  it("uses targeted, snappy accordion transitions", () => {
    renderFAQs();

    const trigger = screen.getByRole("button", { name: "How do I get started?" });
    const icon = trigger.querySelector("svg");
    const panel = trigger.nextElementSibling as HTMLElement;

    expect(icon?.getAttribute("class")).toContain("transition-transform");
    expect(icon?.getAttribute("class")).toContain("duration-200");
    expect(icon?.getAttribute("class")).not.toContain("rotate-180");
    expect(panel.className).toContain("transition-[grid-template-rows,opacity,padding-bottom]");
    expect(panel.className).toContain("duration-300");
    expect(panel.className).not.toContain("transition-all");
    expect(panel.className).not.toContain("duration-500");

    fireEvent.click(trigger);

    expect(icon?.getAttribute("class")).toContain("rotate-180");
  });

  it("opens answers only after clicking a question", () => {
    renderFAQs();

    const trigger = screen.getByRole("button", { name: "What is the minimum investment amount?" });
    const row = trigger.parentElement as HTMLElement;
    const panel = trigger.nextElementSibling as HTMLElement;

    expect(panel.className).toContain("grid-rows-[0fr]");

    fireEvent.mouseEnter(row);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panel.className).toContain("grid-rows-[0fr]");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(panel.className).toContain("grid-rows-[1fr]");
  });
});
