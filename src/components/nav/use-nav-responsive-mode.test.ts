import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("useNavResponsiveMode", () => {
  it("debounces window resize while keeping ResizeObserver updates immediate", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/nav/use-nav-responsive-mode.ts"), "utf8");

    expect(source).toContain("RESIZE_DEBOUNCE_MS = 120");
    expect(source).toContain("new ResizeObserver(() => {");
    expect(source).toContain("scheduleResizeUpdate();");
    expect(source).toContain('window.addEventListener("resize", scheduleResizeUpdate)');
    expect(source).not.toContain('window.addEventListener("resize", updateCompactMode)');
    expect(source).toContain("matchMedia(`(max-width: ${MIN_DESKTOP_NAV_WIDTH - 1}px)`");
  });
});
