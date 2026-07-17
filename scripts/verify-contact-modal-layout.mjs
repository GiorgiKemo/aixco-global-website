import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const browser = await chromium.launch({ headless: true });
const failures = [];

const cases = [
  { width: 390, height: 844, expectScroll: false },
  { width: 844, height: 390, expectScroll: true },
  { width: 1024, height: 768, expectScroll: false },
  { width: 1366, height: 768, expectScroll: false },
  { width: 1440, height: 900, expectScroll: false },
];

const modes = [
  { name: "email", button: "Send an Email" },
  { name: "call", button: "Schedule a Call" },
];

try {
  for (const viewport of cases) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const runtimeErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => runtimeErrors.push(`page: ${error.message}`));

    await page.goto(`${baseUrl}/?modal=contact`, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.getByRole("dialog").waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);

    for (const mode of modes) {
      await page.getByRole("button", { name: mode.button }).click();
      await page.locator(".contact-request-form").waitFor({ state: "visible" });

      const result = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        const close = document.querySelector('[role="dialog"] button[aria-label]');
        const submit = document.querySelector('.contact-request-form button[type="submit"]');
        if (!(dialog instanceof HTMLElement) || !(close instanceof HTMLElement) || !(submit instanceof HTMLElement)) {
          return { missing: true };
        }

        const dialogRect = dialog.getBoundingClientRect();
        const closeRect = close.getBoundingClientRect();
        const submitRect = submit.getBoundingClientRect();
        const horizontalOverflow = Math.max(
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
          dialog.scrollWidth - dialog.clientWidth,
        );

        return {
          missing: false,
          overflowAmount: dialog.scrollHeight - dialog.clientHeight,
          horizontalOverflow,
          closeVisible:
            closeRect.top >= dialogRect.top - 1 &&
            closeRect.right <= dialogRect.right + 1 &&
            closeRect.bottom <= dialogRect.bottom + 1,
          submitInitiallyVisible:
            submitRect.top >= dialogRect.top - 1 && submitRect.bottom <= dialogRect.bottom + 1,
        };
      });

      const label = `${viewport.width}x${viewport.height} ${mode.name}`;
      if (result.missing) failures.push(`${label}: expected modal elements are missing`);
      else {
        if (!result.closeVisible) failures.push(`${label}: close button is outside the dialog`);
        if (result.horizontalOverflow > 1) failures.push(`${label}: ${result.horizontalOverflow}px horizontal overflow`);
        if (!viewport.expectScroll && result.overflowAmount > 1) {
          failures.push(`${label}: unexpected ${result.overflowAmount}px vertical overflow`);
        }
        if (!viewport.expectScroll && !result.submitInitiallyVisible) {
          failures.push(`${label}: submit button is below the initial dialog viewport`);
        }
        if (viewport.expectScroll && result.overflowAmount <= 1) {
          failures.push(`${label}: compact landscape dialog should remain safely scrollable`);
        }
      }

      console.log(
        `${label}: submit=${result.submitInitiallyVisible ? "visible" : "scroll"}, ` +
          `vertical-overflow=${result.overflowAmount ?? "n/a"}px, horizontal-overflow=${result.horizontalOverflow ?? "n/a"}px`,
      );
    }

    failures.push(...runtimeErrors.map((error) => `${viewport.width}x${viewport.height}: ${error}`));
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("\nContact modal layout failures:\n- " + failures.join("\n- "));
  process.exitCode = 1;
} else {
  console.log("\nContact modal layout passed across 10 viewport/mode cases.");
}
