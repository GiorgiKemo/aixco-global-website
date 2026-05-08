import { describe, expect, it } from "vitest";
import {
  getReducedMotionPreference,
  isMotionReducedMotionDevWarning,
} from "./motion";

describe("getReducedMotionPreference", () => {
  it("respects user reduced-motion settings in production", () => {
    expect(getReducedMotionPreference("production")).toBe("user");
  });

  it("keeps Motion animations enabled outside production", () => {
    expect(getReducedMotionPreference("development")).toBe("never");
    expect(getReducedMotionPreference("test")).toBe("never");
  });

  it("recognizes Motion's reduced-motion troubleshooting warning", () => {
    expect(
      isMotionReducedMotionDevWarning(
        "You have Reduced Motion enabled on your device. Animations may not appear as expected. For more information and steps for solving, visit https://motion.dev/troubleshooting/reduced-motion-disabled",
      ),
    ).toBe(true);
    expect(isMotionReducedMotionDevWarning("Unrelated warning")).toBe(false);
  });
});
