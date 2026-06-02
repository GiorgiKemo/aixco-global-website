import { chromium } from "playwright";

const BASE = (process.env.RESPONSIVE_CHECK_URL || "https://aixco-global-website.vercel.app").replace(/\/$/, "");
const WIDTHS = [375, 390, 768, 1024, 1280, 1440, 1920];
const LANGS = ["en", "de", "ru", "ka", "tr", "ar"];

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
    const loginButtons = Array.from(document.querySelectorAll("button")).filter((button) =>
      /^(Login|Anmelden|Войти|შესვლა|Giriş|تسجيل الدخول)$/i.test(button.textContent?.trim() ?? ""),
    );
    const inlineLoginVisible = loginButtons.some((button) => isVisible(button));
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
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
}

async function setLanguage(page, code) {
  await page.evaluate((langCode) => {
    localStorage.setItem("aixco-lang", langCode);
  }, code);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Responsive viewport audit @ ${BASE}\n`);

  let failed = 0;

  try {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  } catch {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  }

  for (const lang of LANGS) {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await setLanguage(page, lang);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(width < 1180 ? 700 : 400);
      const state = await evaluateNav(page);
      const ok = state.ok && state.overflow <= 8;
      if (!ok) failed += 1;
      console.log(
        `${lang.padEnd(2)} ${String(width).padStart(4)}px | overflow ${state.overflow}px | nav ${state.ok ? "ok" : "FAIL"} | ${ok ? "PASS" : "FAIL"}`,
      );
    }
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

main();
