import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("chatbot route", () => {
  it("rejects oversized JSON before parsing or loading site content", async () => {
    const response = await POST(
      new Request("https://aixco.global/api/chatbot", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(96 * 1024 + 1),
          "x-forwarded-for": "203.0.113.44",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({ ok: false, reason: "Request body is too large." });
  });
});
