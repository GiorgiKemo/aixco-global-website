import type { Metadata } from "next";
import { AdminPasswordRecoveryForm } from "@/app/admin/login/AdminPasswordRecoveryForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset admin password | AIXCO.Global",
  robots: { index: false, follow: false },
};

export default function AdminPasswordRecoveryPage() {
  return (
    <main className="admin-safe-page grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
      <div className="w-full max-w-md">
        <AdminPasswordRecoveryForm mode="update" />
      </div>
    </main>
  );
}
