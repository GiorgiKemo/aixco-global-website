"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect } from "react";

const DesktopStoryHome = dynamic(
  () => import("@/components/sections/DesktopStoryHome").then((module) => module.DesktopStoryHome),
  { ssr: false, loading: () => <StoryBootSurface /> },
);

function StoryBootSurface() {
  return <div aria-hidden="true" className="fixed inset-0 min-h-[100svh] bg-black" />;
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
