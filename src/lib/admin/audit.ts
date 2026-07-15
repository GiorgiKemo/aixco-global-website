import type { AdminPrincipal } from "./auth";

type AdminAuditEvent = {
  action: string;
  actor: AdminPrincipal;
  outcome: "success" | "failure";
  target?: string;
  details?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Emits a structured, identity-bearing event to the deployment logs.
 * Do not include form messages, passwords, tokens, or other secrets in details.
 */
export function auditAdminAction(event: AdminAuditEvent) {
  console.info(
    "[aixco-admin-audit]",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      action: event.action,
      outcome: event.outcome,
      actor: {
        id: event.actor.id,
        email: event.actor.email,
        authentication: event.actor.authentication,
      },
      target: event.target,
      details: event.details,
    }),
  );
}
