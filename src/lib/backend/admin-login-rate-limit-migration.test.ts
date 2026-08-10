import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260807130642_site_analytics_dashboard.sql"),
  "utf8",
)
  .replace(/\r\n?/gu, "\n")
  .toLowerCase();

describe("distributed administrator login rate-limit migration", () => {
  it("keeps only a bounded HMAC counter in a forced-RLS service-role table", () => {
    const tableStart = migration.indexOf("create table if not exists public.admin_login_rate_limits");
    const tableEnd = migration.indexOf("\n);", tableStart);
    const tableSql = migration.slice(tableStart, tableEnd);

    expect(tableStart).toBeGreaterThan(-1);
    expect(tableSql).toContain("client_hash text primary key");
    expect(tableSql).toContain("client_hash ~ '^[0-9a-f]{64}$'");
    expect(tableSql).toContain("attempt_count between 1 and 1001");
    expect(tableSql).not.toMatch(/\bip(_address)?\b/);

    expect(migration).toContain(
      "alter table public.admin_login_rate_limits enable row level security",
    );
    expect(migration).toContain(
      "alter table public.admin_login_rate_limits force row level security",
    );
    expect(migration).toContain(
      "revoke all on table public.admin_login_rate_limits from public, anon, authenticated",
    );
    expect(migration).toContain("grant all on table public.admin_login_rate_limits to service_role");
    expect(migration).toContain("admin_login_rate_limits_expiry_idx");
  });

  it("uses an atomic non-extending fixed window and exposes the RPC only to service_role", () => {
    const functionStart = migration.indexOf("create function public.consume_admin_login_rate_limit");
    const functionEnd = migration.indexOf(
      "revoke all on function public.consume_admin_login_rate_limit",
      functionStart,
    );
    const functionSql = migration.slice(functionStart, functionEnd);

    expect(functionStart).toBeGreaterThan(-1);
    expect(functionSql).toContain("security invoker");
    expect(functionSql).toContain("set search_path = pg_catalog, public");
    expect(functionSql).toContain("on conflict (client_hash) do update");
    expect(functionSql).toContain("else limits.window_expires_at");
    expect(functionSql).toContain("least(v_limit + 1, limits.attempt_count + 1)");
    expect(functionSql).toContain("p_client_hash !~ '^[0-9a-f]{64}$'");

    expect(migration).toContain(
      "revoke all on function public.consume_admin_login_rate_limit(text, integer, integer)\nfrom public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant execute on function public.consume_admin_login_rate_limit(text, integer, integer)\nto service_role",
    );
  });

  it("deletes expired counters through the service-role retention RPC", () => {
    expect(migration).toContain("p_admin_login_limit_days integer default 1");
    expect(migration).toContain("delete from public.admin_login_rate_limits");
    expect(migration).toContain(
      "window_expires_at < v_purged_at - make_interval(days => p_admin_login_limit_days)",
    );
    expect(migration).toContain("'adminloginratelimitsdeleted'");
    expect(migration).toContain(
      "grant execute on function public.purge_site_analytics_data(integer, integer, integer, integer, integer)\nto service_role",
    );
  });
});
