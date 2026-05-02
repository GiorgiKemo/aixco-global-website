const liveImageBase = "/aixco-global-op2/images";

export const aixcoLiveImages = {
  aboutArchitecture: `${liveImageBase}/batumip.jpg`,
  contact: `${liveImageBase}/contact.jpg`,
  dubaiEdenHouse: `${liveImageBase}/fund/fund1.jpeg`,
  dubaiHealthcare: `${liveImageBase}/fund2.png`,
  transactionBackdrop: `${liveImageBase}/trans.jpg`,
  batumiQueens: `${liveImageBase}/batumip.jpg`,
  batumiSerenade: `${liveImageBase}/batumi.jpg`,
  teamBenjamin: `${liveImageBase}/benjamin.jpg`,
  teamOwais: `${liveImageBase}/owais.jpg`,
  teamWalter: `${liveImageBase}/walter.jpg`,
} as const;

export const aixcoLiveVideos = {
  batumiOverview: `${liveImageBase}/batumi2.mp4`,
  batumiBuy: `${liveImageBase}/batumibuy.mp4`,
  bonds: `${liveImageBase}/bonds.mp4`,
  fundOne: `${liveImageBase}/fund/fund1.mp4`,
  fundTwo: `${liveImageBase}/fund/fund2.mp4`,
  fundThree: `${liveImageBase}/fund/fund3.mp4`,
  guru: `${liveImageBase}/guru.mp4`,
  tempo: `${liveImageBase}/tempo.mp4`,
} as const;

export const aixcoLiveLogos = {
  aixcoGlobal: `${liveImageBase}/AIXCOGlobalWlong.png`,
  aixcoMark: `${liveImageBase}/AIXW.png`,
  globalPartners: `${liveImageBase}/Globalpartners.png`,
  isp: `${liveImageBase}/isp.png`,
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
