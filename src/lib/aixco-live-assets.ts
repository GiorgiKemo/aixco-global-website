import type { Lang } from "@/i18n/languages";

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
const iconBase = aixcoLivePath("icons");
const batumiGalleryBase = `${optimizedVideoBase}/batumi-gallery`;
const batumiGalleryPreviewBase = `${batumiGalleryBase}/previews`;
const projectGalleryBase = `${liveImageBase}/project-gallery`;
const currentProjectGalleryBase = `${liveImageBase}/project-gallery-2026`;
const healthcareGalleryVersion = "healthcare-gallery-20260506";
const heroVideoVersion = "hero-batumi-web-20260715-p1";
const currentProjectHostedVideoBase =
  "https://media.githubusercontent.com/media/GiorgiKemo/aixco-global-website/main/public/aixco-global-op2/media";

const versionHealthcareImage = (src: string) => `${src}?v=${healthcareGalleryVersion}`;

export const aixcoLiveImages = {
  batumi: `${optimizedImageBase}/batumi.webp`,
  aboutArchitecture: `${optimizedImageBase}/batumip-upscaled.webp`,
  contact: `${batumiGalleryBase}/herovideo-poster.webp`,
  dubaiEdenHouse: `${liveImageBase}/fund/fund1.jpeg`,
  dubaiEdenHouseRendering: `${optimizedImageBase}/fund1-upscaled.webp`,
  dubaiBurjKhalifaSunset: `${liveImageBase}/dubai-burj-khalifa-sunset-unsplash-original.webp`,
  dubaiHealthcare: `${optimizedImageBase}/fund2-upscaled.webp`,
  dubaiHealthcareMap: `${optimizedImageBase}/dubai-map-fund-2.webp`,
  transactionBackdrop: `${optimizedImageBase}/trans.webp`,
  batumiPortPoster: `${batumiGalleryBase}/batumi-short-poster.webp`,
  batumiOverviewPoster: `${batumiGalleryBase}/batumi2-poster.webp`,
  batumiBuyPoster: `${batumiGalleryBase}/batumi1-poster.webp`,
  batumiSeafrontPoster: `${batumiGalleryBase}/batumi3-poster-upscaled.webp`,
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
  batumiMosaicThumbDuskAerialCentral: `${liveImageBase}/batumi-mosaic-thumbs/batumi-dusk-aerial-central.webp`,
  batumiMosaicThumbDuskAerialCoastline: `${liveImageBase}/batumi-mosaic-thumbs/batumi-dusk-aerial-coastline.webp`,
  batumiMosaicThumbSunsetPanorama: `${liveImageBase}/batumi-mosaic-thumbs/batumi-sunset-panorama.webp`,
  batumiMosaicThumbGoldenHourCoastline: `${liveImageBase}/batumi-mosaic-thumbs/batumi-golden-hour-coastline.webp`,
  batumiMosaicThumbEveningWaterfront: `${liveImageBase}/batumi-mosaic-thumbs/batumi-evening-waterfront.webp`,
  batumiMosaicThumbDayAerial: `${liveImageBase}/batumi-mosaic-thumbs/batumi-day-aerial.webp`,
  batumiMosaicThumbSunsetCoastline: `${liveImageBase}/batumi-mosaic-thumbs/batumi-sunset-coastline.webp`,
  batumiMosaicThumbNightSkyline: `${liveImageBase}/batumi-mosaic-thumbs/batumi-night-skyline.webp`,
  batumiMosaicThumbNatureAerial: `${liveImageBase}/batumi-mosaic-thumbs/batumi-nature-aerial.webp`,
  batumiMosaicThumbBlueTower: `${liveImageBase}/batumi-mosaic-thumbs/batumi-blue-tower.webp`,
  batumiCurrentProject: `${optimizedImageBase}/current-project-reverance.webp`,
  currentProjectTowers: `${projectGalleryBase}/reverance-towers.webp`,
  currentProjectExterior: `${projectGalleryBase}/reverance-exterior.webp`,
  currentProjectCourtyard: `${projectGalleryBase}/reverance-courtyard.webp`,
  currentProjectArrival: `${projectGalleryBase}/reverance-arrival.webp`,
  teamBenjamin: `${optimizedImageBase}/benjamin.webp`,
  teamOwais: `${optimizedImageBase}/owais-20260624-crop.webp`,
  teamWalter: `${optimizedImageBase}/walter.webp`,
} as const;

