import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const adminRoot = join(process.cwd(), "src", "app", "admin");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.(?:ts|tsx)$/.test(entry.name) || /\.test\.(?:ts|tsx)$/.test(entry.name)) return [];
    return [path];
  });
}

function adminPath(path: string) {
  return relative(adminRoot, path).split(sep).join("/");
}

const sensitiveEntrypoints = [
  ["analytics/page.tsx", "requireAal2AdminSession"],
  ["email-test/page.tsx", "requireAal2AdminSession"],
  ["email-test/send/route.ts", "getAal2AdminAuthDecision"],
  ["leads/page.tsx", "requireAal2AdminSession"],
  ["leads/requeue-email/route.ts", "getAal2AdminAuthDecision"],
  ["leads/status/route.ts", "getAal2AdminAuthDecision"],
  ["privacy/page.tsx", "requireAal2AdminSession"],
  ["privacy/delete/route.ts", "getAal2AdminAuthDecision"],
  ["privacy/export/route.ts", "getAal2AdminAuthDecision"],
] as const;

const migrationAuthAllowlist = [
  "identity-migration/invite/route.ts",
  "identity-migration/page.tsx",
  "login/audit/route.ts",
  "login/page.tsx",
  "logout/route.ts",
  "page.tsx",
];

describe("admin authorization policy", () => {
  it.each(sensitiveEntrypoints)("requires verified AAL2 at %s", (path, helper) => {
    const source = readFileSync(join(adminRoot, path), "utf8");
    expect(source).toContain(helper);
    expect(source).not.toMatch(/\brequireAdminSession\b|\bgetAdminAuthDecision\b/);
  });

  it("keeps generic migration authentication confined to the rollout allowlist", () => {
    const genericAuthUsage = sourceFiles(adminRoot)
      .filter((path) => /\brequireAdminSession\b|\bgetAdminAuthDecision\b/.test(readFileSync(path, "utf8")))
      .map(adminPath)
      .sort();

    expect(genericAuthUsage).toEqual([...migrationAuthAllowlist].sort());
  });

  it("does not redirect invitation setup through the migration-session loop", () => {
    const source = readFileSync(join(adminRoot, "login", "page.tsx"), "utf8");
    expect(source).toContain('setup !== "1"');
    expect(source).toContain('"/admin/identity-migration"');
    expect(source).toContain('? "/admin"');
  });
});
