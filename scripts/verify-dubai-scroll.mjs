import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

try {
  await page.goto(`${baseUrl}/#dubai`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-story-section='dubai']");
  await page.evaluate(() => document.fonts.ready);

  const layout = await page.evaluate(() => {
    const section = document.querySelector("[data-story-section='dubai']");
    const media = section.querySelector("[data-story-scene-media]");
    const cards = [...section.querySelectorAll(".story-dubai-portfolio-card")];
    const galleries = [...section.querySelectorAll("[data-layout='story-dubai-marquee']")];
    const galleryTitles = galleries.map((gallery) => gallery.querySelector(".story-dubai-gallery-title")?.textContent?.trim());
    const nextSection = document.querySelector("[data-story-section='batumi']");
    return {
      sectionTop: section.offsetTop,
      sectionHeight: section.offsetHeight,
      sectionBottom: section.offsetTop + section.offsetHeight,
      nextSectionTop: nextSection.offsetTop,
      mediaPosition: getComputedStyle(media).position,
      mediaHeight: media.getBoundingClientRect().height,
      cardHeights: cards.map((card) => card.getBoundingClientRect().height),
      galleryRows: section.querySelectorAll("[data-layout='story-dubai-marquee'] .dubai-image-marquee").length,
      galleryTitles,
      galleryRects: galleries.map((gallery) => {
        const rect = gallery.getBoundingClientRect();
        return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY, height: rect.height };
      }),
    };
  });

  const errors = [];
  if (layout.mediaPosition !== "sticky") errors.push(`media position is ${layout.mediaPosition}`);
  if (layout.mediaHeight < 700 || layout.mediaHeight > 850) errors.push(`unexpected media height ${layout.mediaHeight}`);
  if (layout.cardHeights.length !== 2) errors.push(`expected two cards, found ${layout.cardHeights.length}`);
  if (layout.cardHeights.some((height) => height < 216)) errors.push(`cards are too short: ${layout.cardHeights.join(", ")}`);
  if (Math.max(...layout.cardHeights) - Math.min(...layout.cardHeights) > 2) errors.push(`card heights differ: ${layout.cardHeights.join(", ")}`);
  if (layout.galleryRows !== 2) errors.push(`expected two marquee rows, found ${layout.galleryRows}`);
  if (Math.abs(layout.sectionBottom - layout.nextSectionTop) > 2) {
    errors.push(`Dubai/Batumi boundary differs: ${layout.sectionBottom} / ${layout.nextSectionTop}`);
  }
  if (layout.galleryTitles[0] !== "Eden House The Canal") errors.push(`first gallery title is ${layout.galleryTitles[0]}`);
  if (layout.galleryRects.some((rect) => rect.height < 180 || rect.bottom > layout.sectionBottom + 2)) {
    errors.push(`gallery rows are clipped or outside Dubai: ${JSON.stringify(layout.galleryRects)}`);
  }

  for (const offset of [120, 360]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), layout.sectionTop + offset);
    await page.waitForTimeout(120);
    const mediaTop = await page.locator("[data-story-section='dubai'] [data-story-scene-media]").evaluate((node) => node.getBoundingClientRect().top);
    if (mediaTop < 55 || mediaTop > 95) errors.push(`media did not remain pinned at offset ${offset}: top=${mediaTop}`);
  }

  const releaseScrollY = layout.sectionBottom - 240;
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), releaseScrollY);
  await page.waitForTimeout(120);
  const releaseLayout = await page.evaluate(() => {
    const section = document.querySelector("[data-story-section='dubai']");
    const media = section.querySelector("[data-story-scene-media]");
    const nextSection = document.querySelector("[data-story-section='batumi']");
    return {
      sectionBottom: section.getBoundingClientRect().bottom,
      mediaBottom: media.getBoundingClientRect().bottom,
      mediaTop: media.getBoundingClientRect().top,
      nextSectionTop: nextSection.getBoundingClientRect().top,
    };
  });
  if (Math.abs(releaseLayout.mediaBottom - releaseLayout.sectionBottom) > 2) {
    errors.push(`sticky media did not release with Dubai: ${JSON.stringify(releaseLayout)}`);
  }
  if (Math.abs(releaseLayout.nextSectionTop - releaseLayout.sectionBottom) > 2) {
    errors.push(`Batumi overlaps Dubai at release: ${JSON.stringify(releaseLayout)}`);
  }

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Dubai split-scroll passed: cards ${layout.cardHeights.map(Math.round).join("px / ")}px, galleries ${layout.galleryRects.map((rect) => Math.round(rect.height)).join("px / ")}px, media ${Math.round(layout.mediaHeight)}px.`);
  }
} finally {
  await browser.close();
}
