import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/story-mobile-menu.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const storyHome = readFileSync("src/components/sections/DesktopStoryHome.tsx", "utf8");

describe("mobile story menu", () => {
  it("uses one full-width surface on phones and a contained drawer on tablets", () => {
    expect(layout).toContain('import "@/story-mobile-menu.css"');
    expect(css).toContain("body.story-mobile-menu-open .story-mobile-header");
    expect(css).toContain("top: var(--story-mobile-header-height) !important");
    expect(css).toContain("width: 100vw !important");
    expect(css).toContain("width: min(24rem, 90vw) !important");
    expect(storyHome).toContain('className="pointer-events-none fixed inset-0 z-[70] w-screen xl:hidden"');
    expect(storyHome).toContain('sibling.classList.contains("story-mobile-header")');
    expect(storyHome).toContain('className="pointer-events-auto absolute inset-x-0 bottom-0 top-[var(--story-mobile-header-height)]');
    expect(storyHome).toContain("if (menuOpen) shouldRestoreMobileMenuFocusRef.current = false;");
  });

  it("keeps the navigation compact and readable", () => {
    expect(css).toContain("min-height: 2.85rem !important");
    expect(css).toContain("font-size: 0.94rem !important");
    expect(css).toContain("filter: brightness(0) !important");
  });
});
