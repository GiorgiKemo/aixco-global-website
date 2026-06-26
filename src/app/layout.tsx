import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "@/index.css";
import { ClientShell } from "./client-shell";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";

const metadataTitle = "AIXCO.Global | Real Estate Investment";
const metadataDescription =
  "Explore selected real estate opportunities with transparent euro pricing from EUR 45,000, brokerage, and property administration through AIXCO.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: metadataTitle,
  description: metadataDescription,
  openGraph: {
    title: metadataTitle,
    description: metadataDescription,
    url: "/",
    siteName: "AIXCO.Global",
    images: [
      {
        url: "/aixco-global-op2/images/optimized/batumi.webp",
        width: 1200,
        height: 630,
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

export const revalidate = 300;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSiteContent = await fetchSiteContentForServer();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="image"
          href="/aixco-global-op2/images/AIXW-transparent.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body suppressHydrationWarning>
        <ClientShell
          initialSiteContent={initialSiteContent.content}
          initialSiteContentSource={initialSiteContent.source}
        >
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
