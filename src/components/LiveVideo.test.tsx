import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveVideo } from "./LiveVideo";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  private callback: IntersectionObserverCallback;
  private target: Element = document.body;
  readonly root: Element | Document | null = null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? "";
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold ?? 0];
    MockIntersectionObserver.instances.push(this);
  }

  observe = vi.fn((target: Element) => {
    this.target = target;
  });

  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn((): IntersectionObserverEntry[] => []);

  trigger(entry: Partial<IntersectionObserverEntry>) {
    this.callback(
      [
        {
          boundingClientRect: this.target.getBoundingClientRect(),
          intersectionRatio: 0,
          intersectionRect: this.target.getBoundingClientRect(),
          isIntersecting: false,
          rootBounds: null,
          target: this.target,
          time: 0,
          ...entry,
        },
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

describe("LiveVideo", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("opens the clicked preview in an expanded player dialog", () => {
    render(<LiveVideo src="/sample-video.mp4" title="Fund I walkthrough" poster="/poster.jpg" eager />);

    expect(screen.queryByText(/view video/i)).not.toBeInTheDocument();

    const previewTarget = screen.getByRole("button", { name: /play video: fund i walkthrough/i });
    fireEvent.click(previewTarget);

    const dialog = screen.getByRole("dialog", { name: /expanded video: fund i walkthrough/i });
    const expandedVideo = screen.getByLabelText("Fund I walkthrough expanded player");

    expect(dialog).toContainElement(expandedVideo);
    expect(expandedVideo).toHaveAttribute("src", "/sample-video.mp4");
    expect(expandedVideo).toHaveAttribute("poster", "/poster.jpg");
    expect(expandedVideo).toHaveAttribute("controls");
    expect(expandedVideo.className).toContain("h-auto");
    expect(expandedVideo.className).toContain("w-auto");
    expect(expandedVideo.className).toContain("max-h-[min(82svh,calc(100svh-2rem))]");
    expect(expandedVideo.className).not.toContain("w-full");
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("uses lightweight preview media inline and full media in the expanded player", () => {
    render(
      <LiveVideo
        src="/full-video.mp4"
        previewSrc="/preview-video.mp4"
        title="Preview source test"
        poster="/poster.jpg"
        eager
      />,
    );

    const inlineVideo = screen.getByLabelText("Preview source test");

    expect(inlineVideo).toHaveAttribute("src", "/preview-video.mp4");

    fireEvent.click(screen.getByRole("button", { name: /play video: preview source test/i }));

    const expandedVideo = screen.getByLabelText("Preview source test expanded player");

    expect(expandedVideo).toHaveAttribute("src", "/full-video.mp4");
    expect(expandedVideo).toHaveAttribute("poster", "/poster.jpg");
  });

  it("loads nearby preview media but only plays while it is in focus", () => {
    const { container } = render(<LiveVideo src="/sample-video.mp4" title="Batumi overview" poster="/poster.jpg" />);

    expect(container.querySelector("img[role='presentation']")).toHaveAttribute("src", "/poster.jpg");
    expect(screen.getByLabelText("Batumi overview")).not.toHaveAttribute("src");

    act(() => {
      MockIntersectionObserver.instances[0].trigger({ isIntersecting: true, intersectionRatio: 1 });
    });

    const inlineVideo = screen.getByLabelText("Batumi overview");

    expect(container.querySelector("img[role='presentation']")).toHaveAttribute("src", "/poster.jpg");
    expect(inlineVideo).toHaveAttribute("src", "/sample-video.mp4");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    act(() => {
      MockIntersectionObserver.instances[1].trigger({ isIntersecting: true, intersectionRatio: 0.7 });
    });

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();

    act(() => {
      MockIntersectionObserver.instances[1].trigger({ isIntersecting: false, intersectionRatio: 0 });
    });

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it("keeps the poster visible until the preview video has a rendered frame", () => {
    const { container } = render(<LiveVideo src="/sample-video.mp4" title="Otium" poster="/poster.jpg" />);

    act(() => {
      MockIntersectionObserver.instances[0].trigger({ isIntersecting: true, intersectionRatio: 1 });
      MockIntersectionObserver.instances[1].trigger({ isIntersecting: true, intersectionRatio: 0.7 });
    });

    const poster = container.querySelector("img[role='presentation']");
    const inlineVideo = screen.getByLabelText("Otium");

    expect(poster?.className).toContain("opacity-100");

    fireEvent.loadedData(inlineVideo);

    expect(poster?.className).toContain("opacity-0");
  });

  it("closes the expanded player with Escape and pauses playback", () => {
    render(<LiveVideo src="/sample-video.mp4" title="Batumi gallery 1" poster="/poster.jpg" eager />);

    fireEvent.click(screen.getByRole("button", { name: /play video: batumi gallery 1/i }));

    expect(screen.getByRole("dialog", { name: /expanded video: batumi gallery 1/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: /expanded video: batumi gallery 1/i })).not.toBeInTheDocument();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it("keeps the inline preview muted while the expanded player is audible", () => {
    render(
      <>
        <LiveVideo src="/sample-video-one.mp4" title="Batumi gallery 1" poster="/poster-one.jpg" eager />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: /play video: batumi gallery 1/i }));

    const previewVideo = screen.getByLabelText("Batumi gallery 1") as HTMLVideoElement;
    const expandedVideo = screen.getByLabelText("Batumi gallery 1 expanded player") as HTMLVideoElement;

    expect(previewVideo.muted).toBe(true);
    expect(expandedVideo.muted).toBe(false);
  });
});
