import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "@/index.css";
import { getSiteUrl } from "@/lib/site-url";
import { WebVitals } from "./web-vitals";

const gilroy = localFont({
  src: [
    { path: "../assets/fonts/gilroy/Gilroy-Thin.woff2", weight: "100", style: "normal" },
    { path: "../assets/fonts/gilroy/Gilroy-Regular.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/gilroy/Gilroy-Medium.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/gilroy/Gilroy-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/gilroy/Gilroy-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../assets/fonts/gilroy/Gilroy-Black.woff2", weight: "900", style: "normal" },
  ],
  display: "swap",
  variable: "--font-gilroy",
});

const metadataTitle = "AIXCO.Global | Real Estate Investment";
const metadataDescription =
  "Explore selected real estate opportunities with transparent euro pricing from EUR 45,000, brokerage, and property administration through AIXCO.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: metadataTitle,
  description: metadataDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: metadataTitle,
    description: metadataDescription,
    url: "/",
    siteName: "AIXCO.Global",
    images: [
      {
        url: "/aixco-global-op2/images/optimized/batumi.webp",
        width: 1600,
        height: 1066,
        alt: "AIXCO.Global real estate opportunities",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: metadataTitle,
    description: metadataDescription,
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
    <html lang="en" dir="ltr" className={gilroy.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
