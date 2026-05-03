const withBaseUrl = (path: string) => {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.replace(/^\//, "");
  return `${baseUrl}/${normalizedPath}`;
};

export const aixcoLivePath = (path: string) => withBaseUrl(`aixco-global-op2/${path}`);

const liveImageBase = aixcoLivePath("images");
const optimizedImageBase = aixcoLivePath("images/optimized");
const optimizedVideoBase = aixcoLivePath("media");
const documentBase = aixcoLivePath("documents");
const batumiGalleryBase = `${optimizedVideoBase}/batumi-gallery`;

export const aixcoLiveImages = {
  aboutArchitecture: `${optimizedImageBase}/batumip.png`,
  contact: `${optimizedImageBase}/contact.webp`,
  dubaiEdenHouse: `${liveImageBase}/fund/fund1.jpeg`,
  dubaiHealthcare: `${optimizedImageBase}/fund2.webp`,
  transactionBackdrop: `${optimizedImageBase}/trans.webp`,
  batumiOverviewPoster: `${batumiGalleryBase}/batumi2-poster.webp`,
  batumiGuru: `${optimizedImageBase}/guru.png`,
  batumiOtium: `${optimizedImageBase}/otium-reverance.png`,
  teamBenjamin: `${optimizedImageBase}/benjamin.webp`,
  teamOwais: `${optimizedImageBase}/owais.webp`,
  teamWalter: `${optimizedImageBase}/walter.webp`,
} as const;

export const aixcoLiveVideos = {
  batumiOverview: `${batumiGalleryBase}/batumi2.mp4`,
  batumiBuy: `${optimizedVideoBase}/batumibuy-optimized.mp4`,
  bonds: `${optimizedVideoBase}/bonds-optimized.mp4`,
  fundOne: `${optimizedVideoBase}/fund1-optimized.mp4`,
  fundTwo: `${optimizedVideoBase}/fund2-optimized.mp4`,
  fundThree: `${optimizedVideoBase}/fund3-optimized.mp4`,
  guru: `${optimizedVideoBase}/guru-optimized.mp4`,
  tempo: `${optimizedVideoBase}/tempo-optimized.mp4`,
  guruBatumi: `${optimizedVideoBase}/guru-batumi-optimized.mp4`,
  otium: `${optimizedVideoBase}/otium-optimized.mp4`,
} as const;

export const aixcoBatumiGalleryVideos = [
  { src: `${batumiGalleryBase}/batumi1.mp4`, poster: `${batumiGalleryBase}/batumi1-poster.webp`, title: "Batumi gallery 1" },
  { src: `${batumiGalleryBase}/batumi2.mp4`, poster: `${batumiGalleryBase}/batumi2-poster.webp`, title: "Batumi gallery 2" },
  { src: `${batumiGalleryBase}/batumi3.mp4`, poster: `${batumiGalleryBase}/batumi3-poster.webp`, title: "Batumi gallery 3" },
  { src: `${batumiGalleryBase}/batumi4.mp4`, poster: `${batumiGalleryBase}/batumi4-poster.webp`, title: "Batumi gallery 4" },
  { src: `${batumiGalleryBase}/batumi5.mp4`, poster: `${batumiGalleryBase}/batumi5-poster.webp`, title: "Batumi gallery 5" },
  { src: `${batumiGalleryBase}/herovideo.mp4`, poster: `${batumiGalleryBase}/herovideo-poster.webp`, title: "Batumi gallery 6" },
] as const;

export const aixcoLiveDocuments = {
  guru: `${documentBase}/guru.pdf`,
  otium: `${documentBase}/otium.pdf`,
} as const;

export const aixcoLiveLogos = {
  aixcoGlobal: `${liveImageBase}/AIXCOGlobalWlong.png`,
  aixcoMark: `${liveImageBase}/AIXW.png`,
  globalPartners: `${liveImageBase}/Globalpartners.png`,
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

export const aixcoFundGallery = [
  `${liveImageBase}/fund1.png`,
  ...Array.from({ length: 22 }, (_, index) => `${liveImageBase}/fund/fund${index + 1}.jpeg`),
] as const;
