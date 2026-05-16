import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("home page performance structure", () => {
  it("keeps media-heavy below-fold sections out of the initial home module", () => {
    const homeSource = readSource("src/views/HomePage.tsx");

    expect(homeSource).toContain('import { DeferredHomeSections } from "@/components/sections/DeferredHomeSections"');
    expect(homeSource).not.toContain('from "@/components/sections/Dubai"');
    expect(homeSource).not.toContain('from "@/components/sections/Batumi"');
    expect(homeSource).not.toContain('from "@/components/sections/Participate"');
    expect(homeSource).not.toContain('from "@/components/sections/Team"');
  });

  it("loads the deferred home section chunk through next dynamic imports", () => {
    const deferredSource = readSource("src/components/sections/DeferredHomeSections.tsx");

    expect(deferredSource).toContain('import dynamic from "next/dynamic"');
    expect(deferredSource).toContain("DeferredHomeSectionsContent");
    expect(deferredSource).toContain("dynamic(");
  });

  it("uses the Next 16 image preload API instead of the deprecated priority prop", () => {
    const philosophySource = readSource("src/views/AixcoPhilosophyPage.tsx");

    expect(philosophySource).toContain("preload");
    expect(philosophySource).not.toContain("priority");
  });

  it("keeps the philosophy hero fitted to viewport breakpoints", () => {
    const philosophySource = readSource("src/views/AixcoPhilosophyPage.tsx");

    expect(philosophySource).toContain("min-h-svh");
    expect(philosophySource).toContain("min-h-[calc(100svh-6rem)]");
    expect(philosophySource).toContain("md:min-h-[calc(100svh-7rem)]");
    expect(philosophySource).toContain("lg:min-h-[calc(100svh-8rem)]");
    expect(philosophySource).toContain("grid-cols-2");
    expect(philosophySource).toContain("lg:grid-cols-4");
    expect(philosophySource).toContain("uppercase");
    expect(philosophySource).toContain("tracking-[0.18em]");
    expect(philosophySource).toContain("md:tracking-[0.32em]");
    expect(philosophySource).toContain("text-[2.1rem]");
    expect(philosophySource).toContain("text-primary md:mt-5 md:text-5xl");
    expect(philosophySource).toContain("bg-primary/75");
  });

  it("keeps legacy insight articles aligned with the public page typography scale", () => {
    const articleSource = readSource("src/app/aixco-global-op2/[slug]/page.tsx");

    expect(articleSource).toContain("pt-20");
    expect(articleSource).toContain("md:pt-24");
    expect(articleSource).toContain("text-[clamp(2.35rem,5.5vw,4.75rem)]");
    expect(articleSource).toContain("[overflow-wrap:anywhere]");
    expect(articleSource).not.toContain("text-[clamp(2.45rem,7vw,5.6rem)]");
  });

  it("keeps the not-found page aligned with the public brand layout", () => {
    const notFoundSource = readSource("src/views/NotFoundView.tsx");

    expect(notFoundSource).toContain("<Nav />");
    expect(notFoundSource).toContain("<Footer />");
    expect(notFoundSource).toContain("bg-[#11100e]");
    expect(notFoundSource).toContain("btn-gold");
  });
});
