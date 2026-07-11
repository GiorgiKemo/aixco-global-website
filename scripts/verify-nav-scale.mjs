import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1584, height: 544 }, reducedMotion: "reduce" });

try {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".story-desktop-header");
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.evaluate(() => {
    const header = document.querySelector(".story-desktop-header");
    const logo = document.querySelector(".story-desktop-header__brand img");
    const navLink = document.querySelector(".story-desktop-nav-link");
    const languageButton = document.querySelector(".story-desktop-lang-button");
    const kicker = document.querySelector(".story-hero-kicker");
    const note = document.querySelector(".story-hero-statement__note");
    return {
      headerHeight: header.getBoundingClientRect().height,
      logoWidth: logo.getBoundingClientRect().width,
      navFontSize: Number.parseFloat(getComputedStyle(navLink).fontSize),
      languageButtonHeight: languageButton.getBoundingClientRect().height,
      kickerLetterSpacing: Number.parseFloat(getComputedStyle(kicker).letterSpacing),
      noteLetterSpacing: Number.parseFloat(getComputedStyle(note).letterSpacing),
    };
  });

  const errors = [];
  if (metrics.headerHeight < 92) errors.push(`header is too short: ${metrics.headerHeight}px`);
  if (metrics.logoWidth < 53) errors.push(`logo is too small: ${metrics.logoWidth}px`);
  if (metrics.navFontSize < 12) errors.push(`navigation text is too small: ${metrics.navFontSize}px`);
  if (metrics.languageButtonHeight < 50) errors.push(`language control is too small: ${metrics.languageButtonHeight}px`);
  if (metrics.kickerLetterSpacing > 2.8) errors.push(`hero kicker tracking is too wide: ${metrics.kickerLetterSpacing}px`);
  if (metrics.noteLetterSpacing > 2.5) errors.push(`hero note tracking is too wide: ${metrics.noteLetterSpacing}px`);

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Navbar scale passed: ${Math.round(metrics.headerHeight)}px header, ${Math.round(metrics.logoWidth)}px logo, ${metrics.navFontSize.toFixed(1)}px labels.`);
  }
} finally {
  await browser.close();
}
