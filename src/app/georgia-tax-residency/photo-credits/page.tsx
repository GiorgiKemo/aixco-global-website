import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";

export const metadata: Metadata = {
  title: "Georgia Tax Residency Photography Credits | AIXCO.Global",
  description: "Photography sources and license information for the AIXCO.Global Georgia tax residency page.",
  alternates: { canonical: "/georgia-tax-residency/photo-credits" },
  robots: { index: false, follow: true },
};

function linkedText(value: string) {
  const urlStart = value.indexOf("https://");
  if (urlStart < 0) return value;
  const prefix = value.slice(0, urlStart);
  const href = value.slice(urlStart);
  return <>{prefix}<a href={href} target="_blank" rel="noreferrer" className="break-words [overflow-wrap:anywhere] underline decoration-[#161616]/30 underline-offset-4 hover:decoration-[#6a5417]">{href}</a></>;
}

export default async function GeorgiaTaxResidencyPhotoCreditsPage() {
  const sourcePath = path.join(process.cwd(), "public", "aixco-global-op2", "images", "georgia-tax-residency", "IMAGE-SOURCES.md");
  const lines = (await readFile(sourcePath, "utf8")).split(/\r?\n/u);

  return (
    <main className="min-h-screen bg-[#f7f2e9] px-5 py-8 text-[#161616] sm:px-8 sm:py-12">
      <article className="mx-auto w-full max-w-4xl border border-[#161616]/15 bg-[#fbf9f4] px-5 py-7 sm:px-10 sm:py-12 lg:px-14">
        <Link href="/georgia-tax-residency" aria-label="AIXCO.Global Georgia tax residency" className="inline-flex w-36">
          <Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} sizes="9rem" className="h-auto w-full" />
        </Link>
        <div className="mt-12 grid min-w-0 gap-3">
          {lines.map((line, index) => {
            if (!line) return <div key={`space-${index}`} className="h-2" aria-hidden="true" />;
            if (line.startsWith("# ")) return <h1 key={line} className="min-w-0 max-w-[18ch] break-words text-[clamp(2.5rem,6vw,5.2rem)] font-medium leading-[0.94] tracking-[-0.055em]">{line.slice(2)}</h1>;
            if (line.startsWith("## ")) return <h2 key={line} className="mt-8 min-w-0 max-w-full break-words border-t border-[#161616]/15 pt-8 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">{line.slice(3)}</h2>;
            if (line.startsWith("- ")) return <p key={`${line}-${index}`} className="ms-4 min-w-0 max-w-full break-words border-s border-[#6a5417] ps-4 leading-7 text-[#161616]/75">{linkedText(line.slice(2))}</p>;
            return <p key={`${line}-${index}`} className="min-w-0 max-w-2xl break-words text-lg leading-8 text-[#161616]/72">{linkedText(line)}</p>;
          })}
        </div>
      </article>
    </main>
  );
}
