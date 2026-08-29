export type ReveranceUnit = {
  code: string;
  building: "A" | "B";
  floor: number;
  area: number;
  livingArea: number;
  terraceArea: number;
  orientation: "City side" | "Courtyard" | "Sea view" | "Adjara mountains";
  type: "Studio";
};

export type CalculatorInputs = {
  unitCode: string;
  pricePerSquareMetre: number;
  financingPercent: number;
  grossYieldPercent: number;
  annualGrowthPercent: number;
  holdingYears: number;
};

export type CalculatorAssumptions = {
  downPaymentPercent: number;
  constructionInstallmentMonths: number;
  interestPercent: number;
  loanYears: number;
  completionUpliftPercent: number;
  rentalTaxPercent: number;
  operatingAndVoidPercent: number;
};

export type InvestmentProjection = {
  year: number;
  propertyValue: number;
  remainingDebt: number;
  accumulatedCash: number;
  netWorth: number;
  multiple: number;
};

export type InvestmentCalculation = {
  inputs: CalculatorInputs;
  unit: ReveranceUnit;
  assumptions: CalculatorAssumptions;
  listPrice: number;
  downPayment: number;
  constructionInstallments: number;
  loanAmount: number;
  investedEquity: number;
  monthlyBankPayment: number;
  completionValue: number;
  grossMonthlyRent: number;
  netMonthlyRent: number;
  monthlySurplus: number;
  holdingProjection: InvestmentProjection;
  milestones: InvestmentProjection[];
};

export const reveranceCalculatorAssumptions: CalculatorAssumptions = {
  downPaymentPercent: 10,
  constructionInstallmentMonths: 24,
  interestPercent: 9,
  loanYears: 10,
  completionUpliftPercent: 30.5,
  rentalTaxPercent: 1,
  operatingAndVoidPercent: 10,
};

export const reveranceCalculatorRanges = {
  pricePerSquareMetre: { min: 1400, max: 2400, step: 25 },
  financingPercent: { min: 0, max: 70, step: 5 },
  grossYieldPercent: { min: 5, max: 14, step: 0.5 },
  annualGrowthPercent: { min: 0, max: 10, step: 0.5 },
  holdingYears: { min: 1, max: 15, step: 1 },
} as const;

export const reveranceUnits: readonly ReveranceUnit[] = [
  { code: "A0201", building: "A", floor: 2, area: 32.2, livingArea: 27.3, terraceArea: 5.4, orientation: "City side", type: "Studio" },
  { code: "A0401", building: "A", floor: 4, area: 32.2, livingArea: 27.3, terraceArea: 5.4, orientation: "Sea view", type: "Studio" },
  { code: "A0202", building: "A", floor: 2, area: 33.1, livingArea: 27.4, terraceArea: 5.7, orientation: "Courtyard", type: "Studio" },
  { code: "A0302", building: "A", floor: 3, area: 33.1, livingArea: 27.4, terraceArea: 5.7, orientation: "Sea view", type: "Studio" },
  { code: "A0203", building: "A", floor: 2, area: 33.7, livingArea: 27.3, terraceArea: 6.4, orientation: "Sea view", type: "Studio" },
  { code: "A0303", building: "A", floor: 3, area: 33.7, livingArea: 27.3, terraceArea: 6.4, orientation: "Adjara mountains", type: "Studio" },
  { code: "A0803", building: "A", floor: 8, area: 33.7, livingArea: 27.3, terraceArea: 6.4, orientation: "City side", type: "Studio" },
  { code: "A0304", building: "A", floor: 3, area: 34.1, livingArea: 27.5, terraceArea: 6.6, orientation: "City side", type: "Studio" },
  { code: "A0904", building: "A", floor: 9, area: 34.1, livingArea: 27.5, terraceArea: 6.6, orientation: "Sea view", type: "Studio" },
  { code: "B0203", building: "B", floor: 2, area: 33.7, livingArea: 27.3, terraceArea: 6.4, orientation: "Sea view", type: "Studio" },
  { code: "B1403", building: "B", floor: 14, area: 33.7, livingArea: 27.3, terraceArea: 6.4, orientation: "Sea view", type: "Studio" },
  { code: "B1502", building: "B", floor: 15, area: 33.1, livingArea: 27.4, terraceArea: 5.7, orientation: "Sea view", type: "Studio" },
] as const;

