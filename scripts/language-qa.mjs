import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.LANGUAGE_QA_URL ?? "http://127.0.0.1:4173/";
const outDir = path.resolve("output/playwright/language-qa");

const defaultLanguages = ["en", "de", "ru", "ka", "tr", "ar", "pl"];
const defaultViewports = [
  { name: "desktop", width: 1365, height: 768, isMobile: false },
  { name: "ipad", width: 820, height: 1180, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "narrow", width: 280, height: 653, isMobile: true },
];

function parseLanguages(value) {
  if (!value) return defaultLanguages;
  const parsed = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return parsed.length ? parsed : defaultLanguages;
}

function parseViewports(value) {
  if (!value) return defaultViewports;
  const parsed = value
    .split(",")
    .map((entry) => {
      const [namePart, sizePart, modePart] = entry.split(":");
      const [widthText, heightText] = (sizePart ?? "").toLowerCase().split("x");
      const width = Number(widthText);
      const height = Number(heightText);
      if (!namePart || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
      const name = namePart.trim();
      return {
        name,
        width,
        height,
        isMobile: modePart === "mobile" || width < 768,
      };
    })
    .filter(Boolean);
  return parsed.length ? parsed : defaultViewports;
}

const languages = parseLanguages(process.env.LANGUAGE_QA_LANGS);
const viewports = parseViewports(process.env.LANGUAGE_QA_VIEWPORTS);

const sections = [
  "about",
  "philosophy",
  "philosophy-origins",
  "philosophy-platform",
  "about-objectives",
  "about-access",
  "legacy",
  "dubai",
  "batumi",
  "materials",
  "participate",
  "how",
  "team",
  "partners",
  "faqs",
  "contact",
];

const ignoredConsoleText = [
  "Download the React DevTools",
  "The resource",
  "Image with src",
  "Error while trying to use the following icon",
];

const mediaResourceTypes = new Set(["media", "font", "manifest"]);

fs.mkdirSync(outDir, { recursive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slug(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function waitForStoryReady(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("[data-home-experience='desktop-story']", { timeout: 30000 });
  const deadline = Date.now() + 32000;
  let introReady = false;
  let lastLoaderState = null;
  while (Date.now() < deadline) {
    const loader = page.locator(".story-hero-intro-loader");
    const loaderCount = await loader.count();
    if (loaderCount === 0) {
      introReady = true;
      break;
    }

    const loaderState = await loader.first().evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        display: style.display,
        phase: element.getAttribute("data-intro-phase"),
        pointerEvents: style.pointerEvents,
      };
    });
    lastLoaderState = loaderState;

    if (
      loaderState.display === "none" ||
      loaderState.pointerEvents === "none" ||
      loaderState.phase === "done"
    ) {
      introReady = true;
      break;
    }

    await wait(250);
  }
  if (!introReady) {
    throw new Error(`story intro loader remained blocking: ${JSON.stringify(lastLoaderState)}`);
  }
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => undefined);
  await wait(250);
}

