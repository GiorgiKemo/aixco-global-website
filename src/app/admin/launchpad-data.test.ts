import { describe, expect, it } from "vitest";
import type { AdminAnalyticsDashboardResult, AdminOperationsSnapshotResult } from "@/lib/admin/analytics";
import { loadAdminLaunchpadData } from "./launchpad-data";

const analyticsResult: AdminAnalyticsDashboardResult = {
  ok: true,
  data: {
    window: {
      range: "7d",
      label: "Last 7 days",
      from: "2026-08-04T12:00:00.000Z",
      to: "2026-08-11T12:00:00.000Z",
    },
    generatedAt: "2026-08-11T12:00:00.000Z",
    summary: {
      sessions: 82,
      visitors: 57,
      returningSessions: 18,
      engagedSessions: 41,
      convertedSessions: 3,
      pageViews: 194,
      events: 320,
      telemetryEvents: 10,
      webVitalEvents: 8,
      interactions: 141,
      totalActiveSeconds: 3_200,
      averageActiveSeconds: 39,
      bounceRatePercent: 22,
      errorEvents: 2,
      formSubmissions: 3,
      portalHandoffs: 1,
      uniqueCountries: 7,
      latestEventAt: "2026-08-11T11:59:00.000Z",
    },
    intentActivity: null,
    daily: null,
    breakdowns: null,
    recentSessions: [
      {
        id: "session-1",
        visitorId: "private-visitor-id",
        startedAt: "2026-08-11T11:45:00.000Z",
        lastSeenAt: "2026-08-11T11:48:00.000Z",
        endedAt: null,
        activeSeconds: 180,
        pageViews: 3,
        events: 8,
        landingPage: "/",
        exitPage: null,
        referrer: null,
        country: "CH",
        region: "ZH",
        city: "Zurich",
        device: "mobile",
        browser: "Safari",
        operatingSystem: "iOS",
        userAgent: "private-user-agent",
        locale: "de-CH",
        timezone: "Europe/Zurich",
        isReturning: false,
        viewportWidth: 390,
        viewportHeight: 844,
        ipAddress: "203.0.113.10",
        ipHash: "private-ip-hash",
        journey: [],
      },
    ],
    recentErrors: null,
    auditEvents: [
      {
        id: "audit-1",
        occurredAt: "2026-08-11T11:58:00.000Z",
        actorId: "private-actor-id",
        actorEmailHash: "private-email-hash",
        authentication: "supabase-mfa",
        action: "admin.login",
        outcome: "success",
        targetType: null,
        targetId: null,
        requestId: null,
        userAgent: "private-admin-user-agent",
        ipAddress: "203.0.113.20",
        ipHash: "private-admin-ip-hash",
        provenance: "server-verified",
        details: {},
      },
    ],
    warnings: [],
  },
};

const operationsResult: AdminOperationsSnapshotResult = {
  ok: true,
  data: {
    totalContacts: 12,
    totalChats: 7,
    newContacts: 3,
    newChats: 1,
    qualifiedContacts: 4,
    qualifiedChats: 2,
    totalPortalHandoffs: 5,
  },
};

