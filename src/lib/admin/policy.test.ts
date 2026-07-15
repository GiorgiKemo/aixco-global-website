import { describe, expect, it } from "vitest";
import { hasAdminRole } from "./policy";

describe("admin role policy", () => {
  it("accepts a direct app_metadata role or roles list", () => {
    expect(hasAdminRole({ role: "admin" })).toBe(true);
    expect(hasAdminRole({ roles: ["editor", "admin"] })).toBe(true);
  });

  it("requires the configured role exactly", () => {
    expect(hasAdminRole({ role: "owner" }, "owner")).toBe(true);
    expect(hasAdminRole({ role: "admin" }, "owner")).toBe(false);
    expect(hasAdminRole({ roles: ["Admin"] })).toBe(false);
  });

  it("rejects missing or malformed app metadata", () => {
    expect(hasAdminRole(null)).toBe(false);
    expect(hasAdminRole({ roles: "admin" })).toBe(false);
  });
});
