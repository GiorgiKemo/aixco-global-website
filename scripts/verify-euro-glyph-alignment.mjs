import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: "reduce" });

try {
  await page.goto(`${baseUrl}/#batumi`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-story-section="batumi"] .story-currency-symbol--euro');
  await page.evaluate(() => document.fonts.ready);

  const failures = [];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    const result = await page.evaluate(() => {
      const metrics = Array.from(
        document.querySelectorAll(
          '[data-story-section="batumi"] [data-layout="story-batumi-benefits"] .story-batumi-benefit__metric',
        ),
      )
        .filter((metric) => metric.querySelector(".story-currency-symbol--euro"))
        .map((metric) => {
          const symbol = metric.querySelector(".story-currency-symbol--euro");
          const value = metric.querySelector(".story-currency-value");
          const symbolRect = symbol.getBoundingClientRect();
          const valueRect = value.getBoundingClientRect();
          const symbolStyle = getComputedStyle(symbol);
          const valueStyle = getComputedStyle(value);

          return {
            label: metric.getAttribute("aria-label"),
            topDelta: symbolRect.top - valueRect.top,
            bottomDelta: symbolRect.bottom - valueRect.bottom,
            heightDelta: symbolRect.height - valueRect.height,
            fontSizeMatch: symbolStyle.fontSize === valueStyle.fontSize,
            fontWeightMatch: symbolStyle.fontWeight === valueStyle.fontWeight,
            lineHeightMatch: symbolStyle.lineHeight === valueStyle.lineHeight,
            baselineMatch: symbolStyle.verticalAlign === valueStyle.verticalAlign,
          };
        });

      return {
        metrics,
        overflowX: Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      };
    });

    for (const metric of result.metrics) {
      const boxDelta = Math.max(
        Math.abs(metric.topDelta),
        Math.abs(metric.bottomDelta),
        Math.abs(metric.heightDelta),
      );
      const typographyMatches =
        metric.fontSizeMatch &&
        metric.fontWeightMatch &&
        metric.lineHeightMatch &&
        metric.baselineMatch;

      if (boxDelta !== 0 || !typographyMatches) {
        failures.push(
          `${viewport.width}x${viewport.height} ${metric.label}: box delta ${boxDelta}px, typography exact ${typographyMatches}`,
        );
      }
    }

    if (result.overflowX !== 0) {
      failures.push(`${viewport.width}x${viewport.height}: horizontal overflow ${result.overflowX}px`);
    }
  }

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Euro alignment passed at ${viewports.length} viewports: exact top, bottom, height, typography, and 0px overflow.`,
    );
  }
} finally {
  await browser.close();
}
