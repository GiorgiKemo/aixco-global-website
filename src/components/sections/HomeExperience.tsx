"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useState, type ReactNode } from "react";

const DesktopStoryHome = dynamic(
  () => import("@/components/sections/DesktopStoryHome").then((module) => module.DesktopStoryHome),
  { ssr: false, loading: () => <StoryBootSurface /> },
);

const desktopStoryQuery = "(min-width: 1280px) and (min-height: 700px)";

function supportsDesktopStory() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(desktopStoryQuery).matches;
}

function StoryBootSurface() {
  return (
    <div aria-hidden="true" className="min-h-[100svh] bg-foreground">
      <div className="fixed inset-y-0 left-0 w-[clamp(13.5rem,15vw,16rem)] border-r border-foreground/10 bg-white" />
    </div>
  );
}

export function HomeExperience({ children }: { children: ReactNode }) {
  const [shouldUseStory, setShouldUseStory] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia(desktopStoryQuery);
    const updateStoryMode = () => {
      setShouldUseStory(mediaQuery.matches);
    };

    updateStoryMode();
    mediaQuery.addEventListener("change", updateStoryMode);
    return () => mediaQuery.removeEventListener("change", updateStoryMode);
  }, []);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return undefined;

    if (shouldUseStory && supportsDesktopStory()) {
      document.body.classList.add("home-story-nav-hidden");
    } else {
      document.body.classList.remove("home-desktop-story-boot");
      document.body.classList.remove("home-story-nav-hidden");
    }

    return () => {
      document.body.classList.remove("home-desktop-story-boot");
      document.body.classList.remove("home-story-nav-hidden");
    };
  }, [shouldUseStory]);

  if (shouldUseStory && supportsDesktopStory()) {
    return (
      <div data-home-experience-mode="story">
        <DesktopStoryHome />
      </div>
    );
  }

  return <div data-home-experience-mode={shouldUseStory ? "story-loading" : "native"}>{children}</div>;
}
