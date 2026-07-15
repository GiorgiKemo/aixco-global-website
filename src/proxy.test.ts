import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

describe("portal host proxy", () => {
  it.each(["customer", "broker", "developer"])("rewrites the %s subdomain to its portal route", (role) => {
    const request = new NextRequest(`https://${role}.aixco.global/`);
    const response = proxy(request);

    expect(response.headers.get("x-middleware-rewrite")).toBe(`https://${role}.aixco.global/portal/${role}`);
  });

  it("does not trust a spoofed forwarded host on the marketing site", () => {
    const request = new NextRequest("https://www.aixco.global/", {
      headers: { "x-forwarded-host": "customer.aixco.global" },
    });
    const response = proxy(request);

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
