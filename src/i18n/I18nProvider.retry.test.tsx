import { describe, expect, it, vi } from "vitest";

vi.mock("./translations", async () => {
  if ((globalThis as { __i18nChunkFailure?: boolean }).__i18nChunkFailure) {
    throw new Error("Simulated translation chunk failure");
  }
  return await vi.importActual<typeof import("./translations")>("./translations");
});

import { hasTextTranslation } from "./I18nProvider";

describe("translation catalog loading resilience", () => {
  it("retries the catalog load after a transient chunk failure", async () => {
    (globalThis as { __i18nChunkFailure?: boolean }).__i18nChunkFailure = true;
    await expect(hasTextTranslation("Explore Batumi real estate", "de")).rejects.toThrow();

    (globalThis as { __i18nChunkFailure?: boolean }).__i18nChunkFailure = false;
    await expect(hasTextTranslation("Explore Batumi real estate", "de")).resolves.toBe(true);

    delete (globalThis as { __i18nChunkFailure?: boolean }).__i18nChunkFailure;
  });
});
