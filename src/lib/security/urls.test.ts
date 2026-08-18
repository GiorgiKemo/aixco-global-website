import { describe, expect, it } from "vitest";
import {
  getSafeAixcoNewsUrl,
  getSafeAssetKey,
  getSafeEmail,
  getSafeHttpsUrl,
  getSafePortalLoginUrl,
  getSafePortalRegistrationUrl,
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

  it("keeps portal links on the three role-specific AIXCO roots", () => {
    expect(getSafePortalUrl("https://customer.aixco.global", "#")).toBe("https://customer.aixco.global/");
    expect(getSafePortalUrl("https://broker.aixco.global/", "#")).toBe("https://broker.aixco.global/");
    expect(isSafePortalUrl("https://developer.aixco.global/")).toBe(true);
    expect(getSafePortalUrl("https://customer.aixco.global/login", "#")).toBe("#");
    expect(getSafePortalUrl("https://customer.aixco.global.evil.example/", "#")).toBe("#");
    expect(getSafePortalUrl("https://workw.com/realestate/customer/login", "#")).toBe("#");
  });

  it("routes registration links to the matching Workwise signup flow with the selected language", () => {
    expect(getSafePortalRegistrationUrl("https://customer.aixco.global/", "customer", "en", "#")).toBe(
      "https://workw.com/realestate/aixco/customer-signup?lang=en",
    );
    expect(getSafePortalRegistrationUrl("https://broker.aixco.global/", "broker", "de", "#")).toBe(
      "https://workw.com/realestate/aixco/broker-signup?lang=de",
    );
    expect(getSafePortalRegistrationUrl("https://customer.aixco.global/", "broker", "en", "#")).toBe("#");
    expect(getSafePortalRegistrationUrl("https://customer.aixco.global.evil.example/", "customer", "en", "#")).toBe("#");
  });

  it.each(["en", "de", "pl", "sl", "ru"] as const)(
    "routes %s login links to the matching Workwise login flow with the selected language",
    (language) => {
      expect(getSafePortalLoginUrl("https://customer.aixco.global/", "customer", language, "#")).toBe(
        `https://workw.com/realestate/aixco/customer-login?lang=${language}`,
      );
      expect(getSafePortalLoginUrl("https://broker.aixco.global/", "broker", language, "#")).toBe(
        `https://workw.com/realestate/aixco/broker-login?lang=${language}`,
      );
      expect(getSafePortalLoginUrl("https://developer.aixco.global/", "developer", language, "#")).toBe(
        `https://workw.com/realestate/aixco/developer-login?lang=${language}`,
      );
    },
  );

  it("keeps news and asset links inside the published AIXCO surfaces", () => {
    expect(getSafeAixcoNewsUrl("https://www.aixco.global/op2/index.html#page1", "#")).toBe(
      "https://www.aixco.global/op2/index.html#page1",
    );
    expect(getSafeAixcoNewsUrl("https://www.aixco.global/admin", "#")).toBe("#");
    expect(getSafePublicAssetHref("/aixco-global-op2/docs/current-project.pdf", "#")).toBe("/aixco-global-op2/docs/current-project.pdf");
    expect(getSafePublicAssetHref("https://evil.example/aixco-global-op2/docs/current-project.pdf", "#")).toBe("#");
  });

  it("rejects scriptable asset keys and email header injection", () => {
    expect(getSafeAssetKey("currentProject", "fallback")).toBe("currentProject");
    expect(getSafeAssetKey("javascript:alert(1)", "fallback")).toBe("fallback");
    expect(getSafeEmail("INFO@AIXCO.GLOBAL", "fallback@example.com")).toBe("info@aixco.global");
    expect(getSafeEmail("info@aixco.global\r\nbcc:attacker@example.com", "fallback@example.com")).toBe(
      "fallback@example.com",
    );
  });
});
