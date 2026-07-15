import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  for (const width of [767, 768, 820, 1280]) {
    const height = 900;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForFunction(() => {
      const hero = document.querySelector('[data-story-section="hero"]');
      return document.querySelectorAll("[data-story-section]").length === 17
        && (hero?.getBoundingClientRect().height ?? 0) > 0
        && document.body.innerText.trim().length >= 1_500;
    });
    await page.evaluate(() => document.fonts.ready);

    const metrics = await page.evaluate(() => {
      const style = (selector) => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element) : null;
      };
      const hero = document.querySelector('[data-story-section="hero"]');
      const materialsTitle = style(".story-mobile-materials-title");
      const journeys = style('[data-layout="story-journeys"]');
      const team = style('[data-layout="story-team-list"]');
      const mobileHeader = style(".story-mobile-header");
      const desktopHeader = style(".story-desktop-header");

      return {
        heroHeight: Math.round(hero?.getBoundingClientRect().height ?? 0),
        materialsTitleDisplay: materialsTitle?.display,
        journeyAutoFlow: journeys?.gridAutoFlow,
        teamAutoFlow: team?.gridAutoFlow,
        mobileHeaderDisplay: mobileHeader?.display,
        desktopHeaderDisplay: desktopHeader?.display,
      };
    });

    if (width === 767) {
      if (metrics.materialsTitleDisplay === "none") errors.push("767px: mobile materials title is hidden");
      if (metrics.journeyAutoFlow !== "column") errors.push(`767px: journey cards use ${metrics.journeyAutoFlow} flow`);
      if (metrics.teamAutoFlow !== "column") errors.push(`767px: team cards use ${metrics.teamAutoFlow} flow`);
      if (metrics.heroHeight >= height - 8) errors.push(`767px: mobile hero does not reveal the next section (${metrics.heroHeight}px)`);
    } else {
      if (metrics.materialsTitleDisplay !== "none") errors.push(`${width}px: mobile-only materials title is visible`);
      if (metrics.journeyAutoFlow === "column") errors.push(`${width}px: mobile journey carousel leaked outside phone breakpoint`);
      if (metrics.teamAutoFlow === "column") errors.push(`${width}px: mobile team carousel leaked outside phone breakpoint`);
      if (metrics.heroHeight < height - 8) errors.push(`${width}px: mobile hero height leaked outside phone breakpoint (${metrics.heroHeight}px)`);
    }

    if (width === 1280) {
      if (metrics.mobileHeaderDisplay !== "none") errors.push("1280px: mobile header is visible");
      if (metrics.desktopHeaderDisplay === "none") errors.push("1280px: desktop header is hidden");
    }

    await context.close();
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Mobile redesign is isolated to 767px and below; tablet and desktop checks passed.");
