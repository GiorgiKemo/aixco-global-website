import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = (process.env.OVERLAP_CHECK_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const WIDTHS = [375, 390, 768, 1024, 1280, 1440, 1920];
const LANGS = ["en", "de", "ru", "ka", "tr", "ar"];
const OUT = path.join(process.cwd(), "test-results", "overlap-audit");
fs.mkdirSync(OUT, { recursive: true });

const SELECTORS = [
  { name: "header", sel: "header[dir='ltr']" },
  { name: "hero-content", sel: "[data-hero-content-stack='true']" },
  { name: "hero-price", sel: "[data-hero-price-lockup='true']" },
  { name: "hero-scroll-cue", sel: "[data-hero-scroll-cue='viewport']" },
  { name: "story-sidebar", sel: "aside.fixed.bottom-0.left-0.top-0" },
  { name: "chat-widget", sel: "[data-chat-widget-root='true'], [class*='ChatWidget']" },
  { name: "scroll-top", sel: "[data-scroll-to-top-button='true']" },
  { name: "nav-primary", sel: "nav[aria-label='Primary']" },
  { name: "nav-story", sel: "nav[aria-label*='Story']" },
];

function rectsOverlap(a, b, tolerance = 2) {
  return !(
    a.right <= b.left + tolerance ||
    a.left >= b.right - tolerance ||
    a.bottom <= b.top + tolerance ||
    a.top >= b.bottom - tolerance
  );
}

function overlapArea(a, b) {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  if (right <= left || bottom <= top) return 0;
  return (right - left) * (bottom - top);
}

async function setLanguage(page, code) {
  await page.evaluate((langCode) => {
    localStorage.setItem("aixco-lang", langCode);
  }, code);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
}

async function auditPage(page) {
  return page.evaluate(({ selectors }) => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    const issues = [];
    const elements = [];

    for (const { name, sel } of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      elements.push({ name, rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } });
    }

    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const a = elements[i];
        const b = elements[j];
        const aR = a.rect;
        const bR = b.rect;
        const overlaps =
          !(aR.right <= bR.left + 2 || aR.left >= bR.right - 2 || aR.bottom <= bR.top + 2 || aR.top >= bR.bottom - 2);
        if (overlaps) {
          const left = Math.max(aR.left, bR.left);
          const top = Math.max(aR.top, bR.top);
          const right = Math.min(aR.right, bR.right);
          const bottom = Math.min(aR.bottom, bR.bottom);
          const area = Math.max(0, right - left) * Math.max(0, bottom - top);
          const minArea = Math.min(aR.width * aR.height, bR.width * bR.height);
          if (area / minArea > 0.05) {
            issues.push({ a: a.name, b: b.name, overlapPct: Math.round((area / minArea) * 100) });
          }
        }
      }
    }

    const clipped = [];
    document.querySelectorAll("h1,h2,h3,p,button,a,span,dt,dd").forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return;
      const text = el.textContent?.trim();
      if (!text || text.length < 4) return;
      if (el.scrollWidth > el.clientWidth + 2 && style.overflow !== "visible") {
        clipped.push({ tag: el.tagName, text: text.slice(0, 40), overflow: el.scrollWidth - el.clientWidth });
      }
    });

    return { overflow, issues, clipped: clipped.slice(0, 8) };
  }, { selectors: SELECTORS });
}

async function scrollSections(page) {
  const ids = ["about", "legacy", "dubai", "batumi", "partners", "contact"];
  for (const id of ids) {
    await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ block: "center" });
    }, id);
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const findings = [];
  let failCount = 0;

  console.log(`Overlap audit @ ${BASE}\n`);

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  for (const lang of LANGS) {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await setLanguage(page, lang);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(width >= 1280 ? 1200 : 600);
      await scrollSections(page);

      const heroResult = await auditPage(page);
      const hasOverflow = heroResult.overflow > 8;
      const hasOverlap = heroResult.issues.length > 0;
      const hasClip = heroResult.clipped.length > 0;
      const fail = hasOverflow || hasOverlap || hasClip;

      if (fail) {
        failCount += 1;
        const label = `${lang}-${width}`;
        const shot = path.join(OUT, `${label}.png`);
        await page.screenshot({ path: shot, fullPage: false });
        findings.push({ lang, width, ...heroResult, screenshot: shot });
      }

      const status = fail ? "FAIL" : "PASS";
      console.log(
        `${lang.padEnd(2)} ${String(width).padStart(4)}px | overflow ${heroResult.overflow}px | overlaps ${heroResult.issues.length} | clipped ${heroResult.clipped.length} | ${status}`,
      );
    }
  }

  const summaryPath = path.join(OUT, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify({ base: BASE, failCount, findings }, null, 2));
  console.log(`\nFailures: ${failCount}/${LANGS.length * WIDTHS.length}`);
  console.log(`Written: ${summaryPath}`);

  await browser.close();
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
