import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import {
  findLegacyInsight,
  getLegacyInsightParams,
  normalizeLegacySlug,
  type LegacyInsight,
} from "@/data/legacy-insights";

type LegacyInsightPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getLegacyInsightParams();
}

export async function generateMetadata({ params }: LegacyInsightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findLegacyInsight(slug);

  if (!article) {
    return {
      title: "AIXCO.Global",
    };
  }

  return {
    title: `${article.title} | AIXCO.Global`,
    description: article.description,
    alternates: {
      canonical: `/aixco-global-op2/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: `/aixco-global-op2/${article.slug}`,
      images: [
        {
          url: "/aixco-global-op2/images/optimized/batumi.webp",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
  };
}

function LegacyInsightArticle({ article }: { article: LegacyInsight }) {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#11100e] pt-24 text-white md:pt-28">
        <article className="container-x max-w-5xl py-12 md:py-16">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/82 transition-colors duration-200 hover:border-primary/60 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AIXCO.Global
          </Link>

          <header className="mt-10 border-b border-white/12 pb-10">
            <p className="eyebrow text-primary">AIXCO Insights</p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.45rem,7vw,5.6rem)] font-semibold leading-[0.98] tracking-normal text-white">
              {article.title}
            </h1>
            {article.subtitle ? (
              <p className="mt-6 max-w-3xl text-[clamp(1.05rem,2vw,1.35rem)] leading-relaxed text-white/72">
                {article.subtitle}
              </p>
            ) : null}
          </header>

          <div className="mx-auto mt-12 max-w-3xl space-y-12">
            {article.sections.map((section) => (
              <section key={section.heading} className="scroll-mt-24">
                <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-tight text-white">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-5 text-[1.02rem] leading-[1.85] text-white/78 md:text-[1.08rem]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mx-auto mt-16 max-w-3xl border-t border-white/12 pt-8">
            <Link href="/#participate" className="btn-gold">
              Starting from EUR 1,000
              <ArrowRight className="h-4 w-4" />
            </Link>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  );
}

export default async function LegacyInsightPage({ params }: LegacyInsightPageProps) {
  const { slug } = await params;

  if (normalizeLegacySlug(slug) === "index") {
    redirect("/");
  }

  const article = findLegacyInsight(slug);

  if (!article) {
    notFound();
  }

  return <LegacyInsightArticle article={article} />;
}
