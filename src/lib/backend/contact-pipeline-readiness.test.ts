import { describe, expect, it, vi } from "vitest";
import {
  CONTACT_PIPELINE_SCHEMA_VERSION,
  getContactPipelineEnvironmentReadiness,
  getContactPipelineReadiness,
} from "./contact-pipeline-readiness";

const readyEnv = {
  NODE_ENV: "production",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_test",
  LEAD_CAPTURE_HASH_SECRET: "0123456789abcdef0123456789abcdef",
  RESEND_API_KEY: "re_test_key",
  LEAD_NOTIFICATION_FROM: "AIXCO Website <notifications@send.aixco.global>",
  LEAD_NOTIFICATION_TO: "info@aixco.global, klem@example.com",
  CRON_SECRET: "abcdef0123456789abcdef0123456789",
};

describe("contact pipeline readiness", () => {
  it("validates all production capture and worker dependencies", () => {
    expect(getContactPipelineEnvironmentReadiness(readyEnv, { worker: true })).toEqual({
      ready: true,
      issues: [],
    });

    expect(
      getContactPipelineEnvironmentReadiness(
        {
          NODE_ENV: "production",
          SUPABASE_URL: "http://insecure.example",
          LEAD_CAPTURE_HASH_SECRET: "short",
          LEAD_NOTIFICATION_FROM: "invalid",
          LEAD_NOTIFICATION_TO: "invalid",
          CRON_SECRET: "short",
        },
        { worker: true },
      ).issues,
    ).toEqual(expect.arrayContaining([
      "invalid_supabase_url",
      "missing_supabase_secret",
      "weak_lead_capture_hash_secret",
      "invalid_resend_api_key",
      "invalid_notification_sender",
      "invalid_notification_recipients",
      "weak_cron_secret",
    ]));
  });

  it("verifies the exact database schema contract", async () => {
    const client = {
      rpc: vi.fn(async () => ({
        data: [{
          schema_version: CONTACT_PIPELINE_SCHEMA_VERSION,
          queued_count: 4,
          failed_count: 1,
        }],
        error: null,
      })),
    };

    await expect(getContactPipelineReadiness({ client, env: readyEnv })).resolves.toEqual({
      ready: true,
      environment: { ready: true, issues: [] },
      schema: {
        ready: true,
        version: CONTACT_PIPELINE_SCHEMA_VERSION,
        queued: 4,
        failed: 1,
      },
    });
  });

  it("fails closed when the required migration is missing", async () => {
    const client = {
      rpc: vi.fn(async () => ({
        data: [{ schema_version: "old", queued_count: 0, failed_count: 0 }],
        error: null,
      })),
    };
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(getContactPipelineReadiness({ client, env: readyEnv })).resolves.toMatchObject({
        ready: false,
        schema: { ready: false, version: "old" },
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
