export default function AdminLoading() {
  return (
    <main
      className="grid min-h-[100dvh] place-items-center bg-[#f8f6f1] px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] pt-[max(2rem,env(safe-area-inset-top,0px))]"
      aria-busy="true"
    >
      <section
        className="w-full max-w-md rounded-xl border border-[#d8d2c6] bg-white p-6 text-center shadow-xl sm:p-8"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className="mx-auto grid size-12 place-items-center rounded-full bg-[#f3eee2]"
          aria-hidden="true"
        >
          <span className="size-5 animate-spin rounded-full border-2 border-[#c9b98f] border-t-[#7c5d17] motion-reduce:animate-none" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#735a20]">
          Secure admin workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#27241f]">
          Opening your workspace
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#625d54]">
          Verifying access and loading the requested admin screen.
        </p>
      </section>
    </main>
  );
}
