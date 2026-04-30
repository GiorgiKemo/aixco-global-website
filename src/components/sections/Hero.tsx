import { ChevronDown } from "lucide-react";
import heroBatumiCity from "@/assets/hero-batumi-city.jpg";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-background">
      {/* Batumi waterfront backdrop */}
      <img
        src={heroBatumiCity}
        alt="Panoramic city view of Batumi, Georgia"
        className="absolute inset-0 h-full w-full object-cover object-center"
        width={5630}
        height={2999}
        loading="eager"
      />

      {/* Soft wash — light at top for clean text, fades into ivory page below */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.03)_0%,rgb(0_0_0/0.04)_22%,rgb(0_0_0/0.18)_42%,rgb(0_0_0/0.42)_70%,rgb(0_0_0/0.24)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[62%] bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.42)_0%,rgb(0_0_0/0.24)_42%,transparent_72%)]"
        aria-hidden
      />

      {/* Centered hero copy — pushed lower like the reference */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center px-6 pt-[45vh] text-center md:pt-[48vh]">
        <h1 className="reveal max-w-5xl text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-white drop-shadow-[0_8px_28px_rgb(0_0_0/0.46)] sm:text-5xl md:text-6xl lg:text-[5rem]">
          Quality real-estate participation,
          <br className="hidden sm:block" />
          opened from{" "}
          <span className="font-serif-display italic font-normal text-[#f0bd5d]">
            €1,000
          </span>
          .
        </h1>

        <p className="reveal reveal-delay-2 mt-7 max-w-2xl text-base leading-relaxed text-white/85 drop-shadow-[0_3px_18px_rgb(0_0_0/0.42)] md:text-lg">
          Selected projects in Dubai and Batumi, structured to institutional
          standards. One platform. Two routes. Sixteen years of execution.
        </p>

        <a
          href="#about"
          aria-label="Scroll to About section"
          className="hero-scroll-arrow mt-8 inline-flex h-8 w-8 items-center justify-center text-[#f0bd5d] drop-shadow-[0_4px_14px_rgb(0_0_0/0.45)] transition hover:text-[#ffd47a]"
        >
          <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
}
