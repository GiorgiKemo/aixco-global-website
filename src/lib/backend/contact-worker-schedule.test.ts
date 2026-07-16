import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("contact email worker schedule", () => {
  it("uses GitHub Actions only as an hourly protected recovery worker", () => {
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/contact-email-worker.yml"),
      "utf8",
    );
    const vercel = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as {
      crons?: unknown;
    };
    const route = readFileSync(
      join(process.cwd(), "src/app/api/cron/contact-email-deliveries/route.ts"),
      "utf8",
    );

    expect(workflow).toContain("Contact email recovery worker");
    expect(workflow).toContain('cron: "17 * * * *"');
    expect(workflow).not.toContain('cron: "*/5 * * * *"');
    expect(workflow).toContain("secrets.CONTACT_EMAIL_CRON_SECRET");
    expect(workflow).toContain('Authorization: Bearer ${CRON_SECRET}');
    expect(workflow).toContain("https://www.aixco.global/api/health/contact-pipeline");
    expect(workflow).toContain("for pass in {1..6}");
    expect(workflow).toContain("if (( claimed < 2 ))");
    expect(route).toContain("processContactEmailOutbox({ batchSize: 2 })");
    expect(vercel.crons).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "/api/cron/contact-email-deliveries" }),
      ]),
    );
  });

  it("installs the primary five-minute worker with Supabase Cron and Vault", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260715231001_harden_contact_operations.sql"),
      "utf8",
    );

    expect(migration).toContain("perform cron.schedule(");
    expect(migration).toContain("'*/5 * * * *'");
    expect(migration).toContain("from vault.decrypted_secrets");
    expect(migration).toContain("aixco_contact_worker_url");
    expect(migration).toContain("aixco_cron_secret");
  });

  it("runs retention daily on Vercel with a delayed GitHub recovery", () => {
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/data-retention.yml"),
      "utf8",
    );
    const vercel = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as {
      crons?: Array<{ path: string; schedule: string }>;
    };

    expect(vercel.crons).toContainEqual({
      path: "/api/cron/data-retention",
      schedule: "17 2 * * *",
    });
    expect(workflow).toContain("Operational data retention recovery");
    expect(workflow).toContain('cron: "47 3 * * *"');
    expect(workflow).toContain("secrets.CONTACT_EMAIL_CRON_SECRET");
  });
});
