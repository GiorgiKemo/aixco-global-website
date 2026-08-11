import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock3,
  Mail,
  Monitor,
  ShieldAlert,
  UserRound,
  UsersRound,
} from "lucide-react";
import { AdminShell } from "@/app/admin/_components";
import { getAdminAuthConfig, getAdminAuthDecision } from "@/lib/admin/auth";
import {
  loadAdminLaunchpadData,
  type AdminLaunchpadData,
  type LaunchpadStatusTone,
} from "./launchpad-data";
import styles from "./launchpad.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Operations | AIXCO.Global",
  robots: { index: false, follow: false },
};

type ModuleAction = {
  href: string;
  label: string;
};

type LaunchpadModule = {
  id: string;
  title: string;
  value: string;
  unit: string;
  description: string;
  status: string;
  tone: LaunchpadStatusTone;
  icon: LucideIcon;
  actions: ModuleAction[];
  available: boolean;
};

const numberFormatter = new Intl.NumberFormat("en-US");

function count(value: number) {
  return numberFormatter.format(value);
}

function unavailableModule(
  module: Omit<LaunchpadModule, "value" | "unit" | "status" | "tone" | "available">,
): LaunchpadModule {
  return {
    ...module,
    value: "—",
    unit: "unavailable",
    status: "Production source unavailable",
    tone: "neutral",
    available: false,
  };
}

