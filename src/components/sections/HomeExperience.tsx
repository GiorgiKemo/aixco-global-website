"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect } from "react";

const DesktopStoryHome = dynamic(
  () => import("@/components/sections/DesktopStoryHome").then((module) => module.DesktopStoryHome),
  { ssr: false, loading: () => <StoryBootSurface /> },
);

function StoryBootSurface() {
  return <div aria-hidden="true" className="fixed inset-0 min-h-[100svh] bg-background" />;
}

export function HomeExperience() {
  useLayoutEffect(() => {
    if (typeof document === "undefined") return undefined;

    const previousHomeExperience = document.documentElement.dataset.homeExperience;
    if (previousHomeExperience !== "story") {
      document.documentElement.dataset.homeExperience = "story";
    }
    document.body.classList.add("home-story-nav-hidden");
    document.body.classList.remove("home-desktop-story-boot");

    return () => {
      if (previousHomeExperience === undefined) {
        delete document.documentElement.dataset.homeExperience;
      } else {
        document.documentElement.dataset.homeExperience = previousHomeExperience;
      }
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
