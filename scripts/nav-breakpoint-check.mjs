import { chromium } from "playwright";

const BASE = (process.env.NAV_CHECK_URL || "http://127.0.0.1:8081").replace(/\/$/, "");
const WIDTHS = [1280, 1366, 1440, 1536, 1920];

async function evaluateNav(page) {
  return page.evaluate(() => {
    const primary = document.querySelector('nav[aria-label="Primary"]');
    const desktopNavVisible =
      primary != null && window.getComputedStyle(primary).display !== "none";
    const inlineLogin = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Login",
    );
    const inlineLoginVisible =
      inlineLogin != null && window.getComputedStyle(inlineLogin).display !== "none";
    const menuButton = document.querySelector('button[aria-label="Open menu"]');
    const menuVisible =
      menuButton != null && window.getComputedStyle(menuButton).display !== "none";

    return {
      desktopNavVisible,
      inlineLoginVisible,
      menuVisible,
      ok: desktopNavVisible ? inlineLoginVisible || menuVisible : menuVisible,
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
  console.log("Width | Desktop nav | Inline Login | Hamburger | OK");
  console.log("------|-------------|--------------|-----------|----");

  let failed = false;

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(250);
    const state = await evaluateNav(page);
    if (!state.ok) failed = true;
    console.log(
      `${String(width).padStart(5)} | ${String(state.desktopNavVisible).padEnd(11)} | ${String(state.inlineLoginVisible).padEnd(12)} | ${String(state.menuVisible).padEnd(9)} | ${state.ok ? "yes" : "NO"}`,
    );
  }

  await browser.close();
  process.exit(failed ? 1 : 0);
}

main();
