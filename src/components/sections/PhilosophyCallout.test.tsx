import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { PhilosophyCallout } from "./PhilosophyCallout";

function renderPhilosophyCallout() {
  return render(
    <I18nProvider>
      <PhilosophyCallout />
    </I18nProvider>,
  );
}

describe("PhilosophyCallout", () => {
  it("surfaces the philosophy page as a visible home-page callout", () => {
    renderPhilosophyCallout();

    expect(screen.getByLabelText("AIXCO Philosophy")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "From Switzerland to Dubai to Batumi—disciplined real estate execution since 2009.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read AIXCO Philosophy/i })).toHaveAttribute(
      "href",
      "/aixco-philosophy",
    );
  });
});
