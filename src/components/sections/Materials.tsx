"use client";

import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { materialDownloads } from "@/data/materials";
import { useI18n } from "@/i18n/I18nProvider";
import { getSafePublicAssetHref } from "@/lib/security/urls";

function getMaterialIcon(format: string) {
  return format === "PDF" ? FileText : ImageIcon;
}

export function Materials() {
  const { tx } = useI18n();

  return (
    <section id="materials" className="relative scroll-mt-16 py-16 md:scroll-mt-20 md:py-20 lg:py-24">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
          <div className="scroll-reveal max-w-2xl">
            <p className="eyebrow">{tx("Client materials")}</p>
            <h2 className="heading-section mt-5 max-w-xl">{tx("Materials & downloads")}</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75 md:text-lg">
              {tx("Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.")}
            </p>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">{tx("Available files")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {materialDownloads.map((material) => {
              const Icon = getMaterialIcon(material.format);
              const href = getSafePublicAssetHref(material.href, "#materials");

              return (
                <article
                  key={material.id}
                  className="scroll-reveal flex min-h-[18rem] flex-col rounded-lg border border-foreground/10 bg-white p-5 shadow-[0_26px_80px_-34px_rgba(0,0,0,0.35)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_34px_90px_-38px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                      <Icon size={21} aria-hidden="true" />
                    </div>
                    <span className="rounded-md border border-foreground/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/60">
                      {material.format}
                    </span>
                  </div>

                  <div className="mt-5 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{tx(material.category)}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground">{tx(material.title)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/72">{tx(material.description)}</p>
                  </div>

                  <div className="mt-5 border-t border-foreground/10 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50">{tx("Audience")}</p>
                    <p className="mt-1 text-sm text-foreground/75">{tx(material.audience)}</p>
                  </div>

                  <a
                    href={href}
                    download={material.fileName}
                    className="btn-gold mt-5 w-full justify-center gap-2 px-4 py-3 text-center text-[12px]"
                    aria-label={`${tx("Download")} ${tx(material.title)}`}
                  >
                    <Download size={16} aria-hidden="true" />
                    {tx("Download")}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
