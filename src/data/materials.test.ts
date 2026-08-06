import { describe, expect, it } from "vitest";
import type { Lang } from "@/i18n/languages";
import {
  getMaterialDownloadsForLanguage,
  materialDownloads,
  resolveMaterialDownload,
  resolveMaterialTitle,
} from "./materials";

const currentProjectMaterial = materialDownloads.find(
  (material) => material.id === "current-project-brochure",
);

describe("public material downloads", () => {
  it("publishes the current-project brochure through the clean public URL", () => {
    expect(materialDownloads).toContainEqual(
      expect.objectContaining({
        id: "current-project-brochure",
        title: "Reverance Brochure",
        format: "PDF",
        href: "/aixco-global-op2/documents/reverance-brochure-en.pdf",
        fileName: "Reverance-brochure-EN.pdf",
      }),
    );
  });

  it("keeps the retired client brochure unpublished", () => {
    expect(materialDownloads.map((material) => material.id)).not.toContain("client-brochure");
  });

  it("keeps legacy Dubai image downloads out of the materials list", () => {
    expect(materialDownloads.map((material) => material.id)).not.toContain("eden-house-reference");
    expect(materialDownloads.map((material) => material.id)).not.toContain(
      "dubai-healthcare-reference",
    );
  });

  it.each([
    ["en", "en", "EN"],
    ["de", "de", "DE"],
    ["pl", "pl", "PL"],
    ["sl", "sl", "SL"],
    ["ru", "ru", "RU"],
  ] satisfies [Lang, string, string][])(
    "serves the localized catalog to the %s materials section",
    (lang, assetLocale, fileLocale) => {
      expect(currentProjectMaterial).toBeDefined();
      expect(resolveMaterialDownload(currentProjectMaterial!, lang)).toEqual({
        href: `/aixco-global-op2/documents/reverance-brochure-${assetLocale}.pdf`,
        fileName: `Reverance-brochure-${fileLocale}.pdf`,
      });
    },
  );

  it("publishes only the two currently featured English guides", () => {
    const guides = getMaterialDownloadsForLanguage("en").filter(
      (material) => material.localizedDownloads,
    );

    expect(guides.map((material) => resolveMaterialTitle(material, "en"))).toEqual([
      "AIXCO Medical Tourism Guide",
      "AIXCO Leisure Activities",
    ]);
    expect(guides.map((material) => resolveMaterialTitle(material, "en")).join(" ")).not.toMatch(
      /edition|july|2026/i,
    );
  });

  it("serves only the matching two German guides on the German site", () => {
    const guides = getMaterialDownloadsForLanguage("de").filter(
      (material) => material.localizedDownloads,
    );

    expect(guides.map((material) => resolveMaterialTitle(material, "de"))).toEqual([
      "AIXCO Leitfaden für Medizintourismus",
      "AIXCO Freizeitaktivitäten",
    ]);
    expect(resolveMaterialDownload(guides[0]!, "de")).toEqual({
      href: "/aixco-global-op2/documents/aixco-leitfaden-medizintourismus-de.pdf",
      fileName: "AIXCO-Leitfaden-fuer-Medizintourismus.pdf",
    });
    expect(guides.map((material) => resolveMaterialTitle(material, "de")).join(" ")).not.toMatch(
      /ausgabe|juli|2026/i,
    );
  });

  it.each(["pl", "sl", "ru"] satisfies Lang[])(
    "does not substitute English-only guides on the %s site",
    (lang) => {
      expect(
        getMaterialDownloadsForLanguage(lang).some((material) => material.localizedDownloads),
      ).toBe(false);
    },
  );
});
