import { describe, expect, it } from "vitest";
import {
  annuityPayment,
  calculateReveranceInvestment,
  defaultReveranceCalculatorInputs,
  normalizeReveranceInputs,
  remainingLoanBalance,
} from "./reverance-investment-calculator";

describe("Reverance investment model", () => {
  it("matches the reference scenario mechanics for the default unit", () => {
    const result = calculateReveranceInvestment(defaultReveranceCalculatorInputs);
    const listPrice = 33.7 * 1_600;
    const loan = listPrice * 0.6;
    const payment = annuityPayment(loan, 9, 10);

    expect(result.unit.code).toBe("A0203");
    expect(result.listPrice).toBeCloseTo(listPrice, 6);
    expect(result.downPayment).toBeCloseTo(listPrice * 0.1, 6);
    expect(result.constructionInstallments).toBeCloseTo(listPrice * 0.3, 6);
    expect(result.investedEquity).toBeCloseTo(listPrice * 0.4, 6);
    expect(result.loanAmount).toBeCloseTo(loan, 6);
    expect(result.monthlyBankPayment).toBeCloseTo(payment, 6);
    expect(result.completionValue).toBeCloseTo(listPrice * 1.305, 6);
    expect(result.netMonthlyRent).toBeCloseTo(result.grossMonthlyRent * 0.99 * 0.9, 6);
    expect(result.monthlySurplus).toBeCloseTo(result.netMonthlyRent - payment, 6);
    expect(result.holdingProjection.remainingDebt).toBeCloseTo(
      remainingLoanBalance(loan, payment, 9, 10, 10),
      6,
    );
  });

  it("keeps the projection milestones inside the selected holding period", () => {
    const oneYear = calculateReveranceInvestment({ holdingYears: 1 });
    const fifteenYears = calculateReveranceInvestment({ holdingYears: 15 });

    expect(oneYear.milestones.map((milestone) => milestone.year)).toEqual([1]);
    expect(fifteenYears.milestones.map((milestone) => milestone.year)).toEqual([3, 5, 7, 10, 15]);
  });

  it("stops bank outflows in accumulated cash once the loan term ends", () => {
    const result = calculateReveranceInvestment({ holdingYears: 15 });
    const { netMonthlyRent, monthlyBankPayment, assumptions } = result;
    const fifteenYear = result.holdingProjection;
    const tenYear = result.milestones.find((milestone) => milestone.year === 10);

    expect(fifteenYear.year).toBe(15);
    expect(tenYear).toBeDefined();
    expect(fifteenYear.remainingDebt).toBe(0);
    expect(fifteenYear.accumulatedCash).toBeCloseTo(
      (netMonthlyRent * 12 - monthlyBankPayment * 12) * assumptions.loanYears
        + netMonthlyRent * 12 * (15 - assumptions.loanYears),
      6,
    );
    // Years beyond the loan term add exactly one year of net rent, no bank payment.
    expect(fifteenYear.accumulatedCash - tenYear!.accumulatedCash).toBeCloseTo(
      netMonthlyRent * 12 * (15 - assumptions.loanYears),
      6,
    );
  });

  it("produces no loan payment when financing is zero", () => {
    const result = calculateReveranceInvestment({ financingPercent: 0 });

    expect(result.loanAmount).toBe(0);
    expect(result.monthlyBankPayment).toBe(0);
    expect(result.monthlySurplus).toBe(result.netMonthlyRent);
    expect(result.holdingProjection.remainingDebt).toBe(0);
  });

  it("normalizes invalid API input to the supported calculator bounds", () => {
    expect(normalizeReveranceInputs({
      unitCode: "not-a-unit",
      pricePerSquareMetre: Number.POSITIVE_INFINITY,
      financingPercent: -10,
      grossYieldPercent: 100,
      annualGrowthPercent: Number.NaN,
      holdingYears: 99.8,
    })).toEqual({
      ...defaultReveranceCalculatorInputs,
      pricePerSquareMetre: 1_600,
      financingPercent: 0,
      grossYieldPercent: 14,
      annualGrowthPercent: 5,
      holdingYears: 15,
    });
  });
});
