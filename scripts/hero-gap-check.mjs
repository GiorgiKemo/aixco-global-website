import { chromium } from "playwright";

const BASE = (process.env.CHECK_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const WIDTHS = [375, 390, 768, 1024, 1180, 1280, 1440, 1920];

async function checkHero(page) {
  return page.evaluate(() => {
    const stack = document.querySelector("[data-hero-content-stack]");
    const price = document.querySelector("[data-hero-price-lockup]");
    const cue = document.querySelector("[data-hero-scroll-cue]");
    const story = !!document.querySelector('[data-home-experience-mode="story"]');
    if (!stack || !price || !cue) return { story, missing: true };
    const p = price.getBoundingClientRect();
    const c = cue.getBoundingClientRect();
    return {
      story,
      gap: Math.round(c.top - p.bottom),
      overlap: p.bottom > c.top + 4,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      vh: window.innerHeight,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  console.log("Hero price vs scroll cue gap:\n");
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(width >= 1280 ? 1500 : 500);
    await page.evaluate(() => window.scrollTo(0, 0));
    const r = await checkHero(page);
    console.log(`${width}px | story=${r.story} | gap=${r.gap ?? "n/a"}px | overlap=${r.overlap ?? "?"} | overflow=${r.overflow}px`);
  }

  await browser.close();
}

main();
