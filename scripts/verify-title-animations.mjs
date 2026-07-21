import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const outputDir = "output/playwright/title-animation";
const titleRevealDurationMs = 1700;
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
        if (now - start < 1600) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    };

    document.addEventListener("animationstart", (event) => {
      if (!["story-title-reveal", "story-title-scroll-reveal"].includes(event.animationName)) return;
      window.__aixcoTitleEvents.push({
        phase: "start",
        name: event.animationName,
        section: event.target.closest("[data-story-section]")?.getAttribute("data-story-section") ?? "unknown",
      });
      sampleFrames();
    }, true);

    document.addEventListener("animationend", (event) => {
      if (!["story-title-reveal", "story-title-scroll-reveal"].includes(event.animationName)) return;
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
    await page.waitForSelector("[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']");

    const structural = await page.evaluate(() => {
      const reveals = [...document.querySelectorAll("[data-text-reveal-engine='scroll-linked-with-observer-fallback']")];
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

    const reveal = page.locator("[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']");
    await page.waitForFunction(() => document.fonts.status === "loaded");
    // Let the final hash-stabilization pass finish before measuring positions.
    await page.waitForTimeout(1250);

    const scrollRevealToTop = async (documentTop, desiredTop) => {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        await page.evaluate(
          ({ targetDocumentTop, targetViewportTop }) =>
            window.scrollTo(0, Math.max(0, targetDocumentTop - targetViewportTop)),
          { targetDocumentTop: documentTop, targetViewportTop: desiredTop },
        );
        await page.waitForTimeout(120);

        const actualTop = await reveal.evaluate((node) => node.getBoundingClientRect().top);
        if (Math.abs(actualTop - desiredTop) <= 3) return;
      }

      const actualTop = await reveal.evaluate((node) => node.getBoundingClientRect().top);
      throw new Error(
        `could not position title at ${desiredTop.toFixed(1)}px; settled at ${actualTop.toFixed(1)}px`,
      );
    };

    const nativeScrollLinked = await reveal.evaluate((node) => {
      const text = node.querySelector(".story-title-reveal__text");
      const style = getComputedStyle(text);
      return style.animationName === "story-title-scroll-reveal" && style.animationTimeline !== "auto";
    });

    let motionSummary = "";

    if (nativeScrollLinked) {
      const geometry = await reveal.evaluate((node) => ({
        documentTop: window.scrollY + node.getBoundingClientRect().top,
        viewportHeight: window.innerHeight,
      }));
      const desiredTitleTops = [
        geometry.viewportHeight + 24,
        geometry.viewportHeight * 0.8,
        geometry.viewportHeight * 0.6,
        geometry.viewportHeight * 0.4,
        geometry.viewportHeight * 0.2,
      ];
      const samples = [];

      for (const desiredTop of desiredTitleTops) {
        await scrollRevealToTop(geometry.documentTop, desiredTop);
        await page.waitForTimeout(80);
        samples.push(await reveal.evaluate((node) => {
          const text = node.querySelector(".story-title-reveal__text");
          const style = getComputedStyle(text);
          const rect = text.getBoundingClientRect();
          return {
            animationName: style.animationName,
            animationTimeline: style.animationTimeline,
            opacity: Number.parseFloat(style.opacity),
            state: node.getAttribute("data-text-reveal-state"),
            visibility: style.visibility,
            rect: { left: rect.left, right: rect.right, height: rect.height },
            viewportWidth: window.innerWidth,
            horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
          };
        }));
      }

      const opacities = samples.map((sample) => sample.opacity);
      check(samples.every((sample) => sample.animationName === "story-title-scroll-reveal"), `${label}: native timeline animation name changed`);
      check(samples.every((sample) => sample.animationTimeline !== "auto"), `${label}: native view timeline is inactive`);
      check(samples.every((sample) => sample.state === "scroll-linked"), `${label}: native state is not scroll-linked`);
      check(samples.every((sample) => sample.visibility === "visible"), `${label}: native title becomes visibility-hidden`);
      check(opacities[0] <= 0.04, `${label}: title starts at opacity ${opacities[0].toFixed(3)}`);
      check(opacities.at(-1) >= 0.92, `${label}: title ends at opacity ${opacities.at(-1).toFixed(3)}`);
      check(
        opacities.every((opacity, index) => index === 0 || opacity >= opacities[index - 1] - 0.01),
        `${label}: opacity is not monotonic (${opacities.map((value) => value.toFixed(3)).join(", ")})`,
      );

      const settled = samples.at(-1);
      check(settled.rect.height > 0, `${label}: title has no rendered height`);
      check(settled.rect.left >= -1 && settled.rect.right <= settled.viewportWidth + 1, `${label}: title escapes the viewport`);
      check(settled.horizontalOverflow <= 1, `${label}: horizontal overflow is ${settled.horizontalOverflow}px`);

      // Scrolling back above the entry range must rewind the reveal instead of
      // leaving a stale "played" title behind.
      await scrollRevealToTop(geometry.documentTop, geometry.viewportHeight + 24);
      await page.waitForTimeout(80);
      const rewoundOpacity = await reveal.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node.querySelector(".story-title-reveal__text")).opacity),
      );
      check(rewoundOpacity <= 0.04, `${label}: reverse scroll only rewound to ${rewoundOpacity.toFixed(3)}`);
      motionSummary = `scroll-linked opacity ${opacities.map((value) => value.toFixed(2)).join(" -> ")}`;
    } else {
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
      });
      const fallbackGeometry = await reveal.evaluate((node) => ({
        documentTop: window.scrollY + node.getBoundingClientRect().top,
        viewportHeight: window.innerHeight,
      }));
      await scrollRevealToTop(
        fallbackGeometry.documentTop,
        fallbackGeometry.viewportHeight + 24,
      );
      await page.waitForTimeout(400);

      const fallbackState = await reveal.getAttribute("data-text-reveal-state");
      if (fallbackState === "animating") {
        await page.waitForFunction(
          () => document.querySelector("[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']")?.getAttribute("data-text-reveal-state") === "played",
          undefined,
          { timeout: 5000 },
        );
      }

      await page.evaluate(() => {
        window.__aixcoTitleEvents = [];
        window.__aixcoTitleFrames = [];
        window.__aixcoTitleFrameSampling = false;
      });
      await scrollRevealToTop(
        fallbackGeometry.documentTop,
        fallbackGeometry.viewportHeight * 0.55,
      );
      await page.waitForFunction(
        () => document.querySelector("[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']")?.getAttribute("data-text-reveal-state") === "animating",
        undefined,
        { timeout: 5000 },
      );
      await page.waitForFunction(
        () => document.querySelector("[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']")?.getAttribute("data-text-reveal-state") === "played",
        undefined,
        { timeout: 5000 },
      );

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

      check(settled.animationName === "none", `${label}: settled fallback still reports ${settled.animationName}`);
      check(settled.animationCount === 0, `${label}: settled fallback still has Web Animations work`);
      check(settled.opacity === 1 && settled.visibility === "visible", `${label}: settled fallback is not fully visible`);
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
      check(initialEventSummary.startCount === 1, `${label}: expected one fallback start, found ${initialEventSummary.startCount}`);
      check(initialEventSummary.endCount === 1, `${label}: expected one fallback end, found ${initialEventSummary.endCount}`);
      check(
        initialEventSummary.elapsedTime >= 1.62 && initialEventSummary.elapsedTime <= 1.78,
        `${label}: fallback duration was ${initialEventSummary.elapsedTime.toFixed(3)}s`,
      );
      motionSummary = `observer fallback ${initialEventSummary.elapsedTime.toFixed(2)}s`;
    }

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

    if (browserName === "chromium" && !nativeScrollLinked) {
      check(frameStats.count >= 20, `${label}: insufficient animation-frame samples (${frameStats.count})`);
      check(frameStats.p95 < 70, `${label}: p95 frame gap is ${frameStats.p95.toFixed(1)}ms`);
      check(frameStats.max < 180, `${label}: maximum frame gap is ${frameStats.max.toFixed(1)}ms`);
    }
    check(pageErrors.length === 0, `${label}: console/page errors: ${pageErrors.join(" | ")}`);

    if (locale === "en" && (viewport.name === "desktop" || viewport.name === "phone")) {
      await page.screenshot({ path: `${outputDir}/${browserName}-${viewport.name}.png` });
    }

    summaries.push(`${label}: ${motionSummary}`);
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
  }
}

