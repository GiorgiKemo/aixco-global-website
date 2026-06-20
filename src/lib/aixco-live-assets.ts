const withBaseUrl = (path: string) => {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  const normalizedPath = path.replace(/^\//, "");
  return `${baseUrl}/${normalizedPath}`;
};

const aixcoLivePath = (path: string) => withBaseUrl(`aixco-global-op2/${path}`);

const liveImageBase = aixcoLivePath("images");
const optimizedImageBase = aixcoLivePath("images/optimized");
const optimizedVideoBase = aixcoLivePath("media");
const previewVideoBase = aixcoLivePath("media/previews");
const documentBase = aixcoLivePath("documents");
const batumiGalleryBase = `${optimizedVideoBase}/batumi-gallery`;
const batumiGalleryPreviewBase = `${batumiGalleryBase}/previews`;
const healthcareGalleryVersion = "healthcare-gallery-20260506";

const versionHealthcareImage = (src: string) => `${src}?v=${healthcareGalleryVersion}`;

export const aixcoLiveImages = {
  batumi: `${optimizedImageBase}/batumi.webp`,
  aboutArchitecture: `${optimizedImageBase}/batumip.webp`,
  contact: `${batumiGalleryBase}/herovideo-poster.webp`,
  dubaiEdenHouse: `${liveImageBase}/fund/fund1.jpeg`,
  dubaiEdenHouseRendering: `${liveImageBase}/fund1.png`,
  dubaiHealthcare: `${optimizedImageBase}/fund2.webp`,
  dubaiHealthcareMap: `${optimizedImageBase}/dubai-map-fund-2.webp`,
  transactionBackdrop: `${optimizedImageBase}/trans.webp`,
  batumiPortPoster: `${batumiGalleryBase}/batumi-short-poster.webp`,
  batumiOverviewPoster: `${batumiGalleryBase}/batumi2-poster.webp`,
  batumiBuyPoster: `${batumiGalleryBase}/batumi1-poster.webp`,
  batumiSeafrontPoster: `${batumiGalleryBase}/batumi3-poster.webp`,
  batumiUrbanPoster: `${batumiGalleryBase}/batumi4-poster.webp`,
  batumiFogPoster: `${batumiGalleryBase}/batumi5-poster.webp`,
  batumiNightRoadPoster: `${batumiGalleryBase}/herovideo-poster.webp`,
  batumiMosaicDayAerial: `${liveImageBase}/batumi-mosaic-hd/batumi-day-aerial.jpg`,
  batumiMosaicNightSkyline: `${liveImageBase}/batumi-mosaic-hd/batumi-night-skyline.jpg`,
  batumiMosaicNatureAerial: `${liveImageBase}/batumi-mosaic-hd/batumi-nature-aerial.jpg`,
  batumiMosaicBlueTower: `${liveImageBase}/batumi-mosaic-hd/batumi-blue-tower.jpg`,
  batumiMosaicModernCoastline: `${liveImageBase}/batumi-mosaic-hd/batumi-modern-coastline.jpg`,
  batumiMosaicSunsetCoastline: `${liveImageBase}/batumi-mosaic-hd/batumi-sunset-coastline.jpg`,
  batumiMosaicDuskAerialCentral: `${liveImageBase}/batumi-mosaic-hd/batumi-dusk-aerial-central.webp`,
  batumiMosaicDuskAerialCoastline: `${liveImageBase}/batumi-mosaic-hd/batumi-dusk-aerial-coastline.webp`,
  batumiMosaicSunsetPanorama: `${liveImageBase}/batumi-mosaic-hd/batumi-sunset-panorama.webp`,
  batumiMosaicGoldenHourCoastline: `${liveImageBase}/batumi-mosaic-hd/batumi-golden-hour-coastline.webp`,
  batumiMosaicEveningWaterfront: `${liveImageBase}/batumi-mosaic-hd/batumi-evening-waterfront.webp`,
  batumiCurrentProject: `${optimizedImageBase}/current-project-reverance.webp`,
  teamBenjamin: `${optimizedImageBase}/benjamin.webp`,
  teamOwais: `${optimizedImageBase}/owais.webp`,
  teamWalter: `${optimizedImageBase}/walter.webp`,
} as const;

export const aixcoLiveVideos = {
  batumiOverview: `${batumiGalleryBase}/batumi2.mp4`,
  batumiBuy: `${batumiGalleryBase}/batumi1.mp4`,
  bonds: `${optimizedVideoBase}/bonds-optimized.mp4`,
  dubaiHero: aixcoLivePath("videos/aixco-group-dubai-hero.mp4"),
  fundOne: `${optimizedVideoBase}/fund1-optimized.mp4`,
  fundTwo: `${optimizedVideoBase}/fund2-optimized.mp4`,
  fundThree: `${optimizedVideoBase}/fund3-optimized.mp4`,
  tempo: `${optimizedVideoBase}/tempo-optimized.mp4`,
  currentProject: `${optimizedVideoBase}/current-project-optimized.mp4`,
} as const;

export const aixcoLiveVideoPreviews = {
  batumiOverview: `${batumiGalleryPreviewBase}/batumi2-preview.mp4`,
  batumiBuy: `${batumiGalleryPreviewBase}/batumi1-preview.mp4`,
  bonds: `${previewVideoBase}/bonds-preview.mp4`,
  fundOne: `${previewVideoBase}/fund1-preview.mp4`,
  fundTwo: `${previewVideoBase}/fund2-preview.mp4`,
  fundThree: `${previewVideoBase}/fund3-preview.mp4`,
  currentProject: `${previewVideoBase}/current-project-preview.mp4`,
} as const;

export const aixcoHeroBackgroundVideo = {
  src: `${optimizedVideoBase}/batumi-hero-landscape-optimized.mp4`,
  mobileSrc: `${optimizedVideoBase}/batumi-hero-landscape-mobile.mp4`,
  poster: `${optimizedVideoBase}/batumi-hero-landscape-poster.webp`,
  title: "Batumi hero landscape",
} as const;

export const aixcoDubaiHeroVideo = {
  src: aixcoLiveVideos.dubaiHero,
  poster: aixcoLivePath("videos/aixco-group-dubai-hero-poster.webp"),
  title: "Dubai Burj Khalifa aerial",
} as const;

export const aixcoLiveDocuments = {
  clientBrochure: `${documentBase}/aixco-client-brochure.pdf`,
  currentProject: `${documentBase}/current-project.pdf`,
} as const;

export const aixcoLiveAssetDetails = {
  dubaiFundOne: `${liveImageBase}/fund/fund1.jpeg`,
  dubaiFundTwo: `${liveImageBase}/fund2.png`,
  clientBrochurePdf: aixcoLiveDocuments.clientBrochure,
  currentProjectCatalog: `${documentBase}/current-project-catalog.jpeg`,
  currentProjectPdf: aixcoLiveDocuments.currentProject,
} as const;

export const aixcoDubaiEdenHouseCanalGallery = [
  { src: `${liveImageBase}/fund1.png`, title: "Eden House The Canal aerial overview" },
  { src: `${liveImageBase}/fund/fund8.jpeg`, title: "Eden House The Canal entrance wall" },
  { src: `${liveImageBase}/fund/fund9.jpeg`, title: "Eden House The Canal completed facade" },
  { src: `${liveImageBase}/fund/fund13.jpeg`, title: "Eden House The Canal residence facade" },
  { src: `${liveImageBase}/fund/fund14.jpeg`, title: "Eden House The Canal waterfront frontage" },
  { src: `${liveImageBase}/fund/fund15.jpeg`, title: "Eden House The Canal villa row" },
  { src: `${liveImageBase}/fund/fund16.jpeg`, title: "Eden House The Canal promenade view" },
  { src: `${liveImageBase}/fund/fund17.jpeg`, title: "Eden House The Canal waterfront elevation" },
  { src: `${liveImageBase}/fund/fund18.jpeg`, title: "Eden House The Canal villa detail" },
  { src: `${liveImageBase}/fund/fund19.jpeg`, title: "Eden House The Canal waterside block" },
  { src: `${liveImageBase}/fund/fund20.jpeg`, title: "Eden House The Canal signage" },
] as const;

export const aixcoDubaiEdenHouseParkGallery = [
  { src: `${liveImageBase}/fund/fund1.jpeg`, title: "Eden House The Park construction progress" },
  { src: `${liveImageBase}/fund/fund2.jpeg`, title: "Eden House The Park street construction" },
  { src: `${liveImageBase}/fund/fund3.jpeg`, title: "Eden House The Park structure progress" },
  { src: `${liveImageBase}/fund/fund4.jpeg`, title: "Eden House The Park branded site fence" },
  { src: `${liveImageBase}/fund/fund5.jpeg`, title: "Eden House The Park road approach" },
  { src: `${liveImageBase}/fund/fund6.jpeg`, title: "Eden House The Park active works" },
  { src: `${liveImageBase}/fund/fund7.jpeg`, title: "Eden House The Park tower progress" },
  { src: `${liveImageBase}/fund/fund10.jpeg`, title: "Eden House The Park construction streetscape" },
  { src: `${liveImageBase}/fund/fund11.jpeg`, title: "Eden House The Park low-rise residences" },
  { src: `${liveImageBase}/fund/fund12.jpeg`, title: "Eden House The Park villa promenade" },
] as const;

export const aixcoDubaiHealthcareGallery = [
  { src: versionHealthcareImage(`${liveImageBase}/fund2.png`), title: "Dubai Healthcare City asset image" },
  { src: versionHealthcareImage(`${liveImageBase}/fund/fund32.png`), title: "Dubai Healthcare City source site image" },
  { src: versionHealthcareImage(`${liveImageBase}/fund/fund33.png`), title: "Dubai Healthcare City skyline site context" },
  { src: versionHealthcareImage(`${liveImageBase}/fund/fund31.png`), title: "Dubai Healthcare City original site location map" },
  { src: versionHealthcareImage(`${optimizedImageBase}/dubai-map-fund-2.webp`), title: "Dubai Healthcare City legacy location map" },
] as const;

export const aixcoLiveLogos = {
  aixcoGlobal: `${liveImageBase}/AIXCOGlobalWlong.png`,
  aixcoMark: `${liveImageBase}/AIXW.webp`,
  globalPartners: `${liveImageBase}/Globalpartners.png`,
  globalPartnersMarquee: `${liveImageBase}/Globalpartners-marquee.png`,
  isp: `${liveImageBase}/isp.svg`,
  workwise: `${liveImageBase}/ww.png`,
  cleanElements: `${liveImageBase}/cleanelement.png`,
  revanta: `${liveImageBase}/revanta.png`,
  gti: `${liveImageBase}/gti.png`,
  bluerock: `${liveImageBase}/bluerock.png`,
  daewoo: `${liveImageBase}/daewoo.png`,
  iso: `${liveImageBase}/iso-logo.png`,
} as const;

export const aixcoLivePartnerPeople = {
  butti: `${liveImageBase}/butti.png`,
  rashid: `${liveImageBase}/rashid.png`,
  bader: `${liveImageBase}/bader.png`,
  warren: `${liveImageBase}/warren.png`,
} as const;
