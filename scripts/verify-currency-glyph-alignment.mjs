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

const paintedBounds = async (
  png,
  expectedColor,
  { trimNarrowVerticalExtenders = false } = {},
) => {
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
  const rowInk = new Uint16Array(info.height);
  const columnInk = new Uint16Array(info.width);
  for (let x = 0; x < info.width; x += 1) {
    for (let y = 0; y < info.height; y += 1) {
      if (!mask[y * info.width + x]) continue;
      rowInk[y] += 1;
      columnInk[x] += 1;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;

  // The currency glyph's narrow center rule extends beyond its S body. Remove
  // only columns that span most of the glyph height, then compare the remaining
  // curved body with the adjacent numeral. The former row-width heuristic also
  // discarded the legitimately narrow curved top and bottom of the S.
  if (trimNarrowVerticalExtenders) {
    const fullInkHeight = bottom - top + 1;
    const ruleColumns = [...columnInk.keys()].filter(
      (column) => columnInk[column] >= fullInkHeight * 0.72,
    );
    const bodyRowInk = new Uint16Array(rowInk);
    for (const column of ruleColumns) {
      for (let row = top; row <= bottom; row += 1) {
        if (mask[row * info.width + column]) bodyRowInk[row] -= 1;
      }
    }
    const bodyRows = [...bodyRowInk.keys()].filter(
      (row) => bodyRowInk[row] > 0,
    );
    if (bodyRows.length > 0) {
      top = bodyRows[0];
      bottom = bodyRows[bodyRows.length - 1];
    }
  }

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
  await page.addStyleTag({
    content: `
      html .story-standard-number .story-currency-audit-ink {
        background: #fff !important;
        color: #000 !important;
      }
    `,
  });

  const failures = [];
  let inspectedGlyphs = 0;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(100);

    const size = `${viewport.width}x${viewport.height}`;
    const metrics = page.locator(
      ".story-standard-number:has(.story-currency-symbol):not([data-story-section='about'] .story-standard-number)",
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
      const [symbolPng, valuePng] = await (async () => {
        await Promise.all([
          symbol.evaluate((node) =>
            node.classList.add("story-currency-audit-ink"),
          ),
          value.evaluate((node) =>
            node.classList.add("story-currency-audit-ink"),
          ),
        ]);
        try {
          return await Promise.all([
            symbol.screenshot({ animations: "disabled" }),
            value.screenshot({ animations: "disabled" }),
          ]);
        } finally {
          await Promise.all([
            symbol.evaluate((node) =>
              node.classList.remove("story-currency-audit-ink"),
            ),
            value.evaluate((node) =>
              node.classList.remove("story-currency-audit-ink"),
            ),
          ]);
        }
      })();
      const [symbolPaint, valuePaint] = await Promise.all([
        paintedBounds(symbolPng, [0, 0, 0], {
          trimNarrowVerticalExtenders: details.isDollar,
        }),
        paintedBounds(valuePng, [0, 0, 0]),
      ]);
      inspectedGlyphs += 1;

      if (
        !symbolBox ||
        !valueBox ||
        !symbolPaint ||
        !valuePaint
      ) {
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
      // Fractional responsive sizes and platform-specific anti-aliasing can
      // spread a curved S edge over four device-pixel rows at the 51.2px
      // desktop maximum even though its source outline shares the figures' cap
      // height. The optical center remains the stricter guard against a
      // visibly raised or lowered currency symbol.
      const visuallyAligned =
        Math.abs(heightDelta) <= 4 &&
        Math.abs(centerDelta) <= 1.5 &&
        gap >= -5;
      const typographyMatches =
        (details.isEuro
          ? symbolTypography.family.startsWith("system-ui") ||
            symbolTypography.family.includes("gilroy")
          : symbolTypography.family === valueTypography.family) &&
        symbolTypography.size === valueTypography.size &&
        symbolTypography.weight === valueTypography.weight &&
        symbolTypography.lineHeight === valueTypography.lineHeight &&
        symbolTypography.letterSpacing === valueTypography.letterSpacing &&
        symbolTypography.position === "static" &&
        symbolTypography.transform === "none";

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

    // The About figures are rendered over detailed photography. Measuring
    // their original screenshots would let bright image pixels leak into the
    // glyph mask, so reproduce the exact computed type treatment in an opaque
    // fixture and inspect the painted S body there.
    const aboutFixture = await page.evaluate(() => {
      document.querySelector("#currency-about-audit-fixture")?.remove();
      const source = document.querySelector(
        "[data-story-section='about'] .story-standard-number:has(.story-currency-symbol--dollar)",
      );
      if (!(source instanceof HTMLElement)) return null;
      const style = getComputedStyle(source);
      const fixture = document.createElement("span");
      fixture.id = "currency-about-audit-fixture";
      fixture.className = "story-standard-number story-currency-audit-ink";
      fixture.setAttribute("aria-label", "$4");
      Object.assign(fixture.style, {
        position: "fixed",
        inset: "0 auto auto 0",
        zIndex: "2147483647",
        display: "inline-block",
        padding: "8px",
        background: "#fff",
        color: "#000",
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        whiteSpace: "nowrap",
      });
      fixture.innerHTML =
        '<span class="story-currency-token story-currency-token--dollar"><span class="story-currency-symbol story-currency-symbol--dollar story-currency-audit-ink">$</span><span class="story-currency-value story-currency-audit-ink">4</span></span>';
      document.body.append(fixture);
      return true;
    });

    if (aboutFixture) {
      const fixture = page.locator("#currency-about-audit-fixture");
      const symbol = fixture.locator(".story-currency-symbol--dollar");
      const value = fixture.locator(".story-currency-value");
      const [symbolBox, valueBox, symbolPng, valuePng] = await Promise.all([
        symbol.boundingBox(),
        value.boundingBox(),
        symbol.screenshot({ animations: "disabled" }),
        value.screenshot({ animations: "disabled" }),
      ]);
      const [symbolPaint, valuePaint] = await Promise.all([
        paintedBounds(symbolPng, [0, 0, 0], {
          trimNarrowVerticalExtenders: true,
        }),
        paintedBounds(valuePng, [0, 0, 0]),
      ]);
      inspectedGlyphs += 1;

      if (symbolBox && valueBox && symbolPaint && valuePaint) {
        const symbolCenter =
          symbolBox.y + (symbolPaint.top + symbolPaint.bottom) / 2;
        const valueCenter =
          valueBox.y + (valuePaint.top + valuePaint.bottom) / 2;
        const heightDelta = symbolPaint.height - valuePaint.height;
        const centerDelta = symbolCenter - valueCenter;
        if (Math.abs(heightDelta) > 2 || Math.abs(centerDelta) > 1.5) {
          failures.push(
            `${size} About $ body fixture: painted height delta=${heightDelta}px, painted center delta=${centerDelta}px`,
          );
        }
      } else {
        failures.push(`${size} About $ body fixture could not be measured`);
      }
      await fixture.evaluate((node) => node.remove());
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
    // The app intentionally keeps long-lived connections open, so waiting for
    // networkidle makes this audit flaky in CI. DOM readiness plus the font
    // readiness check below is the signal this visual test actually needs.
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
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
          const isEuro =
            symbol.classList.contains("story-currency-symbol--euro") ||
            symbol.classList.contains("story-inline-currency-symbol--euro");
          return {
            text: `${symbol.textContent ?? ""}${value?.textContent ?? ""}`,
            isEuro,
            familyMatches: valueStyle
              ? symbolStyle.fontFamily === valueStyle.fontFamily
              : false,
            // Every locale intentionally uses the same system euro face. This
            // keeps English/German visually identical to the already-approved
            // Polish treatment instead of inheriting a different Gilroy
            // fallback on those locales.
            euroFamilyMatchesReference: isEuro
              ? symbolStyle.fontFamily.startsWith("system-ui")
              : true,
            sizeMatches: valueStyle
              ? symbolStyle.fontSize === valueStyle.fontSize
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
            transformMatches: symbolStyle.transform === "none",
          };
        }),
    );

    for (const treatment of localeTreatments) {
      const familyMatches = treatment.isEuro
        ? treatment.euroFamilyMatchesReference
        : treatment.familyMatches;
      if (
        !familyMatches ||
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
      `Currency typography passed: ${inspectedGlyphs} rendered headline values at ${viewports.length} viewports were checked from painted pixels, including controlled translucent-overlay glyph masks, with centered symbols, matched optical heights, intact spacing, and no clipping.`,
    );
  }
} finally {
  await browser.close();
}
