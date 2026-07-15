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

const imageDialogFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function keepImageDialogFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== "Tab") return;

  const focusable = Array.from(container.querySelectorAll<HTMLElement>(imageDialogFocusableSelector)).filter(
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

function isolateImageDialog(layer: HTMLElement) {
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

export function ExpandableImage({ src, title, className = "", children, style, tabIndex }: ExpandableImageProps) {
  const tx = useOptionalI18n()?.tx ?? ((text: string) => text);
  const imageId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedImageSize, setExpandedImageSize] = useState<{ width: number; height: number } | null>(null);
  const suppressClickRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const modalShellRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeExpandedImage = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    if (!isExpanded || typeof window === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    const opener = triggerRef.current;
    const restoreIsolation = modalShellRef.current ? isolateImageDialog(modalShellRef.current) : () => undefined;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExpandedImage();
        return;
      }
      if (dialogRef.current) keepImageDialogFocus(event, dialogRef.current);
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
          <div ref={modalShellRef} className="expandable-image-modal-shell fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={closeExpandedImage}
            />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${tx("Expanded image")}: ${tx(title)}`}
              tabIndex={-1}
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
                  ref={closeButtonRef}
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
        ref={triggerRef}
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
