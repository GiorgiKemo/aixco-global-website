import { chromium } from "playwright";

const BASE = (process.env.CHECK_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const VIEWPORTS = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
];

async function checkHero(page) {
  return page.evaluate(() => {
    const price = document.querySelector("[data-hero-price-lockup]");
    const cue = document.querySelector("[data-hero-scroll-cue]");
    const title = document.querySelector("[data-hero-title]");
    if (!price || !cue) return { missing: true };
    const p = price.getBoundingClientRect();
    const c = cue.getBoundingClientRect();
    const t = title?.getBoundingClientRect();
    return {
      overlap: p.bottom > c.top + 2,
      gap: Math.round(c.top - p.bottom),
      titleTop: t ? Math.round(t.top) : null,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);

  let fails = 0;
  console.log(`Short viewport hero check @ ${BASE}\n`);

  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 0));
    const r = await checkHero(page);
    const bad = r.overlap || (r.overflow ?? 0) > 8;
    if (bad) fails += 1;
    console.log(
      `${vp.width}x${vp.height} | gap=${r.gap ?? "n/a"} | overlap=${r.overlap ?? "?"} | overflow=${r.overflow ?? 0} | ${bad ? "FAIL" : "PASS"}`,
    );
  }

  await browser.close();
  process.exit(fails > 0 ? 1 : 0);
}

main();
