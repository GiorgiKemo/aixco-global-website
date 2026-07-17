import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { heroIntroText, heroOpportunityFootnote, heroStoryStatementLines } from "@/components/sections/hero/hero-ui";
import { journeys } from "@/data/site";
import { I18nProvider, hasTextTranslation, useI18n } from "./I18nProvider";
import { languageOptions, type Lang } from "./languages";

function TranslationProbe() {
  const { t, tx } = useI18n();

  return (
    <div>
      <p>{tx("Explore Batumi real estate")}</p>
      <p>{tx("Rental income")}</p>
      <p>{tx("starting from")}</p>
      <p>{tx("Group company")}</p>
      <p>{t("cta.start")}</p>
    </div>
  );
}

function MarketAccessProbe() {
  const { tx } = useI18n();

  return (
    <div>
      <p data-testid="market-access-hero">{tx("Emerging Market Opportunities")}</p>
      <p data-testid="market-access-title">{tx("Emerging Market Opportunities with AIXCO")}</p>
      <p data-testid="opportunities-growth-headline">
        {tx("Expanding through carefully selected opportunities")}
      </p>
    </div>
  );
}

const visibleStoryProbeTexts = [
  "Global Real Estate",
  "Emerging Market Opportunities with AIXCO",
  "EXPLORE OPPORTUNITIES",
  "CONTACT ME",
  "Every client starts with a different objective",
  "Some are looking to build long-term wealth through real estate ownership. Others want recurring income, international diversification, or simply a way to participate in a market they believe has strong future potential.",
  "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.",
  "Dubai - Legacy portfolio",
  "Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.",
  "Dubai Healthcare City (legacy development)",
  "Legacy portfolio — realized",
  "Legacy portfolio — in progress",
  "Selected emerging-market projects and apartments through AIXCO, with Batumi as the current focus, entry from €45,000, 100% foreign ownership, bank financing minimum 60%, and a transparent ISO-certified process.",
  "Ours: a current AIXCO residential project with selected apartments, structured buyer guidance, and completion targeted for June 2028.",
  "Access property reference images and supporting documentation.",
  "Customer Real Estate Buyer",
  "For clients buying apartments or reserving units in selected emerging markets through a guided digital process.",
  "Property Owner Administration",
  "For owners who want AIXCO support after purchase with handover, rental coordination, documents, and reporting.",
  "For intermediaries and distribution partners introducing clients and managing deal flow.",
  "Developer",
  "For developers seeking project visibility, buyer access, tour coordination, and a stronger real estate sales channel.",
  "A real estate foundation built on wise selection",
  "Since its first acquisition in 2009, the company has grown through carefully selected real estate decisions, building a portfolio defined by resilience, stability, and recurring income generation.",
  "Over the decades, AIXCO has evolved into a diversified international group combining Swiss real estate heritage with disciplined asset selection in emerging markets.",
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on selected emerging-market opportunities, with a legacy track record in Switzerland and Dubai.",
  "Swiss Real Estate Expertise and Knowledge Conquering Emerging Markets",
  "Expanding through carefully selected opportunities",
  "Selected projects and apartments available exclusively through AIXCO",
  "Bank financing minimum 60%",
  "Secure your position from €5,000",
  "Approx. 12% net rental yields",
  "ACQUIRE.PARTNER.CREATE VALUE.",
  "Buy an Apartment with AIXCO",
  "Download Materials",
  "Frequently asked questions",
  "Rental income is not guaranteed and depends on occupancy, market conditions, and property management.",
] as const;

const asciiGermanUmlautPattern = /\b(?:sorgfaeltig\w*|ausgewaehl\w*|widerstandsfaeh\w*|stabilitaet\w*|ertraeg\w*|gepraeg\w*|maerkt\w*|ursprueng\w*|grundsaetz\w*|risikopruef\w*|persoenlich\w*|broschuer\w*|immobilienpraesent\w*|projektpraesenz\w*|unterstuetz\w*|verfuegbar\w*|haeufig\w*|loesch\w*|einheitsloes\w*|aender\w*|eroeffn\w*|moechten\w*|moeglich\w*|vermoeg\w*|koennen\w*|muessen\w*|wuensch\w*|zurueck\w*|schliess\w*|abschliess\w*|fuehr\w*|kaeufer\w*|verkaeuf\w*|eigentuemer\w*|uebergab\w*|staerk\w*|fuer|ueber|waehrend)\b/i;

const germanJourneyWorkflowTexts = journeys.flatMap((journey) => [
  journey.intro,
  ...journey.steps.flatMap((step) => [step.title, step.text]),
]);

function VisibleStoryTranslationProbe() {
  const { tx } = useI18n();

  return (
    <div>
      {visibleStoryProbeTexts.map((text, index) => (
        <p data-testid={`visible-copy-${index}`} key={text}>
          {tx(text)}
        </p>
      ))}
    </div>
  );
}

