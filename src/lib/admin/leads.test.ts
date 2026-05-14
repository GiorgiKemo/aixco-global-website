import { describe, expect, it } from "vitest";
import { parseLeadStatus } from "./leads";

describe("admin leads", () => {
  it("accepts supported lead status filters", () => {
    expect(parseLeadStatus("new")).toBe("new");
    expect(parseLeadStatus("contacted")).toBe("contacted");
    expect(parseLeadStatus("qualified")).toBe("qualified");
    expect(parseLeadStatus("archived")).toBe("archived");
  });

  it("ignores unsupported lead status filters", () => {
    expect(parseLeadStatus("deleted")).toBeUndefined();
    expect(parseLeadStatus(undefined)).toBeUndefined();
  });
});
