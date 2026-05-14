"use client";

import dynamic from "next/dynamic";

const DeferredHomeSectionsContent = dynamic(
  () =>
    import("@/components/sections/DeferredHomeSectionsContent").then(
      (module) => module.DeferredHomeSectionsContent,
    ),
  {
    loading: () => (
      <div aria-hidden="true" className="contents" data-deferred-home-sections="loading">
        <section className="bg-surface/40 py-16 md:py-20">
          <div className="container-x">
            <div className="h-[min(80svh,48rem)] rounded-lg bg-white/55" />
          </div>
        </section>
      </div>
    ),
  },
);

export function DeferredHomeSections() {
  return <DeferredHomeSectionsContent />;
}
