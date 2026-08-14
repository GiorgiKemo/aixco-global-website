import { describe, expect, it } from "vitest";
import { calculateBestWindow, type StayPeriod } from "@/lib/georgia-tax-residency-calculator";

function stay(id: number, arrival: string, departure: string): StayPeriod {
  return { id, arrival, departure };
}

describe("Georgia tax residency stay calculator", () => {
  it("counts arrival and departure dates inclusively", () => {
    expect(calculateBestWindow([stay(1, "2026-04-10", "2026-04-10")], 2026).days).toBe(1);
  });

  it("merges overlapping stays instead of double counting them", () => {
    const result = calculateBestWindow([
      stay(1, "2026-01-01", "2026-06-30"),
      stay(2, "2026-06-15", "2026-07-02"),
    ], 2026);

    expect(result.days).toBe(183);
    expect(result.start).toBe(Date.UTC(2025, 6, 3));
    expect(result.end).toBe(Date.UTC(2026, 6, 2));
  });

  it("only considers 12-month windows ending in the selected tax year", () => {
    expect(calculateBestWindow([stay(1, "2026-01-01", "2026-06-30")], 2025).days).toBe(0);
  });

  it("ignores incomplete and backwards date ranges", () => {
    const result = calculateBestWindow([
      stay(1, "2026-01-01", ""),
      stay(2, "2026-07-02", "2026-06-15"),
    ], 2026);

    expect(result).toEqual({ days: 0, start: null, end: null });
  });
});
