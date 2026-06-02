import { chromium } from "playwright";

const BASE = (process.env.OVERLAP_CHECK_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const VIEWPORTS = [
  { width: 1280, height: 900, label: "1280x900" },
  { width: 1440, height: 900, label: "1440x900" },
  { width: 1920, height: 1080, label: "1920x1080" },
];

async function auditStorySections(page) {
  return page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("[data-story-section]"));
    const rows = [];

    for (const section of sections) {
      const key = section.getAttribute("data-story-section") ?? "unknown";
      const copy = section.querySelector("[data-story-scene-copy]");
      const column = copy?.parentElement;
      const overflowY = column ? window.getComputedStyle(column).overflowY : "n/a";
      const copyOverflow = copy ? copy.scrollHeight > copy.clientHeight + 4 : false;
      const columnOverflow = column ? column.scrollHeight > column.clientHeight + 4 : false;

      rows.push({
        key,
        overflowY,
        copyOverflow,
        columnOverflow,
        scrollable: overflowY === "auto" || overflowY === "scroll",
      });
    }

    return rows;
  });
}

async function auditParticipate(page) {
  return page.evaluate(() => {
    const participate = document.querySelector('[data-story-section="participate"]');
    const how = document.querySelector('[data-story-section="how"]');
    const lastRoute = document.querySelector('[data-participation-card="management"]');
    if (!participate || !how || !lastRoute) return { skipped: true };

    const routeRect = lastRoute.getBoundingClientRect();
    const howRect = how.getBoundingClientRect();
    const sectionRect = participate.getBoundingClientRect();

    return {
      skipped: false,
      routeIntoHow: Math.round(routeRect.bottom - howRect.top),
      routePastSection: Math.round(routeRect.bottom - sectionRect.bottom),
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let fail = 0;

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(900);

    const rows = await auditStorySections(page);
    await page.evaluate(() => {
      document.getElementById("participate")?.scrollIntoView({ block: "end" });
    });
    await page.waitForTimeout(450);
    const participate = await auditParticipate(page);

    const bad = rows.filter((r) => r.scrollable || r.copyOverflow || r.columnOverflow);
    const participateBad =
      !participate.skipped && (participate.routeIntoHow > 2 || participate.routePastSection > 2);

    if (bad.length || participateBad) fail += 1;

    console.log(`\n${viewport.label}`);
    console.log(
      `  participate: ${participate.skipped ? "n/a" : `intoHow=${participate.routeIntoHow}px past=${participate.routePastSection}px`}`,
    );
    if (bad.length) {
      console.log(`  FAIL sections: ${bad.map((r) => r.key).join(", ")}`);
      bad.forEach((r) => {
        console.log(
          `    - ${r.key}: overflowY=${r.overflowY} copyOverflow=${r.copyOverflow} columnOverflow=${r.columnOverflow}`,
        );
      });
    } else {
      console.log("  all story sections fit (no internal scroll / overflow)");
    }
  }

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
