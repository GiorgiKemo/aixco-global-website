import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { heroIntroText, heroOpportunityFootnote, heroOpportunityText } from "@/components/sections/hero/hero-ui";
import { I18nProvider, hasTextTranslation, useI18n } from "./I18nProvider";

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
      expect(screen.getAllByText("Batumi-Immobilien erkunden")).toHaveLength(2);
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
      expect(document.title).toBe("AIXCO.Global | Qualitäts-Immobilien — Kaufen · Makeln · Verwalten");
    });
  });

  it("has hero intro and tagline translations for every non-English locale", async () => {
    const heroLocales = ["de", "ru", "ka", "tr", "ar"] as const;

    for (const locale of heroLocales) {
      await expect(hasTextTranslation(heroIntroText, locale)).resolves.toBe(true);
      await expect(hasTextTranslation(heroOpportunityText, locale)).resolves.toBe(true);
      await expect(hasTextTranslation(heroOpportunityFootnote, locale)).resolves.toBe(true);
      await expect(hasTextTranslation("Quality Real Estate — Buy · Broker · Manage", locale)).resolves.toBe(true);
      await expect(hasTextTranslation("Explore Batumi real estate", locale)).resolves.toBe(true);
    }
  });
});
