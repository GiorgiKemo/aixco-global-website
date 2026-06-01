import Image from "next/image";
import { forwardRef, type SyntheticEvent } from "react";
import {
  heroPanelVideos,
  shouldAttachHeroVideo,
  shouldShowHeroVideoPoster,
} from "../hero-video-policy";

type HeroVideoWallProps = {
  shouldUseVideoWall: boolean;
  isHeroVideoIdleReady: boolean;
  isHeroInFocus: boolean;
  heroVideoPanelLimit: number;
  readyHeroVideos: Record<string, boolean>;
  onHeroVideoReady: (src: string, event: SyntheticEvent<HTMLVideoElement>) => void;
};

export const HeroVideoWall = forwardRef<HTMLDivElement, HeroVideoWallProps>(function HeroVideoWall(
  {
    shouldUseVideoWall,
    isHeroVideoIdleReady,
    isHeroInFocus,
    heroVideoPanelLimit,
    readyHeroVideos,
    onHeroVideoReady,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      data-hero-video-wall="true"
      data-hero-video-mode={shouldUseVideoWall && isHeroVideoIdleReady && isHeroInFocus ? "video" : "poster"}
      className="hero-video-wall"
      aria-hidden="true"
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
              quality={62}
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
                }}
                onCanPlay={(event) => {
                  onHeroVideoReady(video.src, event);
                  if (isHeroInFocus) {
                    void event.currentTarget.play().catch(() => undefined);
                  }
                }}
                onPlaying={(event) => onHeroVideoReady(video.src, event)}
              >
                <source src={video.src} type="video/mp4" />
              </video>
            )}
          </div>
        );
      })}
    </div>
  );
});
