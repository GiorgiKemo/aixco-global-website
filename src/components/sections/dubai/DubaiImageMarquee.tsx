import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ExpandableImage } from "@/components/ExpandableImage";
import { motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useSpring } from "@/lib/framer-motion";
import type { DubaiFundGalleryGroup, Translate } from "./dubai-data";

const eagerGalleryTileCount = 3;

type GalleryTileLoading = {
  isGalleryInView: boolean;
  imageIndex: number;
};

function getGalleryTileLoading({ isGalleryInView, imageIndex }: GalleryTileLoading) {
  const shouldEagerLoad = isGalleryInView && imageIndex < eagerGalleryTileCount;

  return {
    loading: shouldEagerLoad ? "eager" : "lazy",
    fetchPriority: shouldEagerLoad ? "high" : "auto",
  } as const;
}

function getRenderedGalleryOffset(loopWidth: number, offset: number) {
  if (loopWidth === 0) return Math.max(0, offset);

  return ((offset % loopWidth) + loopWidth) % loopWidth;
}

function getGalleryWheelDelta(event: WheelEvent) {
  const primaryDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return primaryDelta * 18;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return primaryDelta * window.innerWidth;
  return primaryDelta;
}

type DubaiImageMarqueeProps = {
  group: DubaiFundGalleryGroup;
  reverse?: boolean;
  shouldReduceMotion: boolean | null;
  speed?: "standard" | "slow";
  tx: Translate;
};