function GermanJourneyWorkflowProbe() {
  const { tx } = useI18n();

  return (
    <div>
      {germanJourneyWorkflowTexts.map((text, index) => (
        <p data-testid={`german-workflow-${index}`} key={text}>
          {tx(text)}
        </p>
      ))}
    </div>
  );
}

describe("I18nProvider", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("translates common card labels and case-only copy variants", async () => {
    localStorage.setItem("aixco-lang", "de");

    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("Batumi-Immobilien erkunden")).toHaveLength(1);
      expect(screen.getByText("Chancen erkunden")).toBeInTheDocument();
      expect(screen.getByText("Mieteinnahmen")).toBeInTheDocument();
      expect(screen.getByText("ab")).toBeInTheDocument();
      expect(screen.getByText("Konzerngesellschaft")).toBeInTheDocument();
    });
  });

  it("preserves route-specific metadata when the language changes", async () => {
    localStorage.setItem("aixco-lang", "de");
    document.title = "Reverance by Otium | AIXCO.Global";
    const description = document.createElement("meta");
    description.name = "description";
    description.content = "Reverance route description";
    document.head.append(description);

    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.lang).toBe("de");
    });

    expect(document.title).toBe("Reverance by Otium | AIXCO.Global");
    expect(description.content).toBe("Reverance route description");
    description.remove();
  });

  it("uses the approved German market access headline", async () => {
    localStorage.setItem("aixco-lang", "de");

    render(
      <I18nProvider>
        <MarketAccessProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("market-access-hero")).toHaveTextContent("Zugang zu aufstrebenden Märkten");
      expect(screen.getByTestId("market-access-title")).toHaveTextContent(
        "Zugang zu aufstrebenden Märkten mit AIXCO",
      );
      expect(screen.getByTestId("opportunities-growth-headline")).toHaveTextContent(
        "Wachstum durch sorgfältig ausgewählte Chancen",
      );
    });
  });

  it("has hero intro and tagline translations for every non-English locale", async () => {
    const heroLocales = ["de", "ru", "ka", "tr", "ar", "pl"] as const;

    for (const locale of heroLocales) {
      if (heroIntroText) {
        await expect(hasTextTranslation(heroIntroText, locale)).resolves.toBe(true);
      }
      for (const line of heroStoryStatementLines) {
        await expect(hasTextTranslation(line, locale)).resolves.toBe(true);
      }
      if (heroOpportunityFootnote) {
        await expect(hasTextTranslation(heroOpportunityFootnote, locale)).resolves.toBe(true);
      }
      await expect(hasTextTranslation("Global Real Estate", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("EXPLORE OPPORTUNITIES", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("REGISTER", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("CONTACT ME", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("Schedule a Call", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("Preferred Time for a Call", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("Send an Email", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("Explore Batumi real estate", locale)).resolves.toBe(true);
    }
  });

  it("keeps language labels readable", () => {
    expect(languageOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "ru", label: "Русский" }),
        expect.objectContaining({ code: "ka", label: "ქართული" }),
        expect.objectContaining({ code: "tr", label: "Türkçe" }),
        expect.objectContaining({ code: "ar", label: "العربية" }),
        expect.objectContaining({ code: "pl", label: "Polski" }),
      ]),
    );
    expect(languageOptions.map((option) => option.label).join(" ")).not.toMatch(/Ã|Ð|Ñ|áƒ|Ø|Ù/);
  });

  it("does not pass visible story copy through as English for selected languages", async () => {
    const locales = ["de", "ru", "ka", "tr", "ar", "pl"] as const satisfies readonly Lang[];

    for (const locale of locales) {
      localStorage.setItem("aixco-lang", locale);

      const { unmount } = render(
        <I18nProvider>
          <VisibleStoryTranslationProbe />
        </I18nProvider>,
      );

      await waitFor(() => {
        visibleStoryProbeTexts.forEach((original, index) => {
          const rendered = screen.getByTestId(`visible-copy-${index}`).textContent ?? "";
          expect(rendered).not.toBe(original);
          expect(rendered).not.toMatch(/Ã|Ð|Ñ|áƒ|Ø|Ù|â‚¬/);
          if (locale === "de") {
            expect(rendered).not.toMatch(asciiGermanUmlautPattern);
            if (/legacy/i.test(original)) expect(rendered).not.toMatch(/legacy/i);
          }
        });
      });

      unmount();
      localStorage.clear();
    }
  });

  it("fully translates every journey workflow into German", async () => {
    localStorage.setItem("aixco-lang", "de");

    render(
      <I18nProvider>
        <GermanJourneyWorkflowProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      germanJourneyWorkflowTexts.forEach((original, index) => {
        const rendered = screen.getByTestId(`german-workflow-${index}`).textContent ?? "";
        expect(rendered).not.toBe(original);
        expect(rendered).not.toMatch(asciiGermanUmlautPattern);
      });
    });
  });
});
