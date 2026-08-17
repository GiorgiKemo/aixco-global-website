import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.mjs";

describe("Next.js security headers", () => {
  it("hides the framework header and serves a CSP", async () => {
    const routes = await nextConfig.headers?.();
    const rootHeaders = routes?.find((route) => route.source === "/(.*)")?.headers ?? [];
    const headerMap = new Map(rootHeaders.map((header) => [header.key, header.value]));
    const contentSecurityPolicy = headerMap.get("Content-Security-Policy") ?? "";
    const directiveSources = (directive: string) =>
      contentSecurityPolicy
        .split("; ")
        .find((value) => value.startsWith(`${directive} `))
        ?.split(" ")
        .slice(1) ?? [];

    expect(nextConfig.poweredByHeader).toBe(false);
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("https://*.supabase.co");
    expect(directiveSources("img-src")).toEqual(
      expect.arrayContaining(["https://www.googletagmanager.com", "https://*.google-analytics.com"]),
    );
    expect(directiveSources("connect-src")).toEqual(
      expect.arrayContaining([
        "https://*.google-analytics.com",
        "https://*.analytics.google.com",
        "https://www.googletagmanager.com",
      ]),
    );
  });
});
