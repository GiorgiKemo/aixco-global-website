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
    const partnerBack = cssBlock(".partner-flip-back");

    expect(partnerInner).toContain("transform 420ms");
    expect(partnerInner).not.toContain("720ms");
    expect(partnerBack).toContain("overflow-wrap: anywhere");
  });

  it("keeps partner modal logo panels opaque", () => {
    const partnerModalLogoStage = cssBlock(".partner-modal-logo-stage");

    expect(partnerModalLogoStage).toContain("linear-gradient(145deg, hsl(220 15% 40%), hsl(220 16% 25%))");
    expect(partnerModalLogoStage).not.toContain("hsl(220 15% 40% /");
    expect(partnerModalLogoStage).not.toContain("hsl(220 16% 25% /");
    expect(partnerModalLogoStage).not.toContain("backdrop-filter");
  });

  it("keeps the hero scroll cue visible on short desktop viewports", () => {
    expect(css).toContain("@media (max-height: 820px) and (min-width: 768px)");
    expect(css).toContain("[data-hero-content-stack=\"true\"]");
    expect(css).toContain("transform: none !important");
    expect(css).toContain("[data-hero-scroll-cue=\"viewport\"]");
    expect(css).toContain("width: 4.25rem !important");
    expect(css).toContain("[data-hero-scroll-arrow=\"true\"]");
  });

  it("keeps asset detail CTAs large enough for mobile touch targets", () => {
    const assetDetailCta = cssBlock(".asset-detail-cta");

    expect(assetDetailCta).toContain("min-height: 2.75rem");
    expect(assetDetailCta).toContain("padding-block: 0.75rem");
    expect(cssBlock(".asset-detail-cta__label")).toContain("overflow-wrap: anywhere");
  });
});
