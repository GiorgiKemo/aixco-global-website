import { Link } from "react-router-dom";
import { Mail, MapPin, Linkedin, Instagram, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { company } from "@/data/site";
import { useUI } from "./ui-state";

export function Footer() {
  const { openTerms, openPrivacy } = useUI();
  return (
    <footer className="relative border-t border-border/60 bg-gradient-onyx pt-20 pb-10">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            AIXCO Global is a private real-estate participation platform. We curate institutional-grade projects in Dubai and Batumi and open them to qualified individuals from €1,000.
          </p>
          <div className="mt-6 space-y-2 text-sm text-foreground/80">
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 link-underline w-fit">
              <Mail className="h-4 w-4 text-primary" /> {company.email}
            </a>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {company.address}</p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <a aria-label="LinkedIn" href={company.socials.linkedin} target="_blank" rel="noreferrer" className="icon-button-glass h-9 w-9"><Linkedin className="h-4 w-4" /></a>
            <a aria-label="Instagram" href={company.socials.instagram} target="_blank" rel="noreferrer" className="icon-button-glass h-9 w-9"><Instagram className="h-4 w-4" /></a>
            <a aria-label="YouTube" href={company.socials.youtube} target="_blank" rel="noreferrer" className="icon-button-glass h-9 w-9"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.28em] text-primary mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li><Link to="/#about" className="link-underline">About AIXCO</Link></li>
              <li><Link to="/#dubai" className="link-underline">Dubai funds</Link></li>
              <li><Link to="/#batumi" className="link-underline">Batumi properties</Link></li>
              <li><Link to="/#how" className="link-underline">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.28em] text-primary mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li><Link to="/#team" className="link-underline">Team</Link></li>
              <li><Link to="/#partners" className="link-underline">Partners</Link></li>
              <li><Link to="/insights" className="link-underline">Insights</Link></li>
              <li><Link to="/#contact" className="link-underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.28em] text-primary mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li><button onClick={openTerms} className="link-underline">Terms & Conditions</button></li>
              <li><button onClick={openPrivacy} className="link-underline">Privacy Policy</button></li>
              <li><Link to="/#faqs" className="link-underline">FAQs</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container-x mt-14 border-t border-border/40 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-xs text-muted-foreground max-w-3xl">
          © {new Date().getFullYear()} {company.name}. All rights reserved. Investments in real estate involve risk; past performance is not indicative of future results. Returns depend on market conditions, project execution and your individual regulatory suitability. This site is informational and does not constitute investment advice.
        </p>
        <p className="text-xs text-muted-foreground">Vienna · Dubai · Batumi</p>
      </div>

      <p className="container-x mt-4 text-xs text-muted-foreground">
        Hero photo:{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:City_of_Batumi,_Georgia.jpg"
          target="_blank"
          rel="noreferrer"
          className="link-underline"
        >
          Giorgi Balakhadze
        </a>{" "}
        /{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
          className="link-underline"
        >
          CC BY-SA 4.0
        </a>
      </p>
    </footer>
  );
}
