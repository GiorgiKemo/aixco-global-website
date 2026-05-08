export default function LegacyInsightLoading() {
  return (
    <main className="min-h-screen bg-[#11100e] pt-24 text-white md:pt-28">
      <article className="container-x max-w-5xl py-12 md:py-16">
        <div className="h-10 w-48 animate-pulse rounded-full bg-white/10" />
        <header className="mt-10 border-b border-white/12 pb-10">
          <div className="h-3 w-32 animate-pulse rounded-full bg-primary/35" />
          <div className="mt-5 h-16 max-w-3xl animate-pulse rounded-lg bg-white/10 md:h-24" />
          <div className="mt-6 h-5 max-w-2xl animate-pulse rounded-full bg-white/10" />
        </header>
        <div className="mx-auto mt-12 max-w-3xl space-y-10">
          {[0, 1, 2].map((item) => (
            <section key={item}>
              <div className="h-9 w-3/4 animate-pulse rounded-lg bg-white/10" />
              <div className="mt-5 space-y-4">
                <div className="h-4 animate-pulse rounded-full bg-white/10" />
                <div className="h-4 animate-pulse rounded-full bg-white/10" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
