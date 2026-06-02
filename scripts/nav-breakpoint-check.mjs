import { chromium } from "playwright";

const BASE = (process.env.NAV_CHECK_URL || "http://127.0.0.1:8081").replace(/\/$/, "");
const WIDTHS = [1280, 1366, 1440, 1536, 1920];

async function evaluateNav(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
    };

    const storyMode = !!document.querySelector('[data-home-experience-mode="story"]');
    const primary = document.querySelector('nav[aria-label="Primary"]');
    const storyNav = document.querySelector(
      'nav[aria-label*="Story"], nav[aria-label*="story"], nav[aria-label*="Навигация"], nav[aria-label*="ნავიგაცია"]',
    );
    const desktopNavVisible = isVisible(primary);
    const storyNavVisible = isVisible(storyNav);
    const inlineLogin = Array.from(document.querySelectorAll("button")).find((button) =>
      /^(Login|Anmelden|Войти|შესვლა|Giriş|تسجيل الدخول)$/i.test(button.textContent?.trim() ?? ""),
    );
    const inlineLoginVisible = isVisible(inlineLogin);
    const menuButton = document.querySelector('button[aria-label="Open menu"], button[aria-label="Close menu"]');
    const menuVisible = isVisible(menuButton);
    const authReachable = inlineLoginVisible || menuVisible;
    const ok = storyMode
      ? storyNavVisible || authReachable
      : desktopNavVisible
        ? authReachable
        : menuVisible || inlineLoginVisible;

    return {
      storyMode,
      desktopNavVisible,
      storyNavVisible,
      inlineLoginVisible,
      menuVisible,
      ok,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(500);
  } catch (error) {
    console.error(`Could not load ${BASE}/ — start dev server or set NAV_CHECK_URL`);
    console.error(error);
    await browser.close();
    process.exit(1);
  }

  console.log(`Nav auth reachability @ ${BASE}\n`);
  console.log("Width | Story | Desktop nav | Story nav | Login | Menu | OK");
  console.log("------|-------|-------------|-----------|-------|------|----");

  let failed = false;

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(width >= 1280 ? 1200 : 250);
    const state = await evaluateNav(page);
    if (!state.ok) failed = true;
    console.log(
      `${String(width).padStart(5)} | ${String(state.storyMode).padEnd(5)} | ${String(state.desktopNavVisible).padEnd(11)} | ${String(state.storyNavVisible).padEnd(9)} | ${String(state.inlineLoginVisible).padEnd(5)} | ${String(state.menuVisible).padEnd(4)} | ${state.ok ? "yes" : "NO"}`,
    );
  }

  await browser.close();
  process.exit(failed ? 1 : 0);
}

main();
