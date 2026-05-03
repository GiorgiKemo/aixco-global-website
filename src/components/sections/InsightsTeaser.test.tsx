import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { InsightsTeaser } from "./InsightsTeaser";

describe("InsightsTeaser", () => {
  it("does not look like a second Batumi section after partners", () => {
    render(
      <I18nProvider>
        <InsightsTeaser />
      </I18nProvider>,
    );

    expect(screen.getByRole("heading", { name: "Market insights" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Batumi" })).not.toBeInTheDocument();
  });
});
