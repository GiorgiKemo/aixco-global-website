import { aixcoHeroBackgroundVideo } from "@/lib/aixco-live-assets";

const mobileHeroVideoPanelLimit = 1;
const mobileHeroVideoBreakpointPx = 768;
const desktopHeroVideoStartDelayMs = 1200;
const mobileHeroVideoStartDelayMs = 6500;
const slowEffectiveConnectionTypes = new Set(["slow-2g", "2g", "3g"]);

export const heroVideoIdleTimeoutMs = 1200;
export const heroPanelVideos = [aixcoHeroBackgroundVideo] as const;

export type HeroVideoEnvironment = {
  viewportWidth: number;
  saveData?: boolean;
  effectiveType?: string;
  deviceMemory?: number;
};

type HeroVideoPosterVisibility = {
  shouldUseVideoWall: boolean;
  isHeroInFocus: boolean;
  isVideoReady: boolean;
};

type HeroVideoAttachment = {
  shouldUseVideoWall: boolean;
  isHeroVideoIdleReady: boolean;
  panelIndex: number;
  panelLimit: number;
};

export function shouldShowHeroVideoPoster({
  shouldUseVideoWall,
  isHeroInFocus,
  isVideoReady,
}: HeroVideoPosterVisibility) {
  return !shouldUseVideoWall || !isHeroInFocus || !isVideoReady;
}

export function shouldUseHeroVideoWall({ saveData = false, effectiveType, deviceMemory }: HeroVideoEnvironment) {
  if (saveData) return false;
  if (effectiveType && slowEffectiveConnectionTypes.has(effectiveType)) return false;
  if (typeof deviceMemory === "number" && deviceMemory <= 4) return false;
  return true;
}

export function getHeroVideoPanelLimit(environment: HeroVideoEnvironment) {
  return environment.viewportWidth < mobileHeroVideoBreakpointPx ? mobileHeroVideoPanelLimit : heroPanelVideos.length;
}

export function getHeroVideoStartDelay(viewportWidth: number) {
  return viewportWidth < mobileHeroVideoBreakpointPx ? mobileHeroVideoStartDelayMs : desktopHeroVideoStartDelayMs;
}

export function shouldAttachHeroVideo({
  shouldUseVideoWall,
  isHeroVideoIdleReady,
  panelIndex,
  panelLimit,
}: HeroVideoAttachment) {
  return shouldUseVideoWall && isHeroVideoIdleReady && panelIndex < panelLimit;
}
