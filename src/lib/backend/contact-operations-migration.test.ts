import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260715231001_harden_contact_operations.sql"),
  "utf8",
);

describe("contact operations hardening migration", () => {
  it("fails closed on blank or invalid privacy subjects before any deletion", () => {
    const functionStart = migration.indexOf("create or replace function public.delete_contact_subject_data");
    const validation = migration.indexOf("A valid subject email is required.", functionStart);
    const hashValidation = migration.indexOf("A valid subject recipient hash is required.", functionStart);
    const contactDelete = migration.indexOf("delete from public.contact_submissions", functionStart);
    const chatDelete = migration.indexOf("delete from public.chat_transcripts", functionStart);
    const abuseDelete = migration.indexOf("delete from public.lead_capture_attempts", functionStart);
    expect(functionStart).toBeGreaterThan(-1);
    expect(validation).toBeGreaterThan(functionStart);
    expect(validation).toBeLessThan(contactDelete);
    expect(validation).toBeLessThan(chatDelete);
    expect(hashValidation).toBeGreaterThan(validation);
    expect(hashValidation).toBeLessThan(contactDelete);
    expect(abuseDelete).toBeGreaterThan(chatDelete);
    expect(migration.slice(functionStart, contactDelete)).toContain("normalized_email is null");
    expect(migration.slice(functionStart, contactDelete)).toContain("normalized_email !~");
  });

  it("installs a five-minute Vault-backed scheduler without plaintext secrets", () => {
    expect(migration).toContain("'*/5 * * * *'");
    expect(migration).toContain("vault.decrypted_secrets");
    expect(migration).toContain("aixco_contact_worker_url");
    expect(migration).toContain("aixco_cron_secret");
    expect(migration).not.toMatch(/Bearer\s+[A-Za-z0-9_-]{20,}/);
  });

  it("returns runtime status on an empty queue and separates actionable failures from recipient outcomes", () => {
    expect(migration).toContain("from public.contact_email_worker_runtime as runtime");
    expect(migration).toContain("left join public.contact_email_deliveries as deliveries on true");
    expect(migration).toContain("deliveries.status = 'failed'");
    expect(migration).toContain("deliveries.status in ('bounced', 'complained', 'suppressed')");
    expect(migration).toContain("delivery_issue_count bigint");
  });

  it("locks down telemetry and webhook tables to the service role", () => {
    for (const table of ["contact_email_events", "contact_email_worker_runtime", "site_telemetry_events"]) {
      expect(migration).toContain(`alter table public.${table} force row level security`);
      expect(migration).toContain(`revoke all on public.${table} from public, anon, authenticated`);
    }
  });

  it("bounds abuse and unmatched provider-event retention", () => {
    const guardStart = migration.indexOf("create or replace function public.record_lead_capture_attempt");
    const guardEnd = migration.indexOf("revoke all on function public.record_lead_capture_attempt", guardStart);
    const guardSql = migration.slice(guardStart, guardEnd);
    expect(guardSql.match(/insert into public\.lead_capture_attempts/g)).toHaveLength(1);
    expect(migration).toContain("lead_capture_attempts_retention_idx");
    expect(migration).toContain("contact_email_delivery_id is null");
    expect(migration).toContain("make_interval(days => p_email_event_days)");
    expect(migration).toContain("orphan_email_events_deleted bigint");
  });
});
