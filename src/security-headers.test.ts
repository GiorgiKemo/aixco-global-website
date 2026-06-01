import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.mjs";

describe("Next.js security headers", () => {
  it("hides the framework header and serves a CSP", async () => {
    const routes = await nextConfig.headers?.();
    const rootHeaders = routes?.find((route) => route.source === "/(.*)")?.headers ?? [];
    const headerMap = new Map(rootHeaders.map((header) => [header.key, header.value]));

    expect(nextConfig.poweredByHeader).toBe(false);
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    expect(headerMap.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(headerMap.get("Content-Security-Policy")).toContain("object-src 'none'");
    expect(headerMap.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headerMap.get("Content-Security-Policy")).toContain("https://*.supabase.co");
  });
});
