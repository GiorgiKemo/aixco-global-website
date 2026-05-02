import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Dubai } from "@/components/sections/Dubai";
import { Batumi } from "@/components/sections/Batumi";
import { Participate } from "@/components/sections/Participate";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Team } from "@/components/sections/Team";
import { Partners } from "@/components/sections/Partners";
import { InsightsTeaser } from "@/components/sections/InsightsTeaser";
import { FAQs } from "@/components/sections/FAQs";
import { Contact } from "@/components/sections/Contact";
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
          <Dubai />
        </ScrollReveal>
        <ScrollReveal>
          <Batumi />
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
          <InsightsTeaser />
        </ScrollReveal>
        <ScrollReveal>
          <FAQs />
        </ScrollReveal>
        <ScrollReveal>
          <Contact />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
};

export default Index;
