import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const locales = ["en", "de", "pl", "sl", "ru"];
const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "laptop", width: 1440, height: 900 },
];
const errors = [];
const browser = await chromium.launch({ headless: true });

const expectedFamily = {
  en: /gilroy|Epilogue/i,
  de: /gilroyGerman|Epilogue/i,
  pl: /system-ui|Segoe UI|Epilogue/i,
  sl: /system-ui|Segoe UI|Epilogue/i,
  ru: /system-ui|Segoe UI|Epilogue/i,
};

try {
  for (const viewport of viewports) {
    for (const locale of locales) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
        locale: locale === "sl" ? "sl-SI" : locale,
      });
      await context.addInitScript((selectedLocale) => {
        localStorage.setItem("aixco-lang", selectedLocale);
      }, locale);
      const page = await context.newPage();
      const label = `${viewport.name}/${locale}`;

      try {
        await page.goto(baseUrl, {
          waitUntil: "domcontentloaded",
          timeout: 45_000,
        });
        await page.waitForFunction(
          (selectedLocale) =>
            document.documentElement.lang === selectedLocale &&
            document.querySelectorAll("[data-story-section]").length === 17,
          locale,
          { timeout: 30_000 },
        );
        await page.evaluate(() => document.fonts.ready);

        const audit = await page.evaluate(() => {
          const directTextRuns = [
            ...document.querySelectorAll("[data-story-section] *"),
          ].filter((element) =>
            [...element.childNodes].some(
              (node) =>
                node.nodeType === Node.TEXT_NODE &&
                Boolean(node.textContent?.trim()),
            ),
          );
          const typographyRuns = directTextRuns.map((element) => {
            const style = getComputedStyle(element);
            return {
              text: element.textContent?.replace(/\s+/g, " ").trim().slice(0, 90),
              className:
                typeof element.className === "string"
                  ? element.className.slice(0, 120)
                  : "",
              family: style.fontFamily,
              weight: style.fontWeight,
              synthesis: style.fontSynthesis,
            };
          });
          const summaryStyles = [
            ...document.querySelectorAll(".story-team-member__summary"),
          ].map((element) => {
            const style = getComputedStyle(element);
            return JSON.stringify({
              color: style.color,
              family: style.fontFamily,
              weight: style.fontWeight,
              synthesis: style.fontSynthesis,
            });
          });

          return {
            typographyRuns,
            summaryStyles: [...new Set(summaryStyles)],
            horizontalOverflow:
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          };
        });

        const synthesized = audit.typographyRuns.filter(
          ({ synthesis }) => synthesis !== "none",
        );
        if (synthesized.length) {
          errors.push(
            `${label}: ${synthesized.length} text runs allow synthesized glyphs`,
          );
        }

        const unsupportedWeights = audit.typographyRuns.filter(({ weight }) =>
          ["650", "700"].includes(weight),
        );
        if (unsupportedWeights.length) {
          errors.push(
            `${label}: unsupported font weights ${JSON.stringify(
              unsupportedWeights.slice(0, 5),
            )}`,
          );
        }

        const mixedFamilies = audit.typographyRuns.filter(
          ({ family }) => !expectedFamily[locale].test(family),
        );
        if (mixedFamilies.length) {
          errors.push(
            `${label}: mixed font families ${JSON.stringify(
              mixedFamilies.slice(0, 5),
            )}`,
          );
        }

        if (audit.summaryStyles.length !== 1) {
          errors.push(
            `${label}: team summaries have ${audit.summaryStyles.length} visual styles`,
          );
        }

        if (audit.horizontalOverflow > 4) {
          errors.push(
            `${label}: horizontal overflow ${audit.horizontalOverflow}px`,
          );
        }
      } catch (error) {
        errors.push(`${label}: ${error.message}`);
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(`Typography audit found ${errors.length} issue(s).`);
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(
    `Typography audit passed for ${locales.length * viewports.length} locale/viewport combinations.`,
  );
}
