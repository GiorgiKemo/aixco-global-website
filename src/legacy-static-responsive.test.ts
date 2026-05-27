import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { findLegacyInsight, getLegacyInsightParams, legacyInsights } from "@/data/legacy-insights";

describe("legacy insight migration", () => {
  it("keeps old static article content unpublished until the client rewrite is ready", () => {
    expect(legacyInsights).toHaveLength(0);
    expect(findLegacyInsight()).toBeNull();
  });

  it("does not generate static params for disabled historical article routes", () => {
    expect(getLegacyInsightParams()).toEqual([]);
  });

  it("removes obsolete public HTML files from the public build", () => {
    expect(existsSync(resolve(process.cwd(), "public/aixco-global-op2/index.html"))).toBe(false);
  });
});
