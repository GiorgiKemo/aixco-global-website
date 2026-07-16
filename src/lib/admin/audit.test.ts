import { describe, expect, it, vi } from "vitest";
import { auditAdminAction } from "./audit";

describe("admin audit events", () => {
  it("hashes actor email addresses instead of writing PII to logs", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      auditAdminAction({
        action: "test.action",
        actor: { id: "admin-1", email: "Private.Admin@Example.com", authentication: "supabase-mfa", aal: "aal2" },
        outcome: "success",
      });
      const serialized = JSON.stringify(info.mock.calls);
      expect(serialized).not.toContain("Private.Admin@Example.com");
      expect(serialized).not.toContain("private.admin@example.com");
      expect(serialized).toContain("emailHash");
    } finally {
      info.mockRestore();
    }
  });
});
