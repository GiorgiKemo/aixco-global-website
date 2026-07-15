import { describe, expect, it } from "vitest";
import { readBoundedJson } from "./request-body";

describe("readBoundedJson", () => {
  it("parses JSON within the byte ceiling", async () => {
    const result = await readBoundedJson(
      new Request("https://aixco.global/api/example", { method: "POST", body: JSON.stringify({ ok: true }) }),
      128,
    );

    expect(result).toEqual({ ok: true, value: { ok: true } });
  });

  it("rejects declared and streamed oversized bodies", async () => {
    const declared = await readBoundedJson(
      new Request("https://aixco.global/api/example", {
        method: "POST",
        headers: { "content-length": "200" },
        body: "{}",
      }),
      128,
    );
    const streamed = await readBoundedJson(
      new Request("https://aixco.global/api/example", { method: "POST", body: JSON.stringify({ value: "x".repeat(200) }) }),
      128,
    );

    expect(declared).toEqual({ ok: false, error: "payload-too-large" });
    expect(streamed).toEqual({ ok: false, error: "payload-too-large" });
  });

  it("rejects malformed JSON", async () => {
    const result = await readBoundedJson(
      new Request("https://aixco.global/api/example", { method: "POST", body: "not-json" }),
      128,
    );

    expect(result).toEqual({ ok: false, error: "invalid-json" });
  });
});
