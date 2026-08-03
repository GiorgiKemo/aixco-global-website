import fs from "node:fs";
import path from "node:path";
import { chromium, webkit } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browserName = process.env.SMOKE_BROWSER ?? "chromium";
const browserType = browserName === "webkit" ? webkit : chromium;
const locales = (process.env.SMOKE_LOCALES ?? "en,de,pl,sl,ru")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const allViewports = [
  { name: "small-phone", width: 320, height: 568 },
  { name: "phone", width: 390, height: 844 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "compact-laptop", width: 1280, height: 720 },
  { name: "reported-laptop", width: 1536, height: 729 },
  { name: "desktop", width: 1920, height: 1080 },
];
const requestedViewports = new Set(
  (process.env.SMOKE_VIEWPORTS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const captureSections = new Set(
  (process.env.SMOKE_CAPTURE_SECTIONS ?? "philosophyOrigins")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const viewports = requestedViewports.size
  ? allViewports.filter(({ name }) => requestedViewports.has(name))
  : allViewports;
const outputDir = path.resolve("output/playwright/section-boundaries");

fs.mkdirSync(outputDir, { recursive: true });

const browser = await browserType.launch({ headless: true });
const failures = [];

try {
  for (const viewport of viewports) {
    for (const locale of locales) {
      const context = await browser.newContext({
        viewport,
        locale: locale === "sl" ? "sl-SI" : locale,
        reducedMotion: "reduce",
      });
      await context.addInitScript((selectedLocale) => {
        localStorage.setItem("aixco-lang", selectedLocale);
      }, locale);
      const page = await context.newPage();

      try {
        await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForFunction(
          (selectedLocale) =>
            document.documentElement.lang === selectedLocale &&
            document.querySelectorAll("[data-story-section]").length === 17,
          locale,
          { timeout: 60_000 },
        );
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({
          content: `
            .story-letter-reveal__text,
            .story-letter-reveal__char,
            .story-letter-reveal__chunk {
              opacity: 1 !important;
              visibility: visible !important;
              transform: none !important;
              clip-path: none !important;
              filter: none !important;
              animation: none !important;
            }
          `,
        });

        const sections = page.locator("[data-story-section]");
        const count = await sections.count();
        for (let index = 0; index < count; index += 1) {
          const section = sections.nth(index);
          await section.scrollIntoViewIfNeeded();
          await page.waitForTimeout(80);

          const result = await section.evaluate((currentSection) => {
            const sectionName = currentSection.getAttribute("data-story-section") ?? "unknown";
            const sectionRect = currentSection.getBoundingClientRect();
            const skipSelector = [
              ".sr-only",
              "[aria-hidden='true']",
              "[data-story-scene-media]",
              ".story-section-boundary",
              "[data-chat-floating-container='true']",
              "#story-mobile-menu",
              "[role='listbox']",
            ].join(",");
            const textSelector = [
              "h1",
              "h2",
              "h3",
              "h4",
              "p",
              "dt",
              "dd",
              "a",
              "button",
              "label",
              "li",
            ].join(",");
            const intrusions = [];

            for (const element of currentSection.querySelectorAll(textSelector)) {
              if (!(element instanceof HTMLElement) || element.closest(skipSelector)) continue;
              const style = getComputedStyle(element);
              if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
              const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
              if (!text) continue;

              const range = document.createRange();
              range.selectNodeContents(element);
              const textRect = range.getBoundingClientRect();
              if (!textRect.width || !textRect.height) continue;

              const below = textRect.bottom - sectionRect.bottom;
              const above = sectionRect.top - textRect.top;
              if (below > 2 || above > 2) {
                intrusions.push({
                  section: sectionName,
                  tag: element.tagName.toLowerCase(),
                  className: String(element.className).slice(0, 100),
                  text: text.slice(0, 120),
                  edge: below > 2 ? "bottom" : "top",
                  pixels: Math.round(Math.max(below, above) * 10) / 10,
                });
              }
            }

            return {
              section: sectionName,
              sectionHeight: Math.round(sectionRect.height * 10) / 10,
              scrollHeight: currentSection.scrollHeight,
              intrusions: intrusions.slice(0, 8),
            };
          });

          if (result.intrusions.length) {
            failures.push({ locale, viewport: viewport.name, ...result });
            const fileName = `${locale}-${viewport.name}-${result.section}.png`;
            await page.screenshot({ path: path.join(outputDir, fileName), fullPage: false });
          } else if (process.env.SMOKE_CAPTURE === "1" && captureSections.has(result.section)) {
            const fileName = `${locale}-${viewport.name}-${result.section}-pass.png`;
            await page.screenshot({ path: path.join(outputDir, fileName), fullPage: false });
          }
        }
      } catch (error) {
        failures.push({ locale, viewport: viewport.name, error: error.message });
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

const summaryPath = path.join(outputDir, "summary.json");
fs.writeFileSync(summaryPath, `${JSON.stringify({ failures }, null, 2)}\n`);

if (failures.length) {
  console.error(`Section-boundary audit found ${failures.length} failure(s).`);
  console.error(JSON.stringify(failures.slice(0, 20), null, 2));
  console.error(`Full report: ${summaryPath}`);
  process.exit(1);
}

console.log(
  `Section-boundary audit passed: ${locales.length * viewports.length} language/viewport combinations (${browserName}).`,
);