async function inspectNaturalScrollTraversal(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") pageErrors.push(message.text());
  });

  const label = `chromium/${viewport.name}/natural-scroll`;
  const settleMs = 96;
  const scrollStep = Math.max(120, Math.round(viewport.height * 0.38));
  const encounteredTitles = new Set();
  const traversalFailures = [];

  const inspectVisibleTitles = async (direction) => {
    const snapshot = await page.evaluate(() => ({
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      titles: [...document.querySelectorAll("[data-text-reveal-engine='scroll-linked-with-observer-fallback']")].map((node) => {
        const text = node.querySelector(".story-title-reveal__text");
        const style = getComputedStyle(text);
        const rect = text.getBoundingClientRect();
        return {
          active: node.closest("[data-story-section]")?.getAttribute("data-story-active") ?? "false",
          animationName: style.animationName,
          bottom: rect.bottom,
          label: node.getAttribute("data-text-reveal-label") ?? "unknown",
          opacity: Number.parseFloat(style.opacity),
          section: node.closest("[data-story-section]")?.getAttribute("data-story-section") ?? "unknown",
          state: node.getAttribute("data-text-reveal-state"),
          top: rect.top,
          visibility: style.visibility,
        };
      }),
    }));

    for (const title of snapshot.titles) {
      if (title.active !== "true") continue;

      encounteredTitles.add(title.label);
      if (title.state === "idle" || title.visibility !== "visible") {
        traversalFailures.push(
          `${label}: ${direction} at scrollY ${Math.round(snapshot.scrollY)} left ` +
          `${title.section} (${title.label}) ${title.state}/${title.visibility}, ` +
          `opacity ${title.opacity.toFixed(3)}, animation ${title.animationName}, ` +
          `rect ${title.top.toFixed(1)}..${title.bottom.toFixed(1)}`,
        );
      }
    }

    return snapshot.scrollY;
  };

  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-text-reveal-engine='scroll-linked-with-observer-fallback']");
    await page.waitForFunction(() => document.fonts.status === "loaded");
    await page.waitForFunction(() => document.documentElement.dataset.homeExperience === "story");
    await page.waitForTimeout(350);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(Math.round(viewport.width / 2), Math.round(viewport.height / 2));
    await page.waitForTimeout(settleMs);

    const titleCount = await page.locator("[data-text-reveal-engine='scroll-linked-with-observer-fallback']").count();
    const maxScrollY = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    );
    const maxSteps = Math.ceil(maxScrollY / scrollStep) + 8;

    await inspectVisibleTitles("down");
    for (let step = 0; step < maxSteps; step += 1) {
      const before = await page.evaluate(() => window.scrollY);
      if (before >= maxScrollY - 1) break;

      await page.mouse.wheel(0, scrollStep);
      await page.waitForTimeout(settleMs);
      const after = await inspectVisibleTitles("down");
      if (after <= before) {
        traversalFailures.push(`${label}: downward wheel stalled at scrollY ${Math.round(after)}`);
        break;
      }
    }

    for (let step = 0; step < maxSteps; step += 1) {
      const before = await page.evaluate(() => window.scrollY);
      if (before <= 1) break;

      await page.mouse.wheel(0, -scrollStep);
      await page.waitForTimeout(settleMs);
      const after = await inspectVisibleTitles("up");
      if (after >= before) {
        traversalFailures.push(`${label}: upward wheel stalled at scrollY ${Math.round(after)}`);
        break;
      }
    }

    await page.waitForTimeout(titleRevealDurationMs + 80);
    await inspectVisibleTitles("settled-at-top");

    check(
      encounteredTitles.size === titleCount,
      `${label}: encountered ${encounteredTitles.size} of ${titleCount} titles`,
    );
    traversalFailures.forEach((message) => failures.push(message));
    check(pageErrors.length === 0, `${label}: console/page errors: ${pageErrors.join(" | ")}`);

    summaries.push(
      `${label}: ${encounteredTitles.size}/${titleCount} titles remained visible through down/up traversal`,
    );
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
    const reveal = page.locator("[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']");
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

