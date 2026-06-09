import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SiteContentContext } from "@/data/site-content-context";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { UIProvider } from "./ui-state";
import { Footer } from "./Footer";

function renderFooter(variant: "default" | "story" = "default") {
  return render(
    <I18nProvider>
      <UIProvider>
        <Footer variant={variant} />
      </UIProvider>
    </I18nProvider>,
  );
}

describe("Footer", () => {
  it("renders a minimal footer with legal content below contact details", () => {
    const { container } = renderFooter();

    expect(screen.getByRole("link", { name: /aixco\.global home/i })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "AIXCO Global" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Platform sections" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Resources and support" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Register" })).not.toBeInTheDocument();
    expect(screen.getByText("info@aixco.global")).toBeInTheDocument();
    expect(screen.getByText("Grüngasse 16, 1050 Wien, Austria")).toBeInTheDocument();
    expect(screen.getByText(/AIXCO Global 2026/)).toBeInTheDocument();

    const legalBar = container.querySelector(".site-footer-legal");
    const logo = screen.getByRole("link", { name: /aixco\.global home/i });
    expect(legalBar?.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it("marks the homepage story footer variant for the story-mode display override", () => {
    const { container } = renderFooter("story");

    expect(container.querySelector("footer")).toHaveAttribute("data-story-footer", "true");
    expect(container.querySelector("footer")).toHaveClass("story-footer");
  });

  it("keeps footer legal and social actions large enough for touch interaction", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: /Official systems certified/i })).toHaveClass("min-h-12");
    expect(screen.getByRole("button", { name: "Terms & Conditions" })).toHaveClass("min-h-10");
    expect(screen.getByRole("button", { name: "Privacy Policy" })).toHaveClass("min-h-10");
    for (const label of ["AIXCO Group website", "LinkedIn"]) {
      expect(screen.getByRole("link", { name: label })).toHaveClass("h-11", "w-11");
    }
    expect(screen.queryByRole("link", { name: "Instagram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "YouTube" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "X" })).not.toBeInTheDocument();
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
                website: "https://evil.example/",
                instagram: "javascript:alert(1)",
                linkedin: "https://evil.example/company/aixco-global",
                youtube: "https://evil.example/@aixco-global",
                x: "data:text/html,alert(1)",
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

    expect(screen.getByRole("link", { name: "AIXCO Group website" })).toHaveAttribute(
      "href",
      "https://aixco.group/",
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/aixco",
    );
    expect(screen.queryByRole("link", { name: "Instagram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "YouTube" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "X" })).not.toBeInTheDocument();
  });
});
