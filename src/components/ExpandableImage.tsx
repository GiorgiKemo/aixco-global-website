import { useCallback, useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { useOptionalI18n } from "@/i18n/I18nProvider";

type ExpandableImageProps = {
  src: string;
  title: string;
  className?: string;
  children: ReactNode;
  tabIndex?: number;
};

export function ExpandableImage({ src, title, className = "", children, tabIndex }: ExpandableImageProps) {
  const tx = useOptionalI18n()?.tx ?? ((text: string) => text);
  const imageId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const suppressClickRef = useRef(false);

  const closeExpandedImage = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    if (!isExpanded || typeof window === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExpandedImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeExpandedImage, isExpanded]);

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

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }

    setIsExpanded(true);
  };

  const expandedImage =
    isExpanded && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 animate-fade-in md:p-6">
            <button
              type="button"
              aria-label={`${tx("Close image")}: ${tx(title)}`}
              className="absolute inset-0 bg-background/86 backdrop-blur-xl"
              onClick={closeExpandedImage}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${tx("Expanded image")}: ${tx(title)}`}
              className="relative z-10 flex max-h-[calc(100svh-2rem)] w-full max-w-7xl items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black shadow-elegant animate-scale-in"
            >
              <Image
                id={imageId}
                src={src}
                alt={tx(title)}
                width={1600}
                height={1000}
                sizes="100vw"
                unoptimized
                className="block max-h-[calc(100svh-2rem)] w-full object-contain"
                decoding="async"
              />
              <button
                type="button"
                aria-label={`${tx("Close image")}: ${tx(title)}`}
                onClick={closeExpandedImage}
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
      <button
        type="button"
        aria-label={`${tx("Expand image")}: ${tx(title)}`}
        className={`expandable-image-trigger block overflow-hidden border-0 bg-transparent p-0 text-left ${className}`}
        data-expandable-image-trigger
        tabIndex={tabIndex}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        {children}
      </button>
      {expandedImage}
    </>
  );
}
