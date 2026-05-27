import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { heroIntroText } from "@/components/sections/hero/hero-ui";
import { I18nProvider, hasTextTranslation, useI18n } from "./I18nProvider";

function TranslationProbe() {
  const { t, tx } = useI18n();

  return (
    <div>
      <p>{tx("Starting from €10,000")}</p>
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

  it("translates common card labels and case-only copy variants", () => {
    localStorage.setItem("aixco-lang", "de");

    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    expect(screen.getAllByText("Ab 10.000 €")).toHaveLength(2);
    expect(screen.getByText("Mieteinnahmen")).toBeInTheDocument();
    expect(screen.getByText("ab")).toBeInTheDocument();
    expect(screen.getByText("Konzerngesellschaft")).toBeInTheDocument();
  });

  it("translates the document title for non-English languages", () => {
    localStorage.setItem("aixco-lang", "de");

    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    expect(document.title).toBe("AIXCO.Global | Qualitäts-Immobilien — Kaufen · Makeln · Verwalten");
  });

  it("has hero intro and tagline translations for every non-English locale", () => {
    const heroLocales = ["de", "ru", "ka", "tr", "ar"] as const;

    for (const locale of heroLocales) {
      expect(hasTextTranslation(heroIntroText, locale)).toBe(true);
      expect(hasTextTranslation("Quality Real Estate — Buy · Broker · Manage", locale)).toBe(true);
      expect(hasTextTranslation("Starting from €10,000", locale)).toBe(true);
    }
  });
});
