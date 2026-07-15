import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("portal route", () => {
  it("serves a framed portal with explicit security headers", async () => {
    const response = await GET(new Request("https://customer.aixco.global/"), {
      params: Promise.resolve({ role: "customer" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get("content-security-policy")).toContain("frame-src https://workw.com");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    await expect(response.text()).resolves.toContain("Back to AIXCO Global");
  });

  it("returns 404 for an unknown role", async () => {
    const response = await GET(new Request("https://www.aixco.global/portal/admin"), {
      params: Promise.resolve({ role: "admin" }),
    });

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("Portal not found");
  });
});
