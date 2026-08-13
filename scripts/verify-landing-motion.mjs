import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const pages = ["/georgia-residency", "/medical-tourism", "/reverance-batumi"];
const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const errors = [];
const browser = await chromium.launch({ headless: true });

function overflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      overflowX: Math.max(0, doc.scrollWidth - doc.clientWidth),
      headerWidth: document.querySelector("header")?.getBoundingClientRect().width ?? 0,
      viewport: window.innerWidth,
    };
  });
}

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(`${viewport.name} pageerror: ${error.message}`));

    for (const path of pages) {
      const response = await page.goto(new URL(path, baseUrl).toString(), {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });
      if (!response || response.status() >= 400) {
        errors.push(`${viewport.name} ${path} status ${response?.status()}`);
        continue;
      }
      await page.waitForSelector("#main-content", { timeout: 20_000 });
      await page.waitForTimeout(400);
      const metrics = await overflow(page);
      if (metrics.overflowX > 2) {
        errors.push(`${viewport.name} ${path} overflow ${metrics.overflowX}px`);
      }
      if (metrics.headerWidth - 1 > metrics.viewport) {
        errors.push(`${viewport.name} ${path} header wider than viewport`);
      }

      const hero = await page.locator("h1").first();
      if (!(await hero.isVisible())) {
        errors.push(`${viewport.name} ${path} missing hero`);
      }
    }

    if (viewport.name === "phone") {
      await page.goto(new URL("/georgia-residency", baseUrl).toString(), { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#main-content");
      const before = await page.evaluate(() => window.scrollY);
      const menuButton = page.getByRole("button", { name: /navigation/i });
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }
      const contactLink = page.locator('a[href="#contact"]:visible').first();
      await contactLink.click();
      await page.waitForTimeout(800);
      const after = await page.evaluate(() => window.scrollY);
      if (after <= before + 80) {
        errors.push("phone georgia-residency did not smooth-scroll to contact");
      }
    }

    if (viewport.name === "desktop") {
      await page.goto(new URL("/medical-tourism", baseUrl).toString(), { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#main-content");
      const sibling = page.locator('a[href="/georgia-residency"]').first();
      if (!(await sibling.count())) {
        errors.push("desktop medical-tourism missing residency sibling link");
      } else {
        await Promise.all([
          page.waitForURL("**/georgia-residency", { timeout: 20_000 }),
          sibling.click(),
        ]);
        await page.waitForSelector(".residency-dossier, #main-content", { timeout: 20_000 });
        const arrived = await page.evaluate(() => document.documentElement.dataset.routePath || location.pathname);
        if (!String(arrived).includes("georgia-residency")) {
          errors.push(`desktop transition landed on ${arrived}`);
        }
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("landing motion and responsive checks passed");
