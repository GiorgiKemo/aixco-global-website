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

  it("opens the preview inline without a visible CTA or blocking dialog", () => {
    render(<LiveVideo src="/sample-video.mp4" title="Fund I walkthrough" poster="/poster.jpg" eager />);

    expect(screen.queryByText(/view video/i)).not.toBeInTheDocument();

    const previewTarget = screen.getByRole("button", { name: /play video: fund i walkthrough/i });
    fireEvent.click(previewTarget);

    const inlineVideo = screen.getByLabelText("Fund I walkthrough");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(inlineVideo).toHaveAttribute("src", "/sample-video.mp4");
    expect(inlineVideo).toHaveAttribute("poster", "/poster.jpg");
    expect(inlineVideo).toHaveAttribute("controls");
  });

  it("can keep the poster static until the user opens the video", () => {
    render(<LiveVideo src="/sample-video.mp4" title="Batumi overview" poster="/poster.jpg" autoplayPreview={false} />);

    act(() => {
      MockIntersectionObserver.instances[0].trigger({ isIntersecting: true, intersectionRatio: 1 });
    });

    const inlineVideo = screen.getByLabelText("Batumi overview");

    expect(inlineVideo).toHaveAttribute("src", "/sample-video.mp4");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /play video: batumi overview/i }));

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(inlineVideo).toHaveAttribute("controls");
  });

  it("mutes an inline video after it leaves focus and keeps it muted when focus returns", () => {
    render(<LiveVideo src="/sample-video.mp4" title="Batumi gallery 1" poster="/poster.jpg" eager />);

    fireEvent.click(screen.getByRole("button", { name: /play video: batumi gallery 1/i }));

    const inlineVideo = screen.getByLabelText("Batumi gallery 1") as HTMLVideoElement;
    expect(inlineVideo.muted).toBe(false);

    expect(MockIntersectionObserver.instances).toHaveLength(1);
    act(() => {
      MockIntersectionObserver.instances[0].trigger({ isIntersecting: false, intersectionRatio: 0 });
    });

    expect(inlineVideo.muted).toBe(true);

    act(() => {
      MockIntersectionObserver.instances[0].trigger({ isIntersecting: true, intersectionRatio: 1 });
    });

    expect(inlineVideo.muted).toBe(true);
    expect(inlineVideo).toHaveAttribute("controls");
  });

  it("keeps only the most recently opened inline video audible", () => {
    render(
      <>
        <LiveVideo src="/sample-video-one.mp4" title="Batumi gallery 1" poster="/poster-one.jpg" eager />
        <LiveVideo src="/sample-video-two.mp4" title="Batumi gallery 2" poster="/poster-two.jpg" eager />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: /play video: batumi gallery 1/i }));

    const firstVideo = screen.getByLabelText("Batumi gallery 1") as HTMLVideoElement;
    expect(firstVideo.muted).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: /play video: batumi gallery 2/i }));

    const secondVideo = screen.getByLabelText("Batumi gallery 2") as HTMLVideoElement;
    expect(firstVideo.muted).toBe(true);
    expect(secondVideo.muted).toBe(false);
  });
});
