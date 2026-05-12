import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SiteContentContext } from "@/data/site-content-context";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { Modals } from "./Modals";
import { UIProvider, useUI } from "./ui-state";

function PrivacyTrigger() {
  const { openPrivacy } = useUI();

  return (
    <button type="button" onClick={openPrivacy}>
      Open privacy
    </button>
  );
}

function LoginTrigger() {
  const { openLogin } = useUI();

  return (
    <button type="button" onClick={openLogin}>
      Open login
    </button>
  );
}

describe("Modals", () => {
  it("gives legal dialogs an accessible name", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    expect(screen.getByRole("dialog", { name: "Privacy Policy" })).toBeInTheDocument();
  });

  it("uses a comfortable tap target for the modal close control", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("h-10", "w-10");
  });

  it("allows translated dialog copy to wrap inside narrow screens", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveClass("[overflow-wrap:anywhere]");
    expect(dialog).toHaveClass("bg-surface-elevated");
    expect(dialog.className).not.toContain("glass");
  });

  it("uses a dedicated smooth backdrop transition instead of the global page fade", () => {
    const { container } = render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    const modalShell = container.querySelector(".modal-shell");
    const modalBackdrop = container.querySelector(".modal-backdrop");
    const dialog = screen.getByRole("dialog");

    expect(modalShell).toBeInTheDocument();
    expect(modalShell?.className).not.toContain("animate-fade-in");
    expect(modalBackdrop).toBeInTheDocument();
    expect(modalBackdrop?.className).toContain("backdrop-blur-lg");
    expect(modalBackdrop?.className).toContain("bg-transparent");
    expect(modalBackdrop?.className).not.toContain("bg-background");
    expect(dialog).toHaveClass("modal-panel");
    expect(dialog.className).not.toContain("animate-scale-in");
  });

  it("does not render portal links that are outside the approved Workwise portal", () => {
    render(
      <I18nProvider>
        <SiteContentContext.Provider
          value={{
            ...siteContentDefaults,
            company: {
              ...siteContentDefaults.company,
              portals: {
                ...siteContentDefaults.company.portals,
                customerLogin: "https://workw.com.evil.example/realestate/customer/login",
              },
            },
          }}
        >
          <UIProvider>
            <LoginTrigger />
            <Modals />
          </UIProvider>
        </SiteContentContext.Provider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open login/i }));

    expect(screen.queryByRole("link", { name: "Customer Login" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Broker Login" })).toHaveAttribute(
      "href",
      "https://workw.com/realestate/broker/login",
    );
  });
});
