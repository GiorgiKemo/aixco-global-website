import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CONTACT_PIPELINE_SCHEMA_VERSION } from "./contact-pipeline-readiness";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260715231000_p3_request_reference_policy.sql"),
  "utf8",
);

describe("P3 request reference policy migration", () => {
  it("documents UTC rollover, fails closed at annual capacity, and advances readiness", () => {
    expect(migration).toContain("current_timestamp at time zone 'UTC'");
    expect(migration).toContain("where counters.last_value < 999999");
    expect(migration).toContain("request reference capacity exhausted");
    expect(migration).toContain("'20260715231000'::text");
    expect(CONTACT_PIPELINE_SCHEMA_VERSION).toBe("20260715231001");
  });
});
