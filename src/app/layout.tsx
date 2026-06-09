import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "@/index.css";
import { ClientShell } from "./client-shell";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "AIXCO.Global | Quality Real Estate — Buy · Broker · Manage",
  description:
    "Buy selected Batumi apartments with transparent euro pricing from €50,000. Real estate buy-sell-brokerage across Switzerland, Dubai legacy, and Georgia.",
  openGraph: {
    title: "AIXCO.Global | Quality Real Estate — Buy · Broker · Manage",
    description: "Buy Batumi apartments, broker property, and manage real estate with AIXCO since 2009.",
    url: "/",
    siteName: "AIXCO.Global",
    images: [
      {
        url: "/aixco-global-op2/images/optimized/batumi.webp",
        width: 1200,
        height: 630,
        alt: "AIXCO.Global real estate buy sell broker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIXCO.Global | Quality Real Estate — Buy · Broker · Manage",
    description: "Selected Batumi apartments, brokerage, and property administration with AIXCO.",
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

const homeStoryBootScript = `
(function () {
  try {
    var isHome = window.location.pathname === "/";
    if (isHome) {
      document.body.classList.add("home-desktop-story-boot");
      document.body.classList.add("home-story-nav-hidden");
      window.setTimeout(function () {
        var storyMounted = document.querySelector('[data-home-experience-mode="story"]');
        if (!storyMounted && document.body.classList.contains("home-desktop-story-boot")) {
          document.body.classList.remove("home-desktop-story-boot");
          document.body.classList.remove("home-story-nav-hidden");
        }
      }, 1800);
    }
  } catch (error) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSiteContent = await fetchSiteContentForServer();

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: homeStoryBootScript }} />
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
