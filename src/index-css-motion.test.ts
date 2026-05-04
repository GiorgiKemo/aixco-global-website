import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

function cssBlock(selector: string) {
  const start = css.indexOf(`  ${selector} {`);
  expect(start, `${selector} block`).toBeGreaterThanOrEqual(0);
  const end = css.indexOf("\n  }", start);
  return css.slice(start, end);
}

describe("index.css motion rules", () => {
  it("keeps shared buttons on targeted, snappy transitions", () => {
    const gold = cssBlock(".btn-gold");
    const ghost = cssBlock(".btn-ghost-gold");

    expect(gold).not.toContain("transition-all");
    expect(gold).toContain("translate 180ms");
    expect(gold).toContain("box-shadow 180ms");
    expect(ghost).not.toContain("transition-all");
    expect(ghost).toContain("translate 180ms");
    expect(ghost).toContain("background-color 180ms");
  });

  it("animates individual translate hover properties instead of broad all transitions", () => {
    const dataPanel = cssBlock(".data-panel");
    const macCard = cssBlock(".mac-card");

    expect(dataPanel).toContain("translate 0.3s");
    expect(dataPanel).not.toContain("transition-all");
    expect(macCard).toContain("translate 0.3s");
    expect(macCard).not.toContain("transition-all");
  });

  it("keeps partner flip hover responsive", () => {
    const partnerInner = cssBlock(".partner-flip-card-inner");

    expect(partnerInner).toContain("transform 420ms");
    expect(partnerInner).not.toContain("720ms");
  });

  it("keeps the hero scroll cue visible on short desktop viewports", () => {
    expect(css).toContain("@media (max-height: 820px) and (min-width: 768px)");
    expect(css).toContain("[data-hero-content-stack=\"true\"]");
    expect(css).toContain("transform: none !important");
    expect(css).toContain("[data-hero-scroll-cue=\"viewport\"]");
    expect(css).toContain("width: 4.25rem !important");
    expect(css).toContain("[data-hero-lottie-arrow=\"true\"]");
  });
});
