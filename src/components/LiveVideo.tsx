import { useEffect, useId, useRef, useState } from "react";

type LiveVideoProps = {
  src: string;
  title: string;
  poster?: string;
  className?: string;
  videoClassName?: string;
  eager?: boolean;
  rootMargin?: string;
};

const focusThreshold = 0.45;
const audibleVideoEvent = "aixco-live-video-audible";

export function LiveVideo({
  src,
  title,
  poster,
  className = "",
  videoClassName = "",
  eager = false,
  rootMargin = "350px 0px",
}: LiveVideoProps) {
  const videoId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [isVisible, setIsVisible] = useState(eager);
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const [isAudible, setIsAudible] = useState(false);

  const openInlinePlayer = () => {
    setShouldLoad(true);
    setIsPlayingInline(true);
    setIsAudible(true);
    window.requestAnimationFrame(() => {
      void videoRef.current?.play().catch(() => undefined);
    });
  };

  useEffect(() => {
    if (eager || typeof window === "undefined") return;

    const node = wrapperRef.current;
    if (!node || typeof window.IntersectionObserver !== "function") {
      setShouldLoad(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, rootMargin]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const node = wrapperRef.current;
    if (!node || typeof window.IntersectionObserver !== "function") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isInFocus = entry.isIntersecting && entry.intersectionRatio >= focusThreshold;
        if (!isInFocus) {
          setIsAudible(false);
        }
      },
      { threshold: [0, focusThreshold, 1] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (isVisible) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isVisible, shouldLoad]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAudibleVideo = (event: Event) => {
      if (!(event instanceof CustomEvent) || event.detail === videoId) return;
      setIsAudible(false);
    };

    window.addEventListener(audibleVideoEvent, handleAudibleVideo);
    return () => {
      window.removeEventListener(audibleVideoEvent, handleAudibleVideo);
    };
  }, [videoId]);

  useEffect(() => {
    if (!isAudible || typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(audibleVideoEvent, { detail: videoId }));
  }, [isAudible, videoId]);

  useEffect(() => {
    if (!isPlayingInline || typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPlayingInline(false);
        setIsAudible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlayingInline]);

  return (
    <div
      ref={wrapperRef}
      data-video-state={isPlayingInline ? "playing" : "preview"}
      className={`group relative overflow-hidden rounded-lg bg-muted shadow-soft ${className}`}
    >
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        poster={poster}
        aria-label={title}
        title={title}
        className={`h-full w-full object-cover ${videoClassName}`}
        autoPlay={isVisible}
        muted={!isPlayingInline || !isAudible}
        loop={!isPlayingInline}
        controls={isPlayingInline}
        playsInline
        preload={shouldLoad ? "metadata" : "none"}
        onCanPlay={(event) => {
          if (isVisible && event.currentTarget.paused) {
            void event.currentTarget.play().catch(() => undefined);
          }
        }}
        onVolumeChange={(event) => {
          setIsAudible(isPlayingInline && !event.currentTarget.muted);
        }}
      />
      {!isPlayingInline && (
        <button
          type="button"
          onClick={openInlinePlayer}
          aria-label={`Play video: ${title}`}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent outline-none transition duration-300 hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="sr-only">Play video</span>
        </button>
      )}
    </div>
  );
}
