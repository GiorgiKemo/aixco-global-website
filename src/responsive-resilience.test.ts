import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

const css = readSource("src/index.css");
const story = readSource("src/components/sections/DesktopStoryHome.tsx");

describe("cross-device responsive resilience", () => {
  it("lets the full-width FAQ span both tablet grid columns", () => {
    expect(story).toContain('fullWidth ? "md:col-span-2 xl:col-span-12"');
  });

  it("uses viewport-height media queries instead of impossible self container queries", () => {
    expect(css).not.toContain("@container story-section (max-height:");
    for (const height of [62, 56, 48, 45]) {
      expect(css).toContain(`@media (max-height: ${height}rem)`);
    }
  });

  it("keeps pinch zoom available on draggable and drawer surfaces", () => {
    expect(css).not.toMatch(/touch-action:\s*pan-y;/);
    expect(css).not.toMatch(/touch-action:\s*pan-x pan-y;/);
    expect(css).toContain("touch-action: pan-y pinch-zoom;");
    expect(css).toContain("touch-action: pan-x pan-y pinch-zoom;");
  });

  it("positions floating controls logically and removes them behind mobile drawers", () => {
    expect(css).toContain(".scroll-to-top-button {");
    expect(css).toContain("inset-inline-start: max(1.25rem, var(--safe-inline-start)) !important;");
    expect(css).toContain("html.property-mobile-menu-open [data-scroll-to-top-button='true']");
    expect(css).toContain("html.story-mobile-menu-open [data-scroll-to-top-button='true']");
  });

  it("provides safe-area gutters and coarse-pointer target floors", () => {
    expect(css).toContain("padding-inline-start: max(2rem, var(--safe-inline-start)) !important;");
    expect(css).toContain("padding-inline-end: max(2rem, var(--safe-inline-end)) !important;");
    expect(css).toContain("@media (hover: none) and (pointer: coarse) and (min-width: 1280px)");
    expect(css).toContain("min-height: 2.75rem !important;");
  });

  it("keeps paired Philosophy metric values aligned when labels wrap", () => {
    expect(css).toContain("[data-layout='story-philosophy-stats'] > .story-philosophy-card {\n    display: flex;");
    expect(css).toContain("flex-direction: column;");
    expect(css).toContain("[data-layout='story-philosophy-stats'] .story-metric-label + dd {\n    margin-top: auto;");
    expect(css).toContain("padding-top: clamp(0.65rem, 1.35svh, 0.9rem);");
  });
});
