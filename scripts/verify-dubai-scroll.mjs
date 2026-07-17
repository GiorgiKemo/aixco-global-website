import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

async function scrollToY(targetScrollY) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const currentScrollY = await page.evaluate(() => window.scrollY);
    if (Math.abs(currentScrollY - targetScrollY) < 3) return;
    await page.mouse.wheel(0, targetScrollY - currentScrollY);
    await page.waitForTimeout(700);
  }

  const finalScrollY = await page.evaluate(() => window.scrollY);
  throw new Error(`Could not settle at scroll position ${targetScrollY}; stopped at ${finalScrollY}.`);
}

try {
  await page.goto(`${baseUrl}/#dubai`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-story-section='dubai']");
  await page.evaluate(() => document.fonts.ready);

  const layout = await page.evaluate(() => {
    const section = document.querySelector("[data-story-section='dubai']");
    const media = section.querySelector("[data-story-scene-media]");
    const cards = [...section.querySelectorAll(".story-dubai-portfolio-card")];
    const reveal = section.querySelector(".story-scene-reveal");
    const nextSection = document.querySelector("[data-story-section='batumi']");
    const mediaRect = media.getBoundingClientRect();
    const revealRect = reveal.getBoundingClientRect();
    return {
      viewportHeight: window.innerHeight,
      sectionTop: section.offsetTop,
      sectionHeight: section.offsetHeight,
      sectionBottom: section.offsetTop + section.offsetHeight,
      nextSectionTop: nextSection.offsetTop,
      mediaPosition: getComputedStyle(media).position,
      mediaDocumentTop: mediaRect.top + window.scrollY,
      mediaHeight: mediaRect.height,
      revealHeight: revealRect.height,
      revealJustify: getComputedStyle(reveal).justifyContent,
      cardHeights: cards.map((card) => card.getBoundingClientRect().height),
      galleryRows: section.querySelectorAll("[data-layout='story-dubai-marquee']").length,
    };
  });

  const errors = [];
  if (layout.mediaPosition !== "relative") errors.push(`media position is ${layout.mediaPosition}`);
  if (layout.mediaHeight < layout.viewportHeight - 2) {
    errors.push(`media is shorter than the viewport: ${layout.mediaHeight} / ${layout.viewportHeight}`);
  }
  if (Math.abs(layout.mediaHeight - layout.sectionHeight) > 2) {
    errors.push(`media and section heights differ: ${layout.mediaHeight} / ${layout.sectionHeight}`);
  }
  if (layout.revealHeight < 560) errors.push(`Dubai copy does not use enough vertical space: ${layout.revealHeight}`);
  if (layout.revealJustify !== "center") errors.push(`Dubai copy distribution is ${layout.revealJustify}`);
  if (layout.cardHeights.length !== 2) errors.push(`expected two legacy cards, found ${layout.cardHeights.length}`);
  if (layout.cardHeights.some((height) => height < 200)) errors.push(`card is too short: ${layout.cardHeights.join(", ")}`);
  if (layout.galleryRows !== 0) errors.push(`expected no legacy galleries, found ${layout.galleryRows}`);
  if (Math.abs(layout.sectionBottom - layout.nextSectionTop) > 2) {
    errors.push(`Dubai/Batumi boundary differs: ${layout.sectionBottom} / ${layout.nextSectionTop}`);
  }

  for (const offset of [120, 360]) {
    const targetScrollY = layout.sectionTop + offset;
    await scrollToY(targetScrollY);
    const mediaTop = await page.locator("[data-story-section='dubai'] [data-story-scene-media]").evaluate((node) => node.getBoundingClientRect().top);
    const expectedTop = layout.mediaDocumentTop - targetScrollY;
    if (Math.abs(mediaTop - expectedTop) > 3) {
      errors.push(`media paused instead of scrolling at offset ${offset}: top=${mediaTop}, expected=${expectedTop}`);
    }
  }

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Dubai natural-scroll passed: copy ${Math.round(layout.revealHeight)}px, card ${layout.cardHeights.map(Math.round).join("px")}px, media ${Math.round(layout.mediaHeight)}px.`);
  }
} finally {
  await browser.close();
}
