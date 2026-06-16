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
            website: "https://evil.example/",
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
    expect(content.company.socials.website).toBe(siteContentDefaults.company.socials.website);
    expect(content.company.socials.instagram).toBe(siteContentDefaults.company.socials.instagram);
    expect(content.company.portals.customerLogin).toBe(siteContentDefaults.company.portals.customerLogin);
    expect(content.newsTickerItems[0].href).toBe(siteContentDefaults.newsTickerItems[0].href);
    expect(content.batumiProperties[0].url).toBe(siteContentDefaults.batumiProperties[0].url);
  });

  it("keeps stale CMS investment copy from overriding the real estate brief", () => {
    const content = buildSiteContent([
      {
        section: "participation_routes",
        entry_key: "items",
        payload: [
          {
            id: "bond",
            title: "Buy the AIXCO 6% Bond",
            video: "bonds",
            body: "Purchase the AIXCO Bond with a guaranteed 30% return over 5 years.",
            cta: "Register",
          },
        ],
      },
      {
        section: "faq_groups",
        entry_key: "items",
        payload: [
          {
            group: "Customer",
            description: "Investment opportunities.",
            items: [{ q: "What is the minimum investment amount?", a: "The entry point starts from €1,000." }],
          },
        ],
      },
    ]);

    expect(content.participationRoutes.map((route) => route.id)).toEqual(["apartment", "brokerage", "management"]);
    expect(JSON.stringify(content.participationRoutes)).not.toMatch(/bond|guaranteed|30% return/i);
    expect(content.faqGroups[0].group).toBe("Real Estate Investment");
    expect(content.faqGroups[0].items[0].q).toBe("How do I get started?");
    expect(content.faqGroups[0].items[1].q).toBe("What is the minimum investment amount?");
    expect(content.faqGroups[0].items[1].a).toContain("€5,000");
    expect(content.faqGroups[0].items.some((item) => item.q === "Can foreigners buy property in Batumi, Georgia?")).toBe(true);
  });

  it("uses distinct participation media for each route", () => {
    expect(siteContentDefaults.participationRoutes.map((route) => route.video)).toEqual([
      "batumiBuy",
      "batumiOverview",
      "currentProject",
    ]);
    expect(new Set(siteContentDefaults.participationRoutes.map((route) => route.video)).size).toBe(
      siteContentDefaults.participationRoutes.length,
    );
  });
});
