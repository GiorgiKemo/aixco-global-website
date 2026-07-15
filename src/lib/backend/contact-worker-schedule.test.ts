import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("contact email worker schedule", () => {
  it("uses the protected GitHub scheduler instead of an unsupported Vercel Hobby cron", () => {
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/contact-email-worker.yml"),
      "utf8",
    );
    const vercel = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as {
      crons?: unknown;
    };

    expect(workflow).toContain('cron: "*/5 * * * *"');
    expect(workflow).toContain("secrets.CONTACT_EMAIL_CRON_SECRET");
    expect(workflow).toContain('Authorization: Bearer ${CRON_SECRET}');
    expect(vercel.crons).toBeUndefined();
  });
});
