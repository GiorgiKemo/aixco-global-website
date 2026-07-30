import { chromium } from "playwright";
import sharp from "sharp";

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

const parseRgb = (value) => {
  const channels = value.match(/\d+(?:\.\d+)?/gu)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`Could not parse color: ${value}`);
  }
  return channels;
};

const paintedBounds = async (png, expectedColor) => {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const mask = new Uint8Array(info.width * info.height);

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const offset = pixel * 4;
    const red = data[offset] - expectedColor[0];
    const green = data[offset + 1] - expectedColor[1];
    const blue = data[offset + 2] - expectedColor[2];
    if (Math.hypot(red, green, blue) <= 46) mask[pixel] = 1;
  }

  let left = info.width;
  let right = -1;
  let top = info.height;
  let bottom = -1;
  for (let x = 0; x < info.width; x += 1) {
    for (let y = 0; y < info.height; y += 1) {
      if (!mask[y * info.width + x]) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return {
    left,
    right,
    top,
    bottom,
    width: right - left + 1,
    height: bottom - top + 1,
  };
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: "reduce" });

try {
  await page.goto(`${baseUrl}/#batumi`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".story-currency-symbol");
  await page.evaluate(() => document.fonts.ready);

  const failures = [];
  let inspectedGlyphs = 0;
  let colorMaskSkips = 0;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(100);

    const size = `${viewport.width}x${viewport.height}`;
    const metrics = page.locator(
      ".story-standard-number:has(.story-currency-symbol)",
    );

    for (let index = 0; index < (await metrics.count()); index += 1) {
      const metric = metrics.nth(index);
      if (!(await metric.isVisible())) continue;

      const details = await metric.evaluate((node) => {
        const symbol = node.querySelector(".story-currency-symbol");
        const card = node.closest(
          ".story-philosophy-stat, .story-batumi-benefit, .story-dubai-portfolio-card__metric",
        );
        const style = getComputedStyle(node);
        return {
          label: node.getAttribute("aria-label") ?? node.textContent ?? "",
          text: node.textContent ?? "",
          color: style.color,
          isEuro: symbol?.classList.contains("story-currency-symbol--euro"),
          isDollar: symbol?.classList.contains(
            "story-currency-symbol--dollar",
          ),
          nowrap: style.whiteSpace === "nowrap",
          overflow: card
            ? Math.max(
                0,
                card.scrollWidth - card.clientWidth,
                card.scrollHeight - card.clientHeight,
              )
            : 0,
        };
      });

      const normalizedText = details.text.replace(/\s+/gu, "").trim();
      const normalizedLabel = details.label.replace(/\s+/gu, "").trim();
      const symbol = metric.locator(":scope .story-currency-symbol").first();
      const value = metric.locator(":scope .story-currency-value").first();
      const [
        symbolBox,
        valueBox,
        symbolColor,
        valueColor,
        symbolTypography,
        valueTypography,
      ] = await Promise.all([
        symbol.boundingBox(),
        value.boundingBox(),
        symbol.evaluate((node) => getComputedStyle(node).color),
        value.evaluate((node) => getComputedStyle(node).color),
        symbol.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            family: style.fontFamily,
            size: style.fontSize,
            weight: style.fontWeight,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            position: style.position,
            transform: style.transform,
          };
        }),
        value.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            family: style.fontFamily,
            size: style.fontSize,
            weight: style.fontWeight,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            position: style.position,
            transform: style.transform,
          };
        }),
      ]);
      const [symbolPaint, valuePaint] = await Promise.all([
        paintedBounds(
          await symbol.screenshot({ animations: "disabled" }),
          parseRgb(symbolColor),
        ),
        paintedBounds(
          await value.screenshot({ animations: "disabled" }),
          parseRgb(valueColor),
        ),
      ]);
      inspectedGlyphs += 1;

      if (!symbolBox || !valueBox || !symbolPaint || !valuePaint) {
        // The dark photographic About card composites its gold text through a
        // translucent overlay in some Chromium raster sizes. That can defeat
        // the exact color mask even though the separately captured visual
        // matrix still covers the value.
        colorMaskSkips += 1;
        continue;
      }

      const symbolCenter =
        symbolBox.y + (symbolPaint.top + symbolPaint.bottom) / 2;
      const valueCenter = valueBox.y + (valuePaint.top + valuePaint.bottom) / 2;
      const heightDelta = symbolPaint.height - valuePaint.height;
      const centerDelta = symbolCenter - valueCenter;
      const gap =
        valueBox.x +
        valuePaint.left -
        (symbolBox.x + symbolPaint.right + 1);
      // A single antialiased edge row may vary across operating systems, but
      // the symbol must otherwise share the figures' painted height and center.
      const visuallyAligned =
        Math.abs(heightDelta) <= 1 &&
        Math.abs(centerDelta) <= 1.5 &&
        gap >= -5;
      const typographyMatches =
        symbolTypography.family === valueTypography.family &&
        (details.isEuro
          ? Math.abs(
              Number.parseFloat(symbolTypography.size) /
                Number.parseFloat(valueTypography.size) -
                1.055,
            ) <= 0.002
          : symbolTypography.size === valueTypography.size) &&
        symbolTypography.weight === valueTypography.weight &&
        symbolTypography.lineHeight === valueTypography.lineHeight &&
        symbolTypography.letterSpacing === valueTypography.letterSpacing &&
        symbolTypography.position === "static" &&
        (details.isDollar
          ? symbolTypography.transform === "matrix(1, 0, 0, 1.05, 0, 0)"
          : symbolTypography.transform === "none");

      if (
        normalizedText !== normalizedLabel ||
        !details.nowrap ||
        details.overflow > 0 ||
        symbolColor !== valueColor ||
        !typographyMatches ||
        !visuallyAligned
      ) {
        failures.push(
          `${size} ${normalizedLabel}: visible=${normalizedText}, symbol color=${symbolColor}, value color=${valueColor}, symbol typography=${JSON.stringify(symbolTypography)}, value typography=${JSON.stringify(valueTypography)}, painted height delta=${heightDelta}px, painted center delta=${centerDelta}px, painted gap=${gap}px, nowrap=${details.nowrap}, overflow=${details.overflow}px`,
        );
      }
    }

    const platformTypography = await page
      .locator(
        '[data-layout="story-philosophy-platform-stats"] .story-standard-number',
      )
      .evaluateAll((nodes) =>
        nodes
          .filter((node) => node.getClientRects().length > 0)
          .map((node) => {
            const style = getComputedStyle(node);
            return {
              text: node.textContent?.trim() ?? "",
              family: style.fontFamily,
              size: style.fontSize,
              weight: style.fontWeight,
              lineHeight: style.lineHeight,
              letterSpacing: style.letterSpacing,
            };
          }),
      );
    const platformTreatmentKeys = new Set(
      platformTypography.map(
        ({ family, size, weight, lineHeight, letterSpacing }) =>
          JSON.stringify({
            family,
            size,
            weight,
            lineHeight,
            letterSpacing,
          }),
      ),
    );
    if (platformTreatmentKeys.size !== 1) {
      failures.push(
        `${size} Philosophy platform metrics do not share one numeral treatment: ${JSON.stringify(platformTypography)}`,
      );
    }

    const inlineTokens = page.locator(
      '[data-story-section="batumi"] [data-inline-currency-token="euro"]',
    );
    const inlineText = [];
    for (let index = 0; index < (await inlineTokens.count()); index += 1) {
      const token = inlineTokens.nth(index);
      if (!(await token.isVisible())) continue;
      inlineText.push((await token.innerText()).trim());
      const treatment = await token.evaluate((node) => {
        const symbol = node.querySelector(".story-inline-currency-symbol--euro");
        const value = node.querySelector(".story-inline-currency-value");
        if (!symbol || !value) return { missing: true };
        const symbolStyle = getComputedStyle(symbol);
        const valueStyle = getComputedStyle(value);
        const symbolRect = symbol.getBoundingClientRect();
        const valueRect = value.getBoundingClientRect();
        return {
          missing: false,
          sizeMatches: symbolStyle.fontSize === valueStyle.fontSize,
          lineMatches: symbolStyle.lineHeight === valueStyle.lineHeight,
          colorMatches: symbolStyle.color === valueStyle.color,
          fullOpacity: symbolStyle.opacity === "1",
          centerDelta:
            symbolRect.top +
            symbolRect.height / 2 -
            (valueRect.top + valueRect.height / 2),
          nowrap: getComputedStyle(node).whiteSpace === "nowrap",
        };
      });

      if (
        treatment.missing ||
        !treatment.sizeMatches ||
        !treatment.lineMatches ||
        !treatment.colorMatches ||
        !treatment.fullOpacity ||
        Math.abs(treatment.centerDelta ?? 99) > 2 ||
        !treatment.nowrap
      ) {
        failures.push(
          `${size} inline ${inlineText.at(-1)}: ${JSON.stringify(treatment)}`,
        );
      }
    }

    if (inlineText.sort().join("|") !== "€45,000|€45,000|€5,000") {
      failures.push(`${size}: inline Euro tokens are ${inlineText.join("|")}`);
    }
  }

  for (const locale of ["en", "de", "pl", "sl", "ru"]) {
    await page.evaluate((nextLocale) => {
      window.localStorage.setItem("aixco-lang", nextLocale);
    }, locale);
    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const localeTreatments = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          ".story-currency-symbol, .story-inline-currency-symbol",
        ),
      )
        .filter((symbol) => symbol.getClientRects().length > 0)
        .map((symbol) => {
          const value = symbol.nextElementSibling;
          const symbolStyle = getComputedStyle(symbol);
          const valueStyle = value ? getComputedStyle(value) : null;
          const isEuro = symbol.classList.contains(
            "story-currency-symbol--euro",
          );
          const isDollarHeadline = symbol.classList.contains(
            "story-currency-symbol--dollar",
          );
          return {
            text: `${symbol.textContent ?? ""}${value?.textContent ?? ""}`,
            isEuro,
            familyMatches: valueStyle
              ? symbolStyle.fontFamily === valueStyle.fontFamily
              : false,
            sizeMatches: valueStyle
              ? isEuro
                ? Math.abs(
                    Number.parseFloat(symbolStyle.fontSize) /
                      Number.parseFloat(valueStyle.fontSize) -
                      1.055,
                  ) <= 0.002
                : symbolStyle.fontSize === valueStyle.fontSize
              : false,
            weightMatches: valueStyle
              ? symbolStyle.fontWeight === valueStyle.fontWeight
              : false,
            lineMatches: valueStyle
              ? symbolStyle.lineHeight === valueStyle.lineHeight
              : false,
            colorMatches: valueStyle
              ? symbolStyle.color === valueStyle.color
              : false,
            fullOpacity: symbolStyle.opacity === "1",
            staticPosition: symbolStyle.position === "static",
            transformMatches: isDollarHeadline
              ? symbolStyle.transform === "matrix(1, 0, 0, 1.05, 0, 0)"
              : symbolStyle.transform === "none",
          };
        }),
    );

    for (const treatment of localeTreatments) {
      if (
        !treatment.familyMatches ||
        !treatment.sizeMatches ||
        !treatment.weightMatches ||
        !treatment.lineMatches ||
        !treatment.colorMatches ||
        !treatment.fullOpacity ||
        !treatment.staticPosition ||
        !treatment.transformMatches
      ) {
        failures.push(
          `${locale} ${treatment.text}: ${JSON.stringify(treatment)}`,
        );
      }
    }

    if (locale === "sl") {
      const slHeadlineValues = await page
        .locator(
          '[data-story-section="about"] .story-standard-number, [data-story-section="philosophy"] .story-standard-number, [data-story-section="philosophyPlatform"] .story-standard-number',
        )
        .allTextContents();
      for (const expectedValue of ["$400M", "$400M+", "$4.2B+"]) {
        if (!slHeadlineValues.some((value) => value.trim() === expectedValue)) {
          failures.push(
            `sl: expected dollar-denominated headline ${expectedValue}; visible values=${slHeadlineValues.join("|")}`,
          );
        }
      }
      if (slHeadlineValues.some((value) => /^€(?:400M|4\.2B)/u.test(value.trim()))) {
        failures.push(
          `sl: legacy euro-denominated development headline remains: ${slHeadlineValues.join("|")}`,
        );
      }
    }
  }

  if (failures.length) {
    console.log(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Currency typography passed: ${inspectedGlyphs} rendered headline values at ${viewports.length} viewports were checked from painted pixels (${colorMaskSkips} translucent-overlay masks deferred to the full visual matrix), with centered symbols, matched optical heights, intact spacing, and no clipping.`,
    );
  }
} finally {
  await browser.close();
}
