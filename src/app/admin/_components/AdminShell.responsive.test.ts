import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/admin/admin.css"), "utf8");

describe("AdminShell responsive contract", () => {
  it("keeps fixed shell regions inside device safe areas", () => {
    expect(css).toContain("env(safe-area-inset-top, 0px)");
    expect(css).toContain("env(safe-area-inset-right, 0px)");
    expect(css).toContain("env(safe-area-inset-bottom, 0px)");
    expect(css).toContain("env(safe-area-inset-left, 0px)");
    expect(css).toContain("min-height: 100dvh");
  });

  it("switches from the icon rail to a mobile menu at the compact breakpoint", () => {
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toMatch(/\.admin-shell__rail\s*{[\s\S]*?display:\s*none;/);
    expect(css).toMatch(/\.admin-shell__menu-button\s*{[\s\S]*?display:\s*inline-flex;/);
    expect(css).toMatch(/\.admin-shell__content\s*{[\s\S]*?margin-left:\s*0;/);
    expect(css).not.toContain(".admin-shell__wordmark img");
  });

  it("provides 44px interaction floors and reduced-motion behavior", () => {
    const controlFloors = css.match(/min-height:\s*44px/g) ?? [];
    expect(controlFloors.length).toBeGreaterThanOrEqual(4);
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).not.toContain("linear-gradient");
    expect(css).not.toContain("radial-gradient");
  });

  it("exposes a visible-on-focus skip link and AA text contrast tokens", () => {
    expect(css).toContain(".admin-shell__skip-link:focus");
    expect(css).toMatch(/\.admin-shell__drawer-header p\s*{[\s\S]*?color:\s*#7c5d17;/);
  });
});
