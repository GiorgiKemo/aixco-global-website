import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(join(process.cwd(), ".github/workflows/data-retention.yml"), "utf8");

describe("data retention workflow", () => {
  it("runs daily against the protected production endpoint", () => {
    expect(workflow).toContain('cron: "17 2 * * *"');
    expect(workflow).toContain("secrets.CONTACT_EMAIL_CRON_SECRET");
    expect(workflow).toContain("https://www.aixco.global/api/cron/data-retention");
    expect(workflow).toContain('Authorization: Bearer ${CRON_SECRET}');
  });
});
