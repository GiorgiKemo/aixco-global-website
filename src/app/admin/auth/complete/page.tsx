import { Suspense } from "react";
import AdminAuthCompleteClient from "./client-page";

export const dynamic = "force-dynamic";

export default function AdminAuthCompletePage() {
  return (
    <Suspense fallback={<main className="admin-safe-page sr-only">Securing your invitation…</main>}>
      <AdminAuthCompleteClient />
    </Suspense>
  );
}
