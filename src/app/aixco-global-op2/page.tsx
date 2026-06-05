import type { Metadata } from "next";
import Index from "@/views/HomePage";

export const metadata: Metadata = {
  title: "AIXCO.Global | Quality Real Estate — Buy · Broker · Manage",
  description:
    "Buy selected Batumi apartments with transparent euro pricing from EUR 50,000. Real estate services across Switzerland, Dubai legacy, and Georgia.",
  alternates: {
    canonical: "/",
  },
};

export default function LegacyHomePage() {
  return <Index />;
}
