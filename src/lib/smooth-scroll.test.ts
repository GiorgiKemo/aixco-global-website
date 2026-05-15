import { afterEach, describe, expect, it, vi } from "vitest";
import { installGlideScroll, scrollToHash } from "./smooth-scroll";

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

  it("keeps desktop wheel glide active when reduced motion is reported", () => {
    mockMatchMedia((query) => query.includes("prefers-reduced-motion"));
    const addEventListener = vi.spyOn(document, "addEventListener");

    const cleanup = installGlideScroll();

    expect(addEventListener).toHaveBeenCalledWith("wheel", expect.any(Function), { passive: false });
    expect(document.documentElement).toHaveAttribute("data-glide-scroll", "enabled");
    cleanup();
  });

  it("does not install custom wheel scrolling on coarse pointer devices", () => {
    mockMatchMedia((query) => query.includes("pointer: coarse"));
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

  it("uses page glide over non-scrollable form fields", () => {
    mockMatchMedia(() => false);
    const scrollTo = mockViewport();
    let nextFrame: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      nextFrame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);

    const cleanup = installGlideScroll({ easing: 1, multiplier: 1 });
    const wheel = new WheelEvent("wheel", { deltaY: 120, cancelable: true, bubbles: true });

    input.dispatchEvent(wheel);
    nextFrame?.(16);

    expect(wheel.defaultPrevented).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith({ top: 120, left: 0, behavior: "auto" });

    cleanup();
  });
});

describe("scrollToHash", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    mockMatchMedia(() => false);
  });

  it("cancels active smooth hash scrolling when the user starts scrolling", () => {
    mockMatchMedia(() => false);
    const scrollTo = mockViewport();
    const target = document.createElement("section");
    target.id = "about";
    target.getBoundingClientRect = vi.fn(() => ({
      x: 0,
      y: 1200,
      top: 1200,
      right: 0,
      bottom: 1600,
      left: 0,
      width: 0,
      height: 400,
      toJSON: () => ({}),
    }));
    document.body.appendChild(target);

    const frames: FrameRequestCallback[] = [];
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });

    expect(scrollToHash("#about")).toBe(true);
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 120 }));
    frames[0]?.(16);

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
