export const HASH_REPLACED_EVENT = "aixco:hash-replaced";

export function getActiveSectionHash(sectionIds: readonly string[], markerY = 120) {
  if (typeof document === "undefined") return "";

  let current = "";

  for (const id of sectionIds) {
    const element = document.getElementById(id);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    if (rect.top <= markerY && rect.bottom >= markerY) {
      current = `#${id}`;
    }
  }

  return current;
}

export function replaceLocationHash(hash: string) {
  if (typeof window === "undefined") return;
  if (window.location.hash === hash) return;

  const previousHash = window.location.hash;
  const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
  window.dispatchEvent(new CustomEvent(HASH_REPLACED_EVENT, { detail: { hash, previousHash } }));
}

export function syncLocationHashToActiveSection(sectionIds: readonly string[], markerY = 120) {
  const activeHash = getActiveSectionHash(sectionIds, markerY);
  replaceLocationHash(activeHash);
  return activeHash;
}
