import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminAuthConfig, hasAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | AIXCO.Global",
};

type AdminLoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

function getErrorMessage(error: string | undefined) {
  if (error === "invalid") return "The admin password is incorrect.";
  if (error === "config") return "Admin authentication is not configured.";
  return "";
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await hasAdminSession()) {
    redirect("/admin/leads");
  }

  const params = await searchParams;
  const config = getAdminAuthConfig();
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="min-h-screen bg-background px-5 py-16 text-foreground">
      <section className="mx-auto w-full max-w-md">
        <p className="eyebrow">AIXCO Admin</p>
        <h1 className="mt-4 font-display text-4xl leading-tight">Lead dashboard</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Sign in to review contact submissions, live chat transcripts, and portal handoff activity.
        </p>

        <div className="mt-8 rounded-lg border border-border/70 bg-surface-elevated p-6 shadow-elegant">
          {!config.configured ? (
            <div>
              <h2 className="font-display text-xl">Admin access is not configured</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Add these server-only environment variables, then restart the app:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                {config.missing.map((item) => (
                  <li key={item} className="rounded-md bg-background/70 px-3 py-2 font-mono text-xs">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <form action="/admin/session" method="post" className="grid gap-5">
              {errorMessage && (
                <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}
              <div>
                <label htmlFor="password" className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Admin password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn-gold justify-center">
                Sign in
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
