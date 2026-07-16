import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(join(process.cwd(), ".github/workflows/ci.yml"), "utf8");

describe("production CI workflow", () => {
  it("keeps code, translation, database, dependency, build, and asset gates", () => {
    expect(workflow).toContain("npm run lint");
    expect(workflow).toContain("npm run typecheck");
    expect(workflow).toContain("npm run typecheck:test");
    expect(workflow).toContain("npm run test:coverage");
    expect(workflow).toContain("npm run test:i18n");
    expect(workflow).toContain("node scripts/verify-migration-history.mjs");
    expect(workflow).toContain("Enforce append-only migration history");
    expect(workflow).toContain("git diff --name-status");
    expect(workflow).toContain("supabase db reset --local --no-seed");
    expect(workflow).toContain("supabase db lint --local --level warning --fail-on error");
    expect(workflow).toContain("npm audit --omit=dev");
    expect(workflow).toContain("npm run build");
    expect(workflow).toContain("node scripts/verify-production-budgets.mjs");
    expect(workflow).toContain("production-release-gate:");
    expect(workflow).toContain("needs: verify");
  });

  it("runs every maintained production browser suite", () => {
    for (const command of [
      "npm run smoke",
      "npm run smoke:locales",
      "npm run smoke:languages",
      "npm run smoke:dubai",
      "npm run smoke:nav",
      "npm run smoke:mobile",
      "npm run smoke:mobile-scope",
    ]) {
      expect(workflow).toContain(command);
    }
  });
});
