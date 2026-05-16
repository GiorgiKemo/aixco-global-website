import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

const NotFound = () => {
  return (
    <>
      <Nav />
      <main className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#11100e] px-6 py-28 text-white md:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_28%_22%,rgba(188,128,39,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
        <section className="mx-auto w-full max-w-3xl text-center">
          <p className="eyebrow text-primary">404</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white md:text-6xl">
            This page is not available.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/72 md:text-lg">
            The page may have moved, or the address may be incorrect. Return to AIXCO.Global to continue exploring selected real estate participation routes.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/" className="btn-gold">
              Return to Home
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
