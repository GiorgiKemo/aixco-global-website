import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260715170000_p2_operational_hardening.sql"),
  "utf8",
);

describe("P2 operational hardening migration", () => {
  it("stores call requests as structured validated fields", () => {
    expect(migration).toContain("add column request_type text not null default 'message'");
    expect(migration).toContain("add column preferred_call_at timestamptz");
    expect(migration).toContain("contact_submissions_call_details_check");
    expect(migration).toContain("'preferredCallTimezone', submission.preferred_call_timezone");
  });

  it("provides a service-role-only retention operation", () => {
    expect(migration).toContain("create or replace function public.purge_expired_operational_data");
    expect(migration).toContain("delete from public.contact_submissions");
    expect(migration).toContain("delete from public.chat_transcripts");
    expect(migration).toContain("delete from public.portal_click_events");
    expect(migration).toContain("revoke all on function public.purge_expired_operational_data");
    expect(migration).toContain("to service_role");
  });

  it("advances the production schema contract", () => {
    expect(migration).toContain("'20260715170000'::text");
  });
});