const currentProjectGalleryFiles = [
  ["project-01", "01-hero-exterior", "Reverance exterior project render"],
  ["project-02", "02-sunset-exterior", "Reverance exterior project render"],
  ["project-03", "03-night-exterior", "Reverance exterior project render"],
  ["project-04", "04-aerial-exterior", "Reverance exterior project render"],
  ["project-05", "05-front-facade", "Reverance residential towers project render"],
  ["project-06", "06-entrance", "Reverance arrival and landscaped exterior project render"],
  ["project-07", "07-balcony-detail", "Reverance residential towers project render"],
  ["project-08", "08-rooftop-sunset", "Reverance residential towers project render"],
  ["project-09", "09-pool-terrace", "Reverance courtyard and pool project render"],
  ["project-10", "10-low-angle-facade", "Reverance residential towers project render"],
  ["project-11", "11-night-arrival", "Reverance arrival and landscaped exterior project render"],
  ["project-12", "12-reception", "Reverance residential towers project render"],
  ["project-13", "13-lobby-lounge", "Reverance residential towers project render"],
  ["project-14", "14-private-lounge", "Reverance residential towers project render"],
  ["project-15", "15-business-lounge", "Reverance residential towers project render"],
  ["project-16", "16-gym", "Reverance residential towers project render"],
  ["project-17", "17-indoor-pool", "Reverance courtyard and pool project render"],
  ["project-18", "18-indoor-pool-wide", "Reverance courtyard and pool project render"],
  ["project-19", "19-garden-pool", "Reverance courtyard and pool project render"],
  ["project-20", "20-sauna", "Reverance residential towers project render"],
] as const;

export const aixcoCurrentProjectGalleryImages = currentProjectGalleryFiles.map(
  ([key, fileName, alt]) => ({
    key,
    src: `${currentProjectGalleryBase}/${fileName}.webp`,
    thumbnailSrc: `${currentProjectGalleryBase}/thumbs/${fileName}.webp`,
    alt,
    width: 4096,
    height: 4096,
    objectPosition: "50% 50%",
  }),
);

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
  currentProjectEnglish: `${currentProjectHostedVideoBase}/current-project-english.mp4`,
  currentProjectGerman: `${currentProjectHostedVideoBase}/current-project-german.mp4`,
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
  src: `${optimizedVideoBase}/hero-02-desktop.mp4?v=${heroVideoVersion}`,
  mobileSrc: `${optimizedVideoBase}/hero-02-mobile.mp4?v=${heroVideoVersion}`,
  poster: `${optimizedVideoBase}/hero-02-poster.webp`,
  title: "AIXCO hero background",
} as const;

export const aixcoDubaiHeroVideo = {
  src: aixcoLiveVideos.dubaiHero,
  poster: aixcoLivePath("videos/aixco-group-dubai-hero-poster-ultra.webp"),
  title: "Dubai Burj Khalifa aerial",
} as const;

export const aixcoLiveIcons = {
  website: `${iconBase}/AIXCO_icons-05.svg`,
  linkedin: `${iconBase}/AIXCO_icons-01.svg`,
  facebook: `${iconBase}/AIXCO_icons-02.svg`,
  instagram: `${iconBase}/AIXCO_icons-03.svg`,
  email: `${iconBase}/AIXCO_icons-04.svg`,
  whatsapp: `${iconBase}/AIXCO_icons-06.svg`,
  whatsappYellow: `${iconBase}/AIXCO_icons-06-yellow.svg`,
} as const;

export const aixcoLiveAssetDetails = {
  currentProjectBrochure: aixcoLivePath("documents/reverance-brochure-en.pdf"),
  currentProjectBrochureGerman: aixcoLivePath("documents/reverance-brochure-de.pdf"),
  currentProjectBrochurePolish: aixcoLivePath("documents/reverance-brochure-pl.pdf"),
  currentProjectBrochureRussian: aixcoLivePath("documents/reverance-brochure-ru.pdf"),
  currentProjectBrochureSlovenian: aixcoLivePath("documents/reverance-brochure-sl.pdf"),
  dubaiFundOne: `${liveImageBase}/fund/fund1.jpeg`,
  dubaiFundTwo: `${liveImageBase}/fund2.png`,
} as const;

