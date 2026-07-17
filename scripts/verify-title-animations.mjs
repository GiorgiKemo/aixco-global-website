import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const outputDir = "output/playwright/title-animation";
const failures = [];
const summaries = [];

const viewportCases = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "small-laptop", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "phone", width: 390, height: 844 },
  { name: "small-phone", width: 360, height: 800 },
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

async function inspectTitleCase(browser, browserName, viewport, locale = "en") {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: "no-preference",
  });
  await context.addInitScript((nextLocale) => localStorage.setItem("aixco-lang", nextLocale), locale);
  await context.addInitScript(() => {
    window.__aixcoTitleEvents = [];
    window.__aixcoTitleFrames = [];
    window.__aixcoTitleFrameSampling = false;

    const sampleFrames = () => {
      if (window.__aixcoTitleFrameSampling) return;
      window.__aixcoTitleFrameSampling = true;
      const start = performance.now();
      let previous = start;
      const sample = (now) => {
        window.__aixcoTitleFrames.push(now - previous);
        previous = now;
        if (now - start < 1100) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    };

    document.addEventListener("animationstart", (event) => {
      if (event.animationName !== "story-title-reveal") return;
      window.__aixcoTitleEvents.push({
        phase: "start",
        name: event.animationName,
        section: event.target.closest("[data-story-section]")?.getAttribute("data-story-section") ?? "unknown",
      });
      sampleFrames();
    }, true);

    document.addEventListener("animationend", (event) => {
      if (event.animationName !== "story-title-reveal") return;
      window.__aixcoTitleEvents.push({
        phase: "end",
        name: event.animationName,
        elapsedTime: event.elapsedTime,
        section: event.target.closest("[data-story-section]")?.getAttribute("data-story-section") ?? "unknown",
      });
    }, true);
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") pageErrors.push(message.text());
  });

  const label = `${browserName}/${viewport.name}/${locale}`;

  try {
    await page.goto(`${baseUrl}/#dubai`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-story-section='dubai'] [data-text-reveal-engine='unified-transform']");

    const structural = await page.evaluate(() => {
      const reveals = [...document.querySelectorAll("[data-text-reveal-engine='unified-transform']")];
      return {
        revealCount: reveals.length,
        invalidVisualLayerCount: reveals.filter(
          (reveal) => reveal.querySelectorAll(":scope > .story-title-reveal__text").length !== 1,
        ).length,
        legacyCharacterCount: document.querySelectorAll(".story-letter-reveal__char").length,
        compactFallbackCount: document.querySelectorAll(".story-letter-reveal--compact").length,
        duplicatePlainLayerCount: document.querySelectorAll(
          ".story-text-reveal__mobile-plain, .story-text-reveal__tiny-plain",
        ).length,
      };
    });

    check(structural.revealCount >= 14, `${label}: expected all shared titles, found ${structural.revealCount}`);
    check(structural.invalidVisualLayerCount === 0, `${label}: a title has duplicate visual layers`);
    check(structural.legacyCharacterCount === 0, `${label}: legacy per-character nodes are still rendered`);
    check(structural.compactFallbackCount === 0, `${label}: compact fallback is still rendered`);
    check(structural.duplicatePlainLayerCount === 0, `${label}: duplicate mobile/tiny title layers remain`);

    const reveal = page.locator("[data-story-section='dubai'] [data-text-reveal-engine='unified-transform']");
    await page.waitForFunction(
      () => document.querySelector("[data-story-section='dubai'] [data-text-reveal-engine='unified-transform']")?.getAttribute("data-text-reveal-state") === "played",
      undefined,
      { timeout: 5000 },
    );
    await page.waitForFunction(() => document.fonts.status === "loaded");

    const settled = await reveal.evaluate((node) => {
      const text = node.querySelector(".story-title-reveal__text");
      const style = getComputedStyle(text);
      const rect = text.getBoundingClientRect();
      return {
        animationName: style.animationName,
        animationCount: text.getAnimations().length,
        opacity: Number.parseFloat(style.opacity),
        transform: style.transform,
        visibility: style.visibility,
        rect: { left: rect.left, right: rect.right, height: rect.height },
        viewportWidth: window.innerWidth,
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    check(settled.animationName === "none", `${label}: settled title still reports ${settled.animationName}`);
    check(settled.animationCount === 0, `${label}: settled title still has Web Animations work`);
    check(settled.opacity === 1 && settled.visibility === "visible", `${label}: settled title is not fully visible`);
    check(settled.transform === "none" || settled.transform === "matrix(1, 0, 0, 1, 0, 0)", `${label}: settled transform is ${settled.transform}`);
    check(settled.rect.height > 0, `${label}: title has no rendered height`);
    check(settled.rect.left >= -1 && settled.rect.right <= settled.viewportWidth + 1, `${label}: title escapes the viewport`);
    check(settled.horizontalOverflow <= 1, `${label}: horizontal overflow is ${settled.horizontalOverflow}px`);

    const initialEventSummary = await page.evaluate(() => {
      const dubaiEvents = (window.__aixcoTitleEvents ?? []).filter((event) => event.section === "dubai");
      return {
        startCount: dubaiEvents.filter((event) => event.phase === "start").length,
        endCount: dubaiEvents.filter((event) => event.phase === "end").length,
        elapsedTime: dubaiEvents.find((event) => event.phase === "end")?.elapsedTime ?? 0,
      };
    });
    check(initialEventSummary.startCount === 1, `${label}: expected one title animation start, found ${initialEventSummary.startCount}`);
    check(initialEventSummary.endCount === 1, `${label}: expected one title animation end, found ${initialEventSummary.endCount}`);
    check(
      initialEventSummary.elapsedTime >= 0.82 && initialEventSummary.elapsedTime <= 0.9,
      `${label}: animation duration was ${initialEventSummary.elapsedTime.toFixed(3)}s`,
    );

    await page.mouse.wheel(0, viewport.height * 1.2);
    await page.waitForTimeout(180);
    await page.mouse.wheel(0, viewport.height * -1.2);
    await page.waitForTimeout(220);
    check(await reveal.getAttribute("data-text-reveal-state") === "played", `${label}: title replayed after revisiting the section`);
    const finalStartCount = await page.evaluate(
      () => (window.__aixcoTitleEvents ?? []).filter((event) => event.section === "dubai" && event.phase === "start").length,
    );
    check(finalStartCount === 1, `${label}: title animation restarted ${finalStartCount} times`);

    const frameStats = await page.evaluate(() => {
      const frames = window.__aixcoTitleFrames ?? [];
      const sorted = [...frames].sort((a, b) => a - b);
      return {
        count: frames.length,
        average: frames.length ? frames.reduce((sum, value) => sum + value, 0) / frames.length : 0,
        p95: sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0,
        max: sorted.length ? sorted[sorted.length - 1] : 0,
      };
    });

    if (browserName === "chromium") {
      check(frameStats.count >= 20, `${label}: insufficient animation-frame samples (${frameStats.count})`);
      check(frameStats.p95 < 70, `${label}: p95 frame gap is ${frameStats.p95.toFixed(1)}ms`);
      check(frameStats.max < 180, `${label}: maximum frame gap is ${frameStats.max.toFixed(1)}ms`);
    }
    check(pageErrors.length === 0, `${label}: console/page errors: ${pageErrors.join(" | ")}`);

    if (locale === "en" && (viewport.name === "desktop" || viewport.name === "phone")) {
      await page.screenshot({ path: `${outputDir}/${browserName}-${viewport.name}.png` });
    }

    summaries.push(`${label}: ${frameStats.count} frames, p95 ${frameStats.p95.toFixed(1)}ms, max ${frameStats.max.toFixed(1)}ms`);
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
  }
}

async function inspectReducedMotion(browser, browserName) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  try {
    await page.goto(`${baseUrl}/#dubai`, { waitUntil: "domcontentloaded" });
    const reveal = page.locator("[data-story-section='dubai'] [data-text-reveal-engine='unified-transform']");
    await reveal.waitFor();
    await page.waitForTimeout(100);
    const result = await reveal.evaluate((node) => {
      const text = node.querySelector(".story-title-reveal__text");
      const style = getComputedStyle(text);
      return {
        animationName: style.animationName,
        animationCount: text.getAnimations().length,
        opacity: style.opacity,
        transform: style.transform,
        visibility: style.visibility,
      };
    });
    check(result.animationName === "none", `${browserName}/reduced-motion: animation is ${result.animationName}`);
    check(result.animationCount === 0, `${browserName}/reduced-motion: active animation work remains`);
    check(result.opacity === "1" && result.visibility === "visible", `${browserName}/reduced-motion: title is not visible`);
    check(result.transform === "none", `${browserName}/reduced-motion: transform is ${result.transform}`);
  } catch (error) {
    failures.push(`${browserName}/reduced-motion: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });

for (const browserCase of browserCases) {
  const browser = await browserCase.launcher.launch({ headless: true });
  try {
    for (const viewport of browserCase.viewports) {
      await inspectTitleCase(browser, browserCase.name, viewport);
    }

    if (browserCase.name === "chromium") {
      for (const locale of ["de", "ru", "ka", "ar", "pl"]) {
        await inspectTitleCase(browser, browserCase.name, viewportCases[4], locale);
      }
    }

    await inspectReducedMotion(browser, browserCase.name);
  } finally {
    await browser.close();
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Unified title animation passed ${summaries.length} browser/viewport/locale cases.`);
  console.log(summaries.join("\n"));
}
