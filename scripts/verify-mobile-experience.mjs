import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const viewports = [
  { name: "compact-phone", width: 360, height: 640 },
  { name: "phone", width: 390, height: 844 },
  { name: "large-phone", width: 430, height: 932 },
];
const errors = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const value = message.text();
      if (!/favicon|ResizeObserver loop|Failed to load resource.*ERR_ABORTED/i.test(value)) consoleErrors.push(value);
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    try {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForFunction(
        () => document.querySelectorAll("[data-story-section]").length === 17,
        undefined,
        { timeout: 30_000 },
      );
      await page.evaluate(() => document.fonts.ready);

      const sectionKeys = await page.locator("[data-story-section]").evaluateAll((sections) =>
        sections.map((section) => section.getAttribute("data-story-section")),
      );

      for (const sectionKey of sectionKeys) {
        const selector = `[data-story-section="${sectionKey}"]`;
        await page.locator(selector).evaluate((section) => window.scrollTo({ top: section.offsetTop, behavior: "instant" }));
        await page.waitForTimeout(180);

        const initial = await page.locator(selector).evaluate((section) => {
          const heading = section.querySelector("h1, h2");
          const reveal = heading?.querySelector("[data-text-reveal-state]");
          const headingRect = heading?.getBoundingClientRect();
          return {
            state: reveal?.getAttribute("data-text-reveal-state") ?? null,
            headingLeft: headingRect ? Math.round(headingRect.left) : null,
            headingRight: headingRect ? Math.round(headingRect.right) : null,
            headingWidth: headingRect ? Math.round(headingRect.width) : null,
            headingScrollWidth: heading instanceof HTMLElement ? heading.scrollWidth : null,
          };
        });

        await page.evaluate((amount) => window.scrollBy({ top: amount, behavior: "instant" }), Math.round(viewport.height * 0.92));
        await page.waitForTimeout(120);
        const stateAfterScroll = await page.locator(selector).locator("[data-text-reveal-state]").first().getAttribute("data-text-reveal-state").catch(() => null);

        const label = `${viewport.name}/${sectionKey}`;
        if (initial.headingLeft !== null && initial.headingLeft < -3) errors.push(`${label}: heading starts outside viewport (${initial.headingLeft}px)`);
        if (initial.headingRight !== null && initial.headingRight > viewport.width + 3) errors.push(`${label}: heading ends outside viewport (${initial.headingRight}px)`);
        if (initial.headingWidth !== null && initial.headingScrollWidth !== null && initial.headingScrollWidth - initial.headingWidth > 3) {
          errors.push(`${label}: heading overflows by ${initial.headingScrollWidth - initial.headingWidth}px`);
        }
        if (initial.state === "animating" && stateAfterScroll === "idle") {
          errors.push(`${label}: title reveal reset to idle while scrolling`);
        }
      }

      const pageMetrics = await page.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        headerHeight: Math.round(document.querySelector(".story-mobile-header")?.getBoundingClientRect().height ?? 0),
        tapTargets: [...document.querySelectorAll(".story-mobile-header button")].map((button) => {
          const rect = button.getBoundingClientRect();
          return { width: Math.round(rect.width), height: Math.round(rect.height) };
        }),
      }));

      if (pageMetrics.horizontalOverflow > 4) errors.push(`${viewport.name}: horizontal overflow ${pageMetrics.horizontalOverflow}px`);
      if (pageMetrics.headerHeight < 64) errors.push(`${viewport.name}: mobile header is only ${pageMetrics.headerHeight}px tall`);
      if (pageMetrics.tapTargets.some((target) => target.width < 44 || target.height < 44)) {
        errors.push(`${viewport.name}: mobile header has tap targets below 44px`);
      }
      if (consoleErrors.length) errors.push(`${viewport.name}: console errors ${consoleErrors.join(" | ")}`);
    } catch (error) {
      errors.push(`${viewport.name}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Mobile experience smoke passed at ${viewports.map(({ width, height }) => `${width}x${height}`).join(", ")}.`);
