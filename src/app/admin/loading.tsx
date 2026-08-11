import { AdminShell } from "@/app/admin/_components";

/**
 * Dynamic admin pages do real server-side reads. Keeping a lightweight shell
 * visible while those reads resolve makes pagination and workspace changes
 * feel immediate instead of leaving the previous page frozen.
 */
export default function AdminLoading() {
  return (
    <AdminShell>
      <main className="admin-loading" aria-busy="true" aria-live="polite">
        <span className="admin-loading__sr-only">Loading workspace…</span>
        <div className="admin-loading__header" aria-hidden="true">
          <span className="admin-loading__line admin-loading__line--eyebrow" />
          <span className="admin-loading__line admin-loading__line--title" />
          <span className="admin-loading__line admin-loading__line--intro" />
        </div>
        <div className="admin-loading__grid" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="admin-loading__card" key={index}>
              <span className="admin-loading__icon" />
              <span className="admin-loading__copy">
                <span className="admin-loading__line admin-loading__line--card-title" />
                <span className="admin-loading__line admin-loading__line--metric" />
                <span className="admin-loading__line admin-loading__line--body" />
              </span>
            </div>
          ))}
        </div>
      </main>
    </AdminShell>
  );
}
