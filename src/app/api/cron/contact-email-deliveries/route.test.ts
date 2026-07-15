import { describe, expect, it } from "vitest";
import { isAuthorizedContactEmailWorker } from "./route";

const secret = "abcdef0123456789abcdef0123456789";

describe("contact email cron authorization", () => {
  it("accepts only an exact bearer secret with production strength", () => {
    expect(
      isAuthorizedContactEmailWorker(
        new Request("https://www.aixco.global/api/cron/contact-email-deliveries", {
          headers: { authorization: `Bearer ${secret}` },
        }),
        { CRON_SECRET: secret },
      ),
    ).toBe(true);

    expect(
      isAuthorizedContactEmailWorker(
        new Request("https://www.aixco.global/api/cron/contact-email-deliveries", {
          headers: { authorization: "Bearer wrong" },
        }),
        { CRON_SECRET: secret },
      ),
    ).toBe(false);

    expect(
      isAuthorizedContactEmailWorker(
        new Request("https://www.aixco.global/api/cron/contact-email-deliveries", {
          headers: { authorization: "Bearer short" },
        }),
        { CRON_SECRET: "short" },
      ),
    ).toBe(false);
  });
});
