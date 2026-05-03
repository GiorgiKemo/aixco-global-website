import { afterEach, describe, expect, it, vi } from "vitest";
import { installGlideScroll } from "./smooth-scroll";

function mockMatchMedia(matchesFor: (query: string) => boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: matchesFor(query),
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

function mockViewport() {
  let scrollY = 0;
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    get: () => scrollY,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 3200 });

  return vi.spyOn(window, "scrollTo").mockImplementation((options?: ScrollToOptions | number) => {
    scrollY = typeof options === "number" ? options : options?.top ?? 0;
  });
}

describe("installGlideScroll", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-glide-scroll");
    vi.restoreAllMocks();
    mockMatchMedia(() => false);
  });

  it("animates cancelable desktop wheel scrolling with eased page motion", () => {
    mockMatchMedia(() => false);
    const scrollTo = mockViewport();
    let nextFrame: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      nextFrame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    const cleanup = installGlideScroll({ easing: 1, multiplier: 1 });
    const wheel = new WheelEvent("wheel", { deltaY: 360, cancelable: true, bubbles: true });

    document.dispatchEvent(wheel);
    nextFrame?.(16);

    expect(wheel.defaultPrevented).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith({ top: 360, left: 0, behavior: "auto" });
    expect(document.documentElement).toHaveAttribute("data-glide-scroll", "enabled");

    cleanup();
    expect(document.documentElement).not.toHaveAttribute("data-glide-scroll");
  });

  it("does not install when the visitor prefers reduced motion", () => {
    mockMatchMedia((query) => query.includes("prefers-reduced-motion"));
    const addEventListener = vi.spyOn(document, "addEventListener");

    const cleanup = installGlideScroll();

    expect(addEventListener).not.toHaveBeenCalledWith("wheel", expect.any(Function), expect.anything());
    expect(document.documentElement).not.toHaveAttribute("data-glide-scroll");
    cleanup();
  });

  it("keeps nested scroll containers native instead of hijacking their wheel events", () => {
    mockMatchMedia(() => false);
    mockViewport();
    const container = document.createElement("div");
    const content = document.createElement("div");
    container.style.overflowY = "auto";
    Object.defineProperty(container, "clientHeight", { configurable: true, value: 120 });
    Object.defineProperty(container, "scrollHeight", { configurable: true, value: 500 });
    Object.defineProperty(container, "scrollTop", { configurable: true, value: 0, writable: true });
    container.appendChild(content);
    document.body.appendChild(container);

    const cleanup = installGlideScroll();
    const wheel = new WheelEvent("wheel", { deltaY: 80, cancelable: true, bubbles: true });

    content.dispatchEvent(wheel);

    expect(wheel.defaultPrevented).toBe(false);
    cleanup();
  });
});
