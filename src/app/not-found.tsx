import type { Metadata } from "next";
import NotFound from "@/views/NotFoundView";
import { MarketingAnalytics } from "./marketing-analytics";

export const metadata: Metadata = {
  title: "Page Not Found | AIXCO.Global",
  description: "The requested AIXCO.Global page could not be found.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: null,
  twitter: null,
};

export default function NotFoundPage() {
  return (
    <>
      <MarketingAnalytics />
      <NotFound />
    </>
  );
}
