import { describe, expect, it } from "vitest";
import { aixcoLiveImages } from "./aixco-live-assets";

describe("aixcoLiveImages", () => {
  it("uses compressed web images for large section artwork", () => {
    expect(aixcoLiveImages.aboutArchitecture).toContain("batumip.webp");
    expect(aixcoLiveImages.batumiGuru).toContain("guru.webp");
    expect(aixcoLiveImages.batumiOtium).toContain("otium-reverance.webp");
  });
});
