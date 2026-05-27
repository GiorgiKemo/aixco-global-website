import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type LegacyInsightPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "AIXCO.Global",
    robots: {
      index: false,
      follow: false,
    },
  };
}

function normalizeSlug(slug: string) {
  return decodeURIComponent(slug).replace(/\/+$/, "").replace(/\.html$/i, "").toLowerCase();
}

export default async function LegacyInsightPage({ params }: LegacyInsightPageProps) {
  const { slug } = await params;

  if (normalizeSlug(slug) === "index") {
    redirect("/");
  }

  notFound();
}