export function DubaiImageMarquee({
  group,
  reverse = false,
  shouldReduceMotion,
  speed = "standard",
  tx,
}: DubaiImageMarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopWidthRef = useRef(0);
  const visualOffsetRef = useRef(0);
  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: null as number | null,
    lastX: 0,
    startX: 0,
    startY: 0,
    lastTime: 0,
    velocity: 0,
  });
  const interactionPauseUntilRef = useRef(0);
  const [isGalleryInView, setIsGalleryInView] = useState(
    () => process.env.NODE_ENV === "test" || process.env.VITEST === "true",
  );
  const trackX = useMotionValue(0);
  const targetOffset = useMotionValue(0);
  const smoothOffset = useSpring(targetOffset, {
    stiffness: shouldReduceMotion ? 150 : 96,
    damping: shouldReduceMotion ? 32 : 24,
    mass: shouldReduceMotion ? 0.55 : 0.72,
    restDelta: 0.001,
  });

  const renderGalleryOffset = useCallback((offset: number) => {
    const renderedOffset = getRenderedGalleryOffset(loopWidthRef.current, offset);
    trackX.set(-renderedOffset);
  }, [trackX]);

  const setImmediateGalleryOffset = useCallback((offset: number) => {
    targetOffset.jump(offset);
    smoothOffset.jump(offset);
    visualOffsetRef.current = offset;
    renderGalleryOffset(offset);
  }, [renderGalleryOffset, smoothOffset, targetOffset]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const handleWheel = (event: WheelEvent) => {
      if (!event.cancelable || event.ctrlKey || event.metaKey || event.altKey) return;
      const hasHorizontalIntent = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!hasHorizontalIntent) return;

      const delta = getGalleryWheelDelta(event);
      if (Math.abs(delta) < 1) return;

      event.preventDefault();
      targetOffset.set(targetOffset.get() + delta * (shouldReduceMotion ? 0.82 : 1.18));
      interactionPauseUntilRef.current = window.performance.now() + 520;
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [shouldReduceMotion, targetOffset]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === "undefined") {
      setIsGalleryInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsGalleryInView(entry.isIntersecting);
      },
      { rootMargin: "360px 0px", threshold: 0.01 },
    );

    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateLoopWidth = () => {
      const track = trackRef.current;
      if (!track) return;

      loopWidthRef.current = track.scrollWidth / 2;
      renderGalleryOffset(visualOffsetRef.current);
    };

    updateLoopWidth();
    window.addEventListener("resize", updateLoopWidth);

    const track = trackRef.current;
    const resizeObserver = typeof ResizeObserver === "undefined" || !track ? null : new ResizeObserver(updateLoopWidth);

    if (track) resizeObserver?.observe(track);

    return () => {
      window.removeEventListener("resize", updateLoopWidth);
      resizeObserver?.disconnect();
    };
  }, [group.images, renderGalleryOffset]);

  useMotionValueEvent(smoothOffset, "change", (latest) => {
    visualOffsetRef.current = latest;
    renderGalleryOffset(latest);
  });

  useAnimationFrame((time, delta) => {
    if (
      shouldReduceMotion ||
      !isGalleryInView ||
      !trackRef.current ||
      dragRef.current.active ||
      time < interactionPauseUntilRef.current
    ) return;

    const deltaSeconds = Math.min(delta, 64) / 1000;
    if (deltaSeconds <= 0) return;

    const speedPixels = speed === "slow" ? 24 : 34;
    const direction = reverse ? -1 : 1;

    targetOffset.set(targetOffset.get() + direction * speedPixels * deltaSeconds);
  },);

  const updateDrag = useCallback((clientX: number, timeStamp: number) => {
    const drag = dragRef.current;
    if (!drag.active) return false;

    const deltaX = clientX - drag.lastX;
    const deltaTime = Math.max(16, timeStamp - drag.lastTime);
    const nextOffset = visualOffsetRef.current - deltaX;

    setImmediateGalleryOffset(nextOffset);
    drag.velocity = (-deltaX / deltaTime) * 1000;
    drag.lastX = clientX;
    drag.lastTime = timeStamp;
    return true;
  }, [setImmediateGalleryOffset]);

  const finishDrag = useCallback((target?: HTMLDivElement | null) => {
    const drag = dragRef.current;
    if (!drag.active) return;

    if (target && drag.pointerId !== null && target.hasPointerCapture?.(drag.pointerId)) {
      target.releasePointerCapture(drag.pointerId);
    }

    drag.active = false;
    drag.moved = false;
    drag.pointerId = null;
    targetOffset.set(visualOffsetRef.current + drag.velocity * (shouldReduceMotion ? 0.16 : 0.34));
    interactionPauseUntilRef.current = window.performance.now() + 420;
  }, [shouldReduceMotion, targetOffset]);

  const startDrag = (clientX: number, clientY: number, timeStamp: number, pointerId: number) => {
    const currentOffset = visualOffsetRef.current || targetOffset.get();

    dragRef.current.active = true;
    dragRef.current.moved = false;
    dragRef.current.pointerId = pointerId;
    dragRef.current.lastX = clientX;
    dragRef.current.startX = clientX;
    dragRef.current.startY = clientY;
    dragRef.current.lastTime = timeStamp;
    dragRef.current.velocity = 0;
    setImmediateGalleryOffset(currentOffset);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    startDrag(event.clientX, event.clientY, event.timeStamp, event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const totalX = event.clientX - drag.startX;
    const totalY = event.clientY - drag.startY;
    const isCoarsePointer = event.pointerType === "touch" || event.pointerType === "pen";

    if (isCoarsePointer && Math.abs(totalY) > Math.abs(totalX) && Math.abs(totalY) > 8) {
      finishDrag(event.currentTarget);
      return;
    }

    if (isCoarsePointer && Math.abs(totalX) < 4) return;
    if (!isCoarsePointer && Math.abs(totalX) < 3) return;

    if (!drag.moved) {
      drag.moved = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    if (!updateDrag(event.clientX, event.timeStamp)) return;

    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    finishDrag(event.currentTarget);
  };

  return (
    <div
      ref={viewportRef}
      aria-label={`${tx(group.title)} ${tx("images")}`}
      className="dubai-image-marquee relative cursor-grab select-none active:cursor-grabbing"
      data-gallery-group={group.title}
      data-layout="horizontal-infinite-gallery"
      data-drag-scroll="pointer-capture"
      data-auto-scroll="continuous"
      data-auto-scroll-paused={shouldReduceMotion ? "true" : "false"}
      data-motion-preference={shouldReduceMotion ? "reduced" : "standard"}
      data-motion-engine="framer-motion"
      data-scroll-direction={reverse ? "reverse" : "forward"}
      data-scroll-speed={speed}
      data-visual-scroll="framer-transform"
      data-scroll-easing="true"
      data-scroll-mode="framer-motion-glide-loop"
      data-scroll-physics="auto-wheel-pointer-drag-glide"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <motion.div
        ref={trackRef}
        className="dubai-image-marquee-track"
        data-gallery-track="framer-motion-loop"
        style={{ x: trackX }}
      >
        {[0, 1].map((setIndex) => (
          <div
            key={`${group.title}-${setIndex}`}
            aria-hidden={setIndex === 1 ? "true" : undefined}
            className="dubai-image-marquee-set"
            data-gallery-set={setIndex === 0 ? "primary" : "duplicate"}
          >
            {group.images.map((image, imageIndex) => {
              const tileLoading = getGalleryTileLoading({ isGalleryInView, imageIndex });

              return (
                <figure key={`${setIndex}-${image.src}`} className="dubai-gallery-tile" data-gallery-tile>
                  <ExpandableImage
                    src={image.src}
                    title={tx(image.title)}
                    className="h-full w-full"
                    tabIndex={setIndex === 1 ? -1 : undefined}
                  >
                    <Image
                      src={image.src}
                      alt={setIndex === 0 ? tx(image.title) : ""}
                      loading={tileLoading.loading}
                      fetchPriority={tileLoading.fetchPriority}
                      decoding="async"
                      draggable={false}
                      width={1280}
                      height={720}
                      sizes="(min-width: 1024px) 30rem, 78vw"
                      className="h-full w-full object-cover"
                      onDragStart={(event) => event.preventDefault()}
                    />
                  </ExpandableImage>
                </figure>
              );
            })}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
