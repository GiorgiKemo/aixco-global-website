import { ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const articleLinks = [
  { title: "7% Annual Property Growth", href: "/aixco-global-op2/annual-property-growth-batumi.html" },
  { title: "Rise of the Black Sea Corridor", href: "/aixco-global-op2/black-sea-corridor-batumi-report.html" },
  { title: "From Volatility to Opportunity", href: "/aixco-global-op2/from-volatility-to-opportunity-batumi.html" },
  { title: "40% Down Payment Guide", href: "/aixco-global-op2/batumi-property-40-percent-down-v2.html" },
  { title: "Short-Term Rentals in Batumi", href: "/aixco-global-op2/short-term-rentals-batumi-full.html" },
  { title: "$50K Gateway Property", href: "/aixco-global-op2/50k-gateway-european-coastal-property.html" },
  { title: "Tourism-Led Real Estate", href: "/aixco-global-op2/tourism-led-real-estate-batumi.html" },
  { title: "8–12% Rental Yield", href: "/aixco-global-op2/high-rental-yield-coastal-real-estate.html" },
  { title: "Secondary Coastal Cities", href: "/aixco-global-op2/why-capital-secondary-coastal-cities.html" },
  { title: "Batumi Rental Market", href: "/aixco-global-op2/batumi-short-term-rentals.html" },
];

export default function Insights() {
  return (
    <>
      <Nav />
      <main className="pb-20 pt-32">
        <section className="container-x">
          <div className="scroll-reveal">
            <p className="eyebrow">Batumi</p>
            <h1 className="heading-display mt-5 max-w-4xl">Batumi</h1>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {articleLinks.map((article, index) => (
              <a key={article.href} href={article.href} className="scroll-reveal mac-card group flex min-h-[150px] flex-col justify-between p-6">
                <span className="font-display text-4xl text-primary/30">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="mt-5 font-display text-xl leading-snug">{article.title}</h2>
                <span className="mt-5 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-primary">
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
