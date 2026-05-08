import { describe, expect, it } from "vitest";
import { buildSiteContent, fetchSiteContent, siteContentDefaults } from "./site-content";

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

  it("sanitizes published CMS URL fields before components render them", () => {
    const content = buildSiteContent([
      {
        section: "company",
        entry_key: "profile",
        payload: {
          ...siteContentDefaults.company,
          email: "info@aixco.global\r\nbcc:attacker@example.com",
          socials: {
            ...siteContentDefaults.company.socials,
            instagram: "javascript:alert(1)",
          },
          portals: {
            ...siteContentDefaults.company.portals,
            customerLogin: "https://workw.com.evil.example/realestate/customer/login",
          },
        },
      },
      {
        section: "news_ticker",
        entry_key: "items",
        payload: [
          {
            ...siteContentDefaults.newsTickerItems[0],
            href: "https://evil.example/op2/annual-property-growth-batumi.html",
          },
        ],
      },
      {
        section: "batumi_properties",
        entry_key: "items",
        payload: [
          {
            ...siteContentDefaults.batumiProperties[0],
            url: "javascript:alert(1)",
          },
        ],
      },
    ]);

    expect(content.company.email).toBe(siteContentDefaults.company.email);
    expect(content.company.socials.instagram).toBe(siteContentDefaults.company.socials.instagram);
    expect(content.company.portals.customerLogin).toBe(siteContentDefaults.company.portals.customerLogin);
    expect(content.newsTickerItems[0].href).toBe(siteContentDefaults.newsTickerItems[0].href);
    expect(content.batumiProperties[0].url).toBe(siteContentDefaults.batumiProperties[0].url);
  });
});
