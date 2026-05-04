import { describe, expect, it } from "vitest";
import { aixcoLiveImages } from "./aixco-live-assets";

describe("aixcoLiveImages", () => {
  it("keeps the full generated About artwork while using compressed web images elsewhere", () => {
    expect(aixcoLiveImages.aboutArchitecture).toContain("batumip.png");
    expect(aixcoLiveImages.batumiGuru).toContain("guru.webp");
    expect(aixcoLiveImages.batumiOtium).toContain("otium-reverance.webp");
  });
});
