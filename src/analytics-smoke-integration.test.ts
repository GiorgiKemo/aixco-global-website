import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8").replace(/\r\n/g, "\n");
}

const browserGates = [
  "scripts/render-smoke.mjs",
  "scripts/render-locales-smoke.mjs",
  "scripts/verify-language-layout.mjs",
  "scripts/verify-dubai-scroll.mjs",
  "scripts/verify-dubai-metric-layout.mjs",
  "scripts/verify-nav-scale.mjs",
  "scripts/verify-mobile-experience.mjs",
  "scripts/verify-mobile-only-scope.mjs",
  "scripts/verify-currency-glyph-alignment.mjs",
];

describe("analytics consent browser-smoke integration", () => {
  it.each(browserGates)("pre-seeds a current Necessary-only choice in %s", (path) => {
    const script = source(path);

    expect(script).toContain('from "./lib/analytics-consent.mjs"');
    expect(script).toContain("installNecessaryOnlyAnalyticsConsent(");
  });

  it("keeps the helper tied to application constants and clears every analytics identifier", () => {
    const helper = source("scripts/lib/analytics-consent.mjs");

    expect(helper).toContain('from "../../src/lib/analytics/constants.ts"');
    expect(helper).toContain('status: "denied"');
    expect(helper).toContain("localStorage.removeItem(visitorKey)");
    expect(helper).toContain("sessionStorage.removeItem(sessionKey)");
    expect(helper).toContain("sessionStorage.removeItem(outboxKey)");
  });

  it("runs the dedicated consent smoke in the production browser gate", () => {
    const packageJson = JSON.parse(source("package.json")) as {
      scripts?: Record<string, string>;
    };
    const ci = source(".github/workflows/ci.yml");
    const smoke = source("scripts/verify-analytics-consent.mjs");

    expect(packageJson.scripts?.["smoke:analytics"]).toBe(
      "node scripts/verify-analytics-consent.mjs",
    );
    expect(ci).toContain("npm run smoke:analytics");
    expect(smoke).toContain("analytics sent ${batches.length} request(s) before consent");
    expect(smoke).toContain("validateInitialBatch(batches[0])");
    expect(smoke).toContain("private query data leaked into analytics");
    expect(smoke).toContain("revocation did not clear analytics identifiers/outbox");
    expect(smoke).toContain("GPC sent ${gpcBatches.length} analytics request(s)");
  });
});
