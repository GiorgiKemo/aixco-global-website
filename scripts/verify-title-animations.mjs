import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const outputDir = "output/playwright/title-animation";
const revealSelector =
  "[data-story-section='dubai'] [data-text-reveal-engine='shared-observer-letter-sequence']";
const allRevealSelector =
  "[data-text-reveal-engine='shared-observer-letter-sequence']";
const requestedBrowser = process.env.SMOKE_BROWSER;
const requestedViewport = process.env.SMOKE_VIEWPORT;
const failures = [];
const summaries = [];

const viewportCases = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "laptop", width: 1366, height: 768, mobile: false },
  { name: "small-laptop", width: 1024, height: 768, mobile: false },
  { name: "ipad-landscape", width: 1180, height: 820, mobile: true },
  { name: "ipad-portrait", width: 820, height: 1180, mobile: true },
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "phone", width: 390, height: 844, mobile: true },
  { name: "small-phone", width: 360, height: 800, mobile: true },
  { name: "phone-landscape", width: 844, height: 390, mobile: true },
];

const browserCases = [
  { name: "chromium", launcher: chromium, viewports: viewportCases },
  {
    name: "webkit",
    launcher: webkit,
    viewports: viewportCases.filter(({ name }) =>
      ["desktop", "ipad-landscape", "ipad-portrait", "phone", "phone-landscape"].includes(name),
    ),
  },
];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function contextOptions(viewport, reducedMotion = "no-preference") {
  return {
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion,
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
    deviceScaleFactor: viewport.mobile ? 2 : 1,
  };
}

async function waitForStoryReady(page) {
  await page.waitForSelector(revealSelector, { state: "attached" });
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await page
    .waitForFunction(
      () => document.documentElement.dataset.siteIntro === "complete",
      undefined,
      { timeout: 12000 },
    )
    .catch(() => undefined);
  await page.evaluate(async () => {
    const readyImages = [...document.images].filter((image) => image.currentSrc && image.complete);
    await Promise.all(readyImages.map((image) => image.decode().catch(() => undefined)));
  });
  await page.waitForTimeout(450);
}

async function placeRevealAt(page, reveal, desiredTop) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await reveal.evaluate((node, viewportTop) => {
      const currentTop = node.getBoundingClientRect().top;
      window.scrollTo(0, Math.max(0, window.scrollY + currentTop - viewportTop));
    }, desiredTop);
    await page.waitForTimeout(100);

    const actualTop = await reveal.evaluate((node) => node.getBoundingClientRect().top);
    if (Math.abs(actualTop - desiredTop) <= 4) return;
  }

  const actualTop = await reveal.evaluate((node) => node.getBoundingClientRect().top);
  throw new Error(
    `could not position the title at ${desiredTop.toFixed(1)}px; settled at ${actualTop.toFixed(1)}px`,
  );
}

async function scrollRevealIntoZone(page, reveal, desiredTop) {
  return reveal.evaluate(async (node, targetTop) => {
    const scene = node.closest(".story-scene-reveal");
    if (!(scene instanceof HTMLElement)) {
      throw new Error("title is missing its story scene wrapper");
    }

    const samples = [];
    let activeFrameCount = 0;
    for (let frame = 0; frame < 180; frame += 1) {
      const currentTop = node.getBoundingClientRect().top;
      if (currentTop > targetTop + 1) {
        window.scrollBy(0, Math.min(10, currentTop - targetTop));
      }
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      const rect = node.getBoundingClientRect();
      const sceneStyle = getComputedStyle(scene);
      const sceneMatrix =
        sceneStyle.transform === "none"
          ? new DOMMatrixReadOnly()
          : new DOMMatrixReadOnly(sceneStyle.transform);
      samples.push({
        documentTop: rect.top + window.scrollY,
        sceneTranslateY: sceneMatrix.m42,
        state: node.getAttribute("data-text-reveal-state"),
      });

      if (node.getAttribute("data-text-reveal-state") === "animating") {
        activeFrameCount += 1;
        if (activeFrameCount >= 6) break;
      }
    }

    const animatedSamples = samples.filter(({ state }) => state === "animating");
    const documentTops = animatedSamples.map(({ documentTop }) => documentTop);
    return {
      animatedDocumentTopShift: documentTops.length
        ? Math.max(...documentTops) - Math.min(...documentTops)
        : 0,
      animatedFrameCount: animatedSamples.length,
      finalTop: node.getBoundingClientRect().top,
      frameCount: samples.length,
      maxSceneTranslateYDuringTitle: animatedSamples.length
        ? Math.max(...animatedSamples.map(({ sceneTranslateY }) => Math.abs(sceneTranslateY)))
        : 0,
    };
  }, desiredTop);
}

