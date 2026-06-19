import { describe, expect, it } from "vitest";
import { getReducedMotionPreference } from "./motion";

describe("getReducedMotionPreference", () => {
  it("respects user reduced-motion settings in production", () => {
    expect(getReducedMotionPreference("production")).toBe("user");
  });

  it("keeps Motion animations enabled outside production", () => {
    expect(getReducedMotionPreference("development")).toBe("never");
    expect(getReducedMotionPreference("test")).toBe("never");
  });
});
