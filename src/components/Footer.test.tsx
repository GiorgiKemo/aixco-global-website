import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SiteContentContext } from "@/data/site-content-context";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { UIProvider } from "./ui-state";
import { Footer } from "./Footer";

function renderFooter() {
  return render(
    <I18nProvider>
      <UIProvider>
        <Footer />
      </UIProvider>
    </I18nProvider>,
  );
}

describe("Footer", () => {
  it("renders one brand logo treatment in the footer", () => {
    const { container } = renderFooter();

    expect(screen.getByRole("link", { name: /aixco global home/i })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "AIXCO Global" })).not.toBeInTheDocument();
    expect(screen.getByText(/AIXCO Global 2026/)).toBeInTheDocument();
    expect(container.querySelector("[data-footer-actions]")).toHaveClass("md:pr-24", "lg:pr-0");
  });

  it("keeps footer legal and social actions large enough for touch interaction", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: /ISO 27001-2022 Certified Systems/i })).toHaveClass("min-h-10");
    expect(screen.getByRole("button", { name: "Terms & Conditions" })).toHaveClass("min-h-10");
    expect(screen.getByRole("button", { name: "Privacy Policy" })).toHaveClass("min-h-10");
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveClass("h-10", "w-10");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveClass("h-10", "w-10");
  });

  it("falls back when social URLs are outside the expected platforms", () => {
    render(
      <I18nProvider>
        <SiteContentContext.Provider
          value={{
            ...siteContentDefaults,
            company: {
              ...siteContentDefaults.company,
              socials: {
                ...siteContentDefaults.company.socials,
                instagram: "javascript:alert(1)",
                linkedin: "https://evil.example/company/aixco-global",
              },
            },
          }}
        >
          <UIProvider>
            <Footer />
          </UIProvider>
        </SiteContentContext.Provider>
      </I18nProvider>,
    );

    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/aixco.global",
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/aixco-global",
    );
  });
});
