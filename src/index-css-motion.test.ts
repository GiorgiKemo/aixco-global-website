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

  it("keeps partner marquee hover responsive", () => {
    const partnerItem = cssBlock(".partner-marquee-item");
    const partnerLogoPanel = cssBlock(".partner-marquee-item__logo-panel");

    expect(partnerItem).toContain("transform 220ms");
    expect(partnerItem).not.toContain("420ms");
    expect(partnerLogoPanel).toContain("border-color 220ms");
    expect(partnerLogoPanel).toContain("box-shadow 220ms");
  });

  it("keeps partner modal logo panels opaque", () => {
    const partnerModalLogoStage = cssBlock(".partner-modal-logo-stage");

    expect(partnerModalLogoStage).toContain("linear-gradient(145deg, hsl(220 15% 40%), hsl(220 16% 25%))");
    expect(partnerModalLogoStage).not.toContain("hsl(220 15% 40% /");
    expect(partnerModalLogoStage).not.toContain("hsl(220 16% 25% /");
    expect(partnerModalLogoStage).not.toContain("backdrop-filter");
  });

  it("keeps hero safe-area support without tablet placement overrides", () => {
    expect(css).toContain("[data-hero-shell=\"true\"]");
    expect(css).toContain("min-height: 100svh");
    expect(css).toContain("env(safe-area-inset-top, 0px)");
    expect(css).toContain("env(safe-area-inset-bottom, 0px)");
    expect(css).not.toContain("@media (max-height: 840px) and (min-width: 768px) and (max-width: 1180px)");
    expect(css).not.toContain("transform: translateY(-1rem) !important");
    expect(css).not.toContain("font-size: clamp(3.7rem, 8.4vw, 5.45rem) !important");
    expect(css).not.toContain("bottom: 2.75rem !important");
  });

  it("keeps the desktop hero scroll cue clear of the price lockup", () => {
    expect(css).toContain("@media (min-width: 1181px) and (min-height: 760px)");
    expect(css).toContain("bottom: clamp(0.75rem, 2svh, 1.5rem) !important");
    expect(css).toContain("height: 5.25rem !important");
    expect(css).toContain("height: 5rem !important");
  });

  it("keeps the full hero visible in compact landscape browser viewports", () => {
    expect(css).toContain("@media (orientation: landscape) and (max-height: 520px)");
    expect(css).toContain("height: 3.5rem !important");
    expect(css).toContain("height: 100svh");
    expect(css).toContain("align-items: flex-start !important");
    expect(css).toContain("font-size: clamp(2.05rem, 7.35vw, 3.8rem) !important");
    expect(css).toContain("bottom: max(0.15rem, env(safe-area-inset-bottom, 0px)) !important");
  });

  it("keeps the scroll cue clear in narrow iPad landscape windows", () => {
    expect(css).toContain("@media (min-width: 560px) and (max-width: 767px) and (max-height: 780px)");
    expect(css).toContain("height: 100svh");
    expect(css).toContain("bottom: max(0.25rem, env(safe-area-inset-bottom, 0px)) !important");
    expect(css).toContain("height: 2.4rem !important");
    expect(css).toContain("height: 2.25rem !important");
  });

  it("keeps the scroll cue visible on very short phone viewports", () => {
    expect(css).toContain("@media (max-width: 559px) and (max-height: 560px)");
    expect(css).toContain("bottom: max(0.5rem, env(safe-area-inset-bottom, 0px)) !important");
    expect(css).toContain("height: 2.75rem !important");
    expect(css).toContain("height: 2.55rem !important");
  });

  it("keeps asset detail CTAs large enough for mobile touch targets", () => {
    const assetDetailCta = cssBlock(".asset-detail-cta");

    expect(assetDetailCta).toContain("min-height: 2.75rem");
    expect(assetDetailCta).toContain("padding-block: 0.75rem");
    expect(cssBlock(".asset-detail-cta__label")).toContain("overflow-wrap: anywhere");
  });
});
