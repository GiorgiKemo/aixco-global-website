import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (error) => console.log("PAGE ERROR:", error.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE:", msg.text());
});

await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(8000);

const modes = await page.evaluate(() => ({
  mode: document.querySelector("[data-home-experience-mode]")?.getAttribute("data-home-experience-mode"),
  storySection: Boolean(document.querySelector("[data-story-section]")),
  desktopStory: Boolean(document.querySelector("[data-home-experience=\"desktop-story\"]")),
}));

console.log(JSON.stringify(modes, null, 2));
await browser.close();
