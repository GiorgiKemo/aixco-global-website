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
  RESEND_WEBHOOK_SECRET: "whsec_abcdef0123456789abcdef0123456789",
};

function runtimeStatus(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: CONTACT_PIPELINE_SCHEMA_VERSION,
    queued_count: 0,
    failed_count: 0,
    delivery_issue_count: 0,
    oldest_queued_at: null,
    oldest_processing_at: null,
    worker_last_started_at: "2026-07-16T10:00:00.000Z",
    worker_last_succeeded_at: "2026-07-16T10:00:00.000Z",
    worker_last_failed_at: null,
    worker_consecutive_failures: 0,
    scheduler_active: true,
    scheduler_last_succeeded_at: "2026-07-16T10:00:00.000Z",
    ...overrides,
  };
}

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
      "invalid_resend_webhook_secret",
    ]));
  });

  it("verifies the exact database schema contract", async () => {
    const client = {
      rpc: vi.fn(async () => ({
        data: [runtimeStatus()],
        error: null,
      })),
    };

    await expect(getContactPipelineReadiness({
      client,
      env: readyEnv,
      now: new Date("2026-07-16T10:05:00.000Z"),
    })).resolves.toEqual({
      ready: true,
      environment: { ready: true, issues: [] },
      schema: {
        ready: true,
        version: CONTACT_PIPELINE_SCHEMA_VERSION,
        queued: 0,
        failed: 0,
        deliveryIssues: 0,
      },
      operations: {
        ready: true,
        issues: [],
        oldestQueuedAt: null,
        oldestProcessingAt: null,
        workerLastStartedAt: "2026-07-16T10:00:00.000Z",
        workerLastSucceededAt: "2026-07-16T10:00:00.000Z",
        workerLastFailedAt: null,
        workerConsecutiveFailures: 0,
        schedulerActive: true,
        schedulerLastSucceededAt: "2026-07-16T10:00:00.000Z",
      },
    });
  });

  it("reports recipient delivery issues without treating a historical bounce as a worker outage", async () => {
    const client = {
      rpc: vi.fn(async () => ({
        data: [runtimeStatus({ delivery_issue_count: 3 })],
        error: null,
      })),
    };

    await expect(getContactPipelineReadiness({
      client,
      env: readyEnv,
      now: new Date("2026-07-16T10:05:00.000Z"),
    })).resolves.toMatchObject({
      ready: true,
      schema: { failed: 0, deliveryIssues: 3 },
      operations: { ready: true, issues: [] },
    });
  });

  it("fails health when delivery failures, stale work, or a stale worker heartbeat are present", async () => {
    const client = {
      rpc: vi.fn(async () => ({
        data: [runtimeStatus({
          queued_count: 4,
          failed_count: 1,
          oldest_queued_at: "2026-07-16T09:00:00.000Z",
          worker_last_succeeded_at: "2026-07-16T09:00:00.000Z",
          worker_consecutive_failures: 2,
        })],
        error: null,
      })),
    };

    await expect(getContactPipelineReadiness({
      client,
      env: readyEnv,
      now: new Date("2026-07-16T10:00:00.000Z"),
    })).resolves.toMatchObject({
      ready: false,
      schema: { ready: true, queued: 4, failed: 1 },
      operations: {
        ready: false,
        issues: expect.arrayContaining([
          "failed_deliveries_present",
          "oldest_queue_item_stale",
          "worker_heartbeat_stale",
          "worker_failures_present",
        ]),
      },
    });
  });

  it("fails closed when the required migration is missing", async () => {
    const client = {
      rpc: vi.fn(async () => ({
        data: [runtimeStatus({ schema_version: "old" })],
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
