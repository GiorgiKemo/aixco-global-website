"use client";

import { useSearchParams } from "next/navigation";

type AdminLoginFormProps = {
  config: {
    configured: boolean;
    missing: string[];
  };
};

function getErrorMessage(error: string | null) {
  if (error === "invalid") return "The admin password is incorrect.";
  if (error === "config") return "Admin authentication is not configured.";
  if (error === "rate-limited") return "Too many sign-in attempts. Please try again shortly.";
  return "";
}

export function AdminLoginForm({ config }: AdminLoginFormProps) {
  const params = useSearchParams();
  const errorMessage = getErrorMessage(params?.get("error") ?? null);

  return (
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
          <input
            type="text"
            name="username"
            autoComplete="username"
            value="admin"
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />
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
  );
}
