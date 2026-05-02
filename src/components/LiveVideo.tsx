import { useEffect, useRef, useState } from "react";

type LiveVideoProps = {
  src: string;
  title: string;
  poster?: string;
  className?: string;
  videoClassName?: string;
  eager?: boolean;
  rootMargin?: string;
};

export function LiveVideo({
  src,
  title,
  poster,
  className = "",
  videoClassName = "",
  eager = false,
  rootMargin = "350px 0px",
}: LiveVideoProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [isVisible, setIsVisible] = useState(eager);

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
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (isVisible) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isVisible, shouldLoad]);

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden rounded-lg bg-black shadow-soft ${className}`}>
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        poster={poster}
        aria-label={title}
        title={title}
        className={`h-full w-full object-cover ${videoClassName}`}
        autoPlay={isVisible}
        muted
        loop
        playsInline
        preload={shouldLoad ? "metadata" : "none"}
        onCanPlay={(event) => {
          if (isVisible && event.currentTarget.paused) {
            void event.currentTarget.play().catch(() => undefined);
          }
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <div className="pointer-events-none absolute left-4 top-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.75)]" />
    </div>
  );
}