describe("admin launchpad data", () => {
  it("returns real aggregate counts while stripping session and identity PII", async () => {
    const result = await loadAdminLaunchpadData("admin", {
      now: new Date("2026-08-11T12:00:00.000Z"),
      dependencies: {
        fetchOperations: async () => operationsResult,
        fetchAnalytics: async () => analyticsResult,
        fetchEmailReadiness: async () => ({
          ready: true,
          environment: { ready: true, issues: [] },
          schema: { ready: true, version: "20260715231001", queued: 2, failed: 0, deliveryIssues: 0 },
          operations: {
            ready: true,
            issues: [],
            oldestQueuedAt: null,
            oldestProcessingAt: null,
            workerLastStartedAt: "2026-08-11T11:56:00.000Z",
            workerLastSucceededAt: "2026-08-11T11:57:00.000Z",
            workerLastFailedAt: null,
            workerConsecutiveFailures: 0,
            schedulerActive: true,
            schedulerLastSucceededAt: "2026-08-11T11:57:00.000Z",
          },
        }),
        fetchAdminIdentities: async () => ({
          admins: [
            {
              id: "private-admin-id",
              email: "private-admin@example.com",
              invitedAt: null,
              lastSignInAt: "2026-08-11T08:00:00.000Z",
              verifiedTotpFactors: 1,
            },
          ],
          safeToDisableLegacyAccess: true,
          sourceStatus: "available",
          sourceIssues: [],
        }),
      },
    });

    expect(result.leads).toEqual({ active: 19, new: 4, qualified: 6 });
    expect(result.analytics).toMatchObject({ sessions: 82, visitors: 57, recentSessions: 1, errorEvents: 2 });
    expect(result.email).toMatchObject({ ready: true, queued: 2, failed: 0, deliveryIssues: 0 });
    expect(result.admins).toEqual({ total: 1, verified: 1 });
    expect(result.recentActivity.map((activity) => activity.label)).toEqual([
      "Website activity recorded",
      "Administrator signed in",
      "Email delivery worker completed",
    ]);
    expect(result.unavailableSources).toEqual([]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("private-admin@example.com");
    expect(serialized).not.toContain("203.0.113");
    expect(serialized).not.toContain("private-user-agent");
    expect(serialized).not.toContain("private-visitor-id");
  });

  it("degrades every source independently without throwing or inventing values", async () => {
    const fail = async () => {
      throw new Error("source unavailable");
    };
    const result = await loadAdminLaunchpadData("admin", {
      now: new Date("2026-08-11T12:00:00.000Z"),
      dependencies: {
        fetchOperations: fail,
        fetchAnalytics: fail,
        fetchEmailReadiness: fail,
        fetchAdminIdentities: async () => ({
          admins: [{
            id: "partial-admin",
            email: "private-admin@example.com",
            invitedAt: null,
            lastSignInAt: null,
            verifiedTotpFactors: null,
          }],
          safeToDisableLegacyAccess: false,
          sourceStatus: "partial",
          sourceIssues: ["mfa-factors"],
        }),
      },
    });

    expect(result.leads).toBeNull();
    expect(result.analytics).toBeNull();
    expect(result.email).toBeNull();
    expect(result.admins).toBeNull();
    expect(result.recentActivity).toEqual([]);
    expect(result.unavailableSources).toEqual(["leads", "analytics", "email", "admins"]);
  });

  it("omits unknown audit actions instead of exposing internal event details", async () => {
    const result = await loadAdminLaunchpadData("admin", {
      now: new Date("2026-08-11T12:00:00.000Z"),
      dependencies: {
        fetchOperations: async () => operationsResult,
        fetchAnalytics: async () => {
          if (!analyticsResult.ok) throw new Error("invalid analytics fixture");
          return {
            ...analyticsResult,
            data: {
              ...analyticsResult.data,
              summary: { ...analyticsResult.data.summary, latestEventAt: null },
              auditEvents: [
                {
                  ...analyticsResult.data.auditEvents![0],
                  action: "internal.secret.operation",
                  details: { token: "must-not-render" },
                },
              ],
            },
          };
        },
        fetchEmailReadiness: async () => ({
          ready: false,
          environment: { ready: false, issues: ["invalid_resend_api_key"] },
          schema: { ready: false, version: null, queued: null, failed: null },
          operations: { ready: false, issues: ["environment_not_ready"] },
        }),
        fetchAdminIdentities: async () => ({
          admins: [],
          safeToDisableLegacyAccess: false,
          sourceStatus: "available",
          sourceIssues: [],
        }),
      },
    });

    expect(result.recentActivity).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("internal.secret.operation");
    expect(JSON.stringify(result)).not.toContain("must-not-render");
  });

  it("keeps only the newest occurrence of repetitive audit activity", async () => {
    if (!analyticsResult.ok || !analyticsResult.data.auditEvents?.length) {
      throw new Error("invalid analytics fixture");
    }
    const baseAuditEvent = analyticsResult.data.auditEvents[0];
    const result = await loadAdminLaunchpadData("admin", {
      now: new Date("2026-08-11T12:00:00.000Z"),
      dependencies: {
        fetchOperations: async () => operationsResult,
        fetchAnalytics: async () => ({
          ...analyticsResult,
          data: {
            ...analyticsResult.data,
            summary: { ...analyticsResult.data.summary, latestEventAt: null },
            auditEvents: [
              { ...baseAuditEvent, id: "newest", action: "admin.analytics.view", occurredAt: "2026-08-11T11:59:00.000Z" },
              { ...baseAuditEvent, id: "older", action: "admin.analytics.view", occurredAt: "2026-08-11T11:40:00.000Z" },
            ],
          },
        }),
        fetchEmailReadiness: async () => ({
          ready: false,
          environment: { ready: false, issues: ["invalid_resend_api_key"] },
          schema: { ready: false, version: null, queued: null, failed: null },
          operations: { ready: false, issues: ["environment_not_ready"] },
        }),
        fetchAdminIdentities: async () => ({
          admins: [],
          safeToDisableLegacyAccess: false,
          sourceStatus: "available",
          sourceIssues: [],
        }),
      },
    });

    expect(result.recentActivity).toEqual([
      {
        id: "audit-newest",
        label: "Analytics reviewed",
        occurredAt: "2026-08-11T11:59:00.000Z",
        tone: "healthy",
      },
    ]);
  });
});