async function inspectTitleCase(browser, browserName, viewport, locale = "en") {
  const context = await browser.newContext(contextOptions(viewport));
  await context.route("**/*", async (route) => {
    const request = route.request();
    if (
      request.resourceType() === "media" ||
      /\.(?:mp4|webm)(?:\?|$)/iu.test(request.url())
    ) {
      await route.fulfill({ status: 204, contentType: "video/mp4", body: "" });
      return;
    }
    await route.continue();
  });
  await context.addInitScript((nextLocale) => {
    try {
      localStorage.setItem("aixco-lang", nextLocale);
      localStorage.setItem(
        "aixco-analytics-consent-v1",
        JSON.stringify({
          status: "denied",
          version: "2026-08-13-google-analytics-policy-refresh",
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // The script also executes once in the initial opaque document.
    }
  }, locale);
  await context.addInitScript(() => {
    window.__aixcoTitleEvents = [];
    window.__aixcoTitleFrames = [];
    window.__aixcoTitleFrameSampling = false;
    window.__aixcoTitleArmed = false;

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

    document.addEventListener(
      "animationstart",
      (event) => {
        if (!window.__aixcoTitleArmed || event.animationName !== "story-title-letter-reveal") return;
        window.__aixcoTitleEvents.push({
          phase: "start",
          section:
            event.target.closest("[data-story-section]")?.getAttribute("data-story-section") ??
            "unknown",
        });
        sampleFrames();
      },
      true,
    );

    document.addEventListener(
      "animationend",
      (event) => {
        if (!window.__aixcoTitleArmed || event.animationName !== "story-title-letter-reveal") return;
        window.__aixcoTitleEvents.push({
          elapsedTime: event.elapsedTime,
          phase: "end",
          section:
            event.target.closest("[data-story-section]")?.getAttribute("data-story-section") ??
            "unknown",
        });
      },
      true,
    );
  });

  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") pageErrors.push(message.text());
  });
  const label = `${browserName}/${viewport.name}/${locale}`;
  const captureScreenshots =
    locale === "en" &&
    ["desktop", "ipad-landscape", "ipad-portrait", "phone", "phone-landscape"].includes(
      viewport.name,
    );
  let phase = "navigation";

  try {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    phase = "story readiness";
    await waitForStoryReady(page);

    phase = "structure";
    const structural = await page.evaluate((selector) => {
      const reveals = [...document.querySelectorAll(selector)];
      const expectedLetterCount = (labelText) =>
        Array.from(labelText.normalize("NFC")).filter(
          (value) => value !== "\u200B" && !/^\s$/u.test(value),
        ).length;

      return {
        revealCount: reveals.length,
        invalidVisualLayerCount: reveals.filter(
          (reveal) =>
            reveal.querySelectorAll(":scope > .story-title-reveal__text").length !== 1,
        ).length,
        invalidLetterCount: reveals.filter((reveal) => {
          const labelText = reveal.getAttribute("data-text-reveal-label") ?? "";
          return (
            reveal.querySelectorAll(".story-title-reveal__letter").length !==
            expectedLetterCount(labelText)
          );
        }).length,
        legacyCharacterCount: document.querySelectorAll(".story-letter-reveal__char").length,
        duplicatePlainLayerCount: document.querySelectorAll(
          ".story-text-reveal__mobile-plain, .story-text-reveal__tiny-plain",
        ).length,
      };
    }, allRevealSelector);

    check(structural.revealCount >= 15, `${label}: expected all shared titles, found ${structural.revealCount}`);
    check(structural.invalidVisualLayerCount === 0, `${label}: a title has duplicate visual layers`);
    check(structural.invalidLetterCount === 0, `${label}: a title has missing or duplicate letters`);
    check(structural.legacyCharacterCount === 0, `${label}: legacy letter nodes are still rendered`);
    check(structural.duplicatePlainLayerCount === 0, `${label}: duplicate plain title layers remain`);

    const reveal = page.locator(revealSelector);
    await page
      .waitForFunction(
        (selector) =>
          document.querySelector(selector)?.getAttribute("data-text-reveal-state") === "played",
        revealSelector,
        { timeout: 6000 },
      )
      .catch(() => undefined);

    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
    });
    phase = "leaving the reveal zone";
    await placeRevealAt(page, reveal, viewport.height + 40);
    await page.waitForTimeout(350);
    await page.evaluate(() => {
      window.__aixcoTitleEvents = [];
      window.__aixcoTitleFrames = [];
      window.__aixcoTitleFrameSampling = false;
      window.__aixcoTitleArmed = true;
    });

    phase = "entering the reveal zone";
    const slowScrollTrace = await scrollRevealIntoZone(
      page,
      reveal,
      viewport.height * 0.52,
    );
    check(
      slowScrollTrace.animatedFrameCount > 0,
      `${label}: slow scroll did not sample the active letter reveal`,
    );
    check(
      slowScrollTrace.animatedDocumentTopShift <= 0.5,
      `${label}: title shifted ${slowScrollTrace.animatedDocumentTopShift.toFixed(2)}px in document space while scrolling`,
    );
    check(
      slowScrollTrace.maxSceneTranslateYDuringTitle <= 0.5,
      `${label}: scene moved ${slowScrollTrace.maxSceneTranslateYDuringTitle.toFixed(2)}px while its title was revealing`,
    );
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector)?.getAttribute("data-text-reveal-state") === "animating",
      revealSelector,
      { polling: 10, timeout: 5000 },
    );
    await page.waitForTimeout(40);

    phase = "active sequence sampling";
    const active = await reveal.evaluate((node) => {
      const text = node.querySelector(".story-title-reveal__text");
      const letters = [...node.querySelectorAll(".story-title-reveal__letter")];
      const readLetter = (letter) => {
        const glyph = letter.querySelector(".story-title-reveal__glyph");
        const style = getComputedStyle(glyph);
        const animation = glyph.getAnimations().find(
          (candidate) => candidate.animationName === "story-title-letter-reveal",
        );
        return {
          animationDelay: Number.parseFloat(style.animationDelay) || 0,
          animationDuration: Number.parseFloat(style.animationDuration) || 0,
          filter: style.filter,
          opacity: Number.parseFloat(style.opacity),
          progress: animation?.effect?.getComputedTiming().progress ?? 0,
          visibility: style.visibility,
        };
      };
      const sampledLetters = letters.slice(0, Math.min(10, letters.length)).map(readLetter);
      const textRect = text.getBoundingClientRect();
      const firstLetterRect = letters[0].getBoundingClientRect();
      return {
        first: readLetter(letters[0]),
        last: readLetter(letters.at(-1)),
        layout: {
          firstLetterHeight: firstLetterRect.height,
          firstLetterTopOffset: firstLetterRect.top - textRect.top,
          textHeight: textRect.height,
          textWidth: textRect.width,
        },
        letterCount: letters.length,
        sampledLetters,
      };
    });

    check(active.letterCount > 10, `${label}: representative title has only ${active.letterCount} letters`);
    check(
      active.sampledLetters.every((letter) => letter.opacity === 1),
      `${label}: opacity changed during the reveal`,
    );
    check(
      active.sampledLetters.every((letter) => letter.filter === "none"),
      `${label}: a blur/filter is active during the reveal`,
    );
    check(
      active.sampledLetters.every((letter) => letter.visibility === "visible"),
      `${label}: an active letter is visibility-hidden`,
    );
    check(
      active.sampledLetters.every(
        (letter, index, letters) =>
          index === 0 || letter.animationDelay >= letters[index - 1].animationDelay,
      ),
      `${label}: letter delays do not increase left to right`,
    );
    check(
      active.last.animationDelay > active.first.animationDelay,
      `${label}: first and last letters do not have an ordered delay`,
    );
    if (browserName === "chromium") {
      check(
        active.first.progress > active.last.progress + 0.04,
        `${label}: letters are not visibly progressing left to right (${active.first.progress.toFixed(2)} vs ${active.last.progress.toFixed(2)})`,
      );
    }
    check(
      active.sampledLetters.every(
        (letter) => letter.animationDuration >= 0.5 && letter.animationDuration <= 0.54,
      ),
      `${label}: letter duration escaped the 500-540ms budget`,
    );
    phase = "settled sequence";
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector)?.getAttribute("data-text-reveal-state") === "played",
      revealSelector,
      { timeout: 5000 },
    );
    await page.waitForTimeout(650);

    const settled = await reveal.evaluate((node) => {
      const text = node.querySelector(".story-title-reveal__text");
      const letters = [...node.querySelectorAll(".story-title-reveal__letter")];
      const rect = text.getBoundingClientRect();
      const offscreenLetterCount = letters.filter((letter) => {
        const letterRect = letter.getBoundingClientRect();
        return letterRect.left < -1 || letterRect.right > window.innerWidth + 1;
      }).length;
      const invalidLetterCount = letters.filter((letter) => {
        const glyph = letter.querySelector(".story-title-reveal__glyph");
        const style = getComputedStyle(glyph);
        return (
          style.animationName !== "none" ||
          style.opacity !== "1" ||
          style.visibility !== "visible" ||
          !["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(style.transform)
        );
      }).length;
      return {
        activeAnimationCount: letters.reduce(
          (count, letter) =>
            count + letter.querySelector(".story-title-reveal__glyph").getAnimations().length,
          0,
        ),
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        invalidLetterCount,
        layout: {
          firstLetterHeight: letters[0].getBoundingClientRect().height,
          firstLetterTopOffset:
            letters[0].getBoundingClientRect().top - text.getBoundingClientRect().top,
          textHeight: text.getBoundingClientRect().height,
          textWidth: text.getBoundingClientRect().width,
        },
        offscreenLetterCount,
        rect: { height: rect.height, left: rect.left, right: rect.right },
        viewportWidth: window.innerWidth,
      };
    });

    check(settled.activeAnimationCount === 0, `${label}: settled title still has animation work`);
    check(settled.invalidLetterCount === 0, `${label}: settled letters are not in their final state`);
    check(
      Math.abs(settled.layout.textHeight - active.layout.textHeight) <= 0.5 &&
        Math.abs(settled.layout.textWidth - active.layout.textWidth) <= 0.5 &&
        Math.abs(settled.layout.firstLetterHeight - active.layout.firstLetterHeight) <= 0.5 &&
        Math.abs(settled.layout.firstLetterTopOffset - active.layout.firstLetterTopOffset) <= 0.5,
      `${label}: title geometry twitched from ${JSON.stringify(active.layout)} to ${JSON.stringify(settled.layout)}`,
    );
    check(settled.offscreenLetterCount === 0, `${label}: ${settled.offscreenLetterCount} letters escape the viewport`);
    check(settled.rect.height > 0, `${label}: title has no rendered height`);
    check(
      settled.rect.left >= -1 && settled.rect.right <= settled.viewportWidth + 1,
      `${label}: title container escapes the viewport`,
    );
    check(settled.horizontalOverflow <= 1, `${label}: horizontal overflow is ${settled.horizontalOverflow}px`);

    const eventSummary = await page.evaluate(() => {
      const events = (window.__aixcoTitleEvents ?? []).filter(
        (event) => event.section === "dubai",
      );
      const elapsedTimes = events
        .filter((event) => event.phase === "end")
        .map((event) => event.elapsedTime);
      return {
        endCount: elapsedTimes.length,
        maxElapsedTime: elapsedTimes.length ? Math.max(...elapsedTimes) : 0,
        minElapsedTime: elapsedTimes.length ? Math.min(...elapsedTimes) : 0,
        startCount: events.filter((event) => event.phase === "start").length,
      };
    });
    if (browserName === "chromium") {
      check(
        eventSummary.startCount === active.letterCount,
        `${label}: expected ${active.letterCount} starts, found ${eventSummary.startCount}`,
      );
      check(
        eventSummary.endCount === active.letterCount,
        `${label}: expected ${active.letterCount} ends, found ${eventSummary.endCount}`,
      );
      check(
        eventSummary.minElapsedTime >= 0.5 && eventSummary.maxElapsedTime <= 0.54,
        `${label}: browser reported ${eventSummary.minElapsedTime.toFixed(3)}-${eventSummary.maxElapsedTime.toFixed(3)}s letter durations`,
      );
    }

    phase = "one-shot replay guard";
    await page.evaluate(() => {
      window.__aixcoTitleEvents = [];
    });
    await placeRevealAt(page, reveal, viewport.height + 40);
    await page.waitForTimeout(180);
    await placeRevealAt(page, reveal, viewport.height * 0.52);
    await page.waitForTimeout(450);
    const replay = await page.evaluate((selector) => {
      const node = document.querySelector(selector);
      const events = (window.__aixcoTitleEvents ?? []).filter(
        (event) => event.section === "dubai" && event.phase === "start",
      );
      return {
        startCount: events.length,
        state: node?.getAttribute("data-text-reveal-state"),
      };
    }, revealSelector);
    check(replay.state === "played", `${label}: settled title did not remain played after re-entry`);
    check(replay.startCount === 0, `${label}: settled title replayed ${replay.startCount} letter animations`);

    const frameStats = await page.evaluate(() => {
      const frames = window.__aixcoTitleFrames ?? [];
      const sorted = [...frames].sort((a, b) => a - b);
      return {
        count: frames.length,
        max: sorted.at(-1) ?? 0,
        p95: sorted.length
          ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))]
          : 0,
      };
    });
    if (browserName === "chromium") {
      check(frameStats.count >= 35, `${label}: only ${frameStats.count} animation-frame samples`);
      check(frameStats.p95 < 70, `${label}: p95 frame gap is ${frameStats.p95.toFixed(1)}ms`);
      check(frameStats.max < 180, `${label}: maximum frame gap is ${frameStats.max.toFixed(1)}ms`);
    }
    check(pageErrors.length === 0, `${label}: console/page errors: ${pageErrors.join(" | ")}`);

    if (captureScreenshots) {
      await page.screenshot({ path: `${outputDir}/${browserName}-${viewport.name}.png` });
    }

    summaries.push(
      browserName === "chromium"
        ? `${label}: ${active.letterCount} letters, p95 ${frameStats.p95.toFixed(1)}ms, no overflow`
        : `${label}: ${active.letterCount} ordered letters, no overflow`,
    );
  } catch (error) {
    failures.push(`${label} (${phase}): ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
  }
}

async function inspectReducedMotion(browser, browserName, viewport) {
  const context = await browser.newContext(contextOptions(viewport, "reduce"));
  const page = await context.newPage();
  const label = `${browserName}/${viewport.name}/reduced-motion`;

  try {
    await page.goto(`${baseUrl}/#dubai`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(revealSelector, { state: "attached" });
    await page.waitForTimeout(120);
    const result = await page.locator(revealSelector).evaluate((node) => {
      const letters = [...node.querySelectorAll(".story-title-reveal__letter")];
      return {
        activeAnimationCount: letters.reduce(
          (count, letter) =>
            count + letter.querySelector(".story-title-reveal__glyph").getAnimations().length,
          0,
        ),
        invalidLetterCount: letters.filter((letter) => {
          const style = getComputedStyle(letter.querySelector(".story-title-reveal__glyph"));
          return (
            style.animationName !== "none" ||
            style.opacity !== "1" ||
            style.visibility !== "visible" ||
            style.transform !== "none"
          );
        }).length,
      };
    });
    check(result.activeAnimationCount === 0, `${label}: active animation work remains`);
    check(result.invalidLetterCount === 0, `${label}: some letters are not immediately visible`);
    summaries.push(`${label}: immediate static text`);
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });

for (const browserCase of browserCases.filter(
  ({ name }) => !requestedBrowser || name === requestedBrowser,
)) {
  const browser = await browserCase.launcher.launch({ headless: true });
  try {
    for (const viewport of browserCase.viewports.filter(
      ({ name }) => !requestedViewport || name === requestedViewport,
    )) {
      await inspectTitleCase(browser, browserCase.name, viewport);
    }

    if (browserCase.name === "chromium" && !requestedViewport) {
      const phone = viewportCases.find(({ name }) => name === "phone");
      for (const locale of ["de", "pl", "sl", "ru"]) {
        await inspectTitleCase(browser, browserCase.name, phone, locale);
      }
    }

    const reducedMotionViewports = requestedViewport ? [] : [
      viewportCases.find(({ name }) => name === "phone"),
      viewportCases.find(({ name }) => name === "ipad-portrait"),
    ];
    for (const viewport of reducedMotionViewports) {
      await inspectReducedMotion(browser, browserCase.name, viewport);
    }
  } finally {
    await browser.close();
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Letter reveal passed ${summaries.length} browser/viewport/locale cases.`);
  console.log(summaries.join("\n"));
}
