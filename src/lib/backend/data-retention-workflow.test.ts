import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(join(process.cwd(), ".github/workflows/data-retention.yml"), "utf8");
const vercel = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as {
  crons?: Array<{ path: string; schedule: string }>;
};

describe("data retention workflow", () => {
  it("uses Vercel for the daily run and GitHub for delayed recovery", () => {
    expect(vercel.crons).toContainEqual({
      path: "/api/cron/data-retention",
      schedule: "17 2 * * *",
    });
    expect(workflow).toContain('cron: "47 3 * * *"');
    expect(workflow).toContain("secrets.CONTACT_EMAIL_CRON_SECRET");
    expect(workflow).toContain("https://www.aixco.global/api/cron/data-retention");
    expect(workflow).toContain('Authorization: Bearer ${CRON_SECRET}');
  });
});
