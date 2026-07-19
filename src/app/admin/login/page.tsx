import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminAuthConfig, hasAdminSession } from "@/lib/admin/auth";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | AIXCO.Global",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect("/admin/leads");
  }

  const config = getAdminAuthConfig();

  return (
    <main className="admin-safe-page admin-safe-page--login min-h-screen bg-background px-5 py-16 text-foreground">
      <section className="mx-auto w-full max-w-md">
        <p className="eyebrow">AIXCO Admin</p>
        <h1 className="mt-4 font-display text-4xl leading-tight">Lead dashboard</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Sign in with your individual admin identity and authenticator app to review contact submissions, live chat transcripts,
          and portal handoff activity.
        </p>

        <AdminLoginForm
          config={{
            configured: config.configured,
            missing: config.missing,
            mode: config.mode,
            role: config.role,
            identityAvailable: config.identity.configured,
            legacyAvailable: config.legacy.enabled && config.legacy.configured,
          }}
        />
      </section>
    </main>
  );
}
