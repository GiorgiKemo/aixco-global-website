import "server-only";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasAdminRole } from "./policy";
import {
  adminInviteEmailSchema,
  generateAdminIdentityInvite,
  sendAdminIdentityInviteEmail,
} from "./identity-invite-email";

export { adminInviteEmailSchema } from "./identity-invite-email";

export type AdminIdentityStatus = {
  id: string;
  email: string | null;
  invitedAt: string | null;
  lastSignInAt: string | null;
  verifiedTotpFactors: number | null;
};

export type AdminIdentityMigrationSourceStatus = "available" | "partial" | "unavailable";
export type AdminIdentityMigrationSourceIssue = "admin-client" | "user-list" | "mfa-factors";

export type AdminIdentityMigrationStatus = {
  admins: AdminIdentityStatus[];
  safeToDisableLegacyAccess: boolean;
  sourceStatus: AdminIdentityMigrationSourceStatus;
  sourceIssues: AdminIdentityMigrationSourceIssue[];
};

async function runBootstrapClaimRpc(
  fn:
    | "claim_admin_identity_bootstrap"
    | "release_admin_identity_bootstrap"
    | "complete_admin_identity_bootstrap",
  args: { p_claim_id: string; p_user_id?: string },
) {
  const supabase = await getSupabaseAdminClient();
  const bootstrapRpcClient = supabase as unknown as {
    rpc: (
      functionName: typeof fn,
      functionArgs: typeof args,
    ) => Promise<{
      data: boolean | null;
      error: { code?: string; message: string } | null;
    }>;
  };
  const { data, error } = await bootstrapRpcClient.rpc(fn, args);
  if (error) {
    throw new Error(`Administrator bootstrap claim failed (${error.code ?? "database_error"}).`);
  }
  return data === true;
}

export function claimAdminIdentityBootstrap(claimId: string) {
  return runBootstrapClaimRpc("claim_admin_identity_bootstrap", {
    p_claim_id: z.string().uuid().parse(claimId),
  });
}

export function releaseAdminIdentityBootstrap(claimId: string) {
  return runBootstrapClaimRpc("release_admin_identity_bootstrap", {
    p_claim_id: z.string().uuid().parse(claimId),
  });
}

export function completeAdminIdentityBootstrap(claimId: string, userId: string) {
  return runBootstrapClaimRpc("complete_admin_identity_bootstrap", {
    p_claim_id: z.string().uuid().parse(claimId),
    p_user_id: z.string().uuid().parse(userId),
  });
}

function buildMigrationStatus(
  admins: AdminIdentityStatus[],
  sourceStatus: AdminIdentityMigrationSourceStatus,
  sourceIssues: AdminIdentityMigrationSourceIssue[],
): AdminIdentityMigrationStatus {
  return {
    admins,
    sourceStatus,
    sourceIssues: [...new Set(sourceIssues)],
    // A partial response must never be treated as proof that migration is safe.
    safeToDisableLegacyAccess: sourceStatus === "available"
      && admins.some((admin) => (admin.verifiedTotpFactors ?? 0) > 0),
  };
}

export async function getAdminIdentityMigrationStatus(
  requiredRole: string,
): Promise<AdminIdentityMigrationStatus> {
  let supabase;
  try {
    supabase = await getSupabaseAdminClient();
  } catch {
    return buildMigrationStatus([], "unavailable", ["admin-client"]);
  }

  const admins: AdminIdentityStatus[] = [];
  const sourceIssues: AdminIdentityMigrationSourceIssue[] = [];
  let completedUserPage = false;

  for (let page = 1; ; page += 1) {
    let usersResult;
    try {
      usersResult = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    } catch {
      sourceIssues.push("user-list");
      return buildMigrationStatus(
        admins,
        completedUserPage ? "partial" : "unavailable",
        sourceIssues,
      );
    }

    if (usersResult.error || !Array.isArray(usersResult.data?.users)) {
      sourceIssues.push("user-list");
      return buildMigrationStatus(
        admins,
        completedUserPage ? "partial" : "unavailable",
        sourceIssues,
      );
    }
    completedUserPage = true;

    for (const user of usersResult.data.users) {
      if (!hasAdminRole(user.app_metadata, requiredRole)) continue;

      let verifiedTotpFactors: number | null = null;
      try {
        const factors = await supabase.auth.admin.mfa.listFactors({ userId: user.id });
        if (factors.error || !Array.isArray(factors.data?.factors)) {
          sourceIssues.push("mfa-factors");
        } else {
          verifiedTotpFactors = factors.data.factors.filter(
            (factor) => factor.factor_type === "totp" && factor.status === "verified",
          ).length;
        }
      } catch {
        sourceIssues.push("mfa-factors");
      }

      admins.push({
        id: user.id,
        email: user.email ?? null,
        invitedAt: user.invited_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        verifiedTotpFactors,
      });
    }

    if (usersResult.data.users.length < 200) break;
  }

  return buildMigrationStatus(
    admins,
    sourceIssues.length ? "partial" : "available",
    sourceIssues,
  );
}

export async function inviteAdminIdentity(
  email: string,
  options: {
    role: string;
    redirectTo: string;
    sendInvite?: (email: string, actionLink: string) => Promise<unknown>;
  },
) {
  const normalizedEmail = adminInviteEmailSchema.parse(email);
  const supabase = await getSupabaseAdminClient();
  const generated = await generateAdminIdentityInvite(normalizedEmail, {
    redirectTo: options.redirectTo,
  });

  const updated = await supabase.auth.admin.updateUserById(generated.id, {
    app_metadata: {
      ...generated.appMetadata,
      role: options.role,
      invited_by: "aixco_admin_migration",
    },
  });
  if (updated.error) {
    // The invite was just created by this operation. Remove it if assigning the
    // server-controlled role fails so an unclassified identity is not left.
    try {
      const rollback = await supabase.auth.admin.deleteUser(generated.id);
      if (rollback.error) console.error("Could not roll back an incomplete admin invitation.");
    } catch {
      console.error("Could not roll back an incomplete admin invitation.");
    }
    throw new Error(`Could not assign the admin role: ${updated.error.message}`);
  }

  try {
    await (options.sendInvite ?? ((inviteEmail, actionLink) => sendAdminIdentityInviteEmail(inviteEmail, actionLink)))
      (normalizedEmail, generated.actionLink);
  } catch (error) {
    try {
      const rollback = await supabase.auth.admin.deleteUser(generated.id);
      if (rollback.error) console.error("Could not roll back an administrator whose invitation email failed.");
    } catch {
      console.error("Could not roll back an administrator whose invitation email failed.");
    }
    throw error;
  }

  return { id: generated.id, email: normalizedEmail };
}
