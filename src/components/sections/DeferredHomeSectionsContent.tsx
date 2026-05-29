"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { Dubai } from "@/components/sections/Dubai";
import { Batumi } from "@/components/sections/Batumi";
import { Materials } from "@/components/sections/Materials";
import { Participate } from "@/components/sections/Participate";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Team } from "@/components/sections/Team";
import { Partners } from "@/components/sections/Partners";
import { FAQs } from "@/components/sections/FAQs";
import { Contact } from "@/components/sections/Contact";

export function DeferredHomeSectionsContent() {
  return (
    <>
      <ScrollReveal>
        <Dubai />
      </ScrollReveal>
      <ScrollReveal>
        <Batumi />
      </ScrollReveal>
      <ScrollReveal>
        <Materials />
      </ScrollReveal>
      <ScrollReveal>
        <Participate />
      </ScrollReveal>
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      <ScrollReveal>
        <Team />
      </ScrollReveal>
      <ScrollReveal>
        <Partners />
      </ScrollReveal>
      <ScrollReveal>
        <FAQs />
      </ScrollReveal>
      <ScrollReveal>
        <Contact />
      </ScrollReveal>
    </>
  );
}
