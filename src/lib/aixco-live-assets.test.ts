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
    expect(aixcoLiveImages.aboutArchitecture).toContain("batumip-upscaled.webp");
    expect(aixcoLiveImages.batumiBuyPoster).toContain("batumi1-poster.webp");
    expect(aixcoLiveImages.batumiCurrentProject).toContain("current-project-reverance.webp");
    expect(aixcoLiveImages.batumiMosaicDuskAerialCentral).toContain("batumi-dusk-aerial-central.webp");
    expect(aixcoLiveImages.batumiMosaicEveningWaterfront).toContain("batumi-evening-waterfront.webp");
    expect(aixcoLiveImages.batumiMosaicThumbNightSkyline).toContain("/batumi-mosaic-thumbs/batumi-night-skyline.webp");
    expect(aixcoLiveImages.batumiMosaicThumbBlueTower).toContain("/batumi-mosaic-thumbs/batumi-blue-tower.webp");
  });

  it("publishes the downloadable source images", () => {
    expect(aixcoLiveAssetDetails.dubaiFundOne).toContain("/images/fund/fund1.jpeg");
    expect(aixcoLiveAssetDetails.dubaiFundTwo).toContain("/images/fund2.png");
    expect(aixcoLiveAssetDetails.clientBrochurePdf).toContain("/documents/aixco-client-brochure.pdf");
  });

  it("publishes grouped Dubai asset galleries from the OP2 source files", () => {
    expect(aixcoDubaiEdenHouseCanalGallery[0]).toMatchObject({
      src: expect.stringContaining("/aixco-global-op2/images/optimized/fund1-upscaled.webp"),
      title: "Eden House The Canal aerial overview",
    });
    expect(aixcoDubaiEdenHouseCanalGallery[1].src).toContain("/aixco-global-op2/images/optimized/fund8-upscaled.webp");
    expect(aixcoDubaiEdenHouseCanalGallery.at(-1)?.src).toContain("/aixco-global-op2/images/optimized/fund20-upscaled.webp");
    expect(aixcoDubaiEdenHouseParkGallery[0]).toMatchObject({
      src: expect.stringContaining("/aixco-global-op2/images/fund/fund1.jpeg"),
      title: "Eden House The Park construction progress",
    });
    expect(aixcoDubaiHealthcareGallery[0]).toMatchObject({
      src: expect.stringContaining("/aixco-global-op2/images/optimized/fund2-upscaled.webp"),
      title: "Dubai Healthcare City asset image",
    });
    expect(aixcoDubaiHealthcareGallery[1].src).toContain("/aixco-global-op2/images/optimized/fund32-upscaled.webp");
    expect(aixcoDubaiHealthcareGallery[2].src).toContain("/aixco-global-op2/images/optimized/fund33-upscaled.webp");
    expect(aixcoDubaiHealthcareGallery[3].src).toContain("/aixco-global-op2/images/optimized/fund31-upscaled.webp");
    expect(aixcoDubaiHealthcareGallery.every(({ src }) => src.endsWith("?v=healthcare-gallery-20260506"))).toBe(true);
  });

  it("publishes lightweight preview videos next to full media videos", () => {
    expect(aixcoLiveVideoPreviews.batumiOverview).toContain("/aixco-global-op2/media/batumi-gallery/previews/batumi2-preview.mp4");
    expect(aixcoLiveVideoPreviews.bonds).toContain("/aixco-global-op2/media/previews/bonds-preview.mp4");
    expect(aixcoLiveVideoPreviews.batumiBuy).toContain("/aixco-global-op2/media/batumi-gallery/previews/batumi1-preview.mp4");
    expect(aixcoLiveVideoPreviews.currentProject).toContain("/aixco-global-op2/media/previews/current-project-preview.mp4");
  });
});
