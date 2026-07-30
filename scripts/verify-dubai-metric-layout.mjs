import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 900 },
  { width: 1600, height: 900 },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: "reduce" });

try {
  await page.goto(`${baseUrl}/#dubai`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(
    '[data-story-section="dubai"] [data-metric-label="Development value"]',
  );
  await page.evaluate(() => document.fonts.ready);

  const failures = [];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(80);

    const result = await page.evaluate(() => {
      const getMetric = (label) =>
        document.querySelector(
          `[data-story-section="dubai"] [data-metric-label="${label}"]`,
        );
      const development = getMetric("Development value");
      const scope = getMetric("Development scope");
      const progress = getMetric("Site progress");

      if (!development || !scope || !progress) {
        return { missingMetrics: true };
      }

      const readCurrency = (metric) => {
        const number = metric.querySelector(".story-dubai-metric-number");
        const symbol = number?.querySelector(".story-currency-symbol");
        const value = number?.querySelector(".story-currency-value");
        if (!number || !symbol || !value) {
          return { missingParts: true };
        }

        const symbolStyle = getComputedStyle(symbol);
        const valueStyle = getComputedStyle(value);

        return {
          missingParts: false,
          visibleText: `${symbol.textContent ?? ""}${value.textContent ?? ""}`,
          exposedToAccessibility:
            !symbol.hasAttribute("aria-hidden") &&
            !value.hasAttribute("aria-hidden"),
          fontSizeMatch: symbolStyle.fontSize === valueStyle.fontSize,
          symbolWeight: symbolStyle.fontWeight,
          valueWeight: valueStyle.fontWeight,
          lineHeightMatch: symbolStyle.lineHeight === valueStyle.lineHeight,
        };
      };

      const progressNumbers = Array.from(
        progress.querySelectorAll(".story-dubai-metric-number"),
      );
      const progressCopy = Array.from(
        progress.querySelectorAll(".story-dubai-metric-copy"),
      );
      const progressRect = progress.getBoundingClientRect();
      const card = progress.closest(".story-dubai-portfolio-card");
      const cardRect = card?.getBoundingClientRect();

      return {
        missingMetrics: false,
        development: readCurrency(development),
        scope: readCurrency(scope),
        developmentText: development.textContent ?? "",
        scopeText: scope.textContent ?? "",
        progressNumberText: progressNumbers.map((node) =>
          (node.textContent ?? "").trim(),
        ),
        progressCopyText: progressCopy.map((node) =>
          (node.textContent ?? "").trim(),
        ),
        progressTopDeltas: progressCopy.map((copy, index) => {
          const number = progressNumbers[index];
          return number
            ? copy.getBoundingClientRect().top - number.getBoundingClientRect().top
            : Number.POSITIVE_INFINITY;
        }),
        progressContained: progressCopy.every((copy) => {
          const rect = copy.getBoundingClientRect();
          return (
            rect.top >= progressRect.top - 1 &&
            rect.right <= progressRect.right + 1 &&
            rect.bottom <= progressRect.bottom + 1 &&
            rect.left >= progressRect.left - 1 &&
            (!cardRect || rect.bottom <= cardRect.bottom + 1)
          );
        }),
        progressOverflow: {
          x: Math.max(0, progress.scrollWidth - progress.clientWidth),
          y: Math.max(0, progress.scrollHeight - progress.clientHeight),
        },
        cardOverflow: card
          ? {
              x: Math.max(0, card.scrollWidth - card.clientWidth),
              y: Math.max(0, card.scrollHeight - card.clientHeight),
            }
          : null,
        pageOverflowX: Math.max(
          0,
          document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      };
    });

    const size = `${viewport.width}x${viewport.height}`;

    if (result.missingMetrics) {
      failures.push(`${size}: one or more Dubai headline metrics are missing`);
      continue;
    }

    for (const [name, expected] of [
      ["development value", "$462M"],
      ["development scope", "$350M"],
    ]) {
      const metric = name === "development value" ? result.development : result.scope;

      if (metric.missingParts) {
        failures.push(`${size} ${name}: currency structure is incomplete`);
        continue;
      }

      if (
        metric.visibleText !== expected ||
        !metric.exposedToAccessibility ||
        !metric.fontSizeMatch ||
        metric.symbolWeight !== "400" ||
        metric.valueWeight !== "400" ||
        !metric.lineHeightMatch
      ) {
        failures.push(
          `${size} ${name}: visible=${metric.visibleText}, accessible=${metric.exposedToAccessibility}, approved optical style=${metric.fontSizeMatch && metric.symbolWeight === metric.valueWeight && metric.valueWeight === "400" && metric.lineHeightMatch}`,
        );
      }
    }

    if (/\bUSD\b/u.test(result.developmentText + result.scopeText)) {
      failures.push(`${size}: Dubai currency metrics still expose USD text`);
    }
    if (/\d[\d,.]*m\b/u.test(result.developmentText + result.scopeText)) {
      failures.push(`${size}: Dubai currency metrics still use lowercase m`);
    }
    if (result.progressNumberText.join("|") !== "~20%|~80%") {
      failures.push(
        `${size}: progress figures are ${result.progressNumberText.join("|")}`,
      );
    }
    if (
      result.progressCopyText.join("|") !==
      "developed,|under construction"
    ) {
      failures.push(
        `${size}: progress qualifiers are ${result.progressCopyText.join("|")}`,
      );
    }
    if (result.progressTopDeltas.some((delta) => delta < -9 || delta > 10)) {
      failures.push(
        `${size}: progress qualifier top deltas are ${result.progressTopDeltas.join(", ")}px`,
      );
    }
    if (!result.progressContained) {
      failures.push(`${size}: progress qualifier escapes its metric or card`);
    }
    if (
      result.progressOverflow.x > 1 ||
      result.progressOverflow.y > 1 ||
      result.cardOverflow?.x > 1 ||
      result.cardOverflow?.y > 1
    ) {
      failures.push(
        `${size}: progress/card overflow=${JSON.stringify({ progress: result.progressOverflow, card: result.cardOverflow })}`,
      );
    }
    if (result.pageOverflowX > 0) {
      failures.push(`${size}: page horizontal overflow=${result.pageOverflowX}px`);
    }
  }

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Dubai metrics passed at ${viewports.length} viewports: $462M/$350M, uppercase M, approved optical currency styling, aligned progress copy, accessible currency text, and zero overflow.`,
    );
  }
} finally {
  await browser.close();
}
