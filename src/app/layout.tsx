import type { Metadata, Viewport } from "next";
import "@/index.css";
import { ClientShell } from "./client-shell";

export const metadata: Metadata = {
  metadataBase: new URL("https://aixco.global"),
  title: "AIXCO.Global | Quality Real Estate Participation",
  description:
    "AIXCO gives private partners a simple and transparent way to join selected real estate projects in Dubai and Batumi.",
  openGraph: {
    title: "AIXCO.Global | Quality Real Estate Participation",
    description: "Participate where growth, stability, and long term value creation meet.",
    url: "/",
    siteName: "AIXCO.Global",
    images: [
      {
        url: "/aixco-global-op2/images/optimized/batumi.webp",
        width: 1200,
        height: 630,
        alt: "AIXCO.Global real estate participation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIXCO.Global | Quality Real Estate Participation",
    description: "Selected real estate participation opportunities across Dubai and Batumi.",
    images: ["/aixco-global-op2/images/optimized/batumi.webp"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
