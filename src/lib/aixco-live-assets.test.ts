import { describe, expect, it } from "vitest";
import {
  aixcoBatumiGalleryVideos,
  aixcoDubaiEdenHouseCanalGallery,
  aixcoDubaiEdenHouseParkGallery,
  aixcoDubaiHealthcareGallery,
  aixcoLiveAssetDetails,
  aixcoLiveImages,
  aixcoLiveVideoPreviews,
} from "./aixco-live-assets";

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
    expect(aixcoLiveVideoPreviews.batumiBuy).toContain("/aixco-global-op2/media/previews/batumibuy-preview.mp4");
    expect(aixcoLiveVideoPreviews.guruBatumi).toContain("/aixco-global-op2/media/previews/guru-batumi-preview.mp4");
    expect(aixcoLiveVideoPreviews.otium).toContain("/aixco-global-op2/media/previews/otium-preview.mp4");
    expect(aixcoBatumiGalleryVideos.every(({ previewSrc }) => previewSrc.includes("/media/batumi-gallery/previews/"))).toBe(true);
    expect(aixcoBatumiGalleryVideos.every(({ src, previewSrc }) => src !== previewSrc)).toBe(true);
  });
});
