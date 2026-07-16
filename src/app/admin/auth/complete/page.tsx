"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAuthBrowserClient } from "@/lib/supabase/auth-browser";

export default function AdminAuthCompletePage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");

      // URL fragments are not sent in HTTP requests or Referer headers. Scrub
      // them synchronously before creating the auth client or awaiting work.
      window.history.replaceState(null, "", "/admin/auth/complete");

      try {
        if (!accessToken || !refreshToken) throw new Error("Missing invite session.");
        const supabase = getSupabaseAuthBrowserClient();
        const session = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (session.error || !session.data.session) throw session.error ?? new Error("Invalid invite session.");

        const user = await supabase.auth.getUser();
        if (user.error || !user.data.user) throw user.error ?? new Error("Invalid invited user.");
        if (!cancelled) router.replace("/admin/login?setup=1");
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border/70 bg-surface-elevated p-6 text-center shadow-elegant">
        <p className="eyebrow">AIXCO Admin</p>
        <h1 className="mt-3 font-display text-2xl">
          {failed ? "Invitation could not be verified" : "Securing your invitation…"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {failed
            ? "Request a new invitation from an existing administrator."
            : "You will continue to secure password and authenticator setup."}
        </p>
        {failed ? <a href="/admin/login" className="btn-gold mt-5 inline-flex justify-center">Return to sign in</a> : null}
      </section>
    </main>
  );
}
