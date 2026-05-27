import { render, screen } from "@testing-library/react";
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
  it("matches the FAQ copy from the original AIXCO op2 site", () => {
    expect(faqGroups).toEqual([
      {
        group: "Customer",
        description: "Buying property, reserving apartments, or working with AIXCO on real estate services.",
        items: [
          {
            q: "What is the minimum amount to reserve or buy?",
            a: "Typical entry starts from €10,000. On selected Batumi apartments from €50,000, a 10% reservation (from €5,000) may be available—final terms depend on the project and purchase agreement.",
          },
          {
            q: "Can I buy property directly?",
            a: "Yes. Customers may pursue direct apartment purchase, brokerage support, or property administration.",
          },
          {
            q: "Is rental income guaranteed?",
            a: "No. Rental income, resale value, and timing depend on market conditions, occupancy, property management, and project delivery.",
          },
          {
            q: "Will I receive reporting?",
            a: "Yes. Reporting, documents, and project updates are available through the portal.",
          },
          {
            q: "Can foreigners buy property in Batumi?",
            a: "Yes. Foreigners can purchase and own real estate with minimal restrictions.",
          },
        ],
      },
      {
        group: "Broker",
        description: "For intermediaries managing clients, tours, and deal flow.",
        items: [
          {
            q: "What are the benefits for brokers?",
            a: "Brokers gain structured client management, curated listings, stronger presentation tools, and better coordination.",
          },
          {
            q: "Can I book a tour for my customer?",
            a: "Yes. The platform supports tour coordination and a smoother customer journey.",
          },
          {
            q: "Do login and registration do different things?",
            a: "Yes. Login opens the relevant portal. Register starts the onboarding process for access approval.",
          },
          {
            q: "What support is available after sign-up?",
            a: "AIXCO provides follow-up support, coordination, and a more guided service model rather than simple self-service.",
          },
        ],
      },
      {
        group: "Developer",
        description: "For developers listing projects and using AIXCO as a sales channel.",
        items: [
          {
            q: "What do developers gain by registering?",
            a: "Developers gain stronger project exposure, better inquiry handling, coordinated tours, and a more premium end-to-end sales flow.",
          },
          {
            q: "Can AIXCO help distribute projects?",
            a: "Yes. AIXCO can function as a structured distribution and presentation channel for selected listings.",
          },
          {
            q: "Does AIXCO support the sales process?",
            a: "Yes. Support can include project visibility, lead handling, tours, and documentation flow.",
          },
        ],
      },
    ]);
  });

  it("uses targeted, snappy accordion transitions", () => {
    renderFAQs();

    const trigger = screen.getByRole("button", { name: "What is the minimum amount to reserve or buy?" });
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
