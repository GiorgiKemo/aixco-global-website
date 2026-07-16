import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { useOptionalI18n } from "@/i18n/I18nProvider";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

type LiveVideoProps = {
  src: string;
  previewSrc?: string;
  title: string;
  poster?: string;
  className?: string;
  videoClassName?: string;
  videoStyle?: CSSProperties;
  fit?: "cover" | "contain";
  eager?: boolean;
  rootMargin?: string;
  autoplayPreview?: boolean;
  smoothPreview?: boolean;
};

const focusThreshold = 0.45;
const expandedVideoEvent = "aixco-live-video-expanded";
const videoDialogFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "video[controls]",
  "audio[controls]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function keepVideoDialogFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== "Tab") return;

  const focusable = Array.from(container.querySelectorAll<HTMLElement>(videoDialogFocusableSelector)).filter(
    (element) => element.tabIndex >= 0 && element.getAttribute("aria-hidden") !== "true" && !element.closest("[inert]"),
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!first || !last) {
    event.preventDefault();
    container.focus({ preventScroll: true });
  } else if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function isolateVideoDialog(layer: HTMLElement) {
  const previousStates: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }> = [];
  let current: HTMLElement = layer;

  while (current.parentElement) {
    const parent = current.parentElement;
    Array.from(parent.children).forEach((sibling) => {
      if (sibling === current || !(sibling instanceof HTMLElement)) return;
      previousStates.push({ element: sibling, inert: sibling.inert, ariaHidden: sibling.getAttribute("aria-hidden") });
      sibling.inert = true;
      sibling.setAttribute("aria-hidden", "true");
    });
    if (parent === document.body) break;
    current = parent;
  }

  return () => {
    previousStates.reverse().forEach(({ element, inert, ariaHidden }) => {
      element.inert = inert;
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    });
  };
}

export function LiveVideo({
  src,
  previewSrc,
  title,
  poster,
  className = "",
  videoClassName = "",
  videoStyle,
  fit = "cover",
  eager = false,
  rootMargin = "220px 0px",
  autoplayPreview = true,
  smoothPreview = false,
}: LiveVideoProps) {
  const tx = useOptionalI18n()?.tx ?? ((text: string) => text);
  const videoId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const expandedVideoRef = useRef<HTMLVideoElement | null>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalShellRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [isInFocus, setIsInFocus] = useState(eager);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasPreviewFrame, setHasPreviewFrame] = useState(false);
  const shouldReduceMotion = useHydratedReducedMotion();
  const [motionPreferenceResolved, setMotionPreferenceResolved] = useState(false);
  const shouldAutoplayPreview = autoplayPreview && motionPreferenceResolved && !shouldReduceMotion;
  const shouldAttachVideo = shouldLoad && shouldAutoplayPreview && isInFocus;
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
    setMotionPreferenceResolved(true);
  }, []);

  useEffect(() => {
    if (eager) {
      setShouldLoad(true);
      return;
    }
    if (typeof window === "undefined") return;

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
    if (eager) {
      setIsInFocus(true);
      return;
    }

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
  }, [eager]);

  useEffect(() => {
    setHasPreviewFrame(false);
  }, [inlineSrc]);

  useEffect(() => {
    if (!shouldAttachVideo) {
      setHasPreviewFrame(false);
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    }
  }, [shouldAttachVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldAttachVideo) return;

    if (isExpanded) {
      video.pause();
    } else if (isInFocus && shouldAutoplayPreview) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isExpanded, isInFocus, shouldAttachVideo, shouldAutoplayPreview]);

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
    const previousRootOverflow = document.documentElement.style.overflow;
    const opener = openButtonRef.current;
    const restoreIsolation = modalShellRef.current ? isolateVideoDialog(modalShellRef.current) : () => undefined;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    void expandedVideoRef.current?.play().catch(() => undefined);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExpandedPlayer();
        return;
      }
      if (dialogRef.current) keepVideoDialogFocus(event, dialogRef.current);
    };

    window.addEventListener("keydown", handleKeyDown);
    (closeButtonRef.current ?? dialogRef.current)?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      restoreIsolation();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [closeExpandedPlayer, isExpanded]);

  const expandedPlayer =
    isExpanded && typeof document !== "undefined"
      ? createPortal(
          <div ref={modalShellRef} className="live-video-modal-shell fixed inset-0 z-[100] flex items-center justify-center p-3 pt-16 animate-fade-in md:p-6 md:pt-20">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={closeExpandedPlayer}
            />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${tx("Expanded video")}: ${tx(title)}`}
              tabIndex={-1}
              className="relative z-10 max-h-[calc(100dvh-5rem)] max-w-[calc(100vw-1.5rem)] animate-scale-in md:max-h-[calc(100dvh-6.5rem)] md:max-w-6xl"
            >
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={`${tx("Close video")}: ${tx(title)}`}
                onClick={closeExpandedPlayer}
                className="live-video-modal-close fixed end-4 top-4 z-20 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition-colors duration-200 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 md:end-6 md:top-6"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">{tx("Close")}</span>
              </button>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-black/95 shadow-elegant">
                <video
                  ref={expandedVideoRef}
                  src={src}
                  poster={poster}
                  aria-label={`${tx(title)} ${tx("expanded player")}`}
                  title={tx(title)}
                  className="block h-auto max-h-[calc(100dvh-5rem)] w-auto max-w-[calc(100vw-1.5rem)] bg-black object-contain md:max-h-[calc(100dvh-6.5rem)] md:max-w-[calc(100vw-3rem)]"
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
              </div>
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
            className={`pointer-events-none absolute inset-0 h-full w-full ${
              fit === "contain" ? "object-contain" : "object-cover"
            } transition-opacity duration-300 ${shouldAttachVideo && shouldAutoplayPreview && isInFocus && hasPreviewFrame && !isExpanded ? "opacity-0" : "opacity-100"}`}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            decoding="async"
          />
        )}
        <video
          ref={videoRef}
          src={shouldAttachVideo ? inlineSrc : undefined}
          poster={poster}
          aria-label={title}
          title={tx(title)}
          className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${videoClassName}`}
          style={videoStyle}
          autoPlay={shouldAutoplayPreview && isInFocus && shouldAttachVideo && !isExpanded}
          muted
          loop={shouldAutoplayPreview}
          playsInline
          preload={previewPreload}
          onLoadedData={() => setHasPreviewFrame(true)}
          onError={() => setHasPreviewFrame(false)}
          onCanPlay={(event) => {
            setHasPreviewFrame(true);
            if (shouldAttachVideo && isInFocus && shouldAutoplayPreview && !isExpanded && event.currentTarget.paused) {
              void event.currentTarget.play().catch(() => undefined);
            }
          }}
        />
        <button
          ref={openButtonRef}
          type="button"
          onClick={openExpandedPlayer}
          aria-label={`${tx("Play video")}: ${tx(title)}`}
          aria-hidden={isExpanded ? "true" : undefined}
          tabIndex={isExpanded ? -1 : undefined}
          className={`absolute inset-0 z-10 bg-transparent outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            isExpanded ? "pointer-events-none opacity-0" : "cursor-pointer hover:bg-black/[0.03]"
          }`}
        >
          <span className="sr-only">{tx("Play video")}</span>
        </button>
      </div>
      {expandedPlayer}
    </>
  );
}
