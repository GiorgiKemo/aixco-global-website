import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "phone", width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = message.text();
        if (!/favicon|ResizeObserver loop/i.test(text)) {
          consoleErrors.push(text);
        }
      }
    });

    try {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForFunction(
        () => document.body?.innerText?.includes("AIXCO.GLOBAL"),
        undefined,
        { timeout: 20_000 },
      );

      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const bodyText = document.body.innerText;
        return {
          hasHeroCopy: /Emerging market|Global Real Estate/i.test(bodyText),
          horizontalOverflow: root.scrollWidth - root.clientWidth,
          sectionCount: document.querySelectorAll("section, [data-story-scene]").length,
        };
      });

      if (!metrics.hasHeroCopy) {
        errors.push(`${viewport.name}: expected hero copy was not visible`);
      }
      if (metrics.sectionCount < 5) {
        errors.push(`${viewport.name}: page rendered too few sections (${metrics.sectionCount})`);
      }
      if (metrics.horizontalOverflow > 4) {
        errors.push(`${viewport.name}: horizontal overflow ${metrics.horizontalOverflow}px`);
      }
      if (consoleErrors.length > 0) {
        errors.push(`${viewport.name}: console errors: ${consoleErrors.join(" | ")}`);
      }
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Smoke render passed for ${baseUrl}`);
