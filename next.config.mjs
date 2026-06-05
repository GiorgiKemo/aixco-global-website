const isDevelopment = process.env.NODE_ENV !== "production";
const isVercel = process.env.VERCEL === "1";

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
    !isVercel ? "http://localhost:*" : null,
    !isVercel ? "http://127.0.0.1:*" : null,
    !isVercel ? "ws://localhost:*" : null,
    !isVercel ? "ws://127.0.0.1:*" : null,
  ].filter(Boolean);

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    "media-src 'self' blob:",
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
    qualities: [62, 75, 90, 95],
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
        pathname: "/aixco-global-op2/documents/**",
        search: "",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
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
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
