import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LegacyTimeline } from "./LegacyTimeline";

function renderLegacyTimeline() {
  return render(
    <I18nProvider>
      <LegacyTimeline />
    </I18nProvider>,
  );
}

describe("LegacyTimeline", () => {
  it("renders the journey section with Switzerland, Dubai, and Batumi chapters", () => {
    renderLegacyTimeline();

    expect(screen.getByRole("region", { name: "AIXCO legacy journey" })).toHaveAttribute("id", "legacy");
    expect(screen.getByText("Our journey")).toBeInTheDocument();
    expect(screen.getByText("CHF 1.1 billion")).toBeInTheDocument();
    expect(screen.getByText("USD 800m+ development volume")).toBeInTheDocument();
    expect(screen.getByText("Selected apartments from €45,000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /x-co-group.com/i })).toHaveAttribute("href", "https://x-co-group.com");
  });
});
