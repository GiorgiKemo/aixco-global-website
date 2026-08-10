import { chromium } from "playwright";
import { installNecessaryOnlyAnalyticsConsent } from "./lib/analytics-consent.mjs";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  for (const width of [767, 768, 820, 1280]) {
    const height = 900;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    await installNecessaryOnlyAnalyticsConsent(context);
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForFunction(() => {
      const hero = document.querySelector('[data-story-section="hero"]');
      return document.querySelectorAll("[data-story-section]").length === 17
        && document.querySelectorAll("[data-story-section][data-story-in-viewport]").length === 17
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
      const journeyTrack = style(".story-journeys-track");
      const journeyPrimary = style('[data-journey-set="primary"]');
      const journeyDuplicate = style('[data-journey-set="duplicate"]');
      const team = style('[data-layout="story-team-list"]');
      const mobileHeader = style(".story-mobile-header");
      const desktopHeader = style(".story-desktop-header");

      return {
        heroHeight: Math.round(hero?.getBoundingClientRect().height ?? 0),
        materialsTitleDisplay: materialsTitle?.display,
        journeyDisplay: journeys?.display,
        journeyOverflowX: journeys?.overflowX,
        journeyTrackDisplay: journeyTrack?.display,
        journeyTrackAnimationName: journeyTrack?.animationName,
        journeyPrimaryDisplay: journeyPrimary?.display,
        journeyDuplicateDisplay: journeyDuplicate?.display,
        teamAutoFlow: team?.gridAutoFlow,
        mobileHeaderDisplay: mobileHeader?.display,
        desktopHeaderDisplay: desktopHeader?.display,
      };
    });

    if (width === 767) {
      if (metrics.materialsTitleDisplay === "none") errors.push("767px: mobile materials title is hidden");
      if (metrics.journeyDisplay !== "block") errors.push(`767px: journey viewport uses ${metrics.journeyDisplay} display`);
      if (metrics.journeyOverflowX !== "auto") errors.push(`767px reduced motion: journey overflow is ${metrics.journeyOverflowX}`);
      if (metrics.journeyTrackAnimationName !== "none") errors.push(`767px reduced motion: journey animation is ${metrics.journeyTrackAnimationName}`);
      if (metrics.journeyPrimaryDisplay !== "flex") errors.push(`767px: primary journey set uses ${metrics.journeyPrimaryDisplay} display`);
      if (metrics.journeyDuplicateDisplay !== "none") errors.push(`767px reduced motion: duplicate journey set uses ${metrics.journeyDuplicateDisplay} display`);
      if (metrics.teamAutoFlow !== "column") errors.push(`767px: team cards use ${metrics.teamAutoFlow} flow`);
      if (metrics.heroHeight >= height - 8) errors.push(`767px: mobile hero does not reveal the next section (${metrics.heroHeight}px)`);
    } else {
      if (metrics.materialsTitleDisplay !== "none") errors.push(`${width}px: mobile-only materials title is visible`);
      if (metrics.journeyDisplay !== "grid") errors.push(`${width}px: journey grid uses ${metrics.journeyDisplay} display`);
      if (metrics.journeyTrackDisplay !== "contents") errors.push(`${width}px: mobile journey track leaked outside phone breakpoint`);
      if (metrics.journeyDuplicateDisplay !== "none") errors.push(`${width}px: duplicate journey set is visible outside phone breakpoint`);
      if (metrics.teamAutoFlow === "column") errors.push(`${width}px: mobile team carousel leaked outside phone breakpoint`);
      if (metrics.heroHeight < height - 8) errors.push(`${width}px: mobile hero height leaked outside phone breakpoint (${metrics.heroHeight}px)`);
    }

    if (width === 1280) {
      if (metrics.mobileHeaderDisplay !== "none") errors.push("1280px: mobile header is visible");
      if (metrics.desktopHeaderDisplay === "none") errors.push("1280px: desktop header is hidden");
    }

    await context.close();
  }

  const animatedContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "no-preference",
  });
  await installNecessaryOnlyAnalyticsConsent(animatedContext);
  const animatedPage = await animatedContext.newPage();
  await animatedPage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await animatedPage.waitForFunction(() => (
    document.querySelectorAll("[data-story-section]").length === 17
    && document.querySelectorAll("[data-story-section][data-story-in-viewport]").length === 17
  ));
  const animatedJourney = await animatedPage.evaluate(() => {
    const journeys = document.querySelector('[data-layout="story-journeys"]');
    const track = document.querySelector(".story-journeys-track");
    const duplicate = document.querySelector('[data-journey-set="duplicate"]');
    return {
      overflowX: journeys ? getComputedStyle(journeys).overflowX : null,
      animationName: track ? getComputedStyle(track).animationName : null,
      animationDuration: track ? getComputedStyle(track).animationDuration : null,
      duplicateDisplay: duplicate ? getComputedStyle(duplicate).display : null,
      duplicateAriaHidden: duplicate?.getAttribute("aria-hidden"),
    };
  });
  if (animatedJourney.overflowX !== "hidden") errors.push(`390px: animated journey overflow is ${animatedJourney.overflowX}`);
  if (animatedJourney.animationName !== "story-mobile-journeys-loop") errors.push(`390px: journey animation is ${animatedJourney.animationName}`);
  if (animatedJourney.animationDuration !== "32s") errors.push(`390px: journey animation duration is ${animatedJourney.animationDuration}`);
  if (animatedJourney.duplicateDisplay !== "flex") errors.push(`390px: duplicate journey set uses ${animatedJourney.duplicateDisplay} display`);
  if (animatedJourney.duplicateAriaHidden !== "true") errors.push("390px: duplicate journey set is exposed to assistive technology");

  await animatedPage.locator('[data-journey-set="primary"] button').first().focus();
  await animatedPage.waitForFunction(() => {
    const track = document.querySelector(".story-journeys-track");
    return track && getComputedStyle(track).animationPlayState === "paused";
  });
  const focusedAnimationState = await animatedPage.locator(".story-journeys-track").evaluate((track) => getComputedStyle(track).animationPlayState);
  if (focusedAnimationState !== "paused") errors.push(`390px: focused journey animation is ${focusedAnimationState}`);
  await animatedContext.close();
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Mobile redesign is isolated to 767px and below; tablet and desktop checks passed.");
