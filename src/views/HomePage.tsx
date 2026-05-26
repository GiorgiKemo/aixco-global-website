import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { PhilosophyCallout } from "@/components/sections/PhilosophyCallout";
import { LegacyTimeline } from "@/components/sections/LegacyTimeline";
import { DeferredHomeSections } from "@/components/sections/DeferredHomeSections";
import { ScrollReveal } from "@/components/ScrollReveal";

const Index = () => {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ScrollReveal>
          <About />
        </ScrollReveal>
        <ScrollReveal>
          <PhilosophyCallout />
        </ScrollReveal>
        <ScrollReveal>
          <LegacyTimeline />
        </ScrollReveal>
        <DeferredHomeSections />
      </main>
      <Footer />
    </>
  );
};

export default Index;
