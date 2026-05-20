export type BrowserLocationState = {
  pathname: string;
  hash: string;
};

export function getBrowserLocation(): BrowserLocationState {
  if (typeof window === "undefined") {
    return { pathname: "/", hash: "" };
  }

  return {
    pathname: window.location.pathname || "/",
    hash: window.location.hash,
  };
}
