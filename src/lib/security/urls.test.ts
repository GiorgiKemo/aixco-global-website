import { describe, expect, it } from "vitest";
import {
  getSafeAixcoNewsUrl,
  getSafeAssetKey,
  getSafeEmail,
  getSafeHttpsUrl,
  getSafePortalUrl,
  getSafePublicAssetHref,
  isSafePortalUrl,
} from "./urls";

describe("safe URL helpers", () => {
  it("allows HTTPS links only on expected hosts", () => {
    expect(getSafeHttpsUrl("https://www.instagram.com/aixco.global", "#", ["www.instagram.com"])).toBe(
      "https://www.instagram.com/aixco.global",
    );
    expect(getSafeHttpsUrl("javascript:alert(1)", "#", ["www.instagram.com"])).toBe("#");
    expect(getSafeHttpsUrl("https://evil.example/aixco.global", "#", ["www.instagram.com"])).toBe("#");
  });

  it("keeps portal links on the Workwise real estate surface", () => {
    expect(getSafePortalUrl("https://workw.com/realestate/customer/login", "#")).toBe(
      "https://workw.com/realestate/customer/login",
    );
    expect(isSafePortalUrl("https://workw.com/realestate/broker/signup")).toBe(true);
    expect(getSafePortalUrl("https://workw.com/not-realestate/customer/login", "#")).toBe("#");
    expect(getSafePortalUrl("https://workw.com.evil.example/realestate/customer/login", "#")).toBe("#");
  });

  it("keeps news and asset links inside the published AIXCO surfaces", () => {
    expect(getSafeAixcoNewsUrl("https://www.aixco.global/op2/index.html#page1", "#")).toBe(
      "https://www.aixco.global/op2/index.html#page1",
    );
    expect(getSafeAixcoNewsUrl("https://www.aixco.global/admin", "#")).toBe("#");
    expect(getSafePublicAssetHref("/aixco-global-op2/docs/otium.pdf", "#")).toBe("/aixco-global-op2/docs/otium.pdf");
    expect(getSafePublicAssetHref("https://evil.example/aixco-global-op2/docs/otium.pdf", "#")).toBe("#");
  });

  it("rejects scriptable asset keys and email header injection", () => {
    expect(getSafeAssetKey("otium", "fallback")).toBe("otium");
    expect(getSafeAssetKey("javascript:alert(1)", "fallback")).toBe("fallback");
    expect(getSafeEmail("INFO@AIXCO.GLOBAL", "fallback@example.com")).toBe("info@aixco.global");
    expect(getSafeEmail("info@aixco.global\r\nbcc:attacker@example.com", "fallback@example.com")).toBe(
      "fallback@example.com",
    );
  });
});
