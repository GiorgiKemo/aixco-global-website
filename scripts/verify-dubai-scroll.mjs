import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1201, height: 810 }, reducedMotion: "reduce" });

try {
  await page.goto(`${baseUrl}/#dubai`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-story-section='dubai']");
  await page.evaluate(() => document.fonts.ready);

  const layout = await page.evaluate(() => {
    const section = document.querySelector("[data-story-section='dubai']");
    const media = section.querySelector("[data-story-scene-media]");
    const cards = [...section.querySelectorAll(".story-dubai-portfolio-card")];
    return {
      sectionTop: section.offsetTop,
      sectionHeight: section.offsetHeight,
      mediaPosition: getComputedStyle(media).position,
      mediaHeight: media.getBoundingClientRect().height,
      cardHeights: cards.map((card) => card.getBoundingClientRect().height),
      galleryRows: section.querySelectorAll("[data-layout='story-dubai-marquee'] .dubai-image-marquee").length,
    };
  });

  const errors = [];
  if (layout.mediaPosition !== "sticky") errors.push(`media position is ${layout.mediaPosition}`);
  if (layout.mediaHeight < 600 || layout.mediaHeight > 780) errors.push(`unexpected media height ${layout.mediaHeight}`);
  if (layout.cardHeights.length !== 2) errors.push(`expected two cards, found ${layout.cardHeights.length}`);
  if (layout.cardHeights.some((height) => height < 216)) errors.push(`cards are too short: ${layout.cardHeights.join(", ")}`);
  if (Math.max(...layout.cardHeights) - Math.min(...layout.cardHeights) > 2) errors.push(`card heights differ: ${layout.cardHeights.join(", ")}`);
  if (layout.galleryRows !== 2) errors.push(`expected two marquee rows, found ${layout.galleryRows}`);

  for (const offset of [120, 360]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), layout.sectionTop + offset);
    await page.waitForTimeout(120);
    const mediaTop = await page.locator("[data-story-section='dubai'] [data-story-scene-media]").evaluate((node) => node.getBoundingClientRect().top);
    if (mediaTop < 55 || mediaTop > 95) errors.push(`media did not remain pinned at offset ${offset}: top=${mediaTop}`);
  }

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Dubai split-scroll passed: cards ${layout.cardHeights.map(Math.round).join("px / ")}px, media ${Math.round(layout.mediaHeight)}px.`);
  }
} finally {
  await browser.close();
}
