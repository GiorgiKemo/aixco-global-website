import { describe, expect, it } from "vitest";
import { fetchSiteContent, siteContentDefaults } from "./site-content";

describe("site content backend", () => {
  it("keeps the current website content available as a fallback", () => {
    expect(siteContentDefaults.company.name).toBe("AIXCO.Global");
    expect(siteContentDefaults.metrics.length).toBeGreaterThan(0);
    expect(siteContentDefaults.partners.some((partner) => partner.name === "Global Partners")).toBe(true);
    expect(siteContentDefaults.newsTickerItems.length).toBeGreaterThan(0);
  });

  it("does not call Supabase in test mode", async () => {
    const result = await fetchSiteContent();

    expect(result.ok).toBe(false);
    expect(result.source).toBe("fallback");
    expect(result.content.company.email).toBe("info@aixco.global");
  });
});
