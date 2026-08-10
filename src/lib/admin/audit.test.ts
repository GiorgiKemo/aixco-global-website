import { describe, expect, it, vi } from "vitest";
import {
  auditAdminAction,
  auditAdminLoginAttempt,
  type AuditClient,
} from "./audit";

function auditClient(error: { message: string; code?: string } | null = null) {
  const insert = vi.fn(async () => ({ error }));
  const client: AuditClient = {
    from: vi.fn(() => ({ insert })),
  };
  return { client, insert };
}

describe("admin audit events", () => {
  it("hashes actor email addresses in both logs and durable rows", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const { client, insert } = auditClient();
    try {
      await auditAdminAction({
        action: "lead.status_update",
        actor: {
          id: "4427dba7-3040-40fe-b965-9b278610f7b7",
          email: "Private.Admin@Example.com",
          authentication: "supabase-mfa",
          aal: "aal2",
        },
        outcome: "success",
        target: "AIX-2026-000001",
        details: { status: "contacted", invalid_key: "kept because key is valid" },
        headers: new Headers({
          "x-vercel-forwarded-for": "203.0.113.88",
          "x-vercel-id": "iad1::request-123",
          "user-agent": "Admin Browser",
        }),
      }, { client, now: new Date("2026-08-07T12:00:00.000Z") });

      const serializedLog = JSON.stringify(info.mock.calls);
      const serializedRow = JSON.stringify(insert.mock.calls);
      expect(serializedLog).not.toContain("Private.Admin@Example.com");
      expect(serializedLog).not.toContain("private.admin@example.com");
      expect(serializedLog).toContain("emailHash");
      expect(serializedRow).not.toContain("Private.Admin@Example.com");
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({
        occurred_at: "2026-08-07T12:00:00.000Z",
        actor_id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        actor_email_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        action: "lead.status_update",
        outcome: "success",
        target_type: "status_update",
        target_id: "AIX-2026-000001",
        ip_address: "203.0.113.88",
        ip_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        user_agent: "Admin Browser",
        request_id: "iad1::request-123",
      }));
    } finally {
      info.mockRestore();
    }
  });

  it("records anonymous login attempts with a hashed email and bounded details", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const { client, insert } = auditClient();
    try {
      const stored = await auditAdminLoginAttempt({
        email: "ADMIN@AIXCO.GLOBAL",
        outcome: "failure",
        phase: "credentials",
        reason: "x".repeat(200),
        headers: new Headers({
          "x-forwarded-for": "198.51.100.44",
          "x-request-id": "request-456",
        }),
      }, { client, now: new Date("2026-08-07T12:01:00.000Z") });

      expect(stored).toBe(true);
      expect(JSON.stringify(info.mock.calls)).not.toContain("ADMIN@AIXCO.GLOBAL");
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({
        actor_id: null,
        actor_email_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        action: "admin.login",
        outcome: "failure",
        auth_method: "supabase-mfa",
        target_type: "admin_session",
        ip_address: "198.51.100.44",
        request_id: "request-456",
        details: {
          phase: "credentials",
          reason: "x".repeat(120),
          clientReported: true,
          principalVerified: false,
        },
      }));
    } finally {
      info.mockRestore();
    }
  });

  it("binds a successful login audit to the verified AAL2 principal", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const { client, insert } = auditClient();
    try {
      const stored = await auditAdminLoginAttempt({
        email: "spoofed@example.com",
        outcome: "success",
        phase: "mfa",
        principal: {
          id: "4427dba7-3040-40fe-b965-9b278610f7b7",
          email: "verified@aixco.global",
          authentication: "supabase-mfa",
          aal: "aal2",
        },
        headers: new Headers(),
      }, { client, now: new Date("2026-08-07T12:02:00.000Z") });

      expect(stored).toBe(true);
      expect(JSON.stringify(info.mock.calls)).not.toContain("spoofed@example.com");
      expect(JSON.stringify(insert.mock.calls)).not.toContain("spoofed@example.com");
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({
        actor_id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        actor_email_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        auth_method: "supabase-mfa",
        outcome: "success",
        details: expect.objectContaining({ principalVerified: true }),
      }));
    } finally {
      info.mockRestore();
    }
  });

  it("reports when a login audit could not be durably stored", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { client } = auditClient({ message: "database unavailable", code: "XX001" });
    try {
      await expect(auditAdminLoginAttempt({
        email: "admin@aixco.global",
        outcome: "failure",
        phase: "credentials",
        headers: new Headers(),
      }, { client })).resolves.toBe(false);
      expect(warn).toHaveBeenCalledWith("Admin login audit persistence failed (XX001).");
    } finally {
      info.mockRestore();
      warn.mockRestore();
    }
  });

  it("does not block an authorized action when the audit sink fails", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { client } = auditClient({ message: "sensitive database details", code: "XX001" });
    try {
      await expect(auditAdminAction({
        action: "lead.requeue",
        actor: {
          id: "legacy-admin",
          email: null,
          authentication: "legacy-shared-password",
          aal: null,
        },
        outcome: "success",
      }, { client })).resolves.toBeUndefined();
      expect(warn).toHaveBeenCalledWith("Admin audit persistence failed (XX001).");
    } finally {
      info.mockRestore();
      warn.mockRestore();
    }
  });

  it("fails closed when persistence is required and the durable sink rejects the row", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { client } = auditClient({ message: "sensitive database details", code: "XX001" });
    try {
      await expect(auditAdminAction({
        action: "privacy.subject.delete.requested",
        actor: {
          id: "4427dba7-3040-40fe-b965-9b278610f7b7",
          email: "admin@aixco.global",
          authentication: "supabase-mfa",
          aal: "aal2",
        },
        outcome: "success",
        target: "email-hmac:bounded-subject",
      }, { client, required: true })).rejects.toThrow("Required admin audit persistence failed.");
      expect(warn).toHaveBeenCalledWith("Admin audit persistence failed (XX001).");
    } finally {
      info.mockRestore();
      warn.mockRestore();
    }
  });

  it("fails closed when the required durable sink is unavailable", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const client: AuditClient = {
      from: vi.fn(() => {
        throw new Error("connection details that must not escape");
      }),
    };
    try {
      await expect(auditAdminAction({
        action: "lead.status.update.requested",
        actor: {
          id: "4427dba7-3040-40fe-b965-9b278610f7b7",
          email: "admin@aixco.global",
          authentication: "supabase-mfa",
          aal: "aal2",
        },
        outcome: "success",
      }, { client, required: true })).rejects.toThrow("Required admin audit persistence failed.");
      expect(JSON.stringify(warn.mock.calls)).not.toContain("connection details that must not escape");
    } finally {
      info.mockRestore();
      warn.mockRestore();
    }
  });
});
