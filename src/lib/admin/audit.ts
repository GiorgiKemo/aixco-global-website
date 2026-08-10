import type { AdminPrincipal } from "./auth";
import { getAnalyticsRequestContext } from "@/lib/backend/site-analytics";
import { hashLeadCaptureIdentity } from "@/lib/backend/lead-capture-abuse";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type AdminAuditEvent = {
  action: string;
  actor: AdminPrincipal;
  outcome: "success" | "failure";
  target?: string;
  details?: Record<string, string | number | boolean | null | undefined>;
  headers?: Headers;
};

type AuditClient = {
  from: (table: "admin_audit_events") => {
    insert: (value: Record<string, unknown>) => PromiseLike<{
      error: { message: string; code?: string } | null;
    }>;
  };
};

type AdminAuditOptions = {
  client?: AuditClient;
  now?: Date;
  /**
   * Sensitive mutations use this fail-closed mode for their pre-action event.
   * Ordinary success/failure telemetry deliberately remains best-effort.
   */
  required?: boolean;
};

export class AdminAuditPersistenceError extends Error {
  constructor() {
    super("Required admin audit persistence failed.");
    this.name = "AdminAuditPersistenceError";
  }
}

type AdminLoginAuditEvent = {
  email: string | null;
  outcome: "success" | "failure";
  phase: "credentials" | "authorization" | "mfa" | "session";
  reason?: string;
  headers: Headers;
  principal?: AdminPrincipal;
};

function safeDetails(value: AdminAuditEvent["details"]) {
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, item] of Object.entries(value ?? {})) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,59}$/.test(key)) continue;
    if (typeof item === "string") output[key] = item.slice(0, 255);
    else if (typeof item === "number" && Number.isFinite(item)) output[key] = item;
    else if (typeof item === "boolean" || item === null) output[key] = item;
  }
  return output;
}

/**
 * Emits a structured, identity-bearing event to the deployment logs.
 * Do not include form messages, passwords, tokens, or other secrets in details.
 */
export async function auditAdminAction(
  event: AdminAuditEvent,
  options: AdminAuditOptions = {},
) {
  const timestamp = (options.now ?? new Date()).toISOString();
  const action = event.action.slice(0, 120);
  const target = event.target?.slice(0, 255);
  const details = safeDetails(event.details);
  const actorEmailHash = event.actor.email
    ? hashLeadCaptureIdentity(`admin-email:${event.actor.email.trim().toLowerCase()}`)
    : null;
  console.info(
    "[aixco-admin-audit]",
    JSON.stringify({
      timestamp,
      action,
      outcome: event.outcome,
      actor: {
        id: event.actor.id,
        emailHash: actorEmailHash,
        authentication: event.actor.authentication,
      },
      target,
      details,
    }),
  );

  try {
    const network = event.headers
      ? getAnalyticsRequestContext(event.headers)
      : { ipAddress: null, userAgent: null };
    const client = options.client
      ?? ((await getSupabaseAdminClient()) as unknown as AuditClient);
    const actorId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(event.actor.id)
      ? event.actor.id
      : null;
    const { error } = await client.from("admin_audit_events").insert({
      occurred_at: timestamp,
      actor_id: actorId,
      actor_email_hash: actorEmailHash,
      action,
      outcome: event.outcome,
      auth_method: event.actor.authentication,
      target_type: target ? action.split(".")[1]?.slice(0, 80) ?? null : null,
      target_id: target ?? null,
      ip_address: network.ipAddress,
      ip_hash: "ipHash" in network ? network.ipHash : null,
      user_agent: network.userAgent,
      request_id: event.headers?.get("x-vercel-id")?.slice(0, 160)
        ?? event.headers?.get("x-request-id")?.slice(0, 160)
        ?? null,
      details: {
        ...details,
        ...(actorId ? {} : { actorReference: event.actor.id.slice(0, 120) }),
      },
    });
    if (error) {
      console.warn(`Admin audit persistence failed (${error.code ?? "database_error"}).`);
      if (options.required) throw new AdminAuditPersistenceError();
    }
  } catch (error) {
    if (error instanceof AdminAuditPersistenceError) throw error;
    // Best-effort events remain fail-open; required pre-action events fail closed.
    console.warn("Admin audit persistence is unavailable.");
    if (options.required) throw new AdminAuditPersistenceError();
  }
}

export async function auditAdminLoginAttempt(
  event: AdminLoginAuditEvent,
  options: { client?: AuditClient; now?: Date } = {},
) {
  const timestamp = (options.now ?? new Date()).toISOString();
  const verifiedPrincipal = event.outcome === "success" ? event.principal : undefined;
  if (
    event.outcome === "success"
    && (!verifiedPrincipal || verifiedPrincipal.authentication === "legacy-shared-password")
  ) {
    throw new Error("Successful admin login audits require a verified Supabase principal.");
  }
  const verifiedEmail = verifiedPrincipal?.email ?? (event.outcome === "failure" ? event.email : null);
  const emailHash = verifiedEmail
    ? hashLeadCaptureIdentity(`admin-email:${verifiedEmail.trim().toLowerCase()}`)
    : null;
  const actorId = verifiedPrincipal
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(verifiedPrincipal.id)
    ? verifiedPrincipal.id
    : null;
  const authMethod = verifiedPrincipal?.authentication ?? "supabase-mfa";
  console.info("[aixco-admin-audit]", JSON.stringify({
    timestamp,
    action: "admin.login",
    outcome: event.outcome,
    actor: { id: actorId, emailHash, authentication: authMethod },
    details: {
      phase: event.phase,
      reason: event.reason,
      clientReported: true,
      principalVerified: Boolean(verifiedPrincipal),
    },
  }));

  try {
    const network = getAnalyticsRequestContext(event.headers);
    const client = options.client
      ?? ((await getSupabaseAdminClient()) as unknown as AuditClient);
    const { error } = await client.from("admin_audit_events").insert({
      occurred_at: timestamp,
      actor_id: actorId,
      actor_email_hash: emailHash,
      action: "admin.login",
      outcome: event.outcome,
      auth_method: authMethod,
      target_type: "admin_session",
      target_id: null,
      ip_address: network.ipAddress,
      ip_hash: network.ipHash,
      user_agent: network.userAgent,
      request_id: event.headers.get("x-vercel-id")?.slice(0, 160)
        ?? event.headers.get("x-request-id")?.slice(0, 160)
        ?? null,
      details: {
        phase: event.phase,
        ...(event.reason ? { reason: event.reason.slice(0, 120) } : {}),
        clientReported: true,
        principalVerified: Boolean(verifiedPrincipal),
      },
    });
    if (error) {
      console.warn(`Admin login audit persistence failed (${error.code ?? "database_error"}).`);
      return false;
    }
    return true;
  } catch {
    console.warn("Admin login audit persistence is unavailable.");
    return false;
  }
}

export type { AdminAuditEvent, AdminLoginAuditEvent, AuditClient };
