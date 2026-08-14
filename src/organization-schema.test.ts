import { describe, expect, it } from "vitest";
import { buildHomeStructuredData } from "@/app/page";
import { siteContentDefaults } from "@/lib/backend/site-content";

describe("homepage organization identity schema", () => {
  it("identifies AIXCO.Global as the real-estate entity without changing rendered copy", () => {
    const data = buildHomeStructuredData("https://www.aixco.global", siteContentDefaults.company);
    const graph = data["@graph"];
    const organization = graph.find((entry) => entry["@type"] instanceof Array && entry["@type"].includes("Organization"));
    const website = graph.find((entry) => entry["@type"] === "WebSite");

    expect(organization).toMatchObject({
      "@id": "https://www.aixco.global/#organization",
      name: "AIXCO.Global",
      alternateName: ["AIXCO Global", "AIXCO.Global Real Estate"],
      areaServed: ["Vienna", "Dubai", "Batumi"],
      knowsAbout: expect.arrayContaining(["Real estate investment", "Property brokerage"]),
      brand: { "@id": "https://www.aixco.global/#brand" },
      address: {
        "@type": "PostalAddress",
        postalCode: "1050",
        addressCountry: "AT",
      },
    });
    expect(website).toMatchObject({
      "@id": "https://www.aixco.global/#website",
      about: { "@id": "https://www.aixco.global/#organization" },
    });
  });
});
