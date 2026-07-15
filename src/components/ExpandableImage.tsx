import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { useOptionalI18n } from "@/i18n/I18nProvider";

type ExpandableImageProps = {
  src: string;
  title: string;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  tabIndex?: number;
};

export function ExpandableImage({ src, title, className = "", children, style, tabIndex }: ExpandableImageProps) {
  const tx = useOptionalI18n()?.tx ?? ((text: string) => text);
  const imageId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedImageSize, setExpandedImageSize] = useState<{ width: number; height: number } | null>(null);
  const suppressClickRef = useRef(false);

  const closeExpandedImage = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    if (!isExpanded || typeof window === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExpandedImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [closeExpandedImage, isExpanded]);

  useEffect(() => {
    if (!isExpanded || typeof window === "undefined") return;

    let cancelled = false;
    setExpandedImageSize(null);

    const image = new window.Image();
    image.onload = () => {
      if (cancelled) return;

      setExpandedImageSize({
        width: image.naturalWidth || 1600,
        height: image.naturalHeight || 1000,
      });
    };
    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [isExpanded, src]);

  const handleMouseDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || typeof window === "undefined") return;

    const startX = event.clientX;
    const startY = event.clientY;
    suppressClickRef.current = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 6) {
        suppressClickRef.current = true;
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0];
    if (!touch || typeof window === "undefined") return;

    const startX = touch.clientX;
    const startY = touch.clientY;
    suppressClickRef.current = false;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const nextTouch = moveEvent.touches[0];
      if (!nextTouch) return;

      if (Math.hypot(nextTouch.clientX - startX, nextTouch.clientY - startY) > 6) {
        suppressClickRef.current = true;
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
  };

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }

    setIsExpanded(true);
  };

  const expandedImageAspectRatio = expandedImageSize
    ? `${expandedImageSize.width} / ${expandedImageSize.height}`
    : "16 / 10";
  const expandedImageWidth = expandedImageSize
    ? `min(${expandedImageSize.width}px, 92vw, 72rem, calc(70svh * ${expandedImageSize.width / expandedImageSize.height}))`
    : "min(92vw, 72rem)";

  const expandedImage =
    isExpanded && typeof document !== "undefined"
      ? createPortal(
          <div className="expandable-image-modal-shell fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
            <button
              type="button"
              aria-label={`${tx("Close image")}: ${tx(title)}`}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={closeExpandedImage}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${tx("Expanded image")}: ${tx(title)}`}
              className="relative z-10 flex max-h-[calc(100dvh-2rem)] max-w-[min(92vw,72rem)] flex-col items-center overflow-visible outline-none animate-scale-in md:max-w-[min(82vw,68rem)]"
            >
              <div
                className="relative max-w-full"
                style={{
                  aspectRatio: expandedImageAspectRatio,
                  width: expandedImageWidth,
                }}
              >
                <button
                  type="button"
                  aria-label={`${tx("Close image")}: ${tx(title)}`}
                  onClick={closeExpandedImage}
                  className="absolute end-1 top-1 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/72 text-white shadow-[0_14px_34px_rgb(0_0_0/0.34)] backdrop-blur-md transition-colors duration-200 hover:bg-black/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 md:end-0 md:top-0 md:-translate-y-1/2 ltr:md:translate-x-1/2 rtl:md:-translate-x-1/2"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">{tx("Close")}</span>
                </button>
                <Image
                  id={imageId}
                  src={src}
                  alt={tx(title)}
                  fill
                  sizes="(min-width: 768px) 82vw, 92vw"
                  unoptimized
                  className="block h-auto max-h-[min(70svh,42rem)] max-w-full rounded-md object-contain shadow-[0_0_48px_rgb(0_0_0/0.2)] md:max-h-[min(68svh,42rem)]"
                  decoding="async"
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-label={`${tx("Expand image")}: ${tx(title)}`}
        className={`expandable-image-trigger block overflow-hidden border-0 bg-transparent p-0 text-left ${className}`}
        data-expandable-image-trigger
        style={style}
        tabIndex={tabIndex}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {children}
      </button>
      {expandedImage}
    </>
  );
}
