export const NAV = [
  { key: "nav.home", to: "/", hash: "" },
  { key: "nav.about", to: "/", hash: "#about" },
  { key: "nav.dubai", to: "/", hash: "#dubai" },
  { key: "nav.batumi", to: "/", hash: "#batumi" },
  { key: "nav.participate", to: "/", hash: "#participate" },
  { key: "nav.how", to: "/", hash: "#how" },
  { key: "nav.contact", to: "/", hash: "#contact" },
] as const;

export const MORE_NAV = [
  { key: "nav.philosophy", to: "/aixco-philosophy", hash: "" },
  { key: "nav.team", to: "/", hash: "#team" },
  { key: "nav.partners", to: "/", hash: "#partners" },
  { key: "nav.faqs", to: "/", hash: "#faqs" },
] as const;

export const ALL_NAV = [...NAV, ...MORE_NAV] as const;
export const STARTING_FROM_NAV_TARGET = MORE_NAV.find((item) => item.key === "nav.faqs") ?? MORE_NAV[MORE_NAV.length - 1];
export const HOME_SECTION_IDS = ["about", "dubai", "batumi", "participate", "how", "team", "partners", "faqs", "contact"] as const;
export const NAV_HASH_STABILIZE_DELAYS = [120, 320, 700, 1100] as const;
export const HOME_RETURN_HASH_SYNC_LOCK_MS = 1800;

const DESKTOP_NAV_LABELS: Record<string, Record<string, string>> = {
  ka: {
    "nav.about": "AIXCO",
    "nav.participate": "გზები",
    "nav.how": "პროცესი",
    "nav.team": "გუნდი",
    "nav.faqs": "FAQ",
  },
};

export type NavItem = (typeof ALL_NAV)[number];

export function getDesktopNavLabel(lang: string, key: string, fallback: string) {
  return DESKTOP_NAV_LABELS[lang]?.[key] ?? fallback;
}
