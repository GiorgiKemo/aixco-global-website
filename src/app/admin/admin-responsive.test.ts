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
    expect(analyticsPage).toContain("after(() => auditAdminAction");
    expect(analyticsPage).not.toContain("{ required: true }");
    expect(adminIndex).toContain("getAdminAuthDecision");
    expect(adminIndex).toContain("loadAdminLaunchpadData");
    expect(adminIndex).toContain("<AdminShell");
    expect(adminIndex).toContain('redirect("/admin/identity-migration")');
  });

  it("uses mobile-safe form text and 44px action floors", () => {
    const emailTestPage = readAdminSource("./email-test/page.tsx");
    const privacyPage = [
      readAdminSource("./privacy/page.tsx"),
      readAdminSource("./privacy/PrivacyControls.tsx"),
    ].join("\n");
    const identityPage = readAdminSource("./identity-migration/page.tsx");
    const leadsPage = readAdminSource("./leads/page.tsx");

    expect(emailTestPage).toContain("text-base");
    expect(privacyPage).toContain("text-base");
    expect(identityPage).toContain("text-base");
    expect(emailTestPage).toContain("min-h-11");
    expect(privacyPage).toContain("min-h-11");
    expect(leadsPage).toContain("min-h-11");
  });

  it("keeps identity migration messaging aligned with mandatory MFA", () => {
    const identityPage = readAdminSource("./identity-migration/page.tsx");

    expect(identityPage).not.toContain("passwordOnlyAccess");
    expect(identityPage).toContain("The recipient must accept it, set a password, and enroll an authenticator.");
    expect(identityPage).toContain('admin.verifiedTotpFactors ? "TOTP verified" : "TOTP pending"');
  });

  it("uses AA-safe admin metadata colors and honest active-lead labels", () => {
    const css = readAdminSource("./admin.css");
    const analyticsDashboard = readAdminSource("./analytics/AnalyticsDashboard.tsx");
    const leadDetails = readAdminSource("./leads/AdminLeadDetails.tsx");
    const leadsPage = readAdminSource("./leads/page.tsx");

    expect(css).toContain("--primary: 41.6 68.7% 28.8%");
    expect(css).toMatch(/\.admin-shell__rail-avatar,[\s\S]*?background:\s*#8b6818;[\s\S]*?color:\s*#fff;/);
    expect(analyticsDashboard).not.toContain('text-[#9e9d9d]');
    expect(leadDetails).not.toContain('text-[#9e9d9d]');
    expect(leadsPage).toContain('{ label: "Active records", value: "records" }');
    expect(leadsPage).toContain('label="Active Leads"');
    expect(leadsPage).not.toContain("All records");
    expect(leadsPage).not.toContain("Total Leads");
  });
});
