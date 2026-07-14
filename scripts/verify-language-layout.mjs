import { chromium, webkit } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browserName = process.env.SMOKE_BROWSER ?? "chromium";
const browserType = browserName === "webkit" ? webkit : chromium;
const macSafariUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15";
const locales = ["en", "de", "ru", "ka", "tr", "ar", "pl"];
const viewports = [
  { name: "small-phone", width: 320, height: 568 },
  { name: "compact-phone", width: 360, height: 640 },
  { name: "phone", width: 390, height: 844 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "large-tablet", width: 820, height: 1180 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "compact-laptop", width: 1280, height: 720 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "wide-desktop", width: 1920, height: 1080 },
];

const errors = [];
let testedCombinations = 0;
const browser = await browserType.launch({ headless: true });

try {
  for (const viewport of viewports) {
    if (process.env.SMOKE_VIEWPORT && viewport.name !== process.env.SMOKE_VIEWPORT) continue;
    for (const locale of locales) {
      if (process.env.SMOKE_LOCALE && locale !== process.env.SMOKE_LOCALE) continue;
      testedCombinations += 1;
      const context = await browser.newContext({
        viewport,
        ...(browserName === "webkit"
          ? { deviceScaleFactor: 2, userAgent: macSafariUserAgent }
          : {}),
        reducedMotion: "reduce",
        locale: locale === "ka" ? "ka-GE" : locale,
      });
      await context.addInitScript((selectedLocale) => {
        localStorage.setItem("aixco-lang", selectedLocale);
      }, locale);
      const page = await context.newPage();

      try {
        await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForFunction(
          (selectedLocale) => document.documentElement.lang === selectedLocale
            && document.querySelectorAll("[data-story-section]").length === 17,
          locale,
          { timeout: 60_000 },
        );
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: `
          .story-letter-reveal__text,
          .story-letter-reveal__char {
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            clip-path: none !important;
            animation: none !important;
          }
          .story-letter-reveal__chunk {
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            clip-path: none !important;
            filter: none !important;
            animation: none !important;
          }
        ` });
        await page.waitForTimeout(350);

        const result = await page.evaluate(() => {
          const root = document.documentElement;
          const defects = [];
          const seen = new Set();
          const skip = ".sr-only, [aria-hidden='true']:not(.story-letter-reveal__text):not(.story-letter-reveal__char), [data-state='closed'], #story-mobile-menu, [role='listbox']";
          const intentional = ".partner-marquee, .dubai-image-marquee, .story-batumi-gallery__thumbs, [data-layout='story-journeys'], [data-layout='story-team-list']";

          const rendered = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden"
              && rect.width > 0 && rect.height > 0;
          };

          const report = (element, type) => {
            const section = element.closest("[data-story-section]")?.getAttribute("data-story-section") ?? "global";
            const text = (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 90);
            const key = `${section}:${type}:${text}`;
            if (!seen.has(key)) {
              seen.add(key);
              defects.push({ section, type, text });
            }
          };

          const clippedByAncestor = (element, rect) => {
            let ancestor = element.parentElement;
            while (ancestor && ancestor !== document.body) {
              if (ancestor.matches(intentional)) return false;
              const style = getComputedStyle(ancestor);
              const clipX = ["hidden", "clip"].includes(style.overflowX);
              const clipY = ["hidden", "clip"].includes(style.overflowY);
              if (clipX || clipY) {
                const box = ancestor.getBoundingClientRect();
                const clippedX = clipX && (rect.left < box.left - 3 || rect.right > box.right + 3);
                const clippedY = clipY && (rect.top < box.top - 3 || rect.bottom > box.bottom + 3);
                if (clippedX || clippedY) return {
                  axis: clippedX ? "x" : "y",
                  ancestor: ancestor.tagName.toLowerCase() + "." + String(ancestor.className).slice(0, 36),
                };
              }
              ancestor = ancestor.parentElement;
            }
            return false;
          };

          for (const char of document.querySelectorAll(".story-letter-reveal__char")) {
            if (!(char instanceof HTMLElement) || !rendered(char) || char.closest(skip)) continue;
            const rect = char.getBoundingClientRect();
            const viewportClip = rect.left < -3 || rect.right > root.clientWidth + 3;
            const ancestorClip = clippedByAncestor(char, rect);
            if (viewportClip || ancestorClip) {
              const viewportOverflow = Math.ceil(Math.max(0, -rect.left, rect.right - root.clientWidth));
              const reason = viewportClip ? "viewport-x " + viewportOverflow + "px" : ancestorClip.axis + " by " + ancestorClip.ancestor;
              report(char.closest(".story-letter-reveal") ?? char, "animated glyph clipped: " + reason);
            }
          }

          for (const heading of document.querySelectorAll("h1, h2, h3")) {
            if (!(heading instanceof HTMLElement) || !rendered(heading) || heading.closest(skip)) continue;
            const headingRect = heading.getBoundingClientRect();
            const words = heading.querySelectorAll(".story-letter-reveal__word");

            for (const word of words) {
              if (!(word instanceof HTMLElement) || !rendered(word)) continue;
              const rect = word.getBoundingClientRect();
              const outsideHeading = rect.left < headingRect.left - 3 || rect.right > headingRect.right + 3;
              const outsideViewport = rect.left < -3 || rect.right > root.clientWidth + 3;
              if (outsideHeading || outsideViewport) {
                const overflow = Math.ceil(Math.max(
                  0,
                  headingRect.left - rect.left,
                  rect.right - headingRect.right,
                  -rect.left,
                  rect.right - root.clientWidth,
                ));
                report(heading, `localized title word exceeds its line container by ${overflow}px`);
              }
            }

            const plainTitle = heading.querySelector(".story-text-reveal__tiny-plain");
            if (plainTitle instanceof HTMLElement && rendered(plainTitle)) {
              const range = document.createRange();
              range.selectNodeContents(plainTitle);
              for (const rect of range.getClientRects()) {
                if (rect.left < headingRect.left - 3 || rect.right > headingRect.right + 3) {
                  const overflow = Math.ceil(Math.max(
                    0,
                    headingRect.left - rect.left,
                    rect.right - headingRect.right,
                  ));
                  report(heading, `plain localized title exceeds its line container by ${overflow}px`);
                  break;
                }
              }
            }
          }

          const heroNote = document.querySelector("[data-story-section='hero'] .story-hero-statement__note");
          if (heroNote instanceof HTMLElement && rendered(heroNote)) {
            const range = document.createRange();
            range.selectNodeContents(heroNote);
            const textRect = range.getBoundingClientRect();
            const viewportClip = textRect.left < -3 || textRect.right > root.clientWidth + 3;
            const ancestorClip = clippedByAncestor(heroNote, textRect);
            if (viewportClip || ancestorClip) {
              const reason = viewportClip
                ? `viewport-x ${Math.ceil(Math.max(0, -textRect.left, textRect.right - root.clientWidth))}px`
                : `${ancestorClip.axis} by ${ancestorClip.ancestor}`;
              report(heroNote, `hero supporting line clipped: ${reason}`);
            }
          }


          const textSelector = "p, dt, dd, a, button, .story-card-title, .story-body, .story-metric-label, .story-metric-value, .story-faq-question, .story-faq-answer";
          for (const element of document.querySelectorAll(textSelector)) {
            if (!(element instanceof HTMLElement) || !rendered(element) || element.closest(skip) || element.closest(intentional)) continue;
            const style = getComputedStyle(element);
            const horizontalClip = element.scrollWidth - element.clientWidth > 3
              && ["hidden", "clip"].includes(style.overflowX);
            const verticalClip = element.scrollHeight - element.clientHeight > 3
              && ["hidden", "clip"].includes(style.overflowY);
            if (horizontalClip || verticalClip) report(element, horizontalClip ? "text width clipped" : "text height clipped");

            if (!element.querySelector(".story-text-reveal")) {
              const range = document.createRange();
              range.selectNodeContents(element);
              for (const rect of range.getClientRects()) {
                if (rect.left < -3 || rect.right > root.clientWidth + 3) {
                  const overflow = Math.ceil(Math.max(0, -rect.left, rect.right - root.clientWidth));
                  report(element, `visible text line extends beyond viewport by ${overflow}px`);
                  break;
                }
              }
            }
          }

          return {
            defects,
            horizontalOverflow: root.scrollWidth - root.clientWidth,
            replacementGlyphs: (document.body.innerText.match(/�/g) ?? []).length,
            mojibake: /Ã.|â‚¬|â€”|â€“/.test(document.body.innerText),
            germanAsciiUmlauts: document.documentElement.lang === "de"
              ? [...new Set(document.body.innerText.match(/\b(?:sorgfaeltig\w*|ausgewaehl\w*|widerstandsfaeh\w*|stabilitaet\w*|ertraeg\w*|gepraeg\w*|maerkt\w*|ursprueng\w*|grundsaetz\w*|risikopruef\w*|persoenlich\w*|broschuer\w*|immobilienpraesent\w*|projektpraesenz\w*|unterstuetz\w*|verfuegbar\w*|haeufig\w*|loesch\w*|einheitsloes\w*|aender\w*|eroeffn\w*|moechten\w*|moeglich\w*|vermoeg\w*|koennen\w*|muessen\w*|wuensch\w*|zurueck\w*|schliess\w*|abschliess\w*|fuehr\w*|kaeufer\w*|verkaeuf\w*|eigentuemer\w*|uebergab\w*|staerk\w*|fuer|ueber|waehrend)\b/gi) ?? [])]
              : [],
            bodyFont: getComputedStyle(document.body).fontFamily,
            headingFont: getComputedStyle(document.querySelector(".story-h2") ?? document.body).fontFamily,
          };
        });

        const label = `${viewport.name}/${locale}`;
        if (result.horizontalOverflow > 4) errors.push(`${label}: page overflow ${result.horizontalOverflow}px`);
        if (result.replacementGlyphs || result.mojibake) errors.push(`${label}: replacement glyph or mojibake detected`);
        if (result.germanAsciiUmlauts.length) errors.push(`${label}: ASCII umlaut spellings ${result.germanAsciiUmlauts.join(", ")}`);
        if (result.defects.length) errors.push(`${label}: ${JSON.stringify(result.defects.slice(0, 6))}`);
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
  console.error(`Language layout audit found ${errors.length} affected combinations.`);
  console.error(errors.slice(0, 24).join("\n"));
  if (errors.length > 24) console.error(`... ${errors.length - 24} additional combinations omitted.`);
  process.exit(1);
}

console.log(
  `Language layout audit passed in ${browserName}: ${testedCombinations} viewport/language combinations.`,
);
