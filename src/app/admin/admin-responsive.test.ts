import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readAdminSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("admin responsive safeguards", () => {
  it("keeps page content inside device safe areas", () => {
    const css = readAdminSource("./admin.css");
    const pages = [
      "./leads/page.tsx",
      "./email-test/page.tsx",
      "./privacy/page.tsx",
      "./identity-migration/page.tsx",
      "./login/page.tsx",
      "./auth/complete/page.tsx",
      "./analytics/page.tsx",
    ].map(readAdminSource);

    expect(css).toContain("env(safe-area-inset-top, 0px)");
    expect(css).toContain("env(safe-area-inset-right, 0px)");
    expect(css).toContain("env(safe-area-inset-bottom, 0px)");
    expect(css).toContain("env(safe-area-inset-left, 0px)");
    expect(css).toContain("min-height: 100dvh");
    pages.forEach((page) => expect(page).toContain("admin-safe-page"));
  });

  it("keeps the raw analytics dashboard behind verified AAL2 admin access", () => {
    const analyticsPage = readAdminSource("./analytics/page.tsx");
    const adminIndex = readAdminSource("./page.tsx");

    expect(analyticsPage).toContain("requireAal2AdminSession");
    expect(analyticsPage).not.toContain("requireAdminSession");
    expect(analyticsPage).toContain("{ required: true }");
    expect(adminIndex).toContain("getAdminAuthDecision");
    expect(adminIndex).toContain('redirect("/admin/analytics")');
    expect(adminIndex).toContain('redirect("/admin/identity-migration")');
  });

  it("uses mobile-safe form text and 44px action floors", () => {
    const emailTestPage = readAdminSource("./email-test/page.tsx");
    const privacyPage = readAdminSource("./privacy/page.tsx");
    const identityPage = readAdminSource("./identity-migration/page.tsx");
    const leadsPage = readAdminSource("./leads/page.tsx");

    expect(emailTestPage).toContain("text-base");
    expect(privacyPage).toContain("text-base");
    expect(identityPage).toContain("text-base");
    expect(emailTestPage).toContain("min-h-11");
    expect(privacyPage).toContain("min-h-11");
    expect(leadsPage).toContain("min-h-11");
  });
});
