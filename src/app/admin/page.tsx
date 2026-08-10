import { redirect } from "next/navigation";
import { getAdminAuthDecision } from "@/lib/admin/auth";

export default async function AdminPage() {
  const decision = await getAdminAuthDecision();

  if (!decision.ok) {
    redirect(`/admin/login?error=${decision.reason}`);
  }

  if (decision.principal.authentication !== "legacy-shared-password") {
    redirect("/admin/analytics");
  }

  // The shared-password migration principal may only finish the identity
  // rollout until the individual identity is used.
  redirect("/admin/identity-migration");
}
