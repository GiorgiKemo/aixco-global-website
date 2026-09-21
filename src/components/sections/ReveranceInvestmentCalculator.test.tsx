import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ReveranceInvestmentCalculator } from "./ReveranceInvestmentCalculator";

vi.mock("@/components/property/PropertyChrome", () => ({ PropertyChrome: () => null }));

describe("Reverance down-payment controls", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the controls synchronized when the down payment reduces available financing", () => {
    render(<I18nProvider><ReveranceInvestmentCalculator /></I18nProvider>);
    const down = screen.getByRole("slider", { name: "Down payment" });
    const loan = screen.getByRole("slider", { name: "Financing" });
    expect(down).toHaveValue("10");
    fireEvent.change(down, { target: { value: "50" } });
    expect(loan).toHaveValue("50");
    expect(loan).toHaveAttribute("max", "50");
    fireEvent.change(down, { target: { value: "100" } });
    expect(loan).toHaveValue("0");
    expect(loan).toBeDisabled();
    expect(loan.getAttribute("style")).not.toContain("NaN");
    fireEvent.change(down, { target: { value: "10" } });
    expect(loan).toBeEnabled();
    expect(loan).toHaveValue("0");
    expect(loan).toHaveAttribute("max", "70");
  });

  it.each([
    ["en", "Down payment"], ["de", "Anzahlung"], ["pl", "Zaliczka"],
    ["sl", "Polog"], ["ru", "Первоначальный взнос"],
  ])("localizes the down-payment control in %s", (lang, label) => {
    localStorage.setItem("aixco-lang", lang);
    render(<I18nProvider><ReveranceInvestmentCalculator /></I18nProvider>);
    expect(screen.getByRole("slider", { name: label })).toHaveValue("10");
    if (lang !== "en") expect(screen.queryByText(/^Down payment \+ construction/)).not.toBeInTheDocument();
  });
});
