import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FooterLegalBar } from "./Footer";
import { ANALYTICS_PREFERENCES_EVENT } from "@/lib/analytics/contracts";

function tx(value: string) {
  return value;
}

describe("FooterLegalBar", () => {
  it("renders certification and legal actions", () => {
    const openTerms = vi.fn();
    const openPrivacy = vi.fn();
    const openPreferences = vi.fn();
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, openPreferences);

    render(<FooterLegalBar tx={tx} openTerms={openTerms} openPrivacy={openPrivacy} compact />);

    expect(screen.getByRole("link", { name: /Official systems certified/i })).toHaveAttribute(
      "href",
      "https://www.iafcertsearch.org/certified-entity/NjliMzc3N2MtNGQ2Zi01YzY2LThiOTUtMGIwZmViNWMxODk3",
    );
    expect(screen.getByText(new RegExp(`AIXCO Global ${new Date().getFullYear()}`))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Terms & Conditions" }));
    fireEvent.click(screen.getByRole("button", { name: "Privacy Policy" }));
    fireEvent.click(screen.getByRole("button", { name: "Cookie preferences" }));

    expect(openTerms).toHaveBeenCalledTimes(1);
    expect(openPrivacy).toHaveBeenCalledTimes(1);
    expect(openPreferences).toHaveBeenCalledTimes(1);
    window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, openPreferences);
  });
});
