import { describe, expect, it } from "vitest";
import {
  aixcoDubaiEdenHouseCanalGallery,
  aixcoDubaiEdenHouseParkGallery,
  aixcoDubaiHealthcareGallery,
  aixcoLiveAssetDetails,
  aixcoLiveImages,
  aixcoLiveVideoPreviews,
} from "./aixco-live-assets";

describe("aixcoLiveImages", () => {
  it("uses compressed web images for large rendered surfaces", () => {
    expect(aixcoLiveImages.aboutArchitecture).toContain("batumip.webp");
    expect(aixcoLiveImages.batumiBuyPoster).toContain("batumi1-poster.webp");
    expect(aixcoLiveImages.batumiCurrentProject).toContain("current-project-reverance.webp");
    expect(aixcoLiveImages.batumiMosaicDuskAerialCentral).toContain("batumi-dusk-aerial-central.webp");
    expect(aixcoLiveImages.batumiMosaicEveningWaterfront).toContain("batumi-evening-waterfront.webp");
  });

  it("publishes the clickable asset-detail catalogs and source images", () => {
    expect(aixcoLiveAssetDetails.dubaiFundOne).toContain("/images/fund/fund1.jpeg");
    expect(aixcoLiveAssetDetails.dubaiFundTwo).toContain("/images/fund2.png");
    expect(aixcoLiveAssetDetails.clientBrochurePdf).toContain("/documents/aixco-client-brochure.pdf");
    expect(aixcoLiveAssetDetails.currentProjectCatalog).toContain("/documents/current-project-catalog.jpeg");
  });

  it("publishes grouped Dubai asset galleries from the OP2 source files", () => {
    expect(aixcoDubaiEdenHouseCanalGallery[0]).toMatchObject({
      src: expect.stringContaining("/aixco-global-op2/images/fund1.png"),
      title: "Eden House The Canal aerial overview",
    });
    expect(aixcoDubaiEdenHouseParkGallery[0]).toMatchObject({
      src: expect.stringContaining("/aixco-global-op2/images/fund/fund1.jpeg"),
      title: "Eden House The Park construction progress",
    });
    expect(aixcoDubaiHealthcareGallery[0]).toMatchObject({
      src: expect.stringContaining("/aixco-global-op2/images/fund2.png"),
      title: "Dubai Healthcare City asset image",
    });
    expect(aixcoDubaiHealthcareGallery.every(({ src }) => src.endsWith("?v=healthcare-gallery-20260506"))).toBe(true);
  });

  it("publishes lightweight preview videos next to full media videos", () => {
    expect(aixcoLiveVideoPreviews.batumiOverview).toContain("/aixco-global-op2/media/batumi-gallery/previews/batumi2-preview.mp4");
    expect(aixcoLiveVideoPreviews.bonds).toContain("/aixco-global-op2/media/previews/bonds-preview.mp4");
    expect(aixcoLiveVideoPreviews.batumiBuy).toContain("/aixco-global-op2/media/batumi-gallery/previews/batumi1-preview.mp4");
    expect(aixcoLiveVideoPreviews.currentProject).toContain("/aixco-global-op2/media/previews/current-project-preview.mp4");
  });
});
