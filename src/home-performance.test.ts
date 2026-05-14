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
});
