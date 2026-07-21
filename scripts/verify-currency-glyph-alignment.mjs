import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1152, height: 900 },
  { width: 1280, height: 800 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: "reduce" });

try {
  await page.goto(`${baseUrl}/#batumi`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(
    '[data-story-section="batumi"] .story-batumi-benefit__metric[aria-label="€5k"]',
  );
  await page.waitForSelector(
    '[data-story-section="batumi"] [data-batumi-intro-copy="true"] [data-inline-currency-token="euro"]',
  );
  await page.evaluate(() => document.fonts.ready);

  const failures = [];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(80);

    const result = await page.evaluate(() => {
      const readStyle = (node) => {
        const style = getComputedStyle(node);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          fontSynthesis: style.fontSynthesis,
          lineHeight: style.lineHeight,
          verticalAlign: style.verticalAlign,
          transform: style.transform,
          whiteSpace: style.whiteSpace,
          flexWrap: style.flexWrap,
        };
      };

      const metricSymbols = Array.from(
        document.querySelectorAll(
          ".story-standard-number .story-currency-symbol",
        ),
      );

      const metrics = metricSymbols.map((symbol) => {
        const metric = symbol.closest(".story-standard-number");
        const value = metric?.querySelector(
          ":scope > .story-currency-value, :scope > .story-philosophy-stat__number",
        );

        if (!metric || !value) {
          return {
            label: metric?.getAttribute("aria-label") ?? symbol.textContent,
            missingValue: true,
          };
        }

        const symbolRect = symbol.getBoundingClientRect();
        const valueRect = value.getBoundingClientRect();
        const symbolStyle = readStyle(symbol);
        const valueStyle = readStyle(value);
        const metricStyle = readStyle(metric);
        const card = metric.closest(
          ".story-philosophy-stat, .story-batumi-benefit",
        );

        return {
          label: metric.getAttribute("aria-label") ?? metric.textContent,
          visibleText: (metric.textContent ?? "").replace(/\s+/gu, "").trim(),
          missingValue: false,
          isEuro: symbol.classList.contains("story-currency-symbol--euro"),
          topDelta: symbolRect.top - valueRect.top,
          bottomDelta: symbolRect.bottom - valueRect.bottom,
          heightDelta: symbolRect.height - valueRect.height,
          symbolStyle,
          valueStyle,
          nowrap:
            metricStyle.whiteSpace === "nowrap" &&
            metricStyle.flexWrap === "nowrap",
          cardOverflow: card
            ? Math.max(
                0,
                card.scrollWidth - card.clientWidth,
                card.scrollHeight - card.clientHeight,
              )
            : 0,
        };
      });

      const batumi = document.querySelector('[data-story-section="batumi"]');
      const inlineTokens = Array.from(
        batumi?.querySelectorAll('[data-inline-currency-token="euro"]') ?? [],
      ).map((token) => {
        const symbol = token.querySelector(".story-inline-currency-symbol--euro");
        const value = token.querySelector(".story-inline-currency-value");

        if (!symbol || !value) {
          return { text: token.textContent?.trim(), missingParts: true };
        }

        const symbolRect = symbol.getBoundingClientRect();
        const valueRect = value.getBoundingClientRect();

        return {
          text: token.textContent?.trim(),
          missingParts: false,
          topDelta: symbolRect.top - valueRect.top,
          bottomDelta: symbolRect.bottom - valueRect.bottom,
          heightDelta: symbolRect.height - valueRect.height,
          symbolStyle: readStyle(symbol),
          valueStyle: readStyle(value),
          tokenStyle: readStyle(token),
        };
      });

      const introTokens = Array.from(
        batumi?.querySelectorAll(
          '[data-batumi-intro-copy="true"] [data-inline-currency-token="euro"]',
        ) ?? [],
      ).map((token) => token.textContent?.trim());

      return {
        metrics,
        inlineTokens,
        introTokens,
        overflowX: Math.max(
          0,
          document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      };
    });

    const size = `${viewport.width}x${viewport.height}`;
    const euroMetrics = result.metrics.filter(
      (metric) => !metric.missingValue && metric.isEuro,
    );
    const euroLabels = [...new Set(euroMetrics.map((metric) => metric.label))].sort();

    if (euroLabels.join("|") !== "€45k|€5k") {
      failures.push(`${size}: Batumi euro metrics are ${euroLabels.join("|")}`);
    }

    for (const metric of result.metrics) {
      if (metric.missingValue) {
        failures.push(
          `${size} ${metric.label}: matching currency value span not found`,
        );
        continue;
      }

      const boxDelta = Math.max(
        Math.abs(metric.topDelta),
        Math.abs(metric.bottomDelta),
        Math.abs(metric.heightDelta),
      );
      const sharedGeometry =
        metric.symbolStyle.fontSize === metric.valueStyle.fontSize &&
        metric.symbolStyle.lineHeight === metric.valueStyle.lineHeight &&
        metric.symbolStyle.verticalAlign === "baseline" &&
        metric.symbolStyle.transform === "none";
      const correctWeight = metric.isEuro
        ? metric.symbolStyle.fontWeight === "300"
        : metric.symbolStyle.fontWeight === metric.valueStyle.fontWeight;
      const correctFamily = metric.isEuro
        ? metric.symbolStyle.fontFamily.startsWith('"Segoe UI"')
        : metric.symbolStyle.fontFamily === metric.valueStyle.fontFamily;
      const euroIsNormal =
        !metric.isEuro ||
        (metric.symbolStyle.fontStyle === "normal" &&
          metric.symbolStyle.fontSynthesis === "none");

      if (
        metric.visibleText !== metric.label ||
        boxDelta > 1.1 ||
        !sharedGeometry ||
        !correctWeight ||
        !correctFamily ||
        !euroIsNormal ||
        !metric.nowrap ||
        metric.cardOverflow > 0
      ) {
        failures.push(
          `${size} ${metric.label}: visible=${metric.visibleText}, box delta=${boxDelta}px, shared size/line=${sharedGeometry}, weight=${metric.symbolStyle.fontWeight}, family=${metric.symbolStyle.fontFamily}, synthesis=${metric.symbolStyle.fontSynthesis}, nowrap=${metric.nowrap}, overflow=${metric.cardOverflow}px`,
        );
      }
    }

    const inlineTokenText = result.inlineTokens
      .map((token) => token.text)
      .sort();
    if (inlineTokenText.join("|") !== "€45,000|€45,000|€5,000") {
      failures.push(
        `${size}: inline Batumi euro tokens are ${inlineTokenText.join("|")}`,
      );
    }
    if (result.introTokens.join("|") !== "€45,000") {
      failures.push(
        `${size}: Batumi intro euro token is ${result.introTokens.join("|")}`,
      );
    }

    for (const token of result.inlineTokens) {
      if (token.missingParts) {
        failures.push(`${size} ${token.text}: inline currency parts missing`);
        continue;
      }

      const boxDelta = Math.max(
        Math.abs(token.topDelta),
        Math.abs(token.bottomDelta),
        Math.abs(token.heightDelta),
      );
      const exactInlineTreatment =
        token.symbolStyle.fontFamily.startsWith('"Segoe UI"') &&
        token.symbolStyle.fontSize === token.valueStyle.fontSize &&
        token.symbolStyle.fontWeight === "300" &&
        token.symbolStyle.fontStyle === "normal" &&
        token.symbolStyle.fontSynthesis === "none" &&
        token.symbolStyle.lineHeight === token.valueStyle.lineHeight &&
        token.symbolStyle.verticalAlign === "baseline" &&
        token.symbolStyle.transform === "none" &&
        token.tokenStyle.whiteSpace === "nowrap";

      if (boxDelta > 1.1 || !exactInlineTreatment) {
        failures.push(
          `${size} ${token.text}: box delta=${boxDelta}px, family=${token.symbolStyle.fontFamily}, size=${token.symbolStyle.fontSize}/${token.valueStyle.fontSize}, weight=${token.symbolStyle.fontWeight}, synthesis=${token.symbolStyle.fontSynthesis}, nowrap=${token.tokenStyle.whiteSpace}`,
        );
      }
    }

    if (result.overflowX !== 0) {
      failures.push(`${size}: horizontal overflow ${result.overflowX}px`);
    }
  }

  if (failures.length) {
    console.log(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Currency typography passed at ${viewports.length} viewports: optically matched Euro glyphs, exact adjacent size/line boxes, baseline alignment, nowrap tokens, and 0px overflow.`,
    );
  }
} finally {
  await browser.close();
}
