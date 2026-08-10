import { chromium, devices, webkit } from "playwright";
import { installNecessaryOnlyAnalyticsConsent } from "./lib/analytics-consent.mjs";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const cases = [
  { name: "ios-switzerland", engine: webkit, profile: devices["iPhone 13"], country: "CH", expected: "41798320581" },
  { name: "android-germany", engine: chromium, profile: devices["Pixel 5"], country: "DE", expected: "436642554285" },
  { name: "android-austria", engine: chromium, profile: devices["Galaxy S9+"], country: "AT", expected: "436642554285" },
  { name: "tablet-switzerland", engine: chromium, profile: { viewport: { width: 768, height: 1024 }, hasTouch: true }, country: "CH", expected: "41798320581" },
  { name: "laptop-germany", engine: chromium, profile: { viewport: { width: 1366, height: 768 } }, country: "DE", expected: "436642554285" },
  { name: "desktop-switzerland", engine: chromium, profile: { viewport: { width: 1920, height: 1080 } }, country: "CH", expected: "41798320581" },
  { name: "unsupported-georgia", engine: chromium, profile: devices["iPhone 13"], country: "GE", expected: null },
];
const paths = ["/", "/aixco-global-op2/current-project"];
const errors = [];

for (const testCase of cases) {
  let browser;
  try {
    browser = await testCase.engine.launch({ headless: true });
  } catch (error) {
    errors.push(`${testCase.name}: browser could not launch (${error.message})`);
    continue;
  }

  try {
    const context = await browser.newContext({
      ...testCase.profile,
      extraHTTPHeaders: { "x-country-code": testCase.country },
    });
    await installNecessaryOnlyAnalyticsConsent(context);

    for (const path of paths) {
      const page = await context.newPage();
      const runtimeErrors = [];
      const chatbotRequests = [];
      page.on("console", (message) => {
        if (message.type() === "error" && !/favicon|ResizeObserver loop/i.test(message.text())) runtimeErrors.push(message.text());
      });
      page.on("pageerror", (error) => runtimeErrors.push(error.message));
      page.on("request", (request) => {
        if (/\/api\/(chatbot|lead-capture\/chat)(?:\?|$)/u.test(request.url())) chatbotRequests.push(request.url());
      });

      await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(1_000);

      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const container = document.querySelector('[data-whatsapp-floating-container="true"]');
        const link = document.querySelector('[data-market-whatsapp-link="true"]');
        const image = link?.querySelector("img");
        const rect = link?.getBoundingClientRect();
        return {
          containerPresent: Boolean(container),
          linkPresent: Boolean(link),
          href: link?.getAttribute("href") ?? null,
          target: link?.getAttribute("target") ?? null,
          rel: link?.getAttribute("rel") ?? null,
          rect: rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } : null,
          inViewport: Boolean(rect && rect.left >= -1 && rect.top >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1),
          imageLoaded: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
          overflow: root.scrollWidth - root.clientWidth,
          oldChatPresent: Boolean(document.querySelector('[data-chat-floating-container="true"], [aria-label*="live chat" i]')),
        };
      });

      if (testCase.expected) {
        if (!metrics.containerPresent || !metrics.linkPresent) errors.push(`${testCase.name}${path}: WhatsApp launcher missing`);
        if (metrics.href !== `https://wa.me/${testCase.expected}`) errors.push(`${testCase.name}${path}: wrong destination ${metrics.href}`);
        if (metrics.target !== "_blank" || !metrics.rel?.includes("noopener") || !metrics.rel?.includes("noreferrer")) {
          errors.push(`${testCase.name}${path}: unsafe external-link attributes`);
        }
        if (!metrics.rect || metrics.rect.width < 44 || metrics.rect.height < 44 || !metrics.inViewport) {
          errors.push(`${testCase.name}${path}: launcher target/placement invalid ${JSON.stringify(metrics.rect)}`);
        }
        if (!metrics.imageLoaded) errors.push(`${testCase.name}${path}: WhatsApp logo did not load`);
      } else if (metrics.containerPresent || metrics.linkPresent) {
        errors.push(`${testCase.name}${path}: unsupported market must not reserve a launcher slot`);
      }

      if (metrics.overflow > 3) errors.push(`${testCase.name}${path}: horizontal overflow ${metrics.overflow}px`);
      if (metrics.oldChatPresent || chatbotRequests.length) errors.push(`${testCase.name}${path}: obsolete live chat remains active`);
      if (runtimeErrors.length) errors.push(`${testCase.name}${path}: runtime errors ${runtimeErrors.join(" | ")}`);

      if (path === "/" && testCase.expected && (testCase.profile.viewport?.width ?? 0) < 800) {
        const menuButton = page.locator('button[aria-controls="story-mobile-menu"]');
        if (await menuButton.isVisible()) {
          await menuButton.click();
          const hidden = await page.locator('[data-whatsapp-floating-container="true"]').evaluate((node) => {
            const style = getComputedStyle(node);
            return style.visibility === "hidden" || style.opacity === "0" || style.pointerEvents === "none";
          });
          if (!hidden) errors.push(`${testCase.name}${path}: launcher overlays the open mobile menu`);
        }
      }

      await page.close();
    }
    await context.close();
  } catch (error) {
    errors.push(`${testCase.name}: ${error.message}`);
  } finally {
    await browser.close();
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`WhatsApp market QA passed: ${cases.length} device/country profiles × ${paths.length} routes.`);
