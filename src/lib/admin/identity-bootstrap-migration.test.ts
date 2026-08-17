import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260817123000_admin_identity_bootstrap_claim.sql"),
  "utf8",
).replace(/\r\n/g, "\n").toLowerCase();

describe("administrator bootstrap claim migration", () => {
  it("serializes first-admin claims and only permits stale unfinished recovery", () => {
    expect(migration).toContain("singleton boolean primary key");
    expect(migration).toContain("on conflict (singleton) do update");
    expect(migration).toContain("completed_at is null");
    expect(migration).toContain("interval '15 minutes'");
  });

  it("keeps claim state and functions private to the service role", () => {
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("force row level security");
    expect(migration).toContain("security invoker");
    expect(migration).toContain("set search_path = pg_catalog, public");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("on table public.admin_identity_bootstrap_claims\nto service_role");
    expect(migration).toContain("to service_role");
  });
});