async function jumpToSection(page, id) {
  await page.evaluate((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return false;
    const top = Math.max(0, window.scrollY + section.getBoundingClientRect().top);
    window.scrollTo({ top, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
    return true;
  }, id);
  await wait(450);
}

async function collectVisibleIssues(page) {
  return page.evaluate(() => {
    const issues = {
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      textOverflow: [],
      tinyText: [],
      wordSplits: [],
      brokenImages: [],
      badRevealSections: [],
      blankSections: [],
    };

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    const isVisible = (element) => {
      if (!(element instanceof HTMLElement)) return false;
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1 && rect.bottom >= 0 && rect.right >= 0 && rect.top <= viewportHeight && rect.left <= viewportWidth;
    };

    const selectorFor = (element) => {
      const parts = [];
      let current = element;
      while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
        let part = current.tagName.toLowerCase();
        if (current.id) {
          part += `#${current.id}`;
          parts.unshift(part);
          break;
        }
        const dataSection = current.getAttribute("data-story-section");
        if (dataSection) part += `[data-story-section="${dataSection}"]`;
        else if (current.classList.length) part += `.${Array.from(current.classList).slice(0, 2).join(".")}`;
        parts.unshift(part);
        current = current.parentElement;
      }
      return parts.join(" > ");
    };

    document.querySelectorAll("[data-story-section]").forEach((section) => {
      const rect = section.getBoundingClientRect();
      const nearViewport = rect.bottom >= -viewportHeight * 0.1 && rect.top <= viewportHeight * 1.1;
      if (nearViewport && section.getAttribute("data-story-revealed") !== "true") {
        issues.badRevealSections.push(section.getAttribute("data-story-section") || section.id || "unknown");
      }
      if (nearViewport && (section.innerText || "").trim().length < 12) {
        issues.blankSections.push(section.getAttribute("data-story-section") || section.id || "unknown");
      }
    });

    const textElements = document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,a,button,li,dt,dd,label");
    textElements.forEach((element) => {
      if (!isVisible(element)) return;
      if (element.closest(".sr-only,[aria-hidden='true'],.story-letter-reveal__text,.story-letter-reveal__mobile-plain,.story-letter-reveal__char")) return;
      if ((element.innerText || "").trim().length < 2) return;

      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const overflowX = element.scrollWidth - element.clientWidth;
      const overflowY = element.scrollHeight - element.clientHeight;
      const clipsX = style.overflowX !== "visible" && style.overflowX !== "clip";
      const clipsY = style.overflowY !== "visible" && style.overflowY !== "clip";

      if ((clipsX && overflowX > 4) || (clipsY && overflowY > 5)) {
        issues.textOverflow.push({
          selector: selectorFor(element),
          text: (element.innerText || "").trim().slice(0, 140),
          overflowX,
          overflowY,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }

      const fontSize = parseFloat(style.fontSize);
      const isEyebrow = element.classList.contains("story-eyebrow") || element.classList.contains("eyebrow");
      const isCompactStoryNav = Boolean(element.closest(".story-desktop-header"));
      if (!isEyebrow && !isCompactStoryNav && fontSize > 0 && fontSize < 11) {
        issues.tinyText.push({
          selector: selectorFor(element),
          text: (element.innerText || "").trim().slice(0, 100),
          fontSize,
        });
      }
    });

    document.querySelectorAll(".story-letter-reveal__word").forEach((word) => {
      if (!isVisible(word)) return;
      if ((word.textContent || "").trim().length < 2) return;

      const characterRects = Array.from(word.querySelectorAll(".story-letter-reveal__char"))
        .map((character) => character.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);
      if (characterRects.length < 2) return;

      const lineTops = [];
      characterRects.forEach((rect) => {
        if (!lineTops.some((top) => Math.abs(top - rect.top) < 2)) {
          lineTops.push(rect.top);
        }
      });

      if (lineTops.length > 1) {
        issues.wordSplits.push({
          selector: selectorFor(word),
          text: (word.textContent || "").trim().slice(0, 100),
          lines: lineTops.length,
        });
      }
    });

    document.querySelectorAll("img").forEach((image) => {
      if (!isVisible(image)) return;
      if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
        issues.brokenImages.push({
          selector: selectorFor(image),
          src: image.currentSrc || image.src,
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        });
      }
    });

    return issues;
  });
}

async function runCase(browser, lang, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.isMobile ? 2 : 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile || viewport.name === "ipad",
    locale: lang === "ar" ? "ar-SA" : lang,
    reducedMotion: "no-preference",
  });

  await context.addInitScript((language) => {
    localStorage.setItem("aixco-lang", language);
  }, lang);

  const consoleErrors = [];
  const failedRequests = [];
  const badResponses = [];

  const page = await context.newPage();
  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error" && !ignoredConsoleText.some((entry) => text.includes(entry))) {
      consoleErrors.push(text);
    }
  });
  page.on("requestfailed", (request) => {
    const type = request.resourceType();
    if (mediaResourceTypes.has(type)) return;
    failedRequests.push({ url: request.url(), type, failure: request.failure()?.errorText ?? "unknown" });
  });
  page.on("response", (response) => {
    const request = response.request();
    const type = request.resourceType();
    if (mediaResourceTypes.has(type)) return;
    if (response.status() >= 400) {
      badResponses.push({ url: response.url(), status: response.status(), type });
    }
  });

  const result = {
    lang,
    viewport: viewport.name,
    errors: [],
    consoleErrors,
    failedRequests,
    badResponses,
    sectionIssues: {},
    screenshots: [],
  };

  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await waitForStoryReady(page);

    const docInfo = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      title: document.title,
    }));
    if (docInfo.lang !== lang) result.errors.push(`html lang is ${docInfo.lang}, expected ${lang}`);
    if (lang === "ar" && docInfo.dir !== "rtl") result.errors.push(`Arabic dir is ${docInfo.dir}, expected rtl`);
    if (lang !== "ar" && docInfo.dir === "rtl") result.errors.push(`${lang} unexpectedly rendered rtl`);
    if (!/AIXCO/i.test(docInfo.title)) result.errors.push(`unexpected document title: ${docInfo.title}`);

    const heroShot = path.join(outDir, `${lang}-${viewport.name}-hero.png`);
    await page.screenshot({ path: heroShot, fullPage: false });
    result.screenshots.push(heroShot);

    const langButton = page.locator("button[data-language-trigger='true']:visible").first();
    await langButton.click({ timeout: 5000 });
    const visibleLanguageMenu = page.locator(".story-mobile-language-list:visible, .story-desktop-header ul:visible").first();
    const languageMenuBox = await visibleLanguageMenu.boundingBox();
    if (languageMenuBox && (languageMenuBox.x < -1 || languageMenuBox.x + languageMenuBox.width > viewport.width + 1)) {
      result.errors.push(`language menu extends outside viewport (${Math.round(languageMenuBox.x)}-${Math.round(languageMenuBox.x + languageMenuBox.width)}px)`);
    }
    await page.locator(`[data-lang='${lang}']:visible`).first().click({ timeout: 5000 });
    await wait(150);

    for (const section of sections) {
      await jumpToSection(page, section);
      const exists = await page.locator(`#${section}`).count();
      if (!exists) {
        result.sectionIssues[section] = { missing: true };
        continue;
      }
      const issues = await collectVisibleIssues(page);
      if (
        issues.horizontalOverflow > 3 ||
        issues.textOverflow.length ||
        issues.tinyText.length ||
        issues.wordSplits.length ||
        issues.brokenImages.length ||
        issues.badRevealSections.length ||
        issues.blankSections.length
      ) {
        result.sectionIssues[section] = issues;
        const shot = path.join(outDir, `${lang}-${viewport.name}-${slug(section)}-issue.png`);
        await page.screenshot({ path: shot, fullPage: false });
        result.screenshots.push(shot);
      }
    }

    await jumpToSection(page, "team");
    const firstTeamButton = page.locator("[data-layout='story-team-list'] button").first();
    await firstTeamButton.click({ timeout: 6000 });
    const modalVisible = await page.locator("[role='dialog']").first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!modalVisible) {
      result.errors.push("team member modal did not open");
      const shot = path.join(outDir, `${lang}-${viewport.name}-team-modal-failed.png`);
      await page.screenshot({ path: shot, fullPage: false });
      result.screenshots.push(shot);
    } else {
      await page.keyboard.press("Escape").catch(() => undefined);
    }

    await jumpToSection(page, "contact");
    const contactShot = path.join(outDir, `${lang}-${viewport.name}-contact.png`);
    await page.screenshot({ path: contactShot, fullPage: false });
    result.screenshots.push(contactShot);
  } catch (error) {
    result.errors.push(error instanceof Error ? error.stack || error.message : String(error));
    const shot = path.join(outDir, `${lang}-${viewport.name}-fatal.png`);
    await page.screenshot({ path: shot, fullPage: false }).catch(() => undefined);
    result.screenshots.push(shot);
  } finally {
    await context.close();
  }

  if (consoleErrors.length) result.errors.push(`${consoleErrors.length} console error(s)`);
  if (failedRequests.length) result.errors.push(`${failedRequests.length} failed request(s)`);
  if (badResponses.length) result.errors.push(`${badResponses.length} bad response(s)`);

  return result;
}

const browser = await chromium.launch({
  args: [
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
  ],
});
const results = [];

try {
  for (const viewport of viewports) {
    for (const lang of languages) {
      results.push(await runCase(browser, lang, viewport));
    }
  }
} finally {
  await browser.close();
}

const failing = results.filter(
  (result) => result.errors.length || Object.keys(result.sectionIssues).length || result.consoleErrors.length || result.failedRequests.length || result.badResponses.length,
);

const summary = {
  baseUrl,
  checkedAt: new Date().toISOString(),
  languages,
  viewports: viewports.map(({ name, width, height }) => ({ name, width, height })),
  totalCases: results.length,
  failingCases: failing.length,
  results,
};

const summaryPath = path.join(outDir, "summary.json");
fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify({
  summaryPath,
  totalCases: summary.totalCases,
  failingCases: summary.failingCases,
  failures: failing.map((result) => ({
    lang: result.lang,
    viewport: result.viewport,
    errors: result.errors,
    sections: Object.keys(result.sectionIssues),
  })),
}, null, 2));

if (failing.length) {
  process.exitCode = 1;
}
