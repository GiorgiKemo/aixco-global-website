import { beforeEach, describe, expect, it, vi } from "vitest";

const admin = vi.hoisted(() => ({
  inviteUserByEmail: vi.fn(),
  updateUserById: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: async () => ({ auth: { admin } }),
}));

import { inviteAdminIdentity } from "./identity-migration";

describe("admin identity invitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes the address and assigns the server-controlled role", async () => {
    admin.inviteUserByEmail.mockResolvedValue({
      data: { user: { id: "user-1", app_metadata: { existing: true } } },
      error: null,
    });
    admin.updateUserById.mockResolvedValue({ data: { user: {} }, error: null });

    await expect(inviteAdminIdentity(" Named.Admin@Example.com ", {
      role: "admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
    })).resolves.toEqual({ id: "user-1", email: "named.admin@example.com" });
    expect(admin.updateUserById).toHaveBeenCalledWith("user-1", {
      app_metadata: { existing: true, role: "admin" },
    });
  });

  it("attempts a compensating delete if role assignment fails", async () => {
    admin.inviteUserByEmail.mockResolvedValue({
      data: { user: { id: "user-2", app_metadata: {} } },
      error: null,
    });
    admin.updateUserById.mockResolvedValue({ data: { user: null }, error: { message: "Role rejected" } });
    admin.deleteUser.mockResolvedValue({ data: null, error: null });

    await expect(inviteAdminIdentity("admin@example.com", {
      role: "admin",
      redirectTo: "https://www.aixco.global/admin/auth/complete",
    })).rejects.toThrow("Could not assign the admin role: Role rejected");
    expect(admin.deleteUser).toHaveBeenCalledWith("user-2");
  });
});
