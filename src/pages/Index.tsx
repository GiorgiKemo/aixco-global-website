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
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [hash]);
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Dubai />
        <Batumi />
        <Participate />
        <HowItWorks />
        <Team />
        <Partners />
        <InsightsTeaser />
        <FAQs />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Index;
