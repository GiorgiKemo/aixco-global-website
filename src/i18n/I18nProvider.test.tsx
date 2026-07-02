import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { heroIntroText, heroOpportunityFootnote, heroStoryStatementLines } from "@/components/sections/hero/hero-ui";
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
    </div>
  );
}

const visibleStoryProbeTexts = [
  "Global Real Estate",
  "Emerging Market Opportunities with AIXCO",
  "EXPLORE OPPORTUNITIES",
  "CONTACT ME",
  "Every client starts with a different objective",
  "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.",
  "A real estate foundation built on wise selection",
  "Swiss Real Estate Expertise and Knowledge Conquering Emerging Markets",
  "Expanding through carefully selected opportunities",
  "Selected projects and apartments available exclusively through AIXCO",
  "Bank financing minimum 60%",
  "Secure your position from €5,000",
  "Approx. 12% net rental yields",
  "ACQUIRE.PARTNER.CREATE VALUE.",
  "Buy an Apartment with AIXCO",
  "Download Materials",
  "Current project brochure",
  "Frequently asked questions",
  "Rental income is not guaranteed and depends on occupancy, market conditions, and property management.",
] as const;

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

  it("translates the document title for non-English languages", async () => {
    localStorage.setItem("aixco-lang", "de");

    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("AIXCO.Global | Immobilieninvestment");
    });
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
    });
  });

  it("has hero intro and tagline translations for every non-English locale", async () => {
    const heroLocales = ["de", "ru", "ka", "tr", "ar"] as const;

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
      ]),
    );
    expect(languageOptions.map((option) => option.label).join(" ")).not.toMatch(/Ã|Ð|Ñ|áƒ|Ø|Ù/);
  });

  it("does not pass visible story copy through as English for selected languages", async () => {
    const locales = ["de", "ru", "ka", "tr", "ar"] as const satisfies readonly Lang[];

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
        });
      });

      unmount();
      localStorage.clear();
    }
  });
});
