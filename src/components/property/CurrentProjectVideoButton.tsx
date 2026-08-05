"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { useOptionalI18n } from "@/i18n/I18nProvider";

type CurrentProjectVideoButtonProps = {
  englishSrc: string;
  germanSrc: string;
  title: string;
};

export function CurrentProjectVideoButton({
  englishSrc,
  germanSrc,
  title,
}: CurrentProjectVideoButtonProps) {
  const i18n = useOptionalI18n();
  const tx = i18n?.tx ?? ((text: string) => text);
  const language = i18n?.lang ?? "en";
  const src = language === "de" ? germanSrc : englishSrc;
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const video = videoRef.current;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    void video?.play().catch(() => undefined);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      video?.pause();
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#B08A32] px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_8px_18px_rgba(176,138,50,0.18)] transition-colors hover:bg-[#9A7425] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C767]"
      >
        <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
        <span>{tx("Play video")}</span>
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-8">
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`${tx("Play video")}: ${title}`}
                className="relative w-full max-w-6xl overflow-hidden rounded-lg border border-white/15 bg-black shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={tx("Close video")}
                  className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C767]"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
                <video
                  key={src}
                  ref={videoRef}
                  src={src}
                  title={title}
                  aria-label={title}
                  className="block max-h-[calc(100dvh-4rem)] w-full bg-black object-contain"
                  autoPlay
                  controls
                  controlsList="nodownload"
                  playsInline
                  preload="auto"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
