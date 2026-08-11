import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const locales = ["en", "de", "pl", "sl", "ru"];
const routes = ["/reverance-batumi", "/aixco-global-op2/current-project"];
const viewports = [
  { name: "foldable", width: 280, height: 653 },
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const failures = [];
let testedCombinations = 0;
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    for (const locale of locales) {
      for (const route of routes) {
        testedCombinations += 1;
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
          await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
          await page.waitForFunction(
            (selectedLocale) => document.documentElement.lang === selectedLocale
              && document.querySelector("main")
              && document.body.innerText.trim().length >= 500,
            locale,
            { timeout: 60_000 },
          );
          await page.evaluate(() => document.fonts.ready);

          const metrics = await page.evaluate(() => {
            const root = document.documentElement;
            const rendered = (element) => {
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return style.display !== "none" && style.visibility !== "hidden"
                && rect.width > 0 && rect.height > 0;
            };
            const visibleTextOverflow = [...document.querySelectorAll("h1, h2, h3, p, a, button, [role='heading'], label")]
              .flatMap((element) => {
                if (!rendered(element) || element.closest(".sr-only, [aria-hidden='true']")) return [];
                const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                const rects = [];
                let textNode = walker.nextNode();
                while (textNode) {
                  if (!textNode.parentElement?.closest(".sr-only, [aria-hidden='true']")) {
                    const range = document.createRange();
                    range.selectNodeContents(textNode);
                    rects.push(...range.getClientRects());
                  }
                  textNode = walker.nextNode();
                }
                return rects
                  .filter((rect) => rect.left < -3 || rect.right > root.clientWidth + 3)
                  .map((rect) => ({
                    text: (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 90),
                    left: Math.round(rect.left),
                    right: Math.round(rect.right),
                  }));
              });

            return {
              lang: root.lang,
              dir: root.dir,
              horizontalOverflow: root.scrollWidth - root.clientWidth,
              bodyTextLength: document.body.innerText.trim().length,
              brokenImages: [...document.images]
                .filter((image) => image.complete && image.currentSrc && image.naturalWidth === 0)
                .map((image) => image.alt || image.currentSrc),
              visibleTextOverflow,
              hasMain: Boolean(document.querySelector("main")),
              hasLanguageControl: Boolean(document.querySelector("[data-language-trigger='true']")),
              hasHomeLink: Boolean(document.querySelector("a[href='/']")),
            };
          });

          const label = `${viewport.name}/${locale}${route}`;
          if (metrics.lang !== locale) failures.push(`${label}: document language is ${metrics.lang}`);
          if (metrics.dir !== "ltr") failures.push(`${label}: direction is ${metrics.dir}`);
          if (metrics.horizontalOverflow > 4) failures.push(`${label}: horizontal overflow ${metrics.horizontalOverflow}px`);
          if (metrics.bodyTextLength < 500) failures.push(`${label}: unexpectedly little rendered content (${metrics.bodyTextLength})`);
          if (metrics.brokenImages.length) failures.push(`${label}: broken images ${metrics.brokenImages.join(" | ")}`);
          if (metrics.visibleTextOverflow.length) {
            failures.push(`${label}: visible text overflow ${JSON.stringify(metrics.visibleTextOverflow.slice(0, 3))}`);
          }
          if (!metrics.hasMain) failures.push(`${label}: missing main landmark`);
          if (!metrics.hasLanguageControl) failures.push(`${label}: missing language control`);
          if (!metrics.hasHomeLink) failures.push(`${label}: missing home link`);
        } catch (error) {
          failures.push(`${viewport.name}/${locale}${route}: ${error.message}`);
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Public locale layout audit found ${failures.length} affected combinations.`);
  console.error(failures.slice(0, 24).join("\n"));
  if (failures.length > 24) console.error(`... ${failures.length - 24} additional combinations omitted.`);
  process.exit(1);
}

console.log(`Public locale layout audit passed: ${testedCombinations} route/viewport/language combinations.`);
