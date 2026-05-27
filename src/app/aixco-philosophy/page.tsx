import type { Metadata } from "next";
import { AixcoPhilosophyPage } from "@/views/AixcoPhilosophyPage";

export const metadata: Metadata = {
  title: "AIXCO Philosophy | AIXCO.Global",
  description:
    "AIXCO Global's philosophy of disciplined real estate ownership, Swiss risk management, practical execution, and long-term property services.",
  alternates: {
    canonical: "/aixco-philosophy",
  },
  openGraph: {
    title: "AIXCO Philosophy | AIXCO.Global",
    description:
      "Disciplined real estate ownership, Swiss risk management, and practical long-term property services.",
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
