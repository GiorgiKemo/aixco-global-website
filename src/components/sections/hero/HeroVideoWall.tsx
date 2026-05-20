import Image from "next/image";
import { forwardRef, type SyntheticEvent } from "react";
import { motion } from "@/lib/framer-motion";
import {
  heroPanelVideos,
  shouldAttachHeroVideo,
  shouldShowHeroVideoPoster,
} from "../hero-video-policy";
import { heroEase } from "./hero-ui";

type HeroVideoWallProps = {
  shouldReduceMotion: boolean | null;
  shouldUseVideoWall: boolean;
  isHeroVideoIdleReady: boolean;
  isHeroInFocus: boolean;
  heroVideoPanelLimit: number;
  readyHeroVideos: Record<string, boolean>;
  onHeroVideoReady: (src: string, event: SyntheticEvent<HTMLVideoElement>) => void;
  onFirstVideoReady: () => void;
};

export const HeroVideoWall = forwardRef<HTMLDivElement, HeroVideoWallProps>(function HeroVideoWall(
  {
    shouldReduceMotion,
    shouldUseVideoWall,
    isHeroVideoIdleReady,
    isHeroInFocus,
    heroVideoPanelLimit,
    readyHeroVideos,
    onHeroVideoReady,
    onFirstVideoReady,
  },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      data-hero-video-wall="true"
      data-hero-video-mode={shouldUseVideoWall && isHeroVideoIdleReady && isHeroInFocus ? "video" : "poster"}
      className="hero-video-wall"
      aria-hidden="true"
      initial={shouldReduceMotion ? { scale: 1.006, opacity: 0.98 } : { scale: 1.055, opacity: 0.92 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.25 : 1.35, ease: heroEase }}
    >
      {heroPanelVideos.map((video, index) => {
        const shouldAttachVideo = shouldAttachHeroVideo({
          shouldUseVideoWall,
          isHeroVideoIdleReady,
          panelIndex: index,
          panelLimit: heroVideoPanelLimit,
        });
        const isVideoReady = readyHeroVideos[video.src] === true;
        const showPoster = shouldShowHeroVideoPoster({ shouldUseVideoWall: shouldAttachVideo, isHeroInFocus, isVideoReady });

        return (
          <div
            key={video.src}
            data-hero-video-panel="true"
            data-hero-video-ready={isVideoReady ? "true" : "false"}
            className="hero-video-panel"
          >
            <Image
              src={video.poster}
              alt=""
              aria-hidden="true"
              data-hero-video-poster="true"
              className={showPoster ? "opacity-100" : "opacity-0"}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            {shouldAttachVideo && (
              <video
                poster={video.poster}
                autoPlay={isHeroInFocus}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
                onLoadedData={(event) => {
                  onHeroVideoReady(video.src, event);
                  if (index === 0) onFirstVideoReady();
                }}
                onCanPlay={(event) => {
                  onHeroVideoReady(video.src, event);
                  if (index === 0) onFirstVideoReady();
                  if (isHeroInFocus) {
                    void event.currentTarget.play().catch(() => undefined);
                  }
                }}
                onPlaying={(event) => onHeroVideoReady(video.src, event)}
                onError={index === 0 ? onFirstVideoReady : undefined}
              >
                <source src={video.src} type="video/mp4" />
              </video>
            )}
          </div>
        );
      })}
    </motion.div>
  );
});
