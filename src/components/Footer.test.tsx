import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "./ui-state";
import { Footer } from "./Footer";

function renderFooter() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <UIProvider>
          <Footer />
        </UIProvider>
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe("Footer", () => {
  it("renders one brand logo treatment in the footer", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: /aixco global home/i })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "AIXCO Global" })).not.toBeInTheDocument();
    expect(screen.getByText(/AIXCO Global 2026/)).toBeInTheDocument();
  });
});
