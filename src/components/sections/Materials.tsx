"use client";

import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { materialDownloads } from "@/data/materials";
import { useI18n } from "@/i18n/I18nProvider";
import { getSafePublicAssetHref } from "@/lib/security/urls";

function getMaterialIcon(format: string) {
  return format === "PDF" ? FileText : ImageIcon;
}

const materialGroups = Array.from(
  materialDownloads.reduce((groups, material) => {
    const currentGroup = groups.get(material.category) ?? [];
    currentGroup.push(material);
    groups.set(material.category, currentGroup);
    return groups;
  }, new Map<string, typeof materialDownloads>()),
);

function getGroupFormats(materials: typeof materialDownloads) {
  return Array.from(new Set(materials.map((material) => material.format))).join(" / ");
}

export function Materials() {
  const { tx } = useI18n();

  return (
    <section id="materials" className="relative scroll-mt-16 bg-background py-14 md:scroll-mt-20 md:py-16 lg:py-20">
      <div className="container-x">
        <div className="scroll-reveal flex flex-col gap-7 border-b border-foreground/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">{tx("Client materials")}</p>
            <h2 className="heading-section mt-5 max-w-2xl">{tx("Materials & downloads")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/75 md:text-lg">
              {tx("Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.")}
            </p>
          </div>
          <div className="grid w-full max-w-md grid-cols-3 gap-px overflow-hidden border border-foreground/10 bg-foreground/10 text-center lg:shrink-0">
            <div className="bg-white px-4 py-3">
              <p className="font-display text-3xl leading-none text-primary">{materialDownloads.length}</p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-foreground/60">{tx("Available files")}</p>
            </div>
            <div className="bg-white px-4 py-3">
              <p className="font-display text-3xl leading-none text-primary">
                {materialDownloads.filter((material) => material.format === "PDF").length}
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-foreground/60">PDF</p>
            </div>
            <div className="bg-white px-4 py-3">
              <p className="font-display text-3xl leading-none text-primary">
                {materialDownloads.filter((material) => material.format !== "PDF").length}
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-foreground/60">JPEG / PNG</p>
            </div>
          </div>
        </div>

        <div className="mt-8 divide-y divide-foreground/10 border-y border-foreground/10" aria-label={tx("Available files")}>
          {materialGroups.map(([category, materials]) => (
            <div
              key={category}
              className="scroll-reveal grid gap-5 py-6 lg:grid-cols-[minmax(12rem,0.32fr)_minmax(0,1fr)] lg:gap-10 lg:py-8"
            >
              <div className="min-w-0 lg:pt-3">
                <p className="eyebrow">{tx(category)}</p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/65">
                  {getGroupFormats(materials)}
                </p>
              </div>

              <div className="divide-y divide-foreground/10 border border-foreground/10 bg-white">
                {materials.map((material) => {
                  const Icon = getMaterialIcon(material.format);
                  const href = getSafePublicAssetHref(material.href, "#materials");

                  return (
                    <a
                      key={material.id}
                      href={href}
                      download={material.fileName}
                      className="group grid min-h-24 cursor-pointer gap-4 px-4 py-4 transition-colors duration-300 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 sm:grid-cols-[auto_minmax(0,1fr)_minmax(8rem,0.26fr)_5rem_auto] sm:items-center sm:px-5"
                      aria-label={`${tx("Download")} ${tx(material.title)}`}
                    >
                      <div className="flex size-11 items-center justify-center border border-primary/20 bg-primary/10 text-primary sm:size-12">
                        <Icon size={21} aria-hidden="true" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">{tx(material.title)}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/72">{tx(material.description)}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55 sm:hidden">
                          {material.format} / {tx(material.audience)}
                        </p>
                      </div>

                      <div className="hidden min-w-0 text-sm leading-relaxed text-foreground/70 sm:block">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-foreground/55">{tx("Audience")}</p>
                        <p className="mt-1">{tx(material.audience)}</p>
                      </div>

                      <span className="hidden justify-self-start border border-foreground/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80 sm:inline-flex">
                        {material.format}
                      </span>

                      <span className="inline-flex min-h-10 items-center justify-center gap-2 justify-self-start bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors duration-200 group-hover:bg-primary/90 sm:justify-self-end">
                        <Download size={16} aria-hidden="true" />
                        <span className="hidden md:inline">{tx("Download")}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
