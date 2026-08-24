"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";

const siblings = [
  { href: "/reverance-batumi", label: "Project Reverance" },
  { href: "/medical-tourism", label: "Medical care" },
  { href: "/georgia-residency", label: "Residence permit in Georgia" },
  { href: "/invest-in-batumi", label: "Invest in Batumi" },
  { href: "/georgia-tax-residency", label: "Georgia tax residency" },
  { href: "/aixco-global-bond", label: "AIXCO Global Bond" },
] as const;

export function LandingSiblingLinks({ tone }: { tone: "ivory" | "dark" }) {
  const pathname = usePathname();
  const { tx } = useI18n();
  const links = siblings.filter((item) => item.href !== pathname);

  if (links.length === 0) return null;

  const linkClass =
    tone === "dark"
      ? "hover:text-white"
      : "transition-colors hover:text-[#161616]";

  return (
    <nav aria-label={tx("Also from AIXCO")} className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className={tone === "dark" ? "text-white/70" : "text-[#161616]/70"}>{tx("Also from AIXCO")}</span>
      {links.map((item) => (
        <Link key={item.href} href={item.href} className={linkClass}>
          {tx(item.label)}
        </Link>
      ))}
    </nav>
  );
}
