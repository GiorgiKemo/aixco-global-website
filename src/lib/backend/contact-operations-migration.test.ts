import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260715231001_harden_contact_operations.sql"),
  "utf8",
).replace(/\r\n/g, "\n");
const privacyHardeningMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260817114531_harden_admin_privacy_and_chat_quality.sql"),
  "utf8",
).replace(/\r\n/g, "\n");

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

  it("derives truthful chat quality and keeps contact deletion atomic without unsafe attribution", () => {
    const functionStart = privacyHardeningMigration.indexOf(
      "create function public.delete_contact_subject_data",
    );
    const analyticsDelete = privacyHardeningMigration.indexOf(
      "delete from public.site_analytics_sessions",
      functionStart,
    );
    const contactDelete = privacyHardeningMigration.indexOf(
      "delete from public.contact_submissions",
      functionStart,
    );
    const chatDelete = privacyHardeningMigration.indexOf(
      "delete from public.chat_transcripts",
      functionStart,
    );

    expect(privacyHardeningMigration).not.toContain("subject_email_normalized");
    expect(privacyHardeningMigration).toContain("visitor_message_count");
    expect(privacyHardeningMigration).toContain(
      "create or replace function public.derive_chat_quality_fields()",
    );
    expect(privacyHardeningMigration).toContain(
      "before insert or update of messages on public.chat_transcripts",
    );
    expect(privacyHardeningMigration).toContain(
      "create or replace function public.sanitize_lead_analytics_session_link()",
    );
    expect(privacyHardeningMigration).toContain(
      "metadata -> 'analytics_session_verified' = 'true'::jsonb",
    );
    expect(privacyHardeningMigration.slice(functionStart)).not.toContain(
      "lower(transcript) like",
    );
    expect(analyticsDelete).toBe(-1);
    expect(privacyHardeningMigration.slice(functionStart, contactDelete))
      .toContain("analytics_sessions_deleted := 0");
    expect(contactDelete).toBeGreaterThan(functionStart);
    expect(chatDelete).toBe(-1);
    expect(privacyHardeningMigration.slice(functionStart))
      .toContain("chats_deleted := 0");
    expect(privacyHardeningMigration).toContain("analytics_sessions_deleted bigint");
    expect(privacyHardeningMigration).toContain(
      "revoke all on function public.delete_contact_subject_data(text, text)",
    );
    expect(privacyHardeningMigration).toContain(
      "grant execute on function public.delete_contact_subject_data(text, text)\nto service_role",
    );
  });
});
