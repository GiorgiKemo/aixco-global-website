import { describe, expect, it } from "vitest";
import { formatCountValue, getCountStartValue, parseCountUpSegments } from "./CountUpText";

describe("CountUpText helpers", () => {
  it("parses formatted financial numbers while preserving non-number text", () => {
    const value = "$4.2B / \u20ac68,000 / 12-15% IRR / 5,000+";
    const segments = parseCountUpSegments(value);
    const numbers = segments.filter((segment) => segment.type === "number");

    expect(numbers.map((segment) => segment.raw)).toEqual(["4.2", "68,000", "12", "15", "5,000"]);
    expect(numbers.map((segment) => segment.value)).toEqual([4.2, 68000, 12, 15, 5000]);
    expect(numbers.map((segment) => segment.decimals)).toEqual([1, 0, 0, 0, 0]);
    expect(numbers.map((segment) => segment.grouped)).toEqual([false, true, false, false, true]);
    expect(segments.map((segment) => segment.text).join("")).toBe(value);
  });

  it("formats animated values to match the original precision and grouping", () => {
    const [grouped] = parseCountUpSegments("\u20ac68,000").filter((segment) => segment.type === "number");
    const [decimal] = parseCountUpSegments("$4.2B").filter((segment) => segment.type === "number");

    expect(formatCountValue(68123.4, grouped)).toBe("68,123");
    expect(formatCountValue(4.246, decimal)).toBe("4.2");
  });

  it("starts year-like values near the final year instead of from zero", () => {
    const [year] = parseCountUpSegments("2009").filter((segment) => segment.type === "number");

    expect(getCountStartValue(year)).toBe(1993);
  });
});
