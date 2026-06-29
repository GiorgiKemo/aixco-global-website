import { afterEach, describe, expect, it, vi } from "vitest";
import { installGlideScroll, scrollToHash } from "./smooth-scroll";

const lenisMockState = vi.hoisted(() => {
  const state = {
    instances: [] as Array<{
      options: Record<string, unknown>;
      destroy: ReturnType<typeof vi.fn>;
      raf: ReturnType<typeof vi.fn>;
      scrollTo: ReturnType<typeof vi.fn>;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
    }>,
    Constructor: undefined as unknown as ReturnType<typeof vi.fn>,
  };

  state.Constructor = vi.fn(function LenisMock(this: {
    options: Record<string, unknown>;
    destroy: ReturnType<typeof vi.fn>;
    raf: ReturnType<typeof vi.fn>;
    scrollTo: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }, options: Record<string, unknown>) {
    this.options = options;
    this.destroy = vi.fn();
    this.raf = vi.fn();
    this.scrollTo = vi.fn();
    this.start = vi.fn();
    this.stop = vi.fn();
    state.instances.push(this);
  });

  return state;
});

vi.mock("lenis", () => ({
  default: lenisMockState.Constructor,
}));

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
    document.body.classList.remove("home-desktop-story-boot");
    document.documentElement.removeAttribute("data-glide-scroll");
    delete document.documentElement.dataset.homeExperience;
    lenisMockState.instances.length = 0;
    lenisMockState.Constructor.mockClear();
    vi.restoreAllMocks();
    mockMatchMedia(() => false);
  });

  it("installs Lenis with continuous desktop wheel inertia settings", () => {
    mockMatchMedia(() => false);
    mockViewport();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    const cleanup = installGlideScroll({ easing: 0.18, multiplier: 1 });

    expect(lenisMockState.Constructor).toHaveBeenCalledTimes(1);
    expect(lenisMockState.instances[0]?.options).toMatchObject({
      autoRaf: false,
      lerp: 0.18,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    expect(document.documentElement).toHaveAttribute("data-glide-scroll", "enabled");

    cleanup();
    expect(lenisMockState.instances[0]?.destroy).toHaveBeenCalledTimes(1);
    expect(document.documentElement).not.toHaveAttribute("data-glide-scroll");
  });

  it("uses slower Lenis wheel settings while the desktop story experience is active", () => {
    mockMatchMedia(() => false);
    mockViewport();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    document.documentElement.dataset.homeExperience = "story";

    const cleanup = installGlideScroll({
      easing: 0.18,
      multiplier: 1,
      storyEasing: 0.22,
      storyMultiplier: 0.52,
      storyMomentum: 0.18,
    });

    expect(lenisMockState.instances[0]?.options).toMatchObject({
      lerp: 0.22,
      wheelMultiplier: 0.7,
    });

    cleanup();
  });

  it("uses story Lenis settings from the desktop story boot class before React sets data attributes", () => {
    mockMatchMedia(() => false);
    mockViewport();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    document.body.classList.add("home-desktop-story-boot");

    const cleanup = installGlideScroll({
      easing: 0.18,
      multiplier: 1,
      storyEasing: 0.2,
      storyMultiplier: 0.52,
      storyMomentum: 0.18,
    });

    expect(lenisMockState.instances[0]?.options).toMatchObject({
      lerp: 0.2,
      wheelMultiplier: 0.7,
    });

    cleanup();
  });

  it("delegates smooth hash scrolling to the active Lenis instance", () => {
    mockMatchMedia(() => false);
    mockViewport();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
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

    const cleanup = installGlideScroll({ easing: 0.18, multiplier: 1 });

    expect(scrollToHash("#about")).toBe(true);
    expect(lenisMockState.instances[0]?.scrollTo).toHaveBeenCalledWith(1200, {
      immediate: false,
    });

    cleanup();
  });

  it("drives Lenis through a continuous requestAnimationFrame loop", () => {
    mockMatchMedia(() => false);
    mockViewport();
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    const cleanup = installGlideScroll({ easing: 0.18, multiplier: 1 });

    frames[0]?.(16);
    frames[1]?.(32);

    expect(lenisMockState.instances[0]?.raf).toHaveBeenNthCalledWith(1, 16);
    expect(lenisMockState.instances[0]?.raf).toHaveBeenNthCalledWith(2, 32);
    expect(document.documentElement).toHaveAttribute("data-glide-scroll", "enabled");

    cleanup();
    expect(document.documentElement).not.toHaveAttribute("data-glide-scroll");
  });

  it("keeps desktop wheel glide active when reduced motion is reported", () => {
    mockMatchMedia((query) => query.includes("prefers-reduced-motion"));
    mockViewport();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    const cleanup = installGlideScroll();

    expect(lenisMockState.Constructor).toHaveBeenCalledTimes(1);
    expect(document.documentElement).toHaveAttribute("data-glide-scroll", "enabled");
    cleanup();
  });

  it("does not install custom wheel scrolling on coarse pointer devices", () => {
    mockMatchMedia((query) => query.includes("pointer: coarse"));
    const addEventListener = vi.spyOn(document, "addEventListener");

    const cleanup = installGlideScroll();

    expect(addEventListener).not.toHaveBeenCalledWith("wheel", expect.any(Function), expect.anything());
    expect(lenisMockState.Constructor).not.toHaveBeenCalled();
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
    const virtualScroll = lenisMockState.instances[0]?.options.virtualScroll as
      | ((data: { event: WheelEvent; deltaX: number; deltaY: number }) => boolean)
      | undefined;

    expect(wheel.defaultPrevented).toBe(false);
    expect(virtualScroll?.({ event: wheel, deltaX: 0, deltaY: 80 })).toBe(false);
    cleanup();
  });

  it("allows Lenis smoothing over non-scrollable form fields", () => {
    mockMatchMedia(() => false);
    mockViewport();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);

    const cleanup = installGlideScroll({ easing: 0.18, multiplier: 1 });
    const wheel = new WheelEvent("wheel", { deltaY: 120, cancelable: true, bubbles: true });
    const virtualScroll = lenisMockState.instances[0]?.options.virtualScroll as
      | ((data: { event: WheelEvent; deltaX: number; deltaY: number }) => boolean)
      | undefined;

    input.dispatchEvent(wheel);

    expect(wheel.defaultPrevented).toBe(false);
    expect(virtualScroll?.({ event: wheel, deltaX: 0, deltaY: 120 })).toBe(true);

    cleanup();
  });

  it("adds story momentum into the Lenis wheel multiplier", () => {
    mockMatchMedia(() => false);
    mockViewport();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    document.documentElement.dataset.homeExperience = "story";

    const cleanup = installGlideScroll({
      easing: 0.18,
      multiplier: 1,
      storyEasing: 0.22,
      storyMultiplier: 0.62,
      storyMomentum: 0.3,
    });

    expect(lenisMockState.instances[0]?.options).toMatchObject({
      lerp: 0.22,
      wheelMultiplier: 0.92,
    });

    cleanup();
  });

  it("carries same-direction story wheel deltas so repeated wheel ticks feel continuous", () => {
    mockMatchMedia(() => false);
    mockViewport();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    document.documentElement.dataset.homeExperience = "story";

    const cleanup = installGlideScroll({
      easing: 0.18,
      multiplier: 1,
      storyEasing: 0.082,
      storyMultiplier: 0.58,
      storyMomentum: 0.14,
      storyWheelCarry: 0.3,
      storyWheelCarryWindowMs: 560,
    });

    const virtualScroll = lenisMockState.instances[0]?.options.virtualScroll as
      | ((data: { event: WheelEvent; deltaX: number; deltaY: number }) => boolean)
      | undefined;

    const firstWheel = new WheelEvent("wheel", { deltaY: 100, cancelable: true, bubbles: true });
    Object.defineProperty(firstWheel, "timeStamp", { configurable: true, value: 100 });
    const firstData = { event: firstWheel, deltaX: 0, deltaY: 100 };

    const secondWheel = new WheelEvent("wheel", { deltaY: 100, cancelable: true, bubbles: true });
    Object.defineProperty(secondWheel, "timeStamp", { configurable: true, value: 260 });
    const secondData = { event: secondWheel, deltaX: 0, deltaY: 100 };

    expect(virtualScroll?.(firstData)).toBe(true);
    expect(firstData.deltaY).toBe(100);
    expect(virtualScroll?.(secondData)).toBe(true);
    expect(secondData.deltaY).toBeGreaterThan(100);
    expect(secondData.deltaY).toBeLessThanOrEqual(155);

    cleanup();
  });

  it("continues running Lenis frames after wheel release", () => {
    mockMatchMedia(() => false);
    mockViewport();
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    document.documentElement.dataset.homeExperience = "story";

    const cleanup = installGlideScroll({
      easing: 0.18,
      multiplier: 1,
      storyEasing: 0.22,
      storyMultiplier: 0.62,
      storyMomentum: 0.3,
    });

    frames[0]?.(16);
    frames[1]?.(32);
    frames[2]?.(48);

    expect(lenisMockState.instances[0]?.raf).toHaveBeenCalledTimes(3);

    cleanup();
  });
});

describe("scrollToHash", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.body.classList.remove("home-desktop-story-boot");
    lenisMockState.instances.length = 0;
    lenisMockState.Constructor.mockClear();
    vi.restoreAllMocks();
    mockMatchMedia(() => false);
  });

  it("delegates immediate hash scrolling to Lenis for stabilization", () => {
    mockMatchMedia(() => false);
    mockViewport();
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

    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    const cleanup = installGlideScroll();

    expect(scrollToHash("#about", "auto")).toBe(true);
    expect(lenisMockState.instances[0]?.scrollTo).toHaveBeenCalledWith(1200, {
      immediate: true,
    });

    cleanup();
  });

  it("ignores malformed encoded hash values instead of throwing", () => {
    mockMatchMedia(() => false);
    mockViewport();

    expect(() => scrollToHash("#%E0%A4%A", "auto")).not.toThrow();
    expect(scrollToHash("#%E0%A4%A", "auto")).toBe(false);
  });
});
