import { afterEach, describe, expect, it, vi } from "vitest";
import { scrollToHash, scrollToPageTop } from "./smooth-scroll";

function mockReducedMotion() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function mockViewport(scrollY = 0) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    get: () => scrollY,
  });

  return vi.spyOn(window, "scrollTo").mockImplementation((options?: ScrollToOptions | number) => {
    scrollY = typeof options === "number" ? options : options?.top ?? 0;
  });
}

describe("smooth-scroll", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("scrolls to hash targets while respecting scroll margin", () => {
    mockReducedMotion();
    const scrollTo = mockViewport(100);
    const target = document.createElement("section");
    target.id = "dubai";
    target.style.scrollMarginTop = "80px";
    target.getBoundingClientRect = () => ({ top: 500, bottom: 900, left: 0, right: 0, width: 0, height: 400, x: 0, y: 500, toJSON: () => ({}) });
    document.body.appendChild(target);

    expect(scrollToHash("#dubai")).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith({ top: 520, left: 0, behavior: "auto" });
  });

  it("returns false when a hash target is missing", () => {
    mockReducedMotion();
    mockViewport();

    expect(scrollToHash("#missing")).toBe(false);
  });

  it("scrolls to the page top without installing custom wheel behavior", () => {
    mockReducedMotion();
    const scrollTo = mockViewport(640);
    const addEventListener = vi.spyOn(document, "addEventListener");

    scrollToPageTop();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
    expect(addEventListener).not.toHaveBeenCalledWith("wheel", expect.any(Function), expect.anything());
  });
});
