"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect } from "react";

const DesktopStoryHome = dynamic(
  () => import("@/components/sections/DesktopStoryHome").then((module) => module.DesktopStoryHome),
  { ssr: false, loading: () => <StoryBootSurface /> },
);

function StoryBootSurface() {
  return (
    <div aria-hidden="true" className="min-h-[100svh] bg-foreground">
      <div className="fixed inset-y-0 left-0 w-[clamp(13.5rem,15vw,16rem)] border-r border-foreground/10 bg-white" />
    </div>
  );
}

export function HomeExperience() {
  useLayoutEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.body.classList.add("home-story-nav-hidden");
    document.body.classList.remove("home-desktop-story-boot");

    return () => {
      document.body.classList.remove("home-desktop-story-boot");
      document.body.classList.remove("home-story-nav-hidden");
    };
  }, []);

  return (
    <div data-home-experience-mode="story">
      <DesktopStoryHome />
    </div>
  );
}
