import { chromium } from "playwright";
import { analyticsSmokeStorage } from "./lib/analytics-consent.mjs";

const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:8081";
const analyticsEndpoint = "**/api/analytics/events";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const eventTypes = new Set([
  "session_start", "session_end", "page_view", "section_view", "engagement",
  "scroll_depth", "click", "download", "outbound", "form_start",
  "form_submit", "form_error", "portal_handoff", "conversion", "language_change",
]);
const eventNames = new Set([
  "session_started", "session_ended", "page_view", "section_view", "active_time",
  "scroll_depth", "button_click", "link_click", "social_click", "whatsapp_click",
  "phone_click", "email_click", "download_requested", "outbound_link", "form_started",
  "form_submit_attempted", "form_failed", "portal_handoff",
  "contact_request_acknowledged", "chat_message", "language_changed",
]);

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertExactKeys(value, expected, label) {
  assert(value && typeof value === "object" && !Array.isArray(value), `${label} is not an object`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  assert(actual.join("|") === wanted.join("|"), `${label} keys are ${actual.join(", ")}`);
}

function isIsoDate(value) {
  return typeof value === "string"
    && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString() === value;
}

function validateInitialBatch(payload) {
  assertExactKeys(payload, ["consent", "session", "events"], "batch");
  assertExactKeys(payload.consent, ["status", "version"], "batch.consent");
  assert(payload.consent.status === "granted", "batch consent is not granted");
  assert(
    payload.consent.version === analyticsSmokeStorage.consentVersion,
    `batch consent version is ${payload.consent.version}`,
  );

  const session = payload.session;
  assertExactKeys(session, [
    "id", "visitorId", "startedAt", "lastSeenAt", "endedAt", "activeSeconds",
    "landingPath", "exitPath", "referrer", "campaign", "locale", "timezone",
    "screenWidth", "screenHeight", "viewportWidth", "viewportHeight", "isReturning",
  ], "batch.session");
  assert(uuidPattern.test(session.id), "session id is not a UUID");
  assert(uuidPattern.test(session.visitorId), "visitor id is not a UUID");
  assert(isIsoDate(session.startedAt) && isIsoDate(session.lastSeenAt), "session timestamps are invalid");
  assert(session.endedAt === null || isIsoDate(session.endedAt), "session endedAt is invalid");
  assert(Number.isInteger(session.activeSeconds) && session.activeSeconds >= 0, "activeSeconds is invalid");
  for (const [key, path] of [["landingPath", session.landingPath], ["exitPath", session.exitPath]]) {
    assert(typeof path === "string" && path.startsWith("/"), `${key} is invalid`);
    assert(!path.includes("?"), `${key} contains a query string: ${path}`);
  }
  assertExactKeys(
    session.campaign,
    ["source", "medium", "campaign", "term", "content"],
    "batch.session.campaign",
  );
  assert(session.campaign.source === "qa-source", "allowlisted campaign source was not retained");
  assert(session.locale === "en", `session locale is ${session.locale}`);
  assert(session.viewportWidth === 360, `session viewport width is ${session.viewportWidth}`);
  assert(session.viewportHeight === 800, `session viewport height is ${session.viewportHeight}`);
  assert(typeof session.isReturning === "boolean", "session returning flag is invalid");

  assert(Array.isArray(payload.events) && payload.events.length >= 2 && payload.events.length <= 30, "event batch size is invalid");
  const eventIds = new Set();
  for (const [index, event] of payload.events.entries()) {
    assertExactKeys(event, [
      "id", "type", "name", "pagePath", "occurredAt", "sectionId", "targetLabel",
      "value", "durationMs", "scrollDepth", "metadata",
    ], `batch.events[${index}]`);
    assert(uuidPattern.test(event.id), `event ${index} id is not a UUID`);
    assert(!eventIds.has(event.id), `event ${index} id is duplicated`);
    eventIds.add(event.id);
    assert(eventTypes.has(event.type), `event ${index} type is ${event.type}`);
    assert(eventNames.has(event.name), `event ${index} name is ${event.name}`);
    assert(isIsoDate(event.occurredAt), `event ${index} timestamp is invalid`);
    assert(typeof event.pagePath === "string" && event.pagePath.startsWith("/"), `event ${index} path is invalid`);
    assert(!event.pagePath.includes("?"), `event ${index} path contains a query string`);
    assert(event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata), `event ${index} metadata is invalid`);
  }
  const names = new Set(payload.events.map((event) => event.name));
  assert(names.has("session_started"), "initial batch has no session_started event");
  assert(names.has("page_view"), "initial batch has no page_view event");
}

async function readAnalyticsStorage(page) {
  return page.evaluate(({ consentKey, visitorKey, sessionKey, outboxKey }) => ({
    consent: localStorage.getItem(consentKey),
    visitor: localStorage.getItem(visitorKey),
    session: sessionStorage.getItem(sessionKey),
    outbox: sessionStorage.getItem(outboxKey),
  }), analyticsSmokeStorage);
}

async function waitFor(check, message, timeoutMs = 8_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  fail(message);
}

