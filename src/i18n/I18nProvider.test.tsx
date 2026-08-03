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

function GermanDubaiMetricProbe() {
  const { tx } = useI18n();

  return (
    <div>
      <p>{tx("USD 462m")}</p>
      <p>{tx("USD 350m mixed-use program")}</p>
      <p>{tx("USD 800m+ development volume")}</p>
      <p>{tx("Development value: USD 462m")}</p>
      <p>{tx("Development scope: USD 350m mixed-use program")}</p>
      <p>{tx("~20% developed, ~80% under construction")}</p>
      <p>{tx("Secure your position from €5,000")}</p>
    </div>
  );
}

function PolishDubaiMetricProbe() {
  const { tx } = useI18n();

  return (
    <div>
      <p>{tx("USD 462m")}</p>
      <p>{tx("USD 350m")}</p>
      <p>{tx("USD 350m mixed-use program")}</p>
      <p>{tx("Development value: USD 462m")}</p>
      <p>{tx("Development scope: USD 350m mixed-use program")}</p>
    </div>
  );
}

function RussianBriefFixProbe() {
  const { tx } = useI18n();

  return (
    <div>
      <p>{tx("ACQUIRE.PARTNER.CREATE VALUE.")}</p>
      <p>{tx("Gross Development Value (GDV)")}</p>
      <p>{tx("Swiss real estate heritage")}</p>
      <p>{tx("Development value")}</p>
      <p>{tx("Development value: USD 462m")}</p>
      <p>{tx("USD 462m")}</p>
      <p>{tx("USD 350m mixed-use program")}</p>
      <p>{tx("Development scope: USD 350m mixed-use program")}</p>
    </div>
  );
}

function SlovenianClientRevisionProbe() {
  const { tx } = useI18n();

  return (
    <div>
      <p>{tx("Global Real Estate")}</p>
      <p>{tx("Gross Development Value (GDV)")}</p>
      <p>{tx("Total Transactions")}</p>
      <p>{tx("In Business Since")}</p>
      <p>{tx("From Switzerland to Dubai to Batumi")}</p>
      <p>{tx("USD 350m mixed-use program")}</p>
      <p>{tx("ACQUIRE.PARTNER.CREATE VALUE.")}</p>
      <p>{tx("$400M")}</p>
      <p>{tx("$4.2B+")}</p>
      <p>{tx("€45k")}</p>
      <p>{tx("Download Materials")}</p>
      <p>{tx("FAQ essentials")}</p>
      <p>{tx("Terms & Conditions")}</p>
    </div>
  );
}

const currentProjectSummary =
  "Reverance is a premium residential complex on Batumi's New Boulevard. AIXCO currently offers 28 selected apartments on the 13th and 14th floors, with completion targeted for July 2028.";

