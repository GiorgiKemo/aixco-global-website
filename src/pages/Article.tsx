import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { articles } from "@/data/articles";
import { useEffect } from "react";

export default function Article() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);
  const idx = articles.findIndex((a) => a.slug === slug);
  const next = articles[(idx + 1) % articles.length];

  useEffect(() => {
    if (!article) return;
    document.title = `${article.title} — AIXCO Insights`;
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt,
      datePublished: article.date,
      author: { "@type": "Organization", name: "AIXCO Global" },
    });
    document.head.appendChild(ld);
    return () => { document.head.removeChild(ld); };
  }, [article]);

  if (!article) return <Navigate to="/insights" replace />;

  return (
    <>
      <Nav />
      <main className="pt-28 pb-20">
        <article>
          <header className={`relative bg-gradient-to-br ${article.hero} py-20 md:py-32 border-b border-border/40`}>
            <div className="scroll-reveal container-x max-w-4xl">
              <Link to="/insights" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-8 link-underline">
                <ArrowLeft className="h-3 w-3" /> All insights
              </Link>
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{article.tag} · {article.readTime} min read</p>
              <h1 className="heading-display mt-5">{article.title}</h1>
              <p className="mt-6 text-lg text-foreground/85 max-w-3xl leading-relaxed">{article.excerpt}</p>
              <p className="mt-6 text-xs text-muted-foreground">{new Date(article.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </header>

          <div className="container-x max-w-3xl py-16 md:py-24 space-y-7">
            {article.body.map((b, i) => {
              if (b.type === "h2") return <h2 key={i} className="font-display text-3xl md:text-4xl mt-12 first:mt-0">{b.text}</h2>;
              if (b.type === "p") return <p key={i} className="text-base md:text-lg leading-[1.85] text-foreground/85">{b.text}</p>;
              if (b.type === "ul") return (
                <ul key={i} className="space-y-3 border-l-2 border-primary/40 pl-6">
                  {b.items?.map((li, j) => <li key={j} className="text-base text-foreground/85 leading-relaxed">{li}</li>)}
                </ul>
              );
              if (b.type === "quote") return (
                <blockquote key={i} className="border-l-2 border-primary pl-6 py-2 my-4">
                  <p className="font-display text-2xl md:text-3xl italic text-foreground leading-snug">"{b.text}"</p>
                </blockquote>
              );
              if (b.type === "stat") return (
                <div key={i} className="glass my-6 flex items-baseline gap-5 rounded-lg p-6">
                  <span className="font-display text-5xl md:text-6xl text-gold leading-none">{b.statValue}</span>
                  <span className="text-sm uppercase tracking-widest text-muted-foreground">{b.statLabel}</span>
                </div>
              );
              return null;
            })}
          </div>

          <div className="container-x max-w-3xl border-t border-border/60 pt-10 pb-4">
            <Link to={`/insights/${next.slug}`} className="scroll-reveal mac-card group flex items-center justify-between gap-6 p-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Next article</p>
                <p className="font-display text-2xl mt-1">{next.title}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
