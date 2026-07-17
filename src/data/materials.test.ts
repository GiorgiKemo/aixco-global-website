import { describe, expect, it } from "vitest";
import { materialDownloads } from "./materials";

describe("public material downloads", () => {
  it("does not publish the retired client or current-project brochures", () => {
    expect(materialDownloads.map((material) => material.id)).not.toContain("client-brochure");
    expect(materialDownloads.map((material) => material.id)).not.toContain("current-project-brochure");
    expect(materialDownloads.some((material) => material.format === "PDF")).toBe(false);
    expect(materialDownloads.map((material) => material.title).join(" ")).not.toMatch(/brochure/i);
  });
});
