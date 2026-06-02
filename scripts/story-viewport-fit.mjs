import { chromium } from "playwright";

const BASE = (process.env.OVERLAP_CHECK_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const VIEWPORTS = [
  { width: 1280, height: 720, label: "1280x720" },
  { width: 1366, height: 768, label: "1366x768" },
  { width: 1280, height: 900, label: "1280x900" },
  { width: 1440, height: 900, label: "1440x900" },
  { width: 1920, height: 1080, label: "1920x1080" },
  { width: 2560, height: 1080, label: "2560x1080-ultrawide" },
];
const LANGS = (process.env.STORY_FIT_LANGS || "en,de,ru,ka,tr,ar").split(",");
const SECTIONS = [
  "hero",
  "about",
  "legacy",
  "dubai",
  "batumi",
  "materials",
  "participate",
  "how",
  "team",
  "partners",
  "faqs",
  "contact",
];

async function waitForStoryReady(page) {
  await page.waitForSelector('[data-home-experience-mode="story"]', { state: "attached", timeout: 30000 });
  await page.waitForSelector('[data-story-section="hero"]', { state: "attached", timeout: 30000 });
  await page.waitForTimeout(500);
}

async function setLanguage(page, code) {
  await page.evaluate((langCode) => {
    localStorage.setItem("aixco-lang", langCode);
  }, code);
  await page.reload({ waitUntil: "networkidle" });
  await waitForStoryReady(page);
}

async function scrollToSection(page, sectionId) {
  await page.evaluate((id) => {
    if (id === "hero") {
      window.scrollTo(0, 0);
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;
    location.hash = `#${id}`;
    target.scrollIntoView({ block: "start" });
  }, sectionId);
  await page.waitForTimeout(450);
}

async function auditSection(page, sectionId) {
  return page.evaluate((id) => {
    const section = document.querySelector(`[data-story-section="${id}"]`);
    if (!section) return { missing: true };

    const copy = section.querySelector("[data-story-scene-copy]");
    const column = section.querySelector("[data-story-scene-column]") ?? copy?.parentElement;
    const media = section.querySelector("[data-story-scene-media]");
    const vh = window.innerHeight;
    const sectionRect = section.getBoundingClientRect();
    const copyRect = copy?.getBoundingClientRect();
    const mediaRect = media?.getBoundingClientRect();

    const sectionHeightDelta = Math.abs(sectionRect.height - vh);
    const copyOverflow = copy ? copy.scrollHeight > copy.clientHeight + 4 : false;
    const columnOverflow = column ? column.scrollHeight > column.clientHeight + 4 : false;
    const overflowY = column ? window.getComputedStyle(column).overflowY : "n/a";
    const scrollable = overflowY === "auto" || overflowY === "scroll";

    const clipped = [];
    section.querySelectorAll("[data-story-scene-copy] h2, [data-story-scene-copy] p, [data-story-scene-copy] dl, [data-story-scene-copy] button, [data-story-scene-copy] a, [data-story-scene-copy] h3").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.height < 2) return;
      if (rect.bottom > sectionRect.bottom + 2 || rect.top < sectionRect.top - 2) {
        clipped.push(el.tagName.toLowerCase());
      }
    });

    const mediaClipped =
      mediaRect &&
      (mediaRect.bottom > sectionRect.bottom + 2 ||
        mediaRect.top < sectionRect.top - 2 ||
        mediaRect.height > sectionRect.height + 2);

    return {
      missing: false,
      sectionHeightDelta: Math.round(sectionHeightDelta),
      copyOverflow,
      columnOverflow,
      scrollable,
      clipped: clipped.slice(0, 4),
      mediaClipped: Boolean(mediaClipped),
      copyTop: copyRect ? Math.round(copyRect.top - sectionRect.top) : null,
      copyBottom: copyRect ? Math.round(copyRect.bottom - sectionRect.bottom) : null,
    };
  }, sectionId);
}

function sectionFailed(result) {
  if (result.missing) return true;
  if (result.sectionHeightDelta == null) return true;
  return (
    result.sectionHeightDelta > 12 ||
    result.copyOverflow ||
    result.columnOverflow ||
    result.scrollable ||
    result.clipped.length > 0 ||
    result.mediaClipped
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let fail = 0;

  for (const lang of LANGS) {
    await page.setViewportSize({ width: VIEWPORTS[0].width, height: VIEWPORTS[0].height });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    await waitForStoryReady(page);
    await setLanguage(page, lang);

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(700);

      const sectionResults = [];
      for (const sectionId of SECTIONS) {
        await scrollToSection(page, sectionId);
        const result = await auditSection(page, sectionId);
        sectionResults.push({ sectionId, ...result });
      }

      const bad = sectionResults.filter((row) => sectionFailed(row));
      if (bad.length) fail += 1;

      console.log(`\n${lang} @ ${viewport.label}`);
      if (bad.length) {
        console.log(`  FAIL (${bad.length}/${SECTIONS.length} sections)`);
        bad.forEach((row) => {
          if (row.missing) {
            console.log(`    - ${row.sectionId}: missing story section`);
            return;
          }
          console.log(
            `    - ${row.sectionId}: sectionDelta=${row.sectionHeightDelta}px copyOverflow=${row.copyOverflow} columnOverflow=${row.columnOverflow} scrollable=${row.scrollable} clipped=${(row.clipped ?? []).join(",") || "none"} mediaClipped=${row.mediaClipped}`,
          );
        });
      } else {
        console.log(`  PASS all ${SECTIONS.length} sections fit viewport`);
      }
    }
  }

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
