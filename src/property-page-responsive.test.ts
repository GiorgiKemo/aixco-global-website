import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(resolve(process.cwd(), "src/app/aixco-global-op2/[slug]/page.tsx"), "utf8");
const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8").replace(/\r\n/g, "\n");

describe("current-project responsive metrics", () => {
  it("uses a 2x2 constrained layout and only expands to four columns at desktop width", () => {
    expect(pageSource).toContain("grid-cols-2");
    expect(pageSource).toContain("xl:grid-cols-4");
    expect(pageSource).not.toContain("sm:grid-cols-4");
  });

  it("keeps metric values aligned, readable, and non-wrapping", () => {
    expect(pageSource).toContain("property-detail-metric__label");
    expect(pageSource).toContain("property-detail-metric__value");
    expect(css).toContain(".property-detail-metric__label {\n  display: flex;\n  min-height: 3.5em;");
    expect(css).toContain("font-variant-numeric: lining-nums tabular-nums;");
    expect(css).toContain("white-space: nowrap;");
  });
});
