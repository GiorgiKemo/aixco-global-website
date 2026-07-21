import { describe, expect, it } from "vitest";
import {
  aixcoCurrentProjectBrochureDownloads,
  aixcoCurrentProjectGalleryImages,
  aixcoDubaiEdenHouseCanalGallery,
  aixcoDubaiEdenHouseParkGallery,
  aixcoDubaiHealthcareGallery,
  aixcoLiveAssetDetails,
  aixcoLiveImages,
  aixcoLiveVideoPreviews,
  getCurrentProjectBrochureDownload,
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
    expect(aixcoLiveImages.currentProjectExterior).toContain("/images/project-gallery/reverance-exterior.webp");
    expect(aixcoLiveImages.currentProjectTowers).toContain("/images/project-gallery/reverance-towers.webp");
    expect(aixcoLiveImages.currentProjectCourtyard).toContain("/images/project-gallery/reverance-courtyard.webp");
    expect(aixcoLiveImages.currentProjectArrival).toContain("/images/project-gallery/reverance-arrival.webp");
  });

  it("publishes the downloadable source images", () => {
    expect(aixcoLiveAssetDetails.dubaiFundOne).toContain("/images/fund/fund1.jpeg");
    expect(aixcoLiveAssetDetails.dubaiFundTwo).toContain("/images/fund2.png");
  });

  it("publishes the complete lossless current-project gallery and thumbnails", () => {
    expect(aixcoCurrentProjectGalleryImages).toHaveLength(20);
    expect(aixcoCurrentProjectGalleryImages[0].src).toContain(
      "/images/project-gallery-2026/01-hero-exterior.webp",
    );
    expect(aixcoCurrentProjectGalleryImages[0].thumbnailSrc).toContain(
      "/images/project-gallery-2026/thumbs/01-hero-exterior.webp",
    );
    expect(aixcoCurrentProjectGalleryImages.at(-1)?.src).toContain(
      "/images/project-gallery-2026/20-sauna.webp",
    );
  });

  it("publishes locale-specific current-project brochure assets", () => {
    expect(aixcoCurrentProjectBrochureDownloads.en).toEqual({
      href: "/aixco-global-op2/documents/reverance-brochure-en.pdf",
      fileName: "Reverance-brochure-EN.pdf",
    });
    expect(aixcoCurrentProjectBrochureDownloads.de).toEqual({
      href: "/aixco-global-op2/documents/reverance-brochure-de.pdf",
      fileName: "Reverance-brochure-DE.pdf",
    });
    expect(getCurrentProjectBrochureDownload("de")).toEqual(
      aixcoCurrentProjectBrochureDownloads.de,
    );
    expect(getCurrentProjectBrochureDownload("pl")).toEqual(
      aixcoCurrentProjectBrochureDownloads.en,
    );
    expect(getCurrentProjectBrochureDownload("pl", { fallbackToEnglish: false })).toBeNull();
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
