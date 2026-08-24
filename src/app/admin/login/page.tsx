import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAuthConfig, getAdminAuthDecision } from "@/lib/admin/auth";
import { getTrustedDeviceSecret } from "@/lib/admin/trusted-device";
import { getSiteUrl } from "@/lib/site-url";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminPasswordRecoveryForm } from "./AdminPasswordRecoveryForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | AIXCO.Global",
  alternates: { canonical: null },
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLoginPageProps = {
  searchParams?: Promise<{ setup?: string | string[]; recover?: string | string[]; recovered?: string | string[] }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const setup = Array.isArray(params.setup) ? params.setup[0] : params.setup;
  const recover = Array.isArray(params.recover) ? params.recover[0] : params.recover;
  const recovered = Array.isArray(params.recovered) ? params.recovered[0] : params.recovered;
  const auth = await getAdminAuthDecision();

  // Invitation completion must remain reachable even when the same browser
  // still carries the temporary migration cookie.
  if (auth.ok && setup !== "1" && recover !== "1") {
    redirect(
      auth.principal.authentication !== "legacy-shared-password"
        ? "/admin"
        : "/admin/identity-migration",
    );
  }

  const config = getAdminAuthConfig();

  return (
    <main className="admin-safe-page admin-safe-page--login min-h-screen bg-background px-5 py-16 text-foreground">
      <section className="mx-auto w-full max-w-md">
        <Link href="/" aria-label="AIXCO.Global home" className="mb-10 inline-flex">
          <Image
            src={aixcoLiveLogos.aixcoHorizontalDark}
            alt="AIXCO.Global"
            width={1600}
            height={333}
            sizes="10rem"
            className="h-auto w-40"
          />
        </Link>
        <p className="eyebrow">AIXCO Admin</p>
        <h1 className="mt-4 font-display text-4xl leading-tight">Operations dashboard</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Sign in with your individual admin identity to review website analytics, contact requests,
          reliability events, email delivery, and privacy operations.
        </p>

        {recover === "1" ? (
          <AdminPasswordRecoveryForm mode="request" redirectTo={`${getSiteUrl()}/admin/auth/recovery`} />
        ) : (
          <AdminLoginForm
            config={{
              configured: config.configured,
              missing: config.missing,
              mode: config.mode,
              role: config.role,
              identityAvailable: config.identity.configured,
              legacyAvailable: config.legacy.enabled && config.legacy.configured,
              trustedDeviceAvailable: Boolean(getTrustedDeviceSecret()),
            }}
            passwordRecoveryNotice={recovered === "1"}
          />
        )}
      </section>
    </main>
  );
}
