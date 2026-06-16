import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { heroIntroText, heroOpportunityFootnote, heroOpportunityText } from "@/components/sections/hero/hero-ui";
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

const visibleStoryProbeTexts = [
  "Real Estate Investment",
  "Emerging market opportunities with AIXCO",
  "Explore opportunities",
  "Every client starts with a different objective",
  "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.",
  "A real estate foundation built through ownership",
  "Expanding through carefully selected opportunities",
  "Selected projects and apartments available exclusively through AIXCO",
  "Bank financing minimum 60%",
  "Approx. 10-12% net rental yields",
  "How it works",
  "Buy an Apartment with AIXCO",
  "Materials & downloads",
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

  it("has hero intro and tagline translations for every non-English locale", async () => {
    const heroLocales = ["de", "ru", "ka", "tr", "ar"] as const;

    for (const locale of heroLocales) {
      if (heroIntroText) {
        await expect(hasTextTranslation(heroIntroText, locale)).resolves.toBe(true);
      }
      await expect(hasTextTranslation(heroOpportunityText, locale)).resolves.toBe(true);
      if (heroOpportunityFootnote) {
        await expect(hasTextTranslation(heroOpportunityFootnote, locale)).resolves.toBe(true);
      }
      await expect(hasTextTranslation("Real Estate Investment", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("Explore opportunities", locale)).resolves.toBe(true);
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
