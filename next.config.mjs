const isDevelopment = process.env.NODE_ENV !== "production";
const canonicalSiteOrigin = "https://www.aixco.global";

const getOrigin = (value) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const getContentSecurityPolicy = () => {
  const supabaseOrigin = getOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const connectSources = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    supabaseOrigin,
    isDevelopment ? "http://localhost:*" : null,
    isDevelopment ? "http://127.0.0.1:*" : null,
    isDevelopment ? "ws://localhost:*" : null,
    isDevelopment ? "ws://127.0.0.1:*" : null,
  ].filter(Boolean);

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "frame-src 'self' https://www.googletagmanager.com",
    `connect-src ${connectSources.join(" ")}`,
    "media-src 'self' blob: https://media.githubusercontent.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
};

const developmentNoCacheHeaders = isDevelopment
  ? [
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, max-age=0",
      },
      {
        key: "Pragma",
        value: "no-cache",
      },
    ]
  : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    webVitalsAttribution: ["CLS", "LCP", "INP"],
  },
  images: {
    qualities: [62, 75, 78],
    localPatterns: [
      {
        pathname: "/aixco-global-op2/images/**",
        search: "",
      },
      {
        pathname: "/aixco-global-op2/images/**",
        search: "?v=healthcare-gallery-20260506",
      },
      {
        pathname: "/aixco-global-op2/media/**",
        search: "",
      },
      {
        pathname: "/aixco-global-op2/videos/**",
        search: "",
      },
      {
        pathname: "/aixco-global-op2/documents/**",
        search: "",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "aixco.global" }],
        destination: `${canonicalSiteOrigin}/:path*`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "aixco-global-website.vercel.app" }],
        destination: `${canonicalSiteOrigin}/:path*`,
        permanent: true,
      },
      {
        source: "/aixco-global-op2",
        destination: "/",
        permanent: true,
      },
      {
        source: "/aixco-global-op2/index",
        destination: "/",
        permanent: true,
      },
      {
        source: "/aixco-global-op2/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/aixco-global-op2/current-project.html",
        destination: "/aixco-global-op2/current-project",
        permanent: true,
      },
      {
        source: "/op2/index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: getContentSecurityPolicy(),
          },
          ...developmentNoCacheHeaders,
        ],
      },
      ...(!isDevelopment
        ? [
            {
              source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|mp4|webm|woff2)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=86400, stale-while-revalidate=604800",
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
