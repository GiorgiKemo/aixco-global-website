import type { Metadata } from "next";
import Index from "@/views/HomePage";

export const metadata: Metadata = {
  title: "AIXCO.Global | Global Real Estate Participation",
  description:
    "Participate in selected Batumi real estate projects starting from EUR 1,000. Transparent structure, euro-based pricing, and long-term value creation.",
  alternates: {
    canonical: "/",
  },
};

export default function LegacyHomePage() {
  return <Index />;
}
