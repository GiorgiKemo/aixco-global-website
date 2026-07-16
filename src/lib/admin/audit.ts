import type { AdminPrincipal } from "./auth";
import { createHash } from "node:crypto";

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
  const actorEmailHash = event.actor.email
    ? createHash("sha256").update(event.actor.email.trim().toLowerCase()).digest("hex").slice(0, 24)
    : null;
  console.info(
    "[aixco-admin-audit]",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      action: event.action,
      outcome: event.outcome,
      actor: {
        id: event.actor.id,
        emailHash: actorEmailHash,
        authentication: event.actor.authentication,
      },
      target: event.target,
      details: event.details,
    }),
  );
}
