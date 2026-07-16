import "server-only";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasAdminRole } from "./policy";

export const adminInviteEmailSchema = z.string().trim().email().max(255).transform((value) => value.toLowerCase());

export type AdminIdentityStatus = {
  id: string;
  email: string | null;
  invitedAt: string | null;
  lastSignInAt: string | null;
  verifiedTotpFactors: number;
};

export async function getAdminIdentityMigrationStatus(requiredRole: string) {
  const supabase = await getSupabaseAdminClient();
  const admins: AdminIdentityStatus[] = [];

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Could not list admin identities: ${error.message}`);

    for (const user of data.users) {
      if (!hasAdminRole(user.app_metadata, requiredRole)) continue;
      const factors = await supabase.auth.admin.mfa.listFactors({ userId: user.id });
      if (factors.error) throw new Error(`Could not inspect MFA status: ${factors.error.message}`);
      admins.push({
        id: user.id,
        email: user.email ?? null,
        invitedAt: user.invited_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        verifiedTotpFactors: factors.data.factors.filter(
          (factor) => factor.factor_type === "totp" && factor.status === "verified",
        ).length,
      });
    }

    if (data.users.length < 200) break;
  }

  return {
    admins,
    safeToDisableLegacyAccess: admins.some((admin) => admin.verifiedTotpFactors > 0),
  };
}

export async function inviteAdminIdentity(
  email: string,
  options: { role: string; redirectTo: string },
) {
  const normalizedEmail = adminInviteEmailSchema.parse(email);
  const supabase = await getSupabaseAdminClient();
  const invited = await supabase.auth.admin.inviteUserByEmail(normalizedEmail, {
    redirectTo: options.redirectTo,
    data: { invited_by: "aixco_admin_migration" },
  });
  const user = invited.data.user;
  if (invited.error || !user) {
    throw new Error(invited.error?.message ?? "Admin invitation did not return a user.");
  }

  const updated = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      role: options.role,
    },
  });
  if (updated.error) {
    // The invite was just created by this operation. Remove it if assigning the
    // server-controlled role fails so an unclassified identity is not left.
    try {
      const rollback = await supabase.auth.admin.deleteUser(user.id);
      if (rollback.error) console.error("Could not roll back an incomplete admin invitation.");
    } catch {
      console.error("Could not roll back an incomplete admin invitation.");
    }
    throw new Error(`Could not assign the admin role: ${updated.error.message}`);
  }

  return { id: user.id, email: normalizedEmail };
}
