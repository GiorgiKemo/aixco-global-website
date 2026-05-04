import { describe, expect, it } from "vitest";
import { aixcoLiveAssetDetails, aixcoLiveImages } from "./aixco-live-assets";

describe("aixcoLiveImages", () => {
  it("keeps the full generated About artwork while using compressed web images elsewhere", () => {
    expect(aixcoLiveImages.aboutArchitecture).toContain("batumip.png");
    expect(aixcoLiveImages.batumiGuru).toContain("guru.webp");
    expect(aixcoLiveImages.batumiOtium).toContain("otium-reverance.webp");
  });

  it("publishes the clickable asset-detail catalogs and source images", () => {
    expect(aixcoLiveAssetDetails.dubaiFundOne).toContain("/images/fund/fund1.jpeg");
    expect(aixcoLiveAssetDetails.dubaiFundTwo).toContain("/images/fund2.png");
    expect(aixcoLiveAssetDetails.guruCatalog).toContain("/documents/guru-catalog.jpeg");
    expect(aixcoLiveAssetDetails.otiumCatalog).toContain("/documents/otium-catalog.jpeg");
  });
});
