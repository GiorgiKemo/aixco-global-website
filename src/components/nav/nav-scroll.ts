import { replaceLocationHash } from "@/lib/section-hash";
import { scrollToHash } from "@/lib/smooth-scroll";
import { NAV_HASH_STABILIZE_DELAYS } from "./nav-data";

let pendingNavScrollTimers: number[] = [];

export function clearPendingNavScrollTimers() {
  pendingNavScrollTimers.forEach((timer) => window.clearTimeout(timer));
  pendingNavScrollTimers = [];
}

export function scrollToNavHash(hash: string) {
  clearPendingNavScrollTimers();
  replaceLocationHash(hash);
  scrollToHash(hash);

  pendingNavScrollTimers = NAV_HASH_STABILIZE_DELAYS.map((delay) =>
    window.setTimeout(() => {
      replaceLocationHash(hash);
      scrollToHash(hash, "auto");
    }, delay),
  );
}
