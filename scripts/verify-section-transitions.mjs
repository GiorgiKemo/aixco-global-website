import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const captureLabel = process.env.TRANSITION_CAPTURE_LABEL ?? "final";
const captureOnly = process.env.TRANSITION_CAPTURE_ONLY === "1";
const outputDir = "output/playwright/section-transitions";
const failures = [];
const summaries = [];

const viewportCases = [
  { name: "desktop", width: 1562, height: 703 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "phone", width: 390, height: 844 },
  { name: "small-phone", width: 320, height: 568 },
  { name: "phone-landscape", width: 844, height: 390 },
];

const browserCases = [
  { name: "chromium", launcher: chromium, viewports: viewportCases },
  {
    name: "webkit",
    launcher: webkit,
    viewports: viewportCases.filter(({ name }) => name === "desktop" || name === "phone"),
  },
];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function inspectTransition(browser, browserName, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  const label = `${browserName}/${viewport.name}`;

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(`${baseUrl}/#about-access`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-story-section='aboutAccess'] .story-about-access-stage");
    await page.waitForFunction(() => document.fonts.status === "loaded");
    await page.waitForTimeout(1250);
    await page.evaluate((height) => {
      const section = document.querySelector("[data-story-section='aboutAccess']");
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - height * 0.46), behavior: "instant" });
    }, viewport.height);
    await page.waitForFunction(
      (height) => {
        const top = document.querySelector("[data-story-section='aboutAccess']")?.getBoundingClientRect().top;
        return typeof top === "number" && top >= height * 0.35 && top <= height * 0.58;
      },
      viewport.height,
    );

    const metrics = await page.evaluate(() => {
      const previous = document.querySelector("[data-story-section='aboutObjectives']");
      const current = document.querySelector("[data-story-section='aboutAccess']");
      const stage = current.querySelector(".story-about-access-stage");
      const content = current.querySelector("[data-layout='story-about-access']");
      const pseudo = getComputedStyle(stage, "::before");
      const currentStyle = getComputedStyle(current);
      const currentRect = current.getBoundingClientRect();
      const previousRect = previous.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const transitionHeight = Number.parseFloat(pseudo.height) || 0;
      const transitionTop = stageRect.top + (Number.parseFloat(pseudo.top) || 0);
      const transitionBottom = transitionTop + transitionHeight;
      const importantSelector = "h1, h2, h3, p, a, button, [data-brand-lockup]";
      const visibleImportant = [...content.querySelectorAll(importantSelector)].filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });
      const previousImportant = [...previous.querySelectorAll(importantSelector)].filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });
      const firstCurrentTextTop = Math.min(
        ...visibleImportant.map((node) => node.getBoundingClientRect().top),
      );
      const lastPreviousTextBottom = Math.max(
        ...previousImportant.map((node) => node.getBoundingClientRect().bottom),
      );
      const clippedImportant = visibleImportant.filter((node) => {
        const rect = node.getBoundingClientRect();
        const rawCenterX = rect.left + rect.width / 2;
        const rawCenterY = rect.top + rect.height / 2;
        if (
          rawCenterX < 0 ||
          rawCenterX >= window.innerWidth ||
          rawCenterY < 0 ||
          rawCenterY >= window.innerHeight
        ) return false;
        const centerX = Math.min(window.innerWidth - 1, Math.max(0, rawCenterX));
        const centerY = Math.min(window.innerHeight - 1, Math.max(0, rawCenterY));
        const hit = document.elementFromPoint(centerX, centerY);
        return !hit || !(hit === node || node.contains(hit) || hit.contains(node));
      }).length;
      const coveredPreviousImportant = previousImportant.filter((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < currentRect.top - Math.min(transitionHeight * 0.2, 36)) return false;
        const rawCenterX = rect.left + rect.width / 2;
        const rawCenterY = rect.top + rect.height / 2;
        if (
          rawCenterX < 0 ||
          rawCenterX >= window.innerWidth ||
          rawCenterY < 0 ||
          rawCenterY >= window.innerHeight
        ) return false;
        const centerX = Math.min(window.innerWidth - 1, Math.max(0, rawCenterX));
        const centerY = Math.min(window.innerHeight - 1, Math.max(0, rawCenterY));
        const hit = document.elementFromPoint(centerX, centerY);
        return !hit || !(hit === node || node.contains(hit) || hit.contains(node));
      }).length;

      const sections = [...document.querySelectorAll("[data-story-section]")];
      const orderIssues = sections.slice(1).filter((section, index) => {
        const previousSection = sections[index];
        const previousTop = previousSection.getBoundingClientRect().top + window.scrollY;
        const currentTop = section.getBoundingClientRect().top + window.scrollY;
        return currentTop <= previousTop;
      }).length;

      return {
        backgroundImage: pseudo.backgroundImage,
        pseudoContent: pseudo.content,
        pointerEvents: pseudo.pointerEvents,
        sectionMaskImage: currentStyle.webkitMaskImage || currentStyle.maskImage,
        sectionMaskSize: currentStyle.webkitMaskSize || currentStyle.maskSize,
        sectionBackgroundColor: currentStyle.backgroundColor,
        transitionHeight,
        transitionTop,
        currentMarginTop: Number.parseFloat(currentStyle.marginTop) || 0,
        firstCurrentTextTop,
        lastPreviousTextBottom,
        transitionBottom,
        currentTop: currentRect.top,
        previousBottom: previousRect.bottom,
        sectionGap: currentRect.top - previousRect.bottom,
        clippedImportant,
        coveredPreviousImportant,
        orderIssues,
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    await page.screenshot({
      path: `${outputDir}/${captureLabel}-${browserName}-${viewport.name}.png`,
      animations: "disabled",
    });

    if (!captureOnly) {
      check(metrics.pseudoContent !== "none", `${label}: transition pseudo-element is missing`);
      check(metrics.backgroundImage.includes("gradient"), `${label}: transition has no gradient`);
      check(metrics.pointerEvents === "none", `${label}: transition can intercept input`);
      check(
        metrics.sectionMaskImage.includes("gradient"),
        `${label}: incoming section is not feathered with a mask`,
      );
      check(
        metrics.sectionMaskSize.includes("100%"),
        `${label}: section mask does not cover the full section`,
      );
      check(
        metrics.sectionBackgroundColor === "rgba(0, 0, 0, 0)",
        `${label}: section background is opaque at the overlap`,
      );
      check(
        metrics.transitionHeight >= Math.min(96, viewport.height * 0.14),
        `${label}: transition is only ${metrics.transitionHeight.toFixed(1)}px tall`,
      );
      check(
        metrics.sectionGap <= -Math.min(64, viewport.height * 0.12),
        `${label}: sections do not overlap deeply enough (${metrics.sectionGap.toFixed(1)}px)`,
      );
      check(
        Math.abs(metrics.sectionGap - metrics.currentMarginTop) <= 2,
        `${label}: measured overlap and negative margin disagree`,
      );
      check(
        Math.abs(metrics.sectionGap) < metrics.transitionHeight,
        `${label}: overlap is not contained inside the feather`,
      );
      check(
        metrics.firstCurrentTextTop >= metrics.transitionBottom - 1,
        `${label}: current-section text intersects the transition layer`,
      );
      check(
        metrics.lastPreviousTextBottom <=
          metrics.currentTop + Math.min(metrics.transitionHeight * 0.2, 36),
        `${label}: previous-section text is covered by the overlapping section`,
      );
      check(metrics.clippedImportant === 0, `${label}: ${metrics.clippedImportant} important elements fail hit testing`);
      check(
        metrics.coveredPreviousImportant === 0,
        `${label}: ${metrics.coveredPreviousImportant} previous-section elements fail hit testing`,
      );
      check(metrics.orderIssues === 0, `${label}: story section order is invalid`);
      check(metrics.horizontalOverflow <= 1, `${label}: horizontal overflow is ${metrics.horizontalOverflow}px`);
      check(errors.length === 0, `${label}: console/page errors: ${errors.join(" | ")}`);
    }

    summaries.push(
      `${label}: ${Math.abs(metrics.sectionGap).toFixed(0)}px overlap / ${metrics.transitionHeight.toFixed(0)}px feather, text clearance ${(metrics.firstCurrentTextTop - metrics.transitionBottom).toFixed(0)}px`,
    );
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });

for (const browserCase of browserCases) {
  const browser = await browserCase.launcher.launch({ headless: true });
  try {
    for (const viewport of browserCase.viewports) {
      await inspectTransition(browser, browserCase.name, viewport);
    }
  } finally {
    await browser.close();
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    captureOnly
      ? `Captured ${summaries.length} transition baselines.`
      : `Section transition passed ${summaries.length} browser/viewport cases.`,
  );
  console.log(summaries.join("\n"));
}
