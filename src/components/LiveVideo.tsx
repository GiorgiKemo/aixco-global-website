import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { useOptionalI18n } from "@/i18n/I18nProvider";

type LiveVideoProps = {
  src: string;
  previewSrc?: string;
  title: string;
  poster?: string;
  className?: string;
  videoClassName?: string;
  fit?: "cover" | "contain";
  eager?: boolean;
  rootMargin?: string;
  autoplayPreview?: boolean;
  smoothPreview?: boolean;
};

const focusThreshold = 0.45;
const expandedVideoEvent = "aixco-live-video-expanded";

export function LiveVideo({
  src,
  previewSrc,
  title,
  poster,
  className = "",
  videoClassName = "",
  fit = "cover",
  eager = false,
  rootMargin = "350px 0px",
  autoplayPreview = false,
  smoothPreview = true,
}: LiveVideoProps) {
  const tx = useOptionalI18n()?.tx ?? ((text: string) => text);
  const videoId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const expandedVideoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [isInFocus, setIsInFocus] = useState(eager);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasPreviewFrame, setHasPreviewFrame] = useState(false);
  const shouldAttachVideo = shouldLoad && autoplayPreview;
  const inlineSrc = smoothPreview ? src : previewSrc ?? src;
  const previewPreload = shouldAttachVideo && isInFocus && smoothPreview ? "auto" : shouldAttachVideo ? "metadata" : "none";

  const closeExpandedPlayer = useCallback(() => {
    expandedVideoRef.current?.pause();
    setIsExpanded(false);
  }, []);

  const openExpandedPlayer = () => {
    setShouldLoad(true);
    setIsInFocus(true);
    setIsExpanded(true);
  };

  useEffect(() => {
    if (eager || typeof window === "undefined") return;

    const node = wrapperRef.current;
    if (!node || typeof window.IntersectionObserver !== "function") {
      setShouldLoad(true);
      setIsInFocus(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
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
    if (!node || typeof window.IntersectionObserver !== "function") {
      setIsInFocus(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIsInFocus = entry.isIntersecting && entry.intersectionRatio >= focusThreshold;
        setIsInFocus(nextIsInFocus);
      },
      { threshold: [0, focusThreshold, 1] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setHasPreviewFrame(false);
  }, [inlineSrc]);

  useEffect(() => {
    if (!shouldAttachVideo) {
      setHasPreviewFrame(false);
    }
  }, [shouldAttachVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldAttachVideo) return;

    if (isExpanded) {
      video.pause();
    } else if (isInFocus && autoplayPreview) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [autoplayPreview, isExpanded, isInFocus, shouldAttachVideo]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleExpandedVideo = (event: Event) => {
      if (!(event instanceof CustomEvent) || event.detail === videoId) return;
      closeExpandedPlayer();
    };

    window.addEventListener(expandedVideoEvent, handleExpandedVideo);
    return () => {
      window.removeEventListener(expandedVideoEvent, handleExpandedVideo);
    };
  }, [closeExpandedPlayer, videoId]);

  useEffect(() => {
    if (!isExpanded || typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(expandedVideoEvent, { detail: videoId }));
  }, [isExpanded, videoId]);

  useEffect(() => {
    if (!isExpanded || typeof window === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    void expandedVideoRef.current?.play().catch(() => undefined);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExpandedPlayer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeExpandedPlayer, isExpanded]);

  const expandedPlayer =
    isExpanded && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 animate-fade-in md:p-6">
            <button
              type="button"
              aria-label={`${tx("Close video")}: ${tx(title)}`}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={closeExpandedPlayer}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${tx("Expanded video")}: ${tx(title)}`}
              className="relative z-10 inline-flex max-h-[calc(100svh-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border border-white/10 bg-black/95 shadow-elegant animate-scale-in md:max-h-[calc(100svh-3rem)] md:max-w-6xl"
            >
              <video
                ref={expandedVideoRef}
                src={src}
                poster={poster}
                aria-label={`${tx(title)} ${tx("expanded player")}`}
                title={tx(title)}
                className="block h-auto max-h-[min(82svh,calc(100svh-2rem))] w-auto max-w-[calc(100vw-1.5rem)] bg-black object-contain md:max-w-[calc(100vw-3rem)]"
                autoPlay
                controls
                playsInline
                preload="auto"
                onCanPlay={(event) => {
                  if (event.currentTarget.paused) {
                    void event.currentTarget.play().catch(() => undefined);
                  }
                }}
              />
              <button
                type="button"
                aria-label={`${tx("Close video")}: ${tx(title)}`}
                onClick={closeExpandedPlayer}
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-md transition-colors duration-200 hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{tx("Close")}</span>
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={wrapperRef}
        data-video-state={isExpanded ? "expanded" : "preview"}
        className={`group relative overflow-hidden rounded-lg bg-muted shadow-soft ${className}`}
      >
        {poster && (
          <Image
            src={poster}
            alt=""
            aria-hidden="true"
            role="presentation"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            unoptimized
            className={`pointer-events-none absolute inset-0 h-full w-full ${
              fit === "contain" ? "object-contain" : "object-cover"
            } transition-opacity duration-300 ${shouldAttachVideo && autoplayPreview && isInFocus && hasPreviewFrame && !isExpanded ? "opacity-0" : "opacity-100"}`}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        )}
        <video
          ref={videoRef}
          src={shouldAttachVideo ? inlineSrc : undefined}
          poster={shouldAttachVideo ? poster : undefined}
          aria-label={title}
          title={tx(title)}
          className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${videoClassName}`}
          autoPlay={autoplayPreview && isInFocus && shouldAttachVideo && !isExpanded}
          muted
          loop={autoplayPreview}
          playsInline
          preload={previewPreload}
          onLoadedData={() => setHasPreviewFrame(true)}
          onError={() => setHasPreviewFrame(false)}
          onCanPlay={(event) => {
            setHasPreviewFrame(true);
            if (shouldAttachVideo && isInFocus && autoplayPreview && !isExpanded && event.currentTarget.paused) {
              void event.currentTarget.play().catch(() => undefined);
            }
          }}
        />
        {!isExpanded && (
          <button
            type="button"
            onClick={openExpandedPlayer}
            aria-label={`${tx("Play video")}: ${tx(title)}`}
            className="absolute inset-0 z-10 cursor-pointer bg-transparent outline-none transition duration-300 hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="sr-only">{tx("Play video")}</span>
          </button>
        )}
      </div>
      {expandedPlayer}
    </>
  );
}
