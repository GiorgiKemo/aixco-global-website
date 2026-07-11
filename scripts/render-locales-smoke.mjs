import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const locales = ["en", "de", "ru", "ka", "tr", "ar", "pl"];
const viewports = [
  { name: "wide", width: 1920, height: 1080 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "split-desktop", width: 1201, height: 810 },
  { name: "short-laptop", width: 1366, height: 560 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "compact-phone", width: 360, height: 640 },
];
const expectedDirection = (locale) => locale === "ar" ? "rtl" : "ltr";
const errors = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    for (const locale of locales) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
        locale: locale === "ka" ? "ka-GE" : locale,
      });
      await context.addInitScript((selectedLocale) => {
        localStorage.setItem("aixco-lang", selectedLocale);
      }, locale);
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
          ([selectedLocale]) => document.documentElement.lang === selectedLocale
            && document.querySelectorAll("[data-story-section]").length === 17,
          [locale],
          { timeout: 30_000 },
        );
        await page.evaluate(() => document.fonts.ready);

        const metrics = await page.evaluate(() => {
          const root = document.documentElement;
          const sectionHeadings = [...document.querySelectorAll("[data-story-section] h1, [data-story-section] h2")];
          const clippedHeadings = sectionHeadings.flatMap((heading) => {
            const rect = heading.getBoundingClientRect();
            const section = heading.closest("[data-story-section]");
            const sectionRect = section?.getBoundingClientRect();
            const overflowsOwnBox = heading.scrollWidth - heading.clientWidth > 3;
            const overflowsSection = sectionRect
              ? rect.left < sectionRect.left - 4 || rect.right > sectionRect.right + 4
              : false;
            return overflowsSection
              ? [{ text: heading.textContent?.trim().slice(0, 120), overflowsOwnBox, overflowsSection }]
              : [];
          });
          const brokenImages = [...document.images]
            .filter((image) => image.complete && image.currentSrc && image.naturalWidth === 0)
            .map((image) => image.alt || image.currentSrc);

          return {
            lang: root.lang,
            dir: root.dir,
            horizontalOverflow: root.scrollWidth - root.clientWidth,
            sectionCount: document.querySelectorAll("[data-story-section]").length,
            headingCount: sectionHeadings.length,
            clippedHeadings,
            brokenImages,
            hasReplacementGlyph: /�|Ã|â‚¬|â€”|Ð|Ñ|áƒ|Ø|Ù/.test(document.body.innerText),
            bodyTextLength: document.body.innerText.trim().length,
            dubaiCardOverflows: [...document.querySelectorAll("[data-story-section=\"dubai\"] .story-dubai-portfolio-card")].filter((card) => card.scrollHeight - card.clientHeight > 3).map((card) => card.textContent?.trim().slice(0, 80)),
          };
        });

        const label = `${viewport.name}/${locale}`;
        if (metrics.lang !== locale) errors.push(`${label}: document language is ${metrics.lang}`);
        if (metrics.dir !== expectedDirection(locale)) errors.push(`${label}: direction is ${metrics.dir}`);
        if (metrics.sectionCount !== 17) errors.push(`${label}: rendered ${metrics.sectionCount} story sections`);
        if (metrics.headingCount < 12) errors.push(`${label}: rendered only ${metrics.headingCount} major headings`);
        if (metrics.horizontalOverflow > 4) errors.push(`${label}: horizontal overflow ${metrics.horizontalOverflow}px`);
        if (metrics.clippedHeadings.length) errors.push(`${label}: clipped headings ${JSON.stringify(metrics.clippedHeadings)}`);
        if (metrics.brokenImages.length) errors.push(`${label}: broken images ${metrics.brokenImages.join(" | ")}`);
        if (metrics.hasReplacementGlyph) errors.push(`${label}: mojibake or replacement glyph detected`);
        if (metrics.bodyTextLength < 1_500) errors.push(`${label}: unexpectedly little rendered content (${metrics.bodyTextLength})`);
        if (metrics.dubaiCardOverflows.length) errors.push(`${label}: Dubai card content overflow ${metrics.dubaiCardOverflows.join(" | ")}`);
        if (consoleErrors.length) errors.push(`${label}: console errors ${consoleErrors.join(" | ")}`);
      } catch (error) {
        errors.push(`${viewport.name}/${locale}: ${error.message}`);
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Localized responsive smoke passed: ${viewports.length} viewports × ${locales.length} languages.`);
