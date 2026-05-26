import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = (process.env.LIVE_URL || "https://aixco-global-website.vercel.app").replace(/\/$/, "");
const OUT = path.join(process.cwd(), "test-results", "live-smoke");
fs.mkdirSync(OUT, { recursive: true });

const results = [];
let browser;
let page;
let failShot = 0;

async function shot(label) {
  const file = path.join(OUT, `${String(++failShot).padStart(2, "0")}-${label.replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log(`PASS: ${name}`);
  } catch (err) {
    const screenshot = await shot(name).catch(() => null);
    results.push({ name, pass: false, error: String(err?.message || err), screenshot });
    console.log(`FAIL: ${name} — ${err?.message || err}`);
    if (screenshot) console.log(`  screenshot: ${screenshot}`);
  }
}

async function scrollSection(loc) {
  await loc.scrollIntoViewIfNeeded({ timeout: 15000 });
}

async function gotoHome() {
  for (const url of [`${BASE}/`, `${BASE}/aixco-global-op2`]) {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (res && res.ok()) {
      await page.waitForTimeout(1500);
      return url;
    }
  }
  throw new Error(`Could not load homepage from ${BASE}`);
}

async function main() {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  page = await context.newPage();

  const loadedUrl = await gotoHome();
  console.log(`Loaded: ${loadedUrl}`);

  await check("Homepage loads (HTTP OK)", async () => {
    const title = await page.title();
    if (!title) throw new Error("empty title");
  });

  await check("Hero shows EUR 10,000 (not 1,000)", async () => {
    const body = await page.locator("body").innerText();
    const has10k = /10[,.]?000|10\s*000|EUR\s*10/i.test(body) || body.includes("€10");
    const has1kOnly = /\b1[,.]?000\b/.test(body) && !has10k;
    if (!has10k) throw new Error("EUR 10,000 not found in visible text");
    if (has1kOnly) throw new Error("EUR 1,000 still prominent");
  });

  await check("Legacy timeline section visible", async () => {
    const legacy = page.locator("#legacy, [id*='legacy' i], section:has-text('Legacy')").first();
    await legacy.scrollIntoViewIfNeeded({ timeout: 15000 });
    if (!(await legacy.isVisible())) throw new Error("#legacy / Legacy section not visible");
  });

  await check("Dubai section visible", async () => {
    const dubai = page.locator("#dubai").first();
    await dubai.scrollIntoViewIfNeeded({ timeout: 15000 });
    if (!(await dubai.isVisible())) throw new Error("#dubai not visible");
  });

  await check("Dubai UI avoids Fund I/II product language", async () => {
    const dubai = page.locator("#dubai");
    await dubai.scrollIntoViewIfNeeded();
    const text = await dubai.innerText();
    if (/\bFund\s*(I|II|1|2)\b/i.test(text)) throw new Error("Fund I/II language found in Dubai section");
  });

  await check("Batumi section visible", async () => {
    const batumi = page.locator("#batumi").first();
    await batumi.scrollIntoViewIfNeeded({ timeout: 15000 });
    if (!(await batumi.isVisible())) throw new Error("#batumi not visible");
  });

  await check("Navigation hash links work (#legacy, #dubai, #batumi)", async () => {
    for (const id of ["legacy", "dubai", "batumi"]) {
      const link = page.locator(`a[href*='#${id}'], a[href$='#${id}']`).first();
      if ((await link.count()) === 0) throw new Error(`No nav link for #${id}`);
      await link.click();
      await page.waitForTimeout(600);
      const section = page.locator(`#${id}`).first();
      await section.scrollIntoViewIfNeeded();
      const box = await section.boundingBox();
      if (!box || box.height < 20) throw new Error(`#${id} not in view after click`);
    }
  });

  await check("Contact section loads", async () => {
    const contact = page.locator("#contact, [id*='contact' i]").first();
    await contact.scrollIntoViewIfNeeded({ timeout: 15000 });
    if (!(await contact.isVisible())) throw new Error("contact section not visible");
  });

  await check("FAQ section loads", async () => {
    const faq = page.locator("#faq, #faqs, [id*='faq' i]").first();
    await scrollSection(faq);
    if (!(await faq.isVisible())) throw new Error("FAQ section not visible");
  });

await check("Key CTA links are present and clickable", async () => {
    const cta = page.locator("a[href*='contact'], button:has-text('Contact'), a:has-text('Contact')").first();
    await cta.scrollIntoViewIfNeeded();
    if (!(await cta.isVisible())) throw new Error("No visible Contact CTA");
    const disabled = await cta.isDisabled().catch(() => false);
    if (disabled) throw new Error("Contact CTA disabled");
  });

  await check("Language switcher EN → DE (layout)", async () => {
    const langBtn = page.locator("button[aria-label*='language' i], [data-testid*='lang'], button:has-text('EN'), [class*='lang']").first();
    if ((await langBtn.count()) === 0) {
      const alt = page.getByRole("button", { name: /language|sprache|lang/i }).first();
      if ((await alt.count()) === 0) throw new Error("Language control not found");
      await alt.click();
    } else {
      await langBtn.click();
    }
    const de = page.getByRole("menuitem", { name: /DE|Deutsch|German/i }).or(page.locator("button:has-text('DE'), [data-lang='de'], li:has-text('DE')")).first();
    if ((await de.count()) === 0) throw new Error("DE locale option not found");
    await de.click();
    await page.waitForTimeout(1200);
    const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 8);
    if (overflowX) throw new Error("Horizontal overflow after DE switch");
  });

  await check("Mobile viewport 375px — no broken layout", async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 12);
    if (overflow) throw new Error("Horizontal overflow on mobile");
    const hero = page.locator("main, [role='main'], body").first();
    await hero.waitFor({ state: "visible", timeout: 10000 });
  });

  await check("Desktop viewport 1280px — hero 10k visible", async () => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const body = await page.locator("body").innerText();
    if (!/10[,.]?000|10\s*000|€10/i.test(body)) throw new Error("10k not visible on desktop reload");
  });

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const summaryPath = path.join(OUT, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify({ base: BASE, loadedUrl, passed, failed, results }, null, 2));
  console.log("\n--- SUMMARY ---");
  console.log(`PASS: ${passed}  FAIL: ${failed}`);
  console.log(`Written: ${summaryPath}`);
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  if (browser) await browser.close();
  process.exit(2);
});

