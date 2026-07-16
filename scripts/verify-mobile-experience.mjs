import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const viewports = [
  { name: "foldable", width: 280, height: 653, orientation: "portrait" },
  { name: "small-phone", width: 320, height: 568, orientation: "portrait" },
  { name: "compact-phone", width: 360, height: 640, orientation: "portrait" },
  { name: "phone", width: 390, height: 844, orientation: "portrait" },
  { name: "large-phone", width: 430, height: 932, orientation: "portrait" },
  { name: "compact-phone-landscape", width: 568, height: 320, orientation: "landscape" },
  { name: "foldable-landscape", width: 653, height: 280, orientation: "landscape" },
  { name: "large-phone-landscape", width: 844, height: 390, orientation: "landscape" },
];
const propertyViewports = [
  { name: "property-foldable", width: 280, height: 653, orientation: "portrait" },
  { name: "property-phone", width: 390, height: 844, orientation: "portrait" },
  { name: "property-compact-landscape", width: 568, height: 320, orientation: "landscape" },
  { name: "property-foldable-landscape", width: 653, height: 280, orientation: "landscape" },
  { name: "property-phone-landscape", width: 844, height: 390, orientation: "landscape" },
];
const propertyUrl = new URL("/aixco-global-op2/current-project", baseUrl).toString();
const errors = [];
const browser = await chromium.launch({ headless: true });

function observePageErrors(page) {
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const value = message.text();
    if (!/favicon|ResizeObserver loop|Failed to load resource.*ERR_ABORTED/i.test(value)) pageErrors.push(value);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  return pageErrors;
}

