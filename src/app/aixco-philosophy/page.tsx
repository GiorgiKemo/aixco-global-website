import type { Metadata } from "next";
import { AixcoPhilosophyPage } from "@/views/AixcoPhilosophyPage";

export const metadata: Metadata = {
  title: "AIXCO Philosophy | AIXCO.Global",
  description:
    "AIXCO Global's philosophy of disciplined real asset ownership, Swiss risk management, capital preservation, and long-term value creation.",
  alternates: {
    canonical: "/aixco-philosophy",
  },
  openGraph: {
    title: "AIXCO Philosophy | AIXCO.Global",
    description:
      "Disciplined real asset ownership, Swiss risk management, and enduring long-term value creation.",
    url: "/aixco-philosophy",
    siteName: "AIXCO.Global",
    images: [
      {
        url: "/aixco-global-op2/images/optimized/batumi.webp",
        width: 1200,
        height: 630,
        alt: "AIXCO Philosophy",
      },
    ],
    type: "website",
  },
};

export default function PhilosophyPage() {
  return <AixcoPhilosophyPage />;
}
