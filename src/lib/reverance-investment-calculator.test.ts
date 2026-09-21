import { describe, expect, it } from "vitest";
import {
  annuityPayment,
  calculateReveranceInvestment,
  defaultReveranceCalculatorInputs,
  normalizeReveranceInputs,
  remainingLoanBalance,
  reveranceUnits,
  findReveranceUnit,
} from "./reverance-investment-calculator";
import { isGoldenPremiumUnit } from "@/data/golden-premium-apartments";

describe("Reverance investment model", () => {
  it("changes payment timing without inventing additional equity or returns", () => {
    const baseline = calculateReveranceInvestment();
    const result = calculateReveranceInvestment({ downPaymentPercent: 30, financingPercent: 60 });
    expect(result.downPayment).toBeCloseTo(15_552, 8);
    expect(result.constructionInstallments).toBeCloseTo(5_184, 8);
    expect(result.constructionInstallments / 24).toBeCloseTo(216, 8);
    expect(result.loanAmount).toBeCloseTo(31_104, 8);
    expect(result.investedEquity).toBeCloseTo(20_736, 8);
    expect(result.monthlyBankPayment).toBe(baseline.monthlyBankPayment);
    expect(result.netMonthlyRent).toBe(baseline.netMonthlyRent);
    expect(result.holdingProjection.netWorth).toBe(baseline.holdingProjection.netWorth);
    expect(result.holdingProjection.multiple).toBeCloseTo(baseline.holdingProjection.multiple, 10);
    expect(result.assumptions.downPaymentPercent).toBe(30);
    expect(calculateReveranceInvestment().assumptions.downPaymentPercent).toBe(10);
  });

  it("limits bank financing to the unpaid share, including a fully prepaid purchase", () => {
    const half = calculateReveranceInvestment({ downPaymentPercent: 50, financingPercent: 70 });
    expect(half.inputs.financingPercent).toBe(50);
    expect(half.loanAmount).toBeCloseTo(25_920, 8);
    expect(half.constructionInstallments).toBe(0);
    const full = calculateReveranceInvestment({ downPaymentPercent: 100, financingPercent: 70 });
    expect(full.inputs.financingPercent).toBe(0);
    expect(full.downPayment).toBe(full.listPrice);
    expect(full.constructionInstallments).toBe(0);
    expect(full.monthlyBankPayment).toBe(0);
    expect(full.holdingProjection.remainingDebt).toBe(0);
  });

  it("balances every supported down-payment and financing combination for every unit", () => {
    for (const unit of reveranceUnits) {
      for (let downPaymentPercent = 0; downPaymentPercent <= 100; downPaymentPercent += 5) {
        for (let financingPercent = 0; financingPercent <= 70; financingPercent += 5) {
          const result = calculateReveranceInvestment({ unitCode: unit.code, downPaymentPercent, financingPercent });
          expect(result.downPayment + result.constructionInstallments + result.loanAmount).toBeCloseTo(result.listPrice, 7);
          expect(result.investedEquity).toBeCloseTo(result.listPrice - result.loanAmount, 7);
          expect(result.constructionInstallments).toBeGreaterThanOrEqual(0);
          expect(result.inputs.financingPercent + result.inputs.downPaymentPercent).toBeLessThanOrEqual(100);
          expect(Number.isFinite(result.holdingProjection.multiple)).toBe(true);
        }
      }
    }
  });

  it("uses an amortization schedule consistent with the adjusted loan", () => {
    const result = calculateReveranceInvestment({ downPaymentPercent: 65, financingPercent: 60, holdingYears: 5 });
    let balance = result.loanAmount;
    for (let month = 0; month < 60; month++) balance = balance * (1 + 0.09 / 12) - result.monthlyBankPayment;
    expect(result.holdingProjection.remainingDebt).toBeCloseTo(balance, 7);
    for (let month = 60; month < 120; month++) balance = balance * (1 + 0.09 / 12) - result.monthlyBankPayment;
    expect(balance).toBeCloseTo(0, 7);
  });

  it("normalizes missing, non-finite, and out-of-range down payments", () => {
    expect(normalizeReveranceInputs().downPaymentPercent).toBe(10);
    expect(normalizeReveranceInputs({ downPaymentPercent: Number.NaN }).downPaymentPercent).toBe(10);
    expect(normalizeReveranceInputs({ downPaymentPercent: Infinity }).downPaymentPercent).toBe(10);
    expect(normalizeReveranceInputs({ downPaymentPercent: -10 }).downPaymentPercent).toBe(0);
    expect(normalizeReveranceInputs({ downPaymentPercent: 110 }).downPaymentPercent).toBe(100);
  });
  it("offers exactly Klem's approved sea-view units and areas", () => {
    expect(reveranceUnits.map(({ code, area }) => [code, area])).toEqual([
      ["A1305", 32.4], ["A1306", 32.3], ["A1307", 32.4], ["A1308", 32.3],
      ["A1309", 32.4], ["A1310", 32.3], ["A1401", 46.4], ["A1405", 32.4],
      ["A1407", 32.4], ["A1408", 32.3],
    ]);
    expect(reveranceUnits.every((unit) => unit.building === "A" && [13, 14].includes(unit.floor) && unit.orientation === "Sea view")).toBe(true);
    expect(findReveranceUnit("A1401").type).toBe("1 Bedroom");
    expect(reveranceUnits.every((unit) => isGoldenPremiumUnit(unit.code))).toBe(true);
    expect(findReveranceUnit("retired").code).toBe(defaultReveranceCalculatorInputs.unitCode);
  });
  it("matches the reference scenario mechanics for the default unit", () => {
    const result = calculateReveranceInvestment(defaultReveranceCalculatorInputs);
    const listPrice = 32.4 * 1_600;
    const loan = listPrice * 0.6;
    const payment = annuityPayment(loan, 9, 10);

    expect(result.unit.code).toBe("A1305");
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
