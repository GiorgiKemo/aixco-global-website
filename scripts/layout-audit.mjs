import { chromium } from "playwright";

const BASE = (process.env.CHECK_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const WIDTHS = [375, 390, 768, 1024, 1280, 1440, 1920];
const LANGS = ["en", "de", "ru", "ka", "tr", "ar"];

async function setLang(page, code) {
  await page.evaluate((c) => localStorage.setItem("aixco-lang", c), code);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
}

async function auditViewport(page) {
  return page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    const story = !!document.querySelector('[data-home-experience-mode="story"]');
    const issues = [];

    const navReachable = (() => {
      const primary = document.querySelector('nav[aria-label="Primary"]');
      const storyNav = document.querySelector('nav[aria-label*="Story"], nav[aria-label*="story"]');
      const menu = document.querySelector('button[aria-label="Open menu"]');
      const loginBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        /login|anmelden|войти|giriş|تسجيل/i.test(b.textContent?.trim() ?? ""),
      );
      const loginVisible = loginBtn && getComputedStyle(loginBtn).display !== "none" && loginBtn.offsetParent !== null;
      const primaryVisible = primary && getComputedStyle(primary).display !== "none";
      const storyVisible = storyNav && getComputedStyle(storyNav).display !== "none";
      const menuVisible = menu && getComputedStyle(menu).display !== "none";
      return { ok: primaryVisible ? loginVisible || menuVisible : storyVisible || menuVisible || loginVisible, primaryVisible, storyVisible, menuVisible, loginVisible };
    })();

    const sections = ["legacy", "dubai", "batumi", "partners", "contact"];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) continue;
      const style = getComputedStyle(el);
      if (el.scrollWidth > el.clientWidth + 4 && style.overflowX !== "visible") {
        issues.push({ type: "section-overflow", id, delta: el.scrollWidth - el.clientWidth });
      }
    }

    const header = document.querySelector("header[dir='ltr']");
    const chat = document.querySelector("[data-chat-floating-container]");
    if (header && chat) {
      const h = header.getBoundingClientRect();
      const c = chat.getBoundingClientRect();
      const hs = getComputedStyle(header);
      if (hs.display !== "none" && hs.visibility !== "hidden" && h.bottom > c.top + 8 && h.top < c.bottom) {
        issues.push({ type: "header-chat-overlap", overlap: Math.round(Math.min(h.bottom, c.bottom) - Math.max(h.top, c.top)) });
      }
    }

    const clippedLabels = [];
    document.querySelectorAll("nav a, nav button, .eyebrow, .heading-section, h3, [data-hero-price-text]").forEach((el) => {
      if (getComputedStyle(el).display === "none") return;
      const text = el.textContent?.trim();
      if (!text || text.length < 6) return;
      if (el.classList.contains("sr-only")) return;
      if (el.scrollWidth > el.clientWidth + 3) {
        clippedLabels.push({ text: text.slice(0, 50), tag: el.tagName, delta: el.scrollWidth - el.clientWidth });
      }
    });

    return { overflow, story, navReachable, issues, clipped: clippedLabels.slice(0, 5) };
  });
}

async function scrollAll(page) {
  const ids = ["about", "legacy", "dubai", "batumi", "partners", "contact"];
  for (const id of ids) {
    await page.evaluate((sid) => document.getElementById(sid)?.scrollIntoView({ block: "start" }), id);
    await page.waitForTimeout(350);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let fails = 0;

  console.log(`Layout audit @ ${BASE}\n`);

  for (const lang of LANGS) {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await setLang(page, lang);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(width >= 1280 ? 1200 : 500);
      await scrollAll(page);
      const r = await auditViewport(page);
      const bad = r.overflow > 8 || !r.navReachable.ok || r.issues.length > 0 || r.clipped.length > 0;
      if (bad) fails += 1;
      console.log(
        `${lang} ${String(width).padStart(4)} | overflow ${r.overflow} | nav ${r.navReachable.ok ? "ok" : "FAIL"} | issues ${r.issues.length} | clipped ${r.clipped.length} | ${bad ? "FAIL" : "PASS"}`,
      );
      if (r.clipped.length) r.clipped.forEach((c) => console.log(`    clip: ${c.text} (+${c.delta}px)`));
      if (r.issues.length) r.issues.forEach((i) => console.log(`    issue: ${JSON.stringify(i)}`));
    }
  }

  await browser.close();
  console.log(`\nTotal failures: ${fails}/${LANGS.length * WIDTHS.length}`);
  process.exit(fails > 0 ? 1 : 0);
}

main();
