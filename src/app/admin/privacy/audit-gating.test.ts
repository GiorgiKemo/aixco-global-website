import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  audit: vi.fn(),
  exportSubject: vi.fn(),
  deleteSubject: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ getAal2AdminAuthDecision: mocks.auth }));
vi.mock("@/lib/admin/audit", () => ({ auditAdminAction: mocks.audit }));
vi.mock("@/lib/admin/privacy", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin/privacy")>();
  return {
    ...actual,
    exportContactSubjectData: mocks.exportSubject,
    deleteContactSubjectData: mocks.deleteSubject,
    privacySubjectAuditTarget: () => "email-hmac:subject",
  };
});

import { POST as exportSubject } from "./export/route";
import { POST as deleteSubject } from "./delete/route";

function request(path: "export" | "delete") {
  const body = new FormData();
  body.set("email", "subject@example.com");
  if (path === "delete") body.set("confirmation", "DELETE");
  return new Request(`https://www.aixco.global/admin/privacy/${path}`, {
    method: "POST",
    headers: { origin: "https://www.aixco.global" },
    body,
  });
}

describe("privacy operation audit gates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      ok: true,
      principal: {
        id: "4427dba7-3040-40fe-b965-9b278610f7b7",
        email: "admin@aixco.global",
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    });
  });

  it("does not export or delete without a verified AAL2 admin session", async () => {
    mocks.auth.mockResolvedValue({ ok: false, reason: "mfa-required" });

    expect((await exportSubject(request("export"))).status).toBe(303);
    expect((await deleteSubject(request("delete"))).status).toBe(303);
    expect(mocks.exportSubject).not.toHaveBeenCalled();
    expect(mocks.deleteSubject).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it("does not read subject data when the required export audit cannot persist", async () => {
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));
    const response = await exportSubject(request("export"));

    expect(response.headers.get("location")).toContain("error=export-failed");
    expect(mocks.exportSubject).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "privacy.subject.export.requested",
      target: "email-hmac:subject",
    }), { required: true });
  });

  it("does not delete subject data when the required deletion audit cannot persist", async () => {
    mocks.audit.mockRejectedValueOnce(new Error("audit unavailable"));
    const response = await deleteSubject(request("delete"));

    expect(response.headers.get("location")).toContain("error=delete-failed");
    expect(mocks.deleteSubject).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      action: "privacy.subject.delete.requested",
      target: "email-hmac:subject",
    }), { required: true });
  });
});
