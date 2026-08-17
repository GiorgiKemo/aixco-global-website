import { beforeEach, describe, expect, it, vi } from "vitest";

const admin = vi.hoisted(() => ({
  listUsers: vi.fn(),
  mfa: { listFactors: vi.fn() },
  inviteUserByEmail: vi.fn(),
  updateUserById: vi.fn(),
  deleteUser: vi.fn(),
}));
const rpc = vi.hoisted(() => vi.fn());
const clientState = vi.hoisted(() => ({ unavailable: false }));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: async () => {
    if (clientState.unavailable) throw new Error("Missing admin client");
    return { auth: { admin }, rpc };
  },
}));

import {
  claimAdminIdentityBootstrap,
  completeAdminIdentityBootstrap,
  getAdminIdentityMigrationStatus,
  inviteAdminIdentity,
  releaseAdminIdentityBootstrap,
} from "./identity-migration";

describe("admin identity migration status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientState.unavailable = false;
  });

  it("returns unavailable when the server-only admin client cannot be created", async () => {
    clientState.unavailable = true;

    await expect(getAdminIdentityMigrationStatus("admin")).resolves.toEqual({
      admins: [],
      safeToDisableLegacyAccess: false,
      sourceStatus: "unavailable",
      sourceIssues: ["admin-client"],
    });
    expect(admin.listUsers).not.toHaveBeenCalled();
  });

  it("reports an available source only after users and MFA factors are fully inspected", async () => {
    admin.listUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "admin-1",
            email: "admin@example.com",
            app_metadata: { role: "admin" },
            invited_at: "2026-08-01T00:00:00.000Z",
            last_sign_in_at: "2026-08-17T10:00:00.000Z",
          },
          { id: "visitor-1", email: "visitor@example.com", app_metadata: {} },
        ],
      },
      error: null,
    });
    admin.mfa.listFactors.mockResolvedValue({
      data: {
        factors: [
          { id: "factor-1", factor_type: "totp", status: "verified" },
          { id: "factor-2", factor_type: "phone", status: "verified" },
        ],
      },
      error: null,
    });

    await expect(getAdminIdentityMigrationStatus("admin")).resolves.toEqual({
      admins: [{
        id: "admin-1",
        email: "admin@example.com",
        invitedAt: "2026-08-01T00:00:00.000Z",
        lastSignInAt: "2026-08-17T10:00:00.000Z",
        verifiedTotpFactors: 1,
      }],
      safeToDisableLegacyAccess: true,
      sourceStatus: "available",
      sourceIssues: [],
    });
    expect(admin.mfa.listFactors).toHaveBeenCalledWith({ userId: "admin-1" });
  });

  it("returns unavailable instead of throwing when the first user page fails", async () => {
    admin.listUsers.mockResolvedValue({
      data: { users: [] },
      error: { message: "Auth service unavailable" },
    });

    await expect(getAdminIdentityMigrationStatus("admin")).resolves.toEqual({
      admins: [],
      safeToDisableLegacyAccess: false,
      sourceStatus: "unavailable",
      sourceIssues: ["user-list"],
    });
  });

  it("returns partial and suppresses readiness when an MFA factor lookup fails", async () => {
    admin.listUsers.mockResolvedValue({
      data: {
        users: [{ id: "admin-1", email: "admin@example.com", app_metadata: { role: "admin" } }],
      },
      error: null,
    });
    admin.mfa.listFactors.mockResolvedValue({
      data: { factors: [] },
      error: { message: "Factor source unavailable" },
    });

    await expect(getAdminIdentityMigrationStatus("admin")).resolves.toEqual({
      admins: [{
        id: "admin-1",
        email: "admin@example.com",
        invitedAt: null,
        lastSignInAt: null,
        verifiedTotpFactors: null,
      }],
      safeToDisableLegacyAccess: false,
      sourceStatus: "partial",
      sourceIssues: ["mfa-factors"],
    });
  });

  it("returns partial if a later paginated user request fails", async () => {
    admin.listUsers
      .mockResolvedValueOnce({
        data: {
          users: Array.from({ length: 200 }, (_, index) => ({
            id: `visitor-${index}`,
            email: `visitor-${index}@example.com`,
            app_metadata: {},
          })),
        },
        error: null,
      })
      .mockRejectedValueOnce(new Error("Page unavailable"));

    await expect(getAdminIdentityMigrationStatus("admin")).resolves.toEqual({
      admins: [],
      safeToDisableLegacyAccess: false,
      sourceStatus: "partial",
      sourceIssues: ["user-list"],
    });
    expect(admin.listUsers).toHaveBeenNthCalledWith(2, { page: 2, perPage: 200 });
  });
});

describe("admin identity invitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientState.unavailable = false;
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

describe("admin identity bootstrap claim", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientState.unavailable = false;
  });

  it("uses service-role RPCs to claim, complete, and release the singleton", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    const claimId = "5dca2a80-7ddb-4e12-8f39-01fb72c0ac50";
    const userId = "74f0c177-cb85-4d38-b151-e8f51c36a329";

    await expect(claimAdminIdentityBootstrap(claimId)).resolves.toBe(true);
    await expect(completeAdminIdentityBootstrap(claimId, userId)).resolves.toBe(true);
    await expect(releaseAdminIdentityBootstrap(claimId)).resolves.toBe(true);

    expect(rpc).toHaveBeenNthCalledWith(1, "claim_admin_identity_bootstrap", {
      p_claim_id: claimId,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "complete_admin_identity_bootstrap", {
      p_claim_id: claimId,
      p_user_id: userId,
    });
    expect(rpc).toHaveBeenNthCalledWith(3, "release_admin_identity_bootstrap", {
      p_claim_id: claimId,
    });
  });

  it("fails closed when the bootstrap claim source is unavailable", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: "42883", message: "function unavailable" },
    });

    await expect(claimAdminIdentityBootstrap("5dca2a80-7ddb-4e12-8f39-01fb72c0ac50"))
      .rejects.toThrow("Administrator bootstrap claim failed (42883).");
  });
});