export type CurrentProjectBrochureDownload = {
  href: string;
  fileName: string;
};

export const aixcoCurrentProjectBrochureDownloads: Record<Lang, CurrentProjectBrochureDownload> = {
  en: {
    href: aixcoLiveAssetDetails.currentProjectBrochure,
    fileName: "Reverance-brochure-EN.pdf",
  },
  de: {
    href: aixcoLiveAssetDetails.currentProjectBrochureGerman,
    fileName: "Reverance-brochure-DE.pdf",
  },
  pl: {
    href: aixcoLiveAssetDetails.currentProjectBrochurePolish,
    fileName: "Reverance-brochure-PL.pdf",
  },
  sl: {
    href: aixcoLiveAssetDetails.currentProjectBrochureSlovenian,
    fileName: "Reverance-brochure-SL.pdf",
  },
  ru: {
    href: aixcoLiveAssetDetails.currentProjectBrochureRussian,
    fileName: "Reverance-brochure-RU.pdf",
  },
};

export function getCurrentProjectBrochureDownload(
  lang: Lang,
  { fallbackToEnglish = true }: { fallbackToEnglish?: boolean } = {},
): CurrentProjectBrochureDownload | null {
  return aixcoCurrentProjectBrochureDownloads[lang]
    ?? (fallbackToEnglish ? aixcoCurrentProjectBrochureDownloads.en ?? null : null);
}

export const aixcoDubaiEdenHouseCanalGallery = [
  { src: `${optimizedImageBase}/fund1-upscaled.webp`, title: "Eden House The Canal aerial overview" },
  { src: `${optimizedImageBase}/fund8-upscaled.webp`, title: "Eden House The Canal entrance wall" },
  { src: `${liveImageBase}/fund/fund9.jpeg`, title: "Eden House The Canal completed facade" },
  { src: `${liveImageBase}/fund/fund13.jpeg`, title: "Eden House The Canal residence facade" },
  { src: `${liveImageBase}/fund/fund14.jpeg`, title: "Eden House The Canal waterfront frontage" },
  { src: `${liveImageBase}/fund/fund15.jpeg`, title: "Eden House The Canal villa row" },
  { src: `${liveImageBase}/fund/fund16.jpeg`, title: "Eden House The Canal promenade view" },
  { src: `${liveImageBase}/fund/fund17.jpeg`, title: "Eden House The Canal waterfront elevation" },
  { src: `${liveImageBase}/fund/fund18.jpeg`, title: "Eden House The Canal villa detail" },
  { src: `${liveImageBase}/fund/fund19.jpeg`, title: "Eden House The Canal waterside block" },
  { src: `${optimizedImageBase}/fund20-upscaled.webp`, title: "Eden House The Canal signage" },
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
  { src: versionHealthcareImage(`${optimizedImageBase}/fund2-upscaled.webp`), title: "Dubai Healthcare City asset image" },
  { src: versionHealthcareImage(`${optimizedImageBase}/fund32-upscaled.webp`), title: "Dubai Healthcare City source site image" },
  { src: versionHealthcareImage(`${optimizedImageBase}/fund33-upscaled.webp`), title: "Dubai Healthcare City skyline site context" },
  { src: versionHealthcareImage(`${optimizedImageBase}/fund31-upscaled.webp`), title: "Dubai Healthcare City original site location map" },
  { src: versionHealthcareImage(`${optimizedImageBase}/dubai-map-fund-2.webp`), title: "Dubai Healthcare City legacy location map" },
] as const;

export const aixcoLiveLogos = {
  aixcoGlobal: `${liveImageBase}/AIXCOGlobalWlong.png`,
  aixcoHorizontalDark: `${liveImageBase}/AIXCOGlobal-horizontal-dark.webp`,
  aixcoHorizontalLight: `${liveImageBase}/AIXCOGlobal-horizontal-light.webp`,
  aixcoMark: `${liveImageBase}/AIXW-transparent.webp`,
  aixcoMarkPng: `${liveImageBase}/AIXW.png`,
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
