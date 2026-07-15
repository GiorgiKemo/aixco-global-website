import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260715125925_harden_contact_delivery_pipeline.sql"),
  "utf8",
);

describe("contact pipeline migration", () => {
  it("creates a transactional lead plus email-outbox operation", () => {
    expect(migration).toContain("create or replace function public.create_contact_submission");
    expect(migration).toContain("insert into public.contact_submissions");
    expect(migration).toContain("insert into public.contact_email_deliveries");
    expect(migration).toContain("contact_email_deliveries_submission_channel_unique");
    expect(migration).toContain("contact_email_deliveries_idempotency_key_unique");
  });

  it("locks exposed operational tables to the service role with forced RLS", () => {
    for (const table of ["contact_email_deliveries", "lead_capture_attempts"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`alter table public.${table} force row level security`);
      expect(migration).toContain(`revoke all on public.${table} from public, anon, authenticated`);
      expect(migration).toContain(`grant all on public.${table} to service_role`);
    }
  });

  it("prevents profile owners from writing authorization fields", () => {
    expect(migration).toContain("revoke insert, update on public.profiles from authenticated");
    expect(migration).toContain("grant insert (id, full_name, company_name, phone, metadata)");
    expect(migration).toContain("grant update (full_name, company_name, phone, metadata)");
  });
});