export const defaultReveranceCalculatorInputs: CalculatorInputs = {
  unitCode: "A0203",
  pricePerSquareMetre: 1600,
  financingPercent: 60,
  grossYieldPercent: 12,
  annualGrowthPercent: 5,
  holdingYears: 10,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function finite(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function findReveranceUnit(code: string) {
  return reveranceUnits.find((unit) => unit.code === code) ?? reveranceUnits[4];
}

export function normalizeReveranceInputs(value: Partial<CalculatorInputs> = {}): CalculatorInputs {
  const defaults = defaultReveranceCalculatorInputs;
  const unitCode = typeof value.unitCode === "string" && reveranceUnits.some((unit) => unit.code === value.unitCode)
    ? value.unitCode
    : defaults.unitCode;

  return {
    unitCode,
    pricePerSquareMetre: clamp(
      finite(value.pricePerSquareMetre, defaults.pricePerSquareMetre),
      reveranceCalculatorRanges.pricePerSquareMetre.min,
      reveranceCalculatorRanges.pricePerSquareMetre.max,
    ),
    financingPercent: clamp(
      finite(value.financingPercent, defaults.financingPercent),
      reveranceCalculatorRanges.financingPercent.min,
      reveranceCalculatorRanges.financingPercent.max,
    ),
    grossYieldPercent: clamp(
      finite(value.grossYieldPercent, defaults.grossYieldPercent),
      reveranceCalculatorRanges.grossYieldPercent.min,
      reveranceCalculatorRanges.grossYieldPercent.max,
    ),
    annualGrowthPercent: clamp(
      finite(value.annualGrowthPercent, defaults.annualGrowthPercent),
      reveranceCalculatorRanges.annualGrowthPercent.min,
      reveranceCalculatorRanges.annualGrowthPercent.max,
    ),
    holdingYears: Math.round(clamp(
      finite(value.holdingYears, defaults.holdingYears),
      reveranceCalculatorRanges.holdingYears.min,
      reveranceCalculatorRanges.holdingYears.max,
    )),
  };
}

export function annuityPayment(loan: number, ratePercent: number, years: number) {
  if (loan <= 0 || years <= 0) return 0;
  const monthlyRate = ratePercent / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return loan / months;
  return loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
}

export function remainingLoanBalance(loan: number, payment: number, ratePercent: number, years: number, atYear: number) {
  if (loan <= 0 || atYear >= years || years <= 0) return 0;
  const monthlyRate = ratePercent / 100 / 12;
  const months = Math.max(0, atYear * 12);
  if (monthlyRate === 0) return Math.max(0, loan - payment * months);
  const growth = Math.pow(1 + monthlyRate, months);
  return Math.max(0, loan * growth - payment * (growth - 1) / monthlyRate);
}

export function calculateReveranceInvestment(rawInputs: Partial<CalculatorInputs> = {}): InvestmentCalculation {
  const inputs = normalizeReveranceInputs(rawInputs);
  const assumptions = reveranceCalculatorAssumptions;
  const unit = findReveranceUnit(inputs.unitCode);
  const listPrice = unit.area * inputs.pricePerSquareMetre;
  const downPayment = listPrice * (assumptions.downPaymentPercent / 100);
  const loanAmount = listPrice * (inputs.financingPercent / 100);
  const constructionInstallments = Math.max(0, listPrice - downPayment - loanAmount);
  const investedEquity = downPayment + constructionInstallments;
  const monthlyBankPayment = annuityPayment(loanAmount, assumptions.interestPercent, assumptions.loanYears);
  const completionValue = listPrice * (1 + assumptions.completionUpliftPercent / 100);
  const grossMonthlyRent = completionValue * (inputs.grossYieldPercent / 100) / 12;
  const netMonthlyRent = grossMonthlyRent
    * (1 - assumptions.rentalTaxPercent / 100)
    * (1 - assumptions.operatingAndVoidPercent / 100);
  const monthlySurplus = netMonthlyRent - monthlyBankPayment;

  const projectionAt = (year: number): InvestmentProjection => {
    const propertyValue = completionValue * Math.pow(1 + inputs.annualGrowthPercent / 100, year);
    // Bank outflows only occur during the loan term; afterwards pure rent accumulates.
    const loanTermYears = Math.min(year, Math.max(0, assumptions.loanYears));
    const postLoanYears = Math.max(0, year - assumptions.loanYears);
    const accumulatedCash =
      (netMonthlyRent * 12 - monthlyBankPayment * 12) * loanTermYears
      + netMonthlyRent * 12 * postLoanYears;
    const remainingDebt = remainingLoanBalance(
      loanAmount,
      monthlyBankPayment,
      assumptions.interestPercent,
      assumptions.loanYears,
      year,
    );
    const netWorth = propertyValue - remainingDebt + accumulatedCash;
    return {
      year,
      propertyValue,
      remainingDebt,
      accumulatedCash,
      netWorth,
      multiple: investedEquity > 0 ? netWorth / investedEquity : 0,
    };
  };

  const holdingProjection = projectionAt(inputs.holdingYears);
  const milestoneYears = [...new Set([3, 5, 7, 10, inputs.holdingYears])]
    .filter((year) => year <= inputs.holdingYears)
    .sort((left, right) => left - right);

  return {
    inputs,
    unit,
    assumptions,
    listPrice,
    downPayment,
    constructionInstallments,
    loanAmount,
    investedEquity,
    monthlyBankPayment,
    completionValue,
    grossMonthlyRent,
    netMonthlyRent,
    monthlySurplus,
    holdingProjection,
    milestones: milestoneYears.map(projectionAt),
  };
}
