import { chromium, devices, webkit } from "playwright";

const baseUrl = process.env.AIXCO_BASE_URL ?? "http://127.0.0.1:8081";
const locales = [
  { lang: "en", country: "GB", phone: "7911123456" },
  { lang: "de", country: "DE", phone: "15123456789" },
  { lang: "pl", country: "PL", phone: "500100200" },
  { lang: "sl", country: "SI", phone: "40123456" },
  { lang: "ru", country: "RU", phone: "9991234567" },
];
const deviceProfiles = [
  {
    name: "desktop-chrome",
    browser: chromium,
    context: { viewport: { width: 1440, height: 900 } },
  },
  {
    name: "android-chrome",
    browser: chromium,
    context: { ...devices["Pixel 7"] },
  },
  {
    name: "iphone-webkit",
    browser: webkit,
    context: { ...devices["iPhone 15"] },
  },
];

const failures = [];
const results = [];

function getFutureCallTimeValue() {
  const nextAvailable = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (value) => String(value).padStart(2, "0");
  return `${nextAvailable.getFullYear()}-${pad(nextAvailable.getMonth() + 1)}-${pad(nextAvailable.getDate())}T${pad(nextAvailable.getHours())}:${pad(nextAvailable.getMinutes())}`;
}

async function dismissAnalyticsConsent(page) {
  const consent = page.getByRole("dialog", { name: "Cookies & analytics" });
  if (await consent.isVisible().catch(() => false)) {
    await consent.getByRole("button", { name: "Accept" }).click();
    await consent.waitFor({ state: "hidden" });
  }
}

for (const profile of deviceProfiles) {
  const browser = await profile.browser.launch({ headless: true });
  const context = await browser.newContext(profile.context);
  await context.addInitScript(() => {
    window.localStorage.setItem(
      "aixco-analytics-consent-v1",
      JSON.stringify({ status: "denied", version: "2026-08-07" }),
    );
  });
  const page = await context.newPage();
  let capturedRequest = null;

  await page.route("**/api/lead-capture/contact", async (route) => {
    capturedRequest = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, reference: "AIX-TEST-LOCALE" }),
    });
  });

  for (const locale of locales) {
    await page.goto(`${baseUrl}/?modal=contact&qa=form-matrix`, { waitUntil: "domcontentloaded" });
    await page.evaluate((lang) => localStorage.setItem("aixco-lang", lang), locale.lang);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction((lang) => document.documentElement.lang === lang, locale.lang);
    await dismissAnalyticsConsent(page);

    for (const mode of ["call", "email"]) {
      const caseName = `${profile.name}/${locale.lang}/${mode}`;

      try {
        if (mode === "email") {
          await page.goto(`${baseUrl}/?modal=contact&qa=form-matrix`, { waitUntil: "domcontentloaded" });
          await dismissAnalyticsConsent(page);
        }

        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await dialog.locator(".contact-request-option").nth(mode === "call" ? 0 : 1).click();
        await dialog.locator('input[name="name"]').fill("test");
        await dialog.locator('input[name="email"]').fill("gegaqemo@gmail.com");

        if (mode === "call") {
          await dialog.locator('select[name="phoneCountry"]').selectOption(locale.country);
          await dialog.locator('input[name="phoneNational"]').fill(locale.phone);
          await dialog.locator('input[name="preferredTime"]').fill(getFutureCallTimeValue());
        } else {
          await dialog.locator('textarea[name="message"]').fill("JUST TESTING");
        }

        const formIsValid = await dialog.locator("form").evaluate((form) => form.checkValidity());
        if (!formIsValid) throw new Error("browser-native form validation failed");

        capturedRequest = null;
        await dialog.locator('button[type="submit"]').click();
        await dialog.getByRole("status").waitFor({ state: "visible" });

        if (capturedRequest?.context?.locale !== locale.lang) {
          throw new Error(
            `submitted locale ${String(capturedRequest?.context?.locale)} instead of ${locale.lang}`,
          );
        }
        const expectedRequestType = mode === "call" ? "call" : "message";
        if (capturedRequest?.payload?.requestType !== expectedRequestType) {
          throw new Error(
            `submitted request type ${String(capturedRequest?.payload?.requestType)} instead of ${expectedRequestType}`,
          );
        }

        const hasHorizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        );
        if (hasHorizontalOverflow) throw new Error("page has horizontal overflow");

        results.push({ caseName, ok: true });
      } catch (error) {
        failures.push(`${caseName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    {
      const caseName = `${profile.name}/${locale.lang}/reverance-batumi/message`;

      try {
        capturedRequest = null;
        await page.goto(`${baseUrl}/reverance-batumi#contact`, { waitUntil: "domcontentloaded" });
        await dismissAnalyticsConsent(page);
        const form = page.locator("form").first();
        await form.scrollIntoViewIfNeeded();
        await form.locator('input[name="name"]').fill("Landing Page Test");
        await form.locator('input[name="email"]').fill("landing-test@example.com");
        await form.locator('select[name="interest"]').selectOption("Project Reverance");
        await form.locator('textarea[name="message"]').fill("Please send the current Reverance availability and payment details.");

        const formIsValid = await form.evaluate((element) => element.checkValidity());
        if (!formIsValid) throw new Error("landing-page browser-native form validation failed");

        await form.locator('button[type="submit"]').click();
        await form.waitFor({ state: "detached" });

        if (capturedRequest?.context?.page_path !== "/reverance-batumi#contact") {
          throw new Error(`submitted page path ${String(capturedRequest?.context?.page_path)} instead of /reverance-batumi#contact`);
        }
        if (capturedRequest?.payload?.requestType !== "message") {
          throw new Error(`submitted request type ${String(capturedRequest?.payload?.requestType)} instead of message`);
        }
        if (capturedRequest?.payload?.interest !== "Project Reverance") {
          throw new Error(`submitted interest ${String(capturedRequest?.payload?.interest)} instead of Project Reverance`);
        }

        results.push({ caseName, ok: true });
      } catch (error) {
        failures.push(`${caseName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  await context.close();
  await browser.close();
}

console.log(`Verified ${results.length} rendered contact-form flows.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("All locale and device form checks passed.");
}