function CurrentProjectCompletionProbe() {
  const { tx } = useI18n();

  return (
    <div>
      <p data-testid="current-project-summary">{tx(currentProjectSummary)}</p>
      <p data-testid="current-project-completion">{tx("Jul 2028")}</p>
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
  "Ours: a current AIXCO residential project with selected apartments, structured buyer guidance, and completion targeted for July 2028.",
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
  "Current project brochure",
  "Frequently asked questions",
  "Rental income is not guaranteed and depends on occupancy, market conditions, and property management.",
] as const;

const approvedSlovenianPassthrough = new Set(["Global Real Estate"]);

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

  it("keeps German Dubai metrics compact and number-first", async () => {
    localStorage.setItem("aixco-lang", "de");

    render(
      <I18nProvider>
        <GermanDubaiMetricProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("$462M")).toBeInTheDocument();
      expect(screen.getByText("$350M Mischnutzungsprogramm")).toBeInTheDocument();
      expect(screen.getByText("$800M+ Entwicklungsvolumen")).toBeInTheDocument();
      expect(screen.getByText("Entwicklungswert: $462M")).toBeInTheDocument();
      expect(screen.getByText("Entwicklungsumfang: $350M Mischnutzungsprogramm")).toBeInTheDocument();
      expect(screen.getByText("~20% entwickelt, ~80% im Bau")).toBeInTheDocument();
      expect(screen.getByText("Sichern Sie Ihre Position ab 5.000 €")).toBeInTheDocument();
    });
  });

  it("keeps Polish Dubai metrics in compact dollar notation", async () => {
    localStorage.setItem("aixco-lang", "pl");

    render(
      <I18nProvider>
        <PolishDubaiMetricProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("$462M")).toBeInTheDocument();
      expect(screen.getByText("$350M")).toBeInTheDocument();
      expect(screen.getByText("Program wielofunkcyjny o wartości $350M")).toBeInTheDocument();
      expect(screen.getByText("Wartość deweloperska: $462M")).toBeInTheDocument();
      expect(
        screen.getByText("Zakres projektu: program wielofunkcyjny o wartości $350M"),
      ).toBeInTheDocument();
    });
  });

  it("uses the approved Russian client-brief terminology", async () => {
    localStorage.setItem("aixco-lang", "ru");

    render(
      <I18nProvider>
        <RussianBriefFixProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ПРИОБРЕСТИ.СОТРУДНИЧАТЬ.СОЗДАТЬ ЦЕННОСТЬ.")).toBeInTheDocument();
      expect(screen.getByText("Валовая стоимость развития (GDV)")).toBeInTheDocument();
      expect(screen.getByText("Швейцарское наследие в сфере недвижимости")).toBeInTheDocument();
      expect(screen.getByText("Стоимость девелопмента")).toBeInTheDocument();
      expect(screen.getByText("Стоимость девелопмента: $462М")).toBeInTheDocument();
      expect(screen.getByText("$462М")).toBeInTheDocument();
      expect(screen.getByText("Многофункциональная программа на $350М")).toBeInTheDocument();
      expect(
        screen.getByText("Масштаб: многофункциональная программа на $350М"),
      ).toBeInTheDocument();
    });
  });

  it.each([
    [
      "en",
      currentProjectSummary,
      "Jul 2028",
    ],
    [
      "de",
      "Reverance ist ein Premium-Wohnkomplex am New Boulevard in Batumi. AIXCO bietet derzeit 28 ausgewählte Wohnungen im 13. und 14. Stock an; die Fertigstellung ist für Juli 2028 geplant.",
      "Juli 2028",
    ],
    [
      "pl",
      "Reverance to kompleks mieszkaniowy klasy premium przy Nowym Bulwarze w Batumi. AIXCO oferuje obecnie 28 wybranych apartamentów na 13. i 14. piętrze; zakończenie budowy planowane jest na lipiec 2028 r.",
      "lipiec 2028",
    ],
    [
      "sl",
      "Reverance je vrhunski stanovanjski kompleks na Novem bulvarju v Batumiju. AIXCO trenutno ponuja 28 izbranih stanovanj v 13. in 14. nadstropju, z dokončanjem, predvidenim za julij 2028.",
      "julij 2028",
    ],
    [
      "ru",
      "Reverance — жилой комплекс премиум-класса на Новом бульваре Батуми. Сейчас AIXCO предлагает 28 выбранных квартир на 13-м и 14-м этажах; завершение строительства запланировано на июль 2028 года.",
      "Июль 2028",
    ],
  ] as const)("uses the brochure-backed July 2028 date in %s", async (locale, summary, completion) => {
    localStorage.setItem("aixco-lang", locale);

    render(
      <I18nProvider>
        <CurrentProjectCompletionProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-project-summary")).toHaveTextContent(summary);
      expect(screen.getByTestId("current-project-completion")).toHaveTextContent(completion);
    });
  });

  it("loads Slovenian copy and keeps the document left-to-right", async () => {
    localStorage.setItem("aixco-lang", "sl");

    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "sl");
      expect(document.documentElement).toHaveAttribute("dir", "ltr");
      expect(screen.getByText(/Raziščite.*Batumi/i)).toBeInTheDocument();
      expect(screen.getByText("Prihodki od najemnin")).toBeInTheDocument();
    });
  });

  it("gives the client-reviewed Slovenian document priority over older catalogs", async () => {
    localStorage.setItem("aixco-lang", "sl");

    render(
      <I18nProvider>
        <SlovenianClientRevisionProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Global Real Estate")).toBeInTheDocument();
      expect(screen.getByText("Skupna razvojna vrednost (GDV)")).toBeInTheDocument();
      expect(screen.getByText("Skupno število transakcij")).toBeInTheDocument();
      expect(screen.getByText("Poslujemo od leta")).toBeInTheDocument();
      expect(screen.getByText("Od Švice do Dubaja do Batumija")).toBeInTheDocument();
      expect(screen.getByText("$350M, večnamenski program")).toBeInTheDocument();
      expect(screen.getByText("KUPITE. SODELUJTE. USTVARITE VREDNOST.")).toBeInTheDocument();
      expect(screen.getByText("$400M")).toBeInTheDocument();
      expect(screen.getByText("$4.2B+")).toBeInTheDocument();
      expect(screen.getByText("€45k")).toBeInTheDocument();
      expect(screen.getByText("Prenos gradiv")).toBeInTheDocument();
      expect(screen.getByText("Osnovna pogosta vprašanja")).toBeInTheDocument();
      expect(screen.getByText("Splošni pogoji poslovanja")).toBeInTheDocument();
    });
  });

  it.each(["ka", "tr", "ar"])("falls back to English for retired stored locale %s", async (retiredLocale) => {
    localStorage.setItem("aixco-lang", retiredLocale);

    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "en");
      expect(screen.getByText("Explore Batumi real estate")).toBeInTheDocument();
    });
  });

  it("uses the client-approved Slovenian home metadata", async () => {
    localStorage.setItem("aixco-lang", "sl");
    document.title = "AIXCO.Global | Real Estate Investment";
    const description = document.createElement("meta");
    description.name = "description";
    description.content =
      "Explore selected real estate opportunities with transparent euro pricing from EUR 45,000, brokerage, and property administration through AIXCO.";
    document.head.append(description);

    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("AIXCO.Global | Naložbe v nepremičnine");
      expect(description.content).toBe(
        "Odkrijte izbrane nepremičninske priložnosti s pregledno oblikovanimi cenami v evrih že od €45.000, posredovanjem in upravljanjem nepremičnin prek podjetja AIXCO.",
      );
    });

    description.remove();
  });

  it("preserves route-specific metadata when the language changes", async () => {
    localStorage.setItem("aixco-lang", "de");
    document.title = "Our current project | AIXCO.Global";
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

    expect(document.title).toBe("Our current project | AIXCO.Global");
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
    const heroLocales = ["de", "pl", "sl", "ru"] as const;

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
    expect(languageOptions).toEqual([
      { code: "en", label: "English", native: "EN", flag: "GB" },
      { code: "de", label: "Deutsch", native: "DE", flag: "DE" },
      { code: "pl", label: "Polski", native: "PL", flag: "PL" },
      { code: "sl", label: "Slovenščina", native: "SL", flag: "SI" },
      { code: "ru", label: "Русский", native: "RU", flag: "RU" },
    ]);
    expect(languageOptions.map((option) => option.label).join(" ")).not.toMatch(/Ã|Ð|Ñ|áƒ|Ø|Ù/);
  });

  it("does not pass visible story copy through as English for selected languages", async () => {
    const locales = ["de", "pl", "sl", "ru"] as const satisfies readonly Lang[];

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
          if (locale !== "sl" || !approvedSlovenianPassthrough.has(original)) {
            expect(rendered).not.toBe(original);
          }
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
