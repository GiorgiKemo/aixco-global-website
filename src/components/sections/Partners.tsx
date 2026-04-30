import { partners } from "@/data/site";
import { useUI } from "../ui-state";

export function Partners() {
  const { openPartner } = useUI();
  return (
    <section id="partners" className="relative py-28 md:py-36 scroll-mt-24">
      <div className="container-x">
        <div className="scroll-reveal max-w-3xl mb-14">
          <p className="eyebrow">Partners · Ecosystem</p>
          <h2 className="heading-section mt-5">An ecosystem of <span className="text-gold italic">trusted partners</span>.</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {partners.map((p) => (
            <button
              key={p.name}
              onClick={() => openPartner(p)}
              className={`scroll-reveal mac-card group flex min-h-[140px] flex-col justify-between p-7 text-left ${p.featured ? "ring-1 ring-primary/35" : ""}`}
            >
              <p className="font-display text-xl">{p.name}</p>
              <span className="text-[11px] uppercase tracking-widest text-primary mt-3 inline-block">
                {p.featured ? "Featured Partner" : "Partner"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
