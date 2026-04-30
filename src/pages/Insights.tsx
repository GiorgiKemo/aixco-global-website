import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { articles } from "@/data/articles";

const TAGS = ["All", "Market", "Strategy", "Guide", "Yield", "Tourism"] as const;

export default function Insights() {
  const [tag, setTag] = useState<(typeof TAGS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => articles.filter((a) =>
    (tag === "All" || a.tag === tag) &&
    (query === "" || a.title.toLowerCase().includes(query.toLowerCase()) || a.excerpt.toLowerCase().includes(query.toLowerCase()))
  ), [tag, query]);

  return (
    <>
      <Nav />
      <main className="pt-32 pb-20">
        <section className="container-x">
          <div className="scroll-reveal">
            <p className="eyebrow">Insights</p>
            <h1 className="heading-display mt-5 max-w-4xl">Research from the <span className="text-gold italic">Black Sea</span> & <span className="text-gold italic">the Gulf</span>.</h1>
            <p className="mt-6 max-w-2xl text-foreground/80 leading-relaxed">
              Long-form articles on the markets we operate in. Honest, current, and written by people on the ground.
            </p>
          </div>

          <div className="scroll-reveal mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-lg border border-border/50 bg-background/60 p-4 shadow-soft backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button key={t} onClick={() => setTag(t)} className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-widest transition ${tag === t ? "border-primary/60 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}>{t}</button>
              ))}
            </div>
            <label className="form-control flex items-center gap-2 md:w-72">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles" className="flex-1 bg-transparent outline-none text-sm" aria-label="Search articles" />
            </label>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <Link key={a.slug} to={`/insights/${a.slug}`} className="scroll-reveal mac-card group flex flex-col p-7">
                <div className={`mb-6 aspect-[4/3] rounded-lg bg-gradient-to-br ${a.hero} relative overflow-hidden`}>
                  <span className="absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-widest shadow-soft backdrop-blur">{a.tag}</span>
                  <span className="absolute bottom-3 right-3 font-display text-5xl text-primary/40">{a.readTime}'</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(a.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} · {a.readTime} min read</p>
                <h2 className="font-display text-xl mt-2 leading-snug">{a.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs text-primary uppercase tracking-widest">Read article <ArrowUpRight className="h-3 w-3" /></span>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && <p className="mt-16 text-center text-muted-foreground">No articles match your search.</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}
