import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const locales = ["en", "de", "pl", "sl", "ru"];
const viewports = [
  { name: "foldable", width: 280, height: 653 },
  { name: "small-phone", width: 320, height: 568 },
  { name: "compact-phone", width: 360, height: 640 },
  { name: "phone", width: 390, height: 844 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "foldable-landscape", width: 653, height: 280 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "large-tablet", width: 820, height: 1180 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "compact-laptop", width: 1280, height: 720 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "wide-desktop", width: 1920, height: 1080 },
];
const errors = [];
const browser = await chromium.launch({ headless: true });
const numberStyleBaselines = new Map();

const expectedFamily = {
  // Cyrillic text still uses the platform fallback when required, while
  // Latin text and numeric runs use the bundled AIXCO faces. Currency
  // symbols may use the approved system fallback for stable glyph metrics.
  en: /gilroy|Epilogue|system-ui|Segoe UI/i,
  de: /gilroyGerman|gilroy|Epilogue|system-ui|Segoe UI/i,
  pl: /gilroy|system-ui|Segoe UI|Epilogue/i,
  sl: /gilroy|system-ui|Segoe UI|Epilogue/i,
  ru: /gilroy|system-ui|Segoe UI|Epilogue/i,
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
        // The section shell mounts before all metric cards hydrate. Wait for
        // the complete numeric surface so locale comparisons never capture a
        // partially rendered translation.
        await page.waitForFunction(
          () => document.querySelectorAll(".story-standard-number").length >= 29,
          { timeout: 30_000 },
        );
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(
          () => document.body.innerText.trim().length >= 1_500,
          { timeout: 30_000 },
        );
        // Let locale hydration and responsive CSS settle before collecting
        // computed styles; otherwise the first language can be sampled during
        // its initial fallback frame.
        await page.waitForTimeout(350);

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
            standardNumberStyles: [
              ...document.querySelectorAll(".story-standard-number"),
            ].filter((element) => element.getClientRects().length > 0)
              .map((element) => {
                const style = getComputedStyle(element);
                return {
                  text: element.textContent
                    ?.replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 90),
                  className:
                    typeof element.className === "string"
                      ? element.className
                      : "",
                  family: style.fontFamily,
                  weight: style.fontWeight,
                  size: style.fontSize,
                  lineHeight: style.lineHeight,
                  letterSpacing: style.letterSpacing,
                  fontVariantNumeric: style.fontVariantNumeric,
                  fontFeatureSettings: style.fontFeatureSettings,
                  color: style.color,
                };
              }),
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

        const nonGilroyNumbers = audit.standardNumberStyles.filter(
          ({ family }) => !/gilroy/i.test(family),
        );
        if (nonGilroyNumbers.length) {
          errors.push(
            `${label}: numeric runs are not using the bundled Gilroy face ${JSON.stringify(
              nonGilroyNumbers.slice(0, 5),
            )}`,
          );
        }

        const numberStyleSignature = [
          ...new Set(
            audit.standardNumberStyles.map(
              ({
                className,
                family,
                weight,
                size,
                lineHeight,
                letterSpacing,
                fontVariantNumeric,
                fontFeatureSettings,
                color,
              }) =>
                JSON.stringify({
                  className,
                  family,
                  weight,
                  size,
                  lineHeight,
                  letterSpacing,
                  fontVariantNumeric,
                  fontFeatureSettings,
                  color,
                }),
            ),
          ),
        ]
          .sort()
          .join("\n");
        const baseline = numberStyleBaselines.get(viewport.name);
        if (baseline === undefined) {
          numberStyleBaselines.set(viewport.name, numberStyleSignature);
        } else if (baseline !== numberStyleSignature) {
          const baselineStyles = new Set(baseline.split("\n").filter(Boolean));
          const currentStyles = new Set(
            numberStyleSignature.split("\n").filter(Boolean),
          );
          const missingStyles = [...baselineStyles].filter(
            (style) => !currentStyles.has(style),
          );
          const addedStyles = [...currentStyles].filter(
            (style) => !baselineStyles.has(style),
          );
          errors.push(
            `${label}: numeric typography differs from the English baseline for this viewport ${JSON.stringify({
              missing: missingStyles.slice(0, 2),
              added: addedStyles.slice(0, 2),
            })}`,
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
