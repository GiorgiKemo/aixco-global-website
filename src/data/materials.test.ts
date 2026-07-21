import { describe, expect, it } from "vitest";
import type { Lang } from "@/i18n/languages";
import { materialDownloads, resolveMaterialDownload } from "./materials";

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

  it("serves the German catalog to the German materials section", () => {
    expect(currentProjectMaterial).toBeDefined();
    expect(resolveMaterialDownload(currentProjectMaterial!, "de")).toEqual({
      href: "/aixco-global-op2/documents/reverance-brochure-de.pdf",
      fileName: "Reverance-brochure-DE.pdf",
    });
  });

  it.each(["en", "pl", "sl", "ru"] satisfies Lang[])(
    "keeps the English catalog fallback for %s materials",
    (lang) => {
      expect(currentProjectMaterial).toBeDefined();
      expect(resolveMaterialDownload(currentProjectMaterial!, lang)).toEqual({
        href: "/aixco-global-op2/documents/reverance-brochure-en.pdf",
        fileName: "Reverance-brochure-EN.pdf",
      });
    },
  );
});
