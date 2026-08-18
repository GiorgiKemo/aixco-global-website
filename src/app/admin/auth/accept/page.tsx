import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accept admin invitation | AIXCO.Global",
  robots: { index: false, follow: false },
};

export default function AdminInviteAcceptPage() {
  return (
    <main className="admin-safe-page grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border/70 bg-surface-elevated p-6 text-center shadow-elegant">
        <p className="eyebrow">AIXCO Admin</p>
        <h1 className="mt-3 font-display text-2xl">Accept your invitation</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Continue to AIXCO to create your administrator password. This extra confirmation keeps email security scanners from using your one-time invitation link.
        </p>
        <form action="/admin/auth/callback" method="post" className="mt-6">
          <button type="submit" className="btn-gold inline-flex min-h-11 w-full items-center justify-center">
            Continue to admin setup
          </button>
        </form>
      </section>
    </main>
  );
}
