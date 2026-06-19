const HASH_REPLACED_EVENT = "aixco:hash-replaced";

export function replaceLocationHash(hash: string) {
  if (typeof window === "undefined") return;
  if (window.location.hash === hash) return;

  const previousHash = window.location.hash;
  const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
  window.dispatchEvent(new CustomEvent(HASH_REPLACED_EVENT, { detail: { hash, previousHash } }));
}
