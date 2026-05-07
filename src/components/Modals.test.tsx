import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
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
});
