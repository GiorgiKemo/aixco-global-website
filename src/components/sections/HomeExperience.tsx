"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLayoutEffect } from "react";
import { aixcoHeroBackgroundVideo, aixcoLiveLogos } from "@/lib/aixco-live-assets";

const DesktopStoryHome = dynamic(
  () => import("@/components/sections/DesktopStoryHome").then((module) => module.DesktopStoryHome),
  { loading: () => <StoryBootSurface /> },
);

function StoryBootSurface() {
  return (
    <section
      aria-label="AIXCO.Global introduction"
      data-home-ssr-shell="true"
      className="relative isolate flex min-h-[100svh] overflow-hidden bg-[#11100e] text-white"
    >
      <Image
        src={aixcoHeroBackgroundVideo.poster}
        alt="Batumi skyline on the Black Sea"
        fill
        preload
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(17,16,14,0.76),rgba(17,16,14,0.30)_55%,rgba(17,16,14,0.58)),linear-gradient(180deg,rgba(17,16,14,0.18),rgba(17,16,14,0.64))]" />
      <div className="mx-auto flex w-full max-w-[1600px] flex-col justify-between px-5 pb-10 pt-6 sm:px-8 lg:px-12 lg:pb-14">
        <Image
          src={aixcoLiveLogos.aixcoHorizontalLight}
          alt="AIXCO.Global"
          width={1600}
          height={333}
          sizes="(min-width: 768px) 18rem, 10rem"
          className="h-auto w-40 sm:w-56 lg:w-72"
        />
        <div className="max-w-4xl pb-[8svh]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-sm">
            Switzerland · Dubai · Batumi
          </p>
          <h1 className="max-w-[14ch] text-[clamp(2.6rem,8vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.035em]">
            Wise selection. Recurring income generation.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/84 sm:text-lg">
            Selected real estate opportunities, transparent guidance, and long-term property support since 2009.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="btn-gold inline-flex min-h-11 items-center justify-center px-6 py-3">
              Contact AIXCO
            </a>
            <Link
              href="/aixco-global-op2/current-project"
              className="btn-ghost-gold inline-flex min-h-11 items-center justify-center px-6 py-3"
            >
              View current project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
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
