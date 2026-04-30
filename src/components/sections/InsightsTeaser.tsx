import { Link } from "react-router-dom";
import { articles } from "@/data/articles";
import { ArrowUpRight } from "lucide-react";

export function InsightsTeaser() {
  const featured = articles.slice(0, 3);
  return (
    <section className="relative py-28 md:py-36 bg-surface/40">
      <div className="container-x">
        <div className="scroll-reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <p className="eyebrow">Insights</p>
            <h2 className="heading-section mt-5 max-w-2xl">Research. Long-form. <span className="text-gold italic">Honest</span>.</h2>
          </div>
          <Link to="/insights" className="btn-ghost-gold">View all insights</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((a) => (
            <Link key={a.slug} to={`/insights/${a.slug}`} className="scroll-reveal mac-card group flex flex-col p-7">
              <div className={`mb-6 aspect-[4/3] rounded-lg bg-gradient-to-br ${a.hero} relative overflow-hidden`}>
                <span className="absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-widest shadow-soft backdrop-blur">{a.tag}</span>
                <span className="absolute bottom-3 right-3 font-display text-5xl text-primary/40">{a.readTime}'</span>
              </div>
              <h3 className="font-display text-xl leading-snug">{a.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs text-primary uppercase tracking-widest">Read article <ArrowUpRight className="h-3 w-3" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