try {
  for (const viewport of viewports) {
    if (process.env.SMOKE_VIEWPORT && viewport.name !== process.env.SMOKE_VIEWPORT) continue;
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const consoleErrors = observePageErrors(page);

    try {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForFunction(
        () => {
          const hero = document.querySelector('[data-story-section="hero"]');
          return document.querySelectorAll("[data-story-section]").length === 17
            && (hero?.getBoundingClientRect().height ?? 0) > 0
            && document.body.innerText.trim().length >= 1_500;
        },
        undefined,
        { timeout: 30_000 },
      );
      await page.evaluate(() => document.fonts.ready);

      if (viewport.orientation === "landscape") {
        await page.waitForFunction(
          () => document.querySelector('[data-story-section="hero"]')?.getAttribute("data-story-active") === "true",
          undefined,
          { timeout: 5_000 },
        );
        const heroMetrics = await page.evaluate(() => {
          const hero = document.querySelector('[data-story-section="hero"]');
          const brand = hero?.querySelector("h1");
          const statement = hero?.querySelector(".story-hero-statement");
          const actions = hero?.querySelector(".story-hero-actions");
          const controls = actions ? [...actions.querySelectorAll("a, button")] : [];
          const heroRect = hero?.getBoundingClientRect();
          const visibleHeroBounds = heroRect
            ? {
                top: Math.max(0, heroRect.top),
                right: Math.min(document.documentElement.clientWidth, heroRect.right),
                bottom: Math.min(window.innerHeight, heroRect.bottom),
                left: Math.max(0, heroRect.left),
              }
            : null;

          const inspect = (element) => {
            if (!(element instanceof HTMLElement) || !visibleHeroBounds) {
              return { text: "", rendered: false, withinInitialHero: false };
            }
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const rendered = style.display !== "none"
              && style.visibility !== "hidden"
              && rect.width > 0
              && rect.height > 0;
            return {
              text: (element.textContent ?? "").replace(/\s+/g, " ").trim(),
              rendered,
              withinInitialHero: rendered
                && rect.top >= visibleHeroBounds.top - 3
                && rect.right <= visibleHeroBounds.right + 3
                && rect.bottom <= visibleHeroBounds.bottom + 3
                && rect.left >= visibleHeroBounds.left - 3,
              bounds: {
                top: Math.round(rect.top),
                right: Math.round(rect.right),
                bottom: Math.round(rect.bottom),
                left: Math.round(rect.left),
              },
            };
          };

          return {
            brand: inspect(brand),
            statement: inspect(statement),
            actions: inspect(actions),
            controls: controls.map(inspect),
          };
        });

        const label = `${viewport.name}/hero`;
        if (!heroMetrics.brand.text.includes("AIXCO.GLOBAL") || !heroMetrics.brand.withinInitialHero) {
          errors.push(`${label}: brand lockup is not fully visible in the initial landscape viewport`);
        }
        if (heroMetrics.statement.text.length < 24 || !heroMetrics.statement.withinInitialHero) {
          errors.push(`${label}: essential hero statement is not fully visible in the initial landscape viewport`);
        }
        if (heroMetrics.controls.length !== 3) {
          errors.push(`${label}: expected 3 hero actions, found ${heroMetrics.controls.length}`);
        }
        const missingActionLabels = ["EXPLORE OPPORTUNITIES", "REGISTER", "CONTACT ME"].filter(
          (expectedLabel) => !heroMetrics.controls.some(({ text }) => text.includes(expectedLabel)),
        );
        if (missingActionLabels.length) {
          errors.push(`${label}: missing hero actions ${missingActionLabels.join(", ")}`);
        }
        const clippedActions = heroMetrics.controls.filter(({ withinInitialHero }) => !withinInitialHero);
        if (!heroMetrics.actions.withinInitialHero || clippedActions.length) {
          errors.push(
            `${label}: hero actions are not fully visible in the initial landscape viewport `
              + JSON.stringify({ brand: heroMetrics.brand, statement: heroMetrics.statement, group: heroMetrics.actions, clipped: clippedActions }),
          );
        }
      }

      const sectionKeys = await page.locator("[data-story-section]").evaluateAll((sections) =>
        sections.map((section) => section.getAttribute("data-story-section")),
      );

      for (const sectionKey of sectionKeys) {
        const selector = `[data-story-section="${sectionKey}"]`;
        await page.locator(selector).evaluate((section) => window.scrollTo({ top: section.offsetTop, behavior: "instant" }));
        await page.waitForTimeout(180);

        const initial = await page.locator(selector).evaluate((section) => {
          const heading = section.querySelector("h1, h2");
          const reveal = heading?.querySelector("[data-text-reveal-state]");
          const headingRect = heading?.getBoundingClientRect();
          return {
            state: reveal?.getAttribute("data-text-reveal-state") ?? null,
            headingLeft: headingRect ? Math.round(headingRect.left) : null,
            headingRight: headingRect ? Math.round(headingRect.right) : null,
            headingWidth: headingRect ? Math.round(headingRect.width) : null,
            headingScrollWidth: heading instanceof HTMLElement ? heading.scrollWidth : null,
          };
        });

        await page.evaluate((amount) => window.scrollBy({ top: amount, behavior: "instant" }), Math.round(viewport.height * 0.92));
        await page.waitForTimeout(120);
        const stateAfterScroll = await page.locator(selector).evaluate((section) => {
          const heading = section.querySelector("h1, h2");
          return heading?.querySelector("[data-text-reveal-state]")?.getAttribute("data-text-reveal-state") ?? null;
        });

        const label = `${viewport.name}/${sectionKey}`;
        if (initial.headingLeft !== null && initial.headingLeft < -3) errors.push(`${label}: heading starts outside viewport (${initial.headingLeft}px)`);
        if (initial.headingRight !== null && initial.headingRight > viewport.width + 3) errors.push(`${label}: heading ends outside viewport (${initial.headingRight}px)`);
        if (initial.headingWidth !== null && initial.headingScrollWidth !== null && initial.headingScrollWidth - initial.headingWidth > 3) {
          errors.push(`${label}: heading overflows by ${initial.headingScrollWidth - initial.headingWidth}px`);
        }
        if (initial.state === "animating" && stateAfterScroll === "idle") {
          errors.push(`${label}: title reveal reset to idle while scrolling`);
        }
      }

      const pageMetrics = await page.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        headerHeight: Math.round(document.querySelector(".story-mobile-header")?.getBoundingClientRect().height ?? 0),
        tapTargets: [...document.querySelectorAll(".story-mobile-header button")].map((button) => {
          const rect = button.getBoundingClientRect();
          return { width: Math.round(rect.width), height: Math.round(rect.height) };
        }),
      }));

      if (pageMetrics.horizontalOverflow > 4) errors.push(`${viewport.name}: horizontal overflow ${pageMetrics.horizontalOverflow}px`);
      if (pageMetrics.headerHeight < 64) errors.push(`${viewport.name}: mobile header is only ${pageMetrics.headerHeight}px tall`);
      if (pageMetrics.tapTargets.some((target) => target.width < 44 || target.height < 44)) {
        errors.push(`${viewport.name}: mobile header has tap targets below 44px`);
      }

      if (viewport.orientation === "landscape") {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.locator('.story-mobile-header button[aria-label$="Change language"]').click();
        const languageList = page.locator('.story-mobile-header ul[aria-label="Change language"]');
        await languageList.waitFor({ state: "visible" });
        const languageMetrics = await languageList.evaluate((listbox) => {
          const root = document.documentElement;
          const rect = listbox.getBoundingClientRect();
          const style = getComputedStyle(listbox);
          return {
            withinViewport: rect.top >= -3
              && rect.right <= root.clientWidth + 3
              && rect.bottom <= window.innerHeight + 3
              && rect.left >= -3,
            needsScroll: listbox.scrollHeight > listbox.clientHeight + 2,
            canScroll: style.overflowY === "auto" || style.overflowY === "scroll",
          };
        });

        if (!languageMetrics.withinViewport) errors.push(`${viewport.name}/language: list is outside the viewport`);
        if (languageMetrics.needsScroll && !languageMetrics.canScroll) {
          errors.push(`${viewport.name}/language: clipped options cannot scroll`);
        }
        await page.keyboard.press("Escape");
        await languageList.waitFor({ state: "detached" });
      }

      if (viewport.name === "phone") {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.waitForTimeout(220);

        await page.locator('.story-mobile-header button[aria-controls="story-mobile-menu"]').click();
        await page.waitForSelector('[role="dialog"][aria-modal="true"] #story-mobile-menu', { state: "visible" });
        const menuMetrics = await page.evaluate(() => {
          const root = document.documentElement;
          const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
          const drawer = document.querySelector("#story-mobile-menu");
          const rect = drawer?.getBoundingClientRect();
          const targets = dialog
            ? [...dialog.querySelectorAll("a, button")].map((target) => {
                const targetRect = target.getBoundingClientRect();
                return { width: Math.round(targetRect.width), height: Math.round(targetRect.height) };
              })
            : [];
          return {
            rootOverflow: getComputedStyle(root).overflow,
            bodyOverflow: getComputedStyle(document.body).overflow,
            withinViewport: Boolean(
              rect
                && rect.top >= -3
                && rect.right <= root.clientWidth + 3
                && rect.bottom <= window.innerHeight + 3
                && rect.left >= -3
            ),
            horizontalOverflow: root.scrollWidth - root.clientWidth,
            targets,
          };
        });

        if (menuMetrics.rootOverflow !== "hidden" || menuMetrics.bodyOverflow !== "hidden") {
          errors.push("phone/menu: page scroll is not locked while the drawer is open");
        }
        if (!menuMetrics.withinViewport || menuMetrics.horizontalOverflow > 4) {
          errors.push("phone/menu: drawer is not fully contained by the viewport");
        }
        if (menuMetrics.targets.some((target) => target.width < 44 || target.height < 44)) {
          errors.push("phone/menu: drawer has tap targets below 44px");
        }

        await page.locator('[role="dialog"][aria-modal="true"] > button').click();
        await page.waitForFunction(
          () => document.querySelector('[data-story-section="hero"]')?.getAttribute("data-story-active") === "true",
          undefined,
          { timeout: 5_000 },
        );
        await page.getByRole("button", { name: "REGISTER", exact: true }).click();
        const modal = page.getByRole("dialog", { name: "Register with AIXCO" });
        await modal.waitFor({ state: "visible" });
        const modalMetrics = await modal.evaluate((dialog) => {
          const root = document.documentElement;
          const rect = dialog.getBoundingClientRect();
          const close = dialog.querySelector('button[aria-label="Close"]');
          const closeRect = close?.getBoundingClientRect();
          return {
            rootOverflow: getComputedStyle(root).overflow,
            bodyOverflow: getComputedStyle(document.body).overflow,
            withinViewport: rect.top >= -3
              && rect.right <= root.clientWidth + 3
              && rect.bottom <= window.innerHeight + 3
              && rect.left >= -3,
            closeTarget: closeRect
              ? { width: Math.round(closeRect.width), height: Math.round(closeRect.height) }
              : null,
          };
        });

        if (modalMetrics.rootOverflow !== "hidden" || modalMetrics.bodyOverflow !== "hidden") {
          errors.push("phone/register-modal: page scroll is not locked while the modal is open");
        }
        if (!modalMetrics.withinViewport) errors.push("phone/register-modal: dialog is not fully contained by the viewport");
        if (!modalMetrics.closeTarget || modalMetrics.closeTarget.width < 44 || modalMetrics.closeTarget.height < 44) {
          errors.push("phone/register-modal: close control is below 44px");
        }

        await page.keyboard.press("Escape");
        await modal.waitFor({ state: "detached" });
        await page.getByRole("button", { name: /Open live chat/i }).click();
        const chat = page.getByRole("dialog", { name: /AIXCO live chat/i });
        await chat.waitFor({ state: "visible" });
        await page.waitForTimeout(400);
        const chatMetrics = await chat.evaluate((dialog) => {
          const root = document.documentElement;
          const rect = dialog.getBoundingClientRect();
          const targets = [...dialog.querySelectorAll("a, button")]
            .filter((target) => {
              const style = getComputedStyle(target);
              const targetRect = target.getBoundingClientRect();
              return style.display !== "none" && style.visibility !== "hidden" && targetRect.width > 0 && targetRect.height > 0;
            })
            .map((target) => {
              const targetRect = target.getBoundingClientRect();
              return {
                name: target.getAttribute("aria-label") || (target.textContent ?? "").replace(/\s+/g, " ").trim(),
                width: Math.round(targetRect.width),
                height: Math.round(targetRect.height),
              };
            });
          return {
            withinViewport: rect.top >= -3
              && rect.right <= root.clientWidth + 3
              && rect.bottom <= window.innerHeight + 3
              && rect.left >= -3,
            horizontalOverflow: root.scrollWidth - root.clientWidth,
            targets,
          };
        });

        if (!chatMetrics.withinViewport || chatMetrics.horizontalOverflow > 4) {
          errors.push("phone/chat: panel is not fully contained by the viewport");
        }
        const undersizedChatTargets = chatMetrics.targets.filter((target) => target.width < 44 || target.height < 44);
        if (undersizedChatTargets.length) {
          errors.push(`phone/chat: panel has tap targets below 44px ${JSON.stringify(undersizedChatTargets)}`);
        }
        await page.getByRole("button", { name: /Close live chat/i }).click();

        await page.locator('.story-mobile-header button[aria-label$="Change language"]').click();
        await page.locator('.story-mobile-header ul[aria-label="Change language"] [data-lang="ar"]').click();
        await page.waitForFunction(() => document.documentElement.dir === "rtl", undefined, { timeout: 5_000 });
        const rtlMetrics = await page.evaluate(() => {
          const root = document.documentElement;
          const floating = document.querySelector('[data-chat-floating-container="true"]');
          const rect = floating?.getBoundingClientRect();
          return {
            direction: root.dir,
            floatingAtInlineEnd: Boolean(rect && rect.left <= 32 && rect.right < root.clientWidth - 40),
            horizontalOverflow: root.scrollWidth - root.clientWidth,
          };
        });

        if (rtlMetrics.direction !== "rtl" || !rtlMetrics.floatingAtInlineEnd) {
          errors.push("phone/rtl: chat launcher is not anchored to the logical inline end");
        }
        if (rtlMetrics.horizontalOverflow > 4) errors.push("phone/rtl: horizontal overflow after switching to Arabic");
      }

      if (consoleErrors.length) errors.push(`${viewport.name}: console errors ${consoleErrors.join(" | ")}`);
    } catch (error) {
      errors.push(`${viewport.name}: ${error.message}`);
    } finally {
      await context.close();
    }
  }

  for (const viewport of propertyViewports) {
    if (process.env.SMOKE_VIEWPORT && viewport.name !== process.env.SMOKE_VIEWPORT) continue;
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleErrors = observePageErrors(page);

    try {
      await page.goto(propertyUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForSelector("main > section:first-of-type h1", { state: "visible", timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => {
        const image = document.querySelector("main > section:first-of-type aside img");
        return image instanceof HTMLImageElement && image.complete;
      }, undefined, { timeout: 30_000 });

      const initialMetrics = await page.evaluate(() => {
        const root = document.documentElement;
        const hero = document.querySelector("main > section:first-of-type");
        const media = hero?.querySelector("aside");
        const image = media?.querySelector("img");
        const title = hero?.querySelector("h1");
        const mediaRect = media?.getBoundingClientRect();
        const titleRect = title?.getBoundingClientRect();
        const mediaStyle = media ? getComputedStyle(media) : null;
        const titleStyle = title ? getComputedStyle(title) : null;
        const metricLabels = [...(hero?.querySelectorAll(".property-detail-metric p:first-child") ?? [])].map((label) => ({
          text: (label.textContent ?? "").replace(/\s+/g, " ").trim(),
          overflow: label instanceof HTMLElement ? Math.round(label.scrollWidth - label.clientWidth) : 0,
        }));
        return {
          horizontalOverflow: root.scrollWidth - root.clientWidth,
          heroPresent: Boolean(hero),
          heroMediaVisible: Boolean(
            mediaRect
              && mediaStyle?.display !== "none"
              && mediaStyle?.visibility !== "hidden"
              && mediaRect.width > 0
              && mediaRect.height > 0
              && mediaRect.bottom > 0
              && mediaRect.top < window.innerHeight
              && mediaRect.right > 0
              && mediaRect.left < root.clientWidth
          ),
          heroImageLoaded: image instanceof HTMLImageElement && image.naturalWidth > 0,
          heroTitleVisible: Boolean(
            titleRect
              && titleStyle?.display !== "none"
              && titleStyle?.visibility !== "hidden"
              && titleRect.width > 0
              && titleRect.height > 0
              && titleRect.bottom > 0
              && titleRect.top < window.innerHeight
              && titleRect.right > 0
              && titleRect.left < root.clientWidth
          ),
          metricLabels,
        };
      });

      const title = page.locator("main > section:first-of-type h1");
      await title.evaluate((element) => element.scrollIntoView({ behavior: "instant", block: "center", inline: "nearest" }));
      await page.waitForTimeout(100);
      const titleMetrics = await title.evaluate((element) => {
        const root = document.documentElement;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          text: (element.textContent ?? "").replace(/\s+/g, " ").trim(),
          horizontalOverflow: root.scrollWidth - root.clientWidth,
          ownOverflow: element.scrollWidth - element.clientWidth,
          fullyVisible: style.display !== "none"
            && style.visibility !== "hidden"
            && rect.width > 0
            && rect.height > 0
            && rect.top >= -3
            && rect.right <= root.clientWidth + 3
            && rect.bottom <= window.innerHeight + 3
            && rect.left >= -3,
        };
      });

      const label = viewport.name;
      if (!initialMetrics.heroPresent) errors.push(`${label}: property hero is missing`);
      if (!initialMetrics.heroMediaVisible) errors.push(`${label}: property hero media is not visible in the initial viewport`);
      if (!initialMetrics.heroTitleVisible) errors.push(`${label}: property title is not visible alongside the media in the initial viewport`);
      if (!initialMetrics.heroImageLoaded) errors.push(`${label}: property hero image did not load`);
      const overflowingMetricLabels = initialMetrics.metricLabels.filter(({ overflow }) => overflow > 3);
      if (overflowingMetricLabels.length) {
        errors.push(`${label}: property metric labels overflow ${JSON.stringify(overflowingMetricLabels)}`);
      }
      if (initialMetrics.horizontalOverflow > 4 || titleMetrics.horizontalOverflow > 4) {
        errors.push(`${label}: property page has horizontal overflow`);
      }
      if (titleMetrics.text.length < 8 || !/[\p{L}\p{N}]/u.test(titleMetrics.text)) {
        errors.push(`${label}: property title is missing meaningful text`);
      }
      if (!titleMetrics.fullyVisible) errors.push(`${label}: property title is not fully visible when scrolled into view`);
      if (titleMetrics.ownOverflow > 3) errors.push(`${label}: property title overflows by ${titleMetrics.ownOverflow}px`);

      if (viewport.orientation === "portrait") {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        const menuButton = page.locator('button[aria-controls="property-mobile-menu"]');
        await menuButton.click();
        const propertyMenu = page.locator('#property-mobile-menu[role="dialog"]');
        await propertyMenu.waitFor({ state: "visible" });
        const propertyMenuMetrics = await propertyMenu.evaluate((drawer) => {
          const root = document.documentElement;
          const rect = drawer.getBoundingClientRect();
          const chat = document.querySelector('[data-chat-floating-container="true"]');
          const chatStyle = chat ? getComputedStyle(chat) : null;
          return {
            rootOverflow: getComputedStyle(root).overflow,
            bodyOverflow: getComputedStyle(document.body).overflow,
            withinViewport: rect.top >= -3
              && rect.right <= root.clientWidth + 3
              && rect.bottom <= window.innerHeight + 3
              && rect.left >= -3,
            chatHidden: !chat || chatStyle?.visibility === "hidden" || chatStyle?.display === "none",
          };
        });

        if (propertyMenuMetrics.rootOverflow !== "hidden" || propertyMenuMetrics.bodyOverflow !== "hidden") {
          errors.push(`${label}/menu: page scroll is not locked`);
        }
        if (!propertyMenuMetrics.withinViewport) errors.push(`${label}/menu: drawer is outside the viewport`);
        if (!propertyMenuMetrics.chatHidden) errors.push(`${label}/menu: chat remains above the property drawer`);
        await propertyMenu.getByRole("button", { name: /Close menu/i }).click();
        await propertyMenu.waitFor({ state: "detached" });
      }

      if (viewport.orientation === "landscape") {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.locator('button[aria-controls="property-mobile-language-list"]').click();
        const propertyLanguages = page.locator("#property-mobile-language-list");
        await propertyLanguages.waitFor({ state: "visible" });
        const propertyLanguageMetrics = await propertyLanguages.evaluate((listbox) => {
          const root = document.documentElement;
          const rect = listbox.getBoundingClientRect();
          const style = getComputedStyle(listbox);
          return {
            withinViewport: rect.top >= -3
              && rect.right <= root.clientWidth + 3
              && rect.bottom <= window.innerHeight + 3
              && rect.left >= -3,
            needsScroll: listbox.scrollHeight > listbox.clientHeight + 2,
            canScroll: style.overflowY === "auto" || style.overflowY === "scroll",
          };
        });

        if (!propertyLanguageMetrics.withinViewport) errors.push(`${label}/language: list is outside the viewport`);
        if (propertyLanguageMetrics.needsScroll && !propertyLanguageMetrics.canScroll) {
          errors.push(`${label}/language: clipped options cannot scroll`);
        }
        await page.keyboard.press("Escape");
        await propertyLanguages.waitFor({ state: "detached" });
      }

      if (consoleErrors.length) errors.push(`${label}: console errors ${consoleErrors.join(" | ")}`);
    } catch (error) {
      errors.push(`${viewport.name}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Mobile experience smoke passed at ${viewports.map(({ width, height }) => `${width}x${height}`).join(", ")}.`);
console.log(`Property mobile smoke passed at ${propertyViewports.map(({ width, height }) => `${width}x${height}`).join(", ")}.`);