async function installAnalyticsCapture(context, batches) {
  await context.route(analyticsEndpoint, async (route) => {
    let payload;
    try {
      payload = JSON.parse(route.request().postData() ?? "null");
    } catch (error) {
      fail(`analytics request body was not JSON: ${error.message}`);
    }
    batches.push(payload);
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, stored: true, accepted: payload?.events?.length ?? 0 }),
    });
  });
}

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    reducedMotion: "reduce",
    locale: "en-US",
  });
  const batches = [];
  await installAnalyticsCapture(context, batches);
  const page = await context.newPage();

  try {
    await page.goto(
      `${baseUrl}/?email=private-smoke-marker%40example.com&utm_source=qa-source#hero`,
      { waitUntil: "domcontentloaded", timeout: 45_000 },
    );
    const dialog = page.getByRole("dialog", { name: "Cookies & analytics" });
    await dialog.waitFor({ state: "visible", timeout: 20_000 });
    await page.waitForTimeout(500);

    const preConsent = await readAnalyticsStorage(page);
    assert(batches.length === 0, `analytics sent ${batches.length} request(s) before consent`);
    assert(preConsent.consent === null, "a consent choice appeared before visitor action");
    assert(preConsent.visitor === null && preConsent.session === null && preConsent.outbox === null, "analytics identifiers exist before consent");
    const dialogBounds = await dialog.boundingBox();
    assert(dialogBounds !== null, "consent dialog has no layout box");
    assert(dialogBounds.x >= -1 && dialogBounds.x + dialogBounds.width <= 361, "consent dialog overflows the 360px viewport");
    assert(
      await dialog.getByText("Google Analytics and optional AIXCO analytics stay off until you choose", { exact: false }).isVisible(),
      "compact consent summary is missing",
    );
    const details = dialog.locator("details");
    await details.locator("summary").click();
    assert(
      await dialog.getByText("We use Google Analytics through Google Tag Manager", { exact: false }).isVisible(),
      "expanded consent details are missing",
    );
    await details.locator("summary").click();

    await page.getByRole("button", { name: "Accept analytics" }).click();
    await waitFor(() => batches.length > 0, "granting consent did not send the initial analytics batch");
    validateInitialBatch(batches[0]);
    const serialized = JSON.stringify(batches[0]);
    assert(!serialized.includes("private-smoke-marker"), "private query data leaked into analytics");
    assert(!serialized.includes("email="), "query parameter names leaked into analytics");

    const grantedStorage = await readAnalyticsStorage(page);
    const grantedConsent = JSON.parse(grantedStorage.consent ?? "null");
    assert(grantedConsent?.status === "granted", "granted consent was not persisted");
    assert(grantedConsent?.version === analyticsSmokeStorage.consentVersion, "granted consent version is stale");
    assert(uuidPattern.test(grantedStorage.visitor ?? ""), "visitor UUID was not stored after consent");
    assert(grantedStorage.session !== null, "session was not stored after consent");

    const preferences = page.getByRole("button", { name: "Cookie preferences" }).first();
    await preferences.scrollIntoViewIfNeeded();
    await preferences.click();
    await dialog.waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Necessary only" }).click();
    await dialog.waitFor({ state: "hidden" });

    const afterRevoke = await readAnalyticsStorage(page);
    const revokedConsent = JSON.parse(afterRevoke.consent ?? "null");
    assert(revokedConsent?.status === "denied", "revocation did not persist Necessary only");
    assert(revokedConsent?.version === analyticsSmokeStorage.consentVersion, "revocation consent version is stale");
    assert(afterRevoke.visitor === null && afterRevoke.session === null && afterRevoke.outbox === null, "revocation did not clear analytics identifiers/outbox");

    const requestCountAfterRevoke = batches.length;
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("aixco:analytics-track", {
        detail: { type: "click", name: "button_click", targetLabel: "post-revoke-probe" },
      }));
    });
    await page.waitForTimeout(500);
    assert(batches.length === requestCountAfterRevoke, "analytics continued after revocation");
  } finally {
    await context.close();
  }

  const gpcContext = await browser.newContext({
    viewport: { width: 360, height: 800 },
    reducedMotion: "reduce",
    locale: "en-US",
  });
  const gpcBatches = [];
  await gpcContext.addInitScript(() => {
    Object.defineProperty(navigator, "globalPrivacyControl", {
      configurable: true,
      get: () => true,
    });
  });
  await installAnalyticsCapture(gpcContext, gpcBatches);
  const gpcPage = await gpcContext.newPage();

  try {
    await gpcPage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const gpcDialog = gpcPage.getByRole("dialog", { name: "Cookies & analytics" });
    await gpcDialog.waitFor({ state: "visible", timeout: 20_000 });
    assert(await gpcPage.getByRole("button", { name: "Accept analytics" }).count() === 0, "GPC still exposes analytics opt-in");
    assert(await gpcDialog.getByText("Your browser privacy signal is on", { exact: false }).isVisible(), "GPC explanation is missing");
    await gpcPage.getByRole("button", { name: "Necessary only" }).click();
    await gpcPage.waitForTimeout(500);
    const gpcStorage = await readAnalyticsStorage(gpcPage);
    const gpcConsent = JSON.parse(gpcStorage.consent ?? "null");
    assert(gpcConsent?.status === "denied", "GPC Necessary only choice was not persisted");
    assert(gpcStorage.visitor === null && gpcStorage.session === null && gpcStorage.outbox === null, "GPC created analytics identifiers");
    assert(gpcBatches.length === 0, `GPC sent ${gpcBatches.length} analytics request(s)`);
  } finally {
    await gpcContext.close();
  }
} finally {
  await browser.close();
}

console.log("Analytics consent smoke passed: pre-consent silence, strict opt-in batch, query redaction, revocation cleanup, and GPC blocking.");