export function buildLaunchpadModules(data: AdminLaunchpadData): LaunchpadModule[] {
  const leadsBase = {
    id: "leads",
    title: "Leads",
    description: "Review and manage your latest leads.",
    icon: UserRound,
    actions: [{ href: "/admin/leads", label: "Open lead center" }],
  };
  const analyticsBase = {
    id: "analytics",
    title: "Website analytics",
    description: "Explore site traffic and performance.",
    icon: BarChart3,
    actions: [{ href: "/admin/analytics?focus=traffic&range=7d", label: "Open website analytics" }],
  };
  const sessionsBase = {
    id: "sessions",
    title: "Visitor sessions",
    description: "See recent visitor sessions and behavior.",
    icon: Monitor,
    actions: [{ href: "/admin/analytics?focus=sessions&range=7d", label: "Open visitor sessions" }],
  };
  const securityBase = {
    id: "security",
    title: "Errors & security",
    description: "Monitor errors and security events.",
    icon: ShieldAlert,
    actions: [{ href: "/admin/analytics?focus=reliability&range=7d", label: "Open errors and security" }],
  };
  const emailBase = {
    id: "email",
    title: "Email delivery",
    description: "Track notification delivery and queue health.",
    icon: Mail,
    actions: [{ href: "/admin/email-test", label: "Open email delivery" }],
  };
  const privacyBase = {
    id: "privacy",
    title: "Privacy & admins",
    description: "Manage data requests and admin access.",
    icon: UsersRound,
    actions: [{ href: "/admin/privacy", label: "Open privacy requests" }],
  };

  const leads = data.leads
    ? {
        ...leadsBase,
        value: count(data.leads.active),
        unit: "active",
        status: data.leads.new ? `${count(data.leads.new)} waiting for review` : "Up to date",
        tone: data.leads.new ? ("attention" as const) : ("healthy" as const),
        available: true,
      }
    : unavailableModule(leadsBase);

  const analytics = data.analytics
    ? {
        ...analyticsBase,
        value: count(data.analytics.sessions),
        unit: "sessions",
        status: `${count(data.analytics.visitors)} visitors in the last 7 days`,
        tone: "healthy" as const,
        available: true,
      }
    : unavailableModule(analyticsBase);

  const sessions = data.analytics
    ? {
        ...sessionsBase,
        value: count(data.analytics.recentSessions ?? data.analytics.visitors),
        unit: data.analytics.recentSessions === null ? "visitors" : "recent",
        status: `${count(data.analytics.engagedSessions)} engaged in the last 7 days`,
        tone: "healthy" as const,
        available: true,
      }
    : unavailableModule(sessionsBase);

  const security = data.analytics
    ? {
        ...securityBase,
        value: count(data.analytics.errorEvents),
        unit: data.analytics.errorEvents === 1 ? "error" : "errors",
        status: data.analytics.errorEvents ? "Review reliability events" : "No recorded errors",
        tone: data.analytics.errorEvents ? ("critical" as const) : ("healthy" as const),
        available: true,
      }
    : unavailableModule(securityBase);

  const emailIssueCount = data.email ? data.email.failed + data.email.deliveryIssues : 0;
  const email = data.email
    ? {
        ...emailBase,
        value: count(emailIssueCount),
        unit: emailIssueCount === 1 ? "issue" : "issues",
        status: data.email.ready
          ? data.email.queued
            ? `${count(data.email.queued)} queued · worker healthy`
            : "All systems normal"
          : "Delivery pipeline needs attention",
        tone: data.email.ready
          ? emailIssueCount
            ? ("attention" as const)
            : ("healthy" as const)
          : ("critical" as const),
        available: true,
      }
    : unavailableModule(emailBase);

  const admins = data.admins
    ? {
        ...privacyBase,
        value: count(data.admins.total),
        unit: data.admins.total === 1 ? "admin" : "admins",
        status: data.admins.verified
          ? `${count(data.admins.verified)} MFA-enrolled administrator${data.admins.verified === 1 ? "" : "s"}`
          : data.admins.total
            ? "Password access active"
            : "No administrator identities",
        tone: data.admins.total ? ("healthy" as const) : ("attention" as const),
        available: true,
      }
    : unavailableModule(privacyBase);

  return [leads, analytics, sessions, security, email, admins];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

function ModuleCard({ module }: { module: LaunchpadModule }) {
  const Icon = module.icon;

  return (
    <article
      className={styles.moduleCard}
      data-tone={module.tone}
      data-source-available={module.available ? "true" : "false"}
    >
      <Link
        href={module.actions[0].href}
        className={styles.cardOverlay}
        aria-label={module.actions[0].label}
      />
      <div className={styles.moduleIcon} aria-hidden="true">
        <Icon strokeWidth={1.55} />
      </div>
      <div className={styles.moduleContent}>
        <h2>{module.title}</h2>
        <p className={styles.metric}>
          <strong>{module.value}</strong>
          <span>{module.unit}</span>
        </p>
        <p className={styles.description}>{module.description}</p>
        <p className={styles.status}>
          <span aria-hidden="true" />
          {module.status}
        </p>
      </div>
      <div className={styles.moduleActions}>
        <span className={styles.primaryAction} aria-hidden="true">
          <ArrowRight />
        </span>
      </div>
    </article>
  );
}

export default async function AdminPage() {
  const decision = await getAdminAuthDecision();

  if (!decision.ok) {
    redirect(`/admin/login?error=${decision.reason}`);
  }

  if (decision.principal.authentication === "legacy-shared-password") {
    redirect("/admin/identity-migration");
  }

  const data = await loadAdminLaunchpadData(getAdminAuthConfig().role);
  const modules = buildLaunchpadModules(data);

  return (
    <AdminShell adminEmail={decision.principal.email}>
      <main data-admin-scrollbar="true" className={`admin-safe-page ${styles.page}`}>
        <div className={styles.inner}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Admin workspace</p>
            <h1>Operations</h1>
            <p className={styles.intro}>Choose a workspace to review and act.</p>
          </div>
          <p className={styles.date}>
            <CalendarDays aria-hidden="true" />
            <time dateTime={data.generatedAt}>{formatDate(data.generatedAt)}</time>
          </p>
        </header>

        <section className={styles.moduleGrid} aria-label="Admin workspaces">
          {modules.map((module) => <ModuleCard key={module.id} module={module} />)}
        </section>

        <section className={styles.activityPanel} aria-labelledby="recent-activity-heading">
          <div className={styles.activityHeading}>
            <Clock3 aria-hidden="true" />
            <h2 id="recent-activity-heading">Recent activity</h2>
          </div>
          {data.recentActivity.length ? (
            <ol className={styles.activityList}>
              {data.recentActivity.map((activity) => (
                <li key={activity.id} data-tone={activity.tone}>
                  <span className={styles.activityDot} aria-hidden="true" />
                  <span>
                    <strong>{activity.label}</strong>
                    <time dateTime={activity.occurredAt}>{formatTimestamp(activity.occurredAt)} UTC</time>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.emptyActivity}>No recent operational activity is available.</p>
          )}
          <Link href="/admin/analytics?focus=reliability&range=7d" className={styles.activityLink}>
            View activity
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
        </div>
      </main>
    </AdminShell>
  );
}
