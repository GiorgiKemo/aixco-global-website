import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider, useI18n } from "./I18nProvider";

function TranslationProbe() {
  const { t, tx } = useI18n();

  return (
    <div>
      <p>{tx("STARTING FROM €1,000")}</p>
      <p>{tx("Rental yield")}</p>
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

    expect(screen.getAllByText("Ab 1.000 €")).toHaveLength(2);
    expect(screen.getByText("Mietrendite")).toBeInTheDocument();
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

    expect(document.title).toBe("AIXCO.Global | Hochwertige Immobilienbeteiligung");
  });
});
