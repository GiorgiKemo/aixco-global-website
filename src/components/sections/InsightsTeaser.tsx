import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLivePath } from "@/lib/aixco-live-assets";

const articleLinks = [
  { title: "7% Annual Property Growth", href: aixcoLivePath("annual-property-growth-batumi.html") },
  { title: "Rise of the Black Sea Corridor", href: aixcoLivePath("black-sea-corridor-batumi-report.html") },
  { title: "From Volatility to Opportunity", href: aixcoLivePath("from-volatility-to-opportunity-batumi.html") },
  { title: "40% Down Payment Guide", href: aixcoLivePath("batumi-property-40-percent-down-v2.html") },
  { title: "Short-Term Rentals in Batumi", href: aixcoLivePath("short-term-rentals-batumi-full.html") },
  { title: "$50K Gateway Property", href: aixcoLivePath("50k-gateway-european-coastal-property.html") },
  { title: "Tourism-Led Real Estate", href: aixcoLivePath("tourism-led-real-estate-batumi.html") },
  { title: "8–12% Rental Yield", href: aixcoLivePath("high-rental-yield-coastal-real-estate.html") },
  { title: "Secondary Coastal Cities", href: aixcoLivePath("why-capital-secondary-coastal-cities.html") },
  { title: "Batumi Rental Market", href: aixcoLivePath("batumi-short-term-rentals.html") },
];

export function InsightsTeaser() {
  const { tx } = useI18n();

  return (
    <section id="insights" aria-labelledby="insights-heading" className="relative py-20 md:py-28 lg:py-36 bg-surface/40">
      <div className="container-x">
        <div className="scroll-reveal mb-14 max-w-3xl">
          <p className="eyebrow">{tx("Insights")}</p>
          <h2 id="insights-heading" className="heading-section mt-5">{tx("Market insights")}</h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            {tx("Selected research on coastal real estate, rental yields, and long-term market participation.")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {articleLinks.map((article, index) => (
            <motion.a
              key={article.href}
              href={article.href}
              className="scroll-reveal mac-card group flex min-h-[150px] flex-col justify-between p-6"
              whileHover={premiumSurfaceHover}
              whileTap={premiumPress}
            >
              <span className="font-display text-4xl text-primary/30">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 font-display text-xl leading-snug">{article.title}</h3>
              <span className="mt-5 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-primary">
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
