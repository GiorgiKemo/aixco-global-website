import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("marketing analytics route boundary", () => {
  it("keeps instrumentation out of the root and admin layouts", () => {
    const rootLayout = source("src/app/layout.tsx");
    const adminLayout = source("src/app/admin/layout.tsx");

    expect(rootLayout).not.toContain("MarketingAnalytics");
    expect(rootLayout).not.toContain("marketing-analytics");
    expect(adminLayout).not.toContain("MarketingAnalytics");
    expect(adminLayout).not.toContain("ClientShell");
  });

  it("mounts instrumentation through the shell used by every public page", () => {
    const clientShell = source("src/app/client-shell.tsx");
    const homePage = source("src/app/page.tsx");
    const propertyPage = source("src/app/aixco-global-op2/[slug]/page.tsx");

    expect(clientShell).toContain('import { MarketingAnalytics } from "./marketing-analytics"');
    expect(clientShell).toContain("<MarketingAnalytics />");
    expect(homePage).toContain("<ClientShell");
    expect(propertyPage).toContain("<ClientShell");
  });
});