async function inspectLiveLocaleUpdate(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const label = "chromium/phone/live-locale-update";

  try {
    await page.goto(`${baseUrl}/#dubai`, { waitUntil: "domcontentloaded" });
    const reveal = page.locator("[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']");
    await reveal.waitFor();
    await page.waitForTimeout(100);
    const nativeScrollLinked = await page.evaluate(() =>
      /(?:Chrome|Chromium|Edg|OPR)\//u.test(navigator.userAgent) &&
      CSS.supports("animation-timeline: view()") &&
      CSS.supports("animation-range: entry 0% cover 42%"),
    );
    if (nativeScrollLinked) {
      await page.waitForFunction(
        () => document.querySelector(
          "[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']",
        )?.getAttribute("data-text-reveal-state") === "scroll-linked",
        undefined,
        { timeout: 5000 },
      );
    } else {
      await page.waitForFunction(
        () => document.querySelector(
          "[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']",
        )?.getAttribute("data-text-reveal-state") === "played",
        undefined,
        { timeout: 5000 },
      );
    }
    const englishLabel = await reveal.getAttribute("data-text-reveal-label");

    await page.locator('[data-language-trigger="true"]:visible').click();
    await page.locator('[data-lang="de"]:visible').click();
    await page.waitForFunction(() => document.documentElement.lang === "de");
    await page.waitForFunction(
      (previousLabel) => {
        const node = document.querySelector(
          "[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']",
        );
        return node?.getAttribute("data-text-reveal-label") !== previousLabel;
      },
      englishLabel,
      { timeout: 5000 },
    );
    await reveal.evaluate((node) => {
      const documentTop = window.scrollY + node.getBoundingClientRect().top;
      window.scrollTo(0, Math.max(0, documentTop - window.innerHeight * 0.2));
    });
    await page.waitForFunction(
      () => {
        const node = document.querySelector(
          "[data-story-section='dubai'] [data-text-reveal-engine='scroll-linked-with-observer-fallback']",
        );
        const text = node?.querySelector(".story-title-reveal__text");
        return text && Number.parseFloat(getComputedStyle(text).opacity) >= 0.98;
      },
      undefined,
      { timeout: 2500 },
    );

    const result = await reveal.evaluate((node) => {
      const text = node.querySelector(".story-title-reveal__text");
      const style = getComputedStyle(text);
      return {
        animationName: style.animationName,
        opacity: Number.parseFloat(style.opacity),
        state: node.getAttribute("data-text-reveal-state"),
        visibility: style.visibility,
      };
    });

    check(
      result.state === (nativeScrollLinked ? "scroll-linked" : "played"),
      `${label}: translated title reset to ${result.state}`,
    );
    check(
      result.visibility === "visible" && result.opacity >= 0.98,
      `${label}: translated title became hidden at opacity ${result.opacity.toFixed(3)}`,
    );
    check(
      result.animationName === (nativeScrollLinked ? "story-title-scroll-reveal" : "none"),
      `${label}: translated title animation is ${result.animationName}`,
    );
    summaries.push(`${label}: translated title retained ${result.state} state`);
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
      await inspectTitleCase(browser, browserCase.name, viewport);
    }

    if (browserCase.name === "chromium") {
      for (const locale of ["de", "pl", "sl", "ru"]) {
        await inspectTitleCase(browser, browserCase.name, viewportCases[4], locale);
      }

      for (const viewport of viewportCases.filter(({ name }) => name === "desktop" || name === "phone")) {
        await inspectNaturalScrollTraversal(browser, viewport);
      }

      await inspectLiveLocaleUpdate(browser);
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
