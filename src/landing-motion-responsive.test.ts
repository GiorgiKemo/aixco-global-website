import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

const css = readSource("src/index.css");
const nextConfig = readSource("next.config.mjs");
const layout = readSource("src/app/layout.tsx");
const template = readSource("src/app/template.tsx");
const routeTransition = readSource("src/components/RouteTransition.tsx");
const residency = readSource("src/components/sections/GeorgiaResidencyLandingPage.tsx");
const medical = readSource("src/components/sections/MedicalTourismLandingPage.tsx");
const reverance = readSource("src/components/sections/BrandbookLandingPage.tsx");
const invest = readSource("src/components/sections/InvestBatumiLandingPage.tsx");

describe("landing page motion and responsiveness", () => {
  it("enables Next.js view transitions and mounts the route veil", () => {
    expect(nextConfig).toContain("viewTransition: true");
    expect(layout).toContain("import { RouteTransition } from \"@/components/RouteTransition\"");
    expect(layout).toContain("<RouteTransition />");
    expect(template).toContain('className="aixco-page-shell"');
    expect(routeTransition).toContain("prefersReducedMotion");
    expect(routeTransition).toContain("aixco-route-veil");
    expect(css).toContain("html[data-route-transition='marketing']::view-transition-old(root)");
    expect(css).toContain("html[data-route-transition='marketing']::view-transition-new(root)");
    expect(css).toContain(".aixco-route-veil.is-active");
    expect(css).toContain("html:active-view-transition .aixco-page-shell");
  });

  it("does not transform the page wrapper that owns fixed landing headers", () => {
    expect(css).not.toContain("transform: translate3d(0, 12px, 0) scale(1.008);");
  });

  it("scrolls landing-page sections through Lenis instead of native scrollIntoView", () => {
    expect(residency).toContain('import { scrollToHash } from "@/lib/smooth-scroll"');
    expect(residency).toContain("scrollToHash(`#${id}`)");
    expect(medical).toContain('import { scrollToHash } from "@/lib/smooth-scroll"');
    expect(medical).toContain("scrollToHash(href)");
    expect(reverance).toContain('import { scrollToHash } from "@/lib/smooth-scroll"');
    expect(reverance).toContain("scrollToHash(href)");
    expect(invest).toContain('import { scrollToHash } from "@/lib/smooth-scroll"');
    expect(invest).toContain("scrollToHash(href)");
    expect(residency).not.toContain("scrollIntoView");
    expect(medical).not.toContain("scrollIntoView");
    expect(reverance).not.toContain("scrollIntoView");
    expect(invest).not.toContain("scrollIntoView");
  });

  it("stacks the residency hero metrics before they crush on phones", () => {
    expect(residency).toContain("grid-cols-1 border-t border-white/20 min-[520px]:grid-cols-3");
    expect(residency).toContain("text-[clamp(2.55rem,12vw,7.6rem)]");
    expect(residency).toContain("w-[7.25rem] sm:w-36");
    expect(css).toContain("overflow-x: clip");
    expect(css).toContain(".brandbook-landing h1,\n.brandbook-landing h2,\n.residency-dossier h1,\n.residency-dossier h2");
    expect(css).toContain("overflow-wrap: anywhere");
  });

  it("keeps brandbook headers compact on narrow screens", () => {
    expect(medical).toContain("w-[7.25rem] sm:w-36 lg:w-40");
    expect(reverance).toContain("w-[7.25rem] sm:w-36 lg:w-40");
    expect(medical).toContain("min-h-[min(28rem,calc(100svh-4.6rem))]");
    expect(reverance).toContain("min-h-[min(28rem,calc(100svh-4.6rem))]");
    expect(medical).toContain('<span className="sm:hidden">{lang.toUpperCase()}</span>');
    expect(reverance).toContain('<span className="sm:hidden">{lang.toUpperCase()}</span>');
  });

  it("links the marketing landings to each other so route transitions are reachable", () => {
    expect(residency).toContain("LandingSiblingLinks");
    expect(medical).toContain("LandingSiblingLinks");
    expect(reverance).toContain("LandingSiblingLinks");
  });
});
