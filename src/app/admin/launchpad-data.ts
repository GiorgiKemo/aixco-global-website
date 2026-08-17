import "server-only";

import {
  fetchAdminAnalyticsDashboard,
  fetchAdminOperationsSnapshot,
} from "@/lib/admin/analytics";
import { getAdminIdentityMigrationStatus } from "@/lib/admin/identity-migration";
import { getContactPipelineReadiness } from "@/lib/backend/contact-pipeline-readiness";

export type LaunchpadStatusTone = "healthy" | "attention" | "critical" | "neutral";

export type LaunchpadActivity = {
  id: string;
  label: string;
  occurredAt: string;
  tone: LaunchpadStatusTone;
};

export type AdminLaunchpadData = {
  generatedAt: string;
  leads: {
    active: number;
    new: number;
    qualified: number;
  } | null;
  analytics: {
    sessions: number;
    visitors: number;
    recentSessions: number | null;
    engagedSessions: number;
    errorEvents: number;
    latestEventAt: string | null;
  } | null;
  email: {
    ready: boolean;
    queued: number;
    failed: number;
    deliveryIssues: number;
    workerLastSucceededAt: string | null;
  } | null;
  admins: {
    total: number;
    verified: number;
  } | null;
  recentActivity: LaunchpadActivity[];
  unavailableSources: Array<"leads" | "analytics" | "email" | "admins">;
};

type LaunchpadDependencies = {
  fetchOperations: typeof fetchAdminOperationsSnapshot;
  fetchAnalytics: typeof fetchAdminAnalyticsDashboard;
  fetchEmailReadiness: typeof getContactPipelineReadiness;
  fetchAdminIdentities: typeof getAdminIdentityMigrationStatus;
};

const defaultDependencies: LaunchpadDependencies = {
  fetchOperations: fetchAdminOperationsSnapshot,
  fetchAnalytics: fetchAdminAnalyticsDashboard,
  fetchEmailReadiness: getContactPipelineReadiness,
  fetchAdminIdentities: getAdminIdentityMigrationStatus,
};

async function settle<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch {
    return null;
  }
}

function auditActivityLabel(action: string, outcome: string) {
  const labels: Record<string, string> = {
    "admin.login": "Administrator signed in",
    "admin.logout": "Administrator signed out",
    "admin.analytics.view": "Analytics reviewed",
    "admin.identity.invite": "Administrator invited",
    "email.delivery.test": "Email delivery test completed",
    "lead.status.update": "Lead status updated",
    "privacy.subject.export": "Privacy export completed",
    "privacy.subject.delete": "Privacy record erased",
  };
  const label = labels[action];
  if (!label) return null;
  return outcome === "success" ? label : `${label} with an issue`;
}

function activityTone(outcome: string): LaunchpadStatusTone {
  if (outcome === "success") return "healthy";
  if (outcome === "failure" || outcome === "denied") return "critical";
  return "neutral";
}

function isValidTimestamp(value: string | null | undefined): value is string {
  return Boolean(value) && Number.isFinite(Date.parse(value as string));
}

export async function loadAdminLaunchpadData(
  requiredRole: string,
  options: {
    now?: Date;
    dependencies?: Partial<LaunchpadDependencies>;
  } = {},
): Promise<AdminLaunchpadData> {
  const now = options.now ?? new Date();
  const dependencies = { ...defaultDependencies, ...options.dependencies };
  const [operationsResult, analyticsResult, emailResult, identityResult] = await Promise.all([
    settle(() => dependencies.fetchOperations()),
    settle(() => dependencies.fetchAnalytics("7d", { now })),
    settle(() => dependencies.fetchEmailReadiness({ operational: true, now })),
    settle(() => dependencies.fetchAdminIdentities(requiredRole)),
  ]);

  const operations = operationsResult?.ok ? operationsResult.data : null;
  const analytics = analyticsResult?.ok ? analyticsResult.data : null;
  const email = emailResult && emailResult.schema.ready
    ? {
        ready: emailResult.ready,
        queued: emailResult.schema.queued ?? 0,
        failed: emailResult.schema.failed ?? 0,
        deliveryIssues: emailResult.schema.deliveryIssues ?? 0,
        workerLastSucceededAt: emailResult.operations.ready
          ? emailResult.operations.workerLastSucceededAt
          : "workerLastSucceededAt" in emailResult.operations
            ? emailResult.operations.workerLastSucceededAt
            : null,
      }
    : null;
  const admins = identityResult?.sourceStatus === "available"
    ? {
        total: identityResult.admins.length,
        verified: identityResult.admins.filter((admin) => (admin.verifiedTotpFactors ?? 0) > 0).length,
      }
    : null;

  const recentActivity: LaunchpadActivity[] = [];
  const latestAuditActivityByLabel = new Map<string, LaunchpadActivity>();
  for (const event of analytics?.auditEvents ?? []) {
    const label = auditActivityLabel(event.action, event.outcome);
    if (!label || !isValidTimestamp(event.occurredAt)) continue;
    const activity = {
      id: `audit-${event.id}`,
      label,
      occurredAt: event.occurredAt,
      tone: activityTone(event.outcome),
    } satisfies LaunchpadActivity;
    const previous = latestAuditActivityByLabel.get(label);
    if (!previous || Date.parse(activity.occurredAt) > Date.parse(previous.occurredAt)) {
      latestAuditActivityByLabel.set(label, activity);
    }
  }
  recentActivity.push(...latestAuditActivityByLabel.values());

  if (analytics?.summary.latestEventAt && isValidTimestamp(analytics.summary.latestEventAt)) {
    recentActivity.push({
      id: "website-latest-event",
      label: "Website activity recorded",
      occurredAt: analytics.summary.latestEventAt,
      tone: "healthy",
    });
  }

  if (email?.workerLastSucceededAt && isValidTimestamp(email.workerLastSucceededAt)) {
    recentActivity.push({
      id: "email-worker-latest-success",
      label: "Email delivery worker completed",
      occurredAt: email.workerLastSucceededAt,
      tone: "healthy",
    });
  }

  recentActivity.sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));

  return {
    generatedAt: now.toISOString(),
    leads: operations
      ? {
          active: operations.totalContacts + operations.totalChats,
          new: operations.newContacts + operations.newChats,
          qualified: operations.qualifiedContacts + operations.qualifiedChats,
        }
      : null,
    analytics: analytics
      ? {
          sessions: analytics.summary.sessions,
          visitors: analytics.summary.visitors,
          recentSessions: analytics.recentSessions?.length ?? null,
          engagedSessions: analytics.summary.engagedSessions,
          errorEvents: analytics.summary.errorEvents,
          latestEventAt: analytics.summary.latestEventAt,
        }
      : null,
    email,
    admins,
    recentActivity: recentActivity.slice(0, 3),
    unavailableSources: [
      ...(operations ? [] : ["leads" as const]),
      ...(analytics ? [] : ["analytics" as const]),
      ...(email ? [] : ["email" as const]),
      ...(admins ? [] : ["admins" as const]),
    ],
  };
}
