import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider, useUI } from "@/components/ui-state";
import { PropertyChrome, PropertyContactLink } from "./PropertyChrome";

function ModalProbe() {
  const { modal } = useUI();
  return <output aria-label="active modal">{modal ?? "none"}</output>;
}

function renderChrome() {
  return render(
    <I18nProvider>
      <PropertyChrome />
    </I18nProvider>,
  );
}

describe("PropertyChrome", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = "";
    document.documentElement.className = "";
  });

  it("opens real navigation menus and closes them with Escape", () => {
    renderChrome();

    const aboutButton = screen.getByRole("button", { name: /about aixco/i });
    fireEvent.click(aboutButton);

    expect(aboutButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "Origins" })).toHaveAttribute(
      "href",
      "/#philosophy-origins",
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(aboutButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menuitem", { name: "Origins" })).not.toBeInTheDocument();
  });

  it("switches language and updates the document direction", async () => {
    renderChrome();

    const languageButton = screen.getAllByRole("button", { name: /change language/i })[0];
    fireEvent.click(languageButton);
    fireEvent.click(screen.getAllByRole("option", { name: /العربية/i })[0]);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "ar");
      expect(document.documentElement).toHaveAttribute("dir", "rtl");
    });
    expect(screen.getAllByRole("button", { name: /تغيير اللغة/i })[0]).toHaveTextContent("AR");
  });

  it("mounts the mobile menu only while it is open and locks page scroll", () => {
    renderChrome();

    const openButton = screen.getByRole("button", { name: /open menu/i });
    expect(document.querySelector("#property-mobile-menu")).not.toBeInTheDocument();

    openButton.focus();
    fireEvent.click(openButton);
    const mobileMenu = document.querySelector("#property-mobile-menu");
    expect(mobileMenu).toBeInTheDocument();
    expect(document.body).toHaveClass("overflow-hidden");
    const closeButton = screen.getByRole("button", { name: /close menu/i });
    expect(closeButton).toHaveFocus();
    expect(within(mobileMenu as HTMLElement).getByRole("link", { name: "Batumi" })).toHaveAttribute(
      "href",
      "/#batumi",
    );

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(within(mobileMenu as HTMLElement).getByRole("link", { name: "Contact" })).toHaveFocus();

    fireEvent.click(closeButton);
    expect(document.querySelector("#property-mobile-menu")).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass("overflow-hidden");
    expect(openButton).toHaveFocus();
  });

  it("opens the shared contact flow immediately and keeps a direct-load URL fallback", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <PropertyContactLink>Contact AIXCO</PropertyContactLink>
          <ModalProbe />
        </UIProvider>
      </I18nProvider>,
    );

    const link = screen.getByRole("link", { name: "Contact AIXCO" });
    expect(link).toHaveAttribute("href", "/?modal=contact");

    fireEvent.click(link);
    expect(screen.getByLabelText("active modal")).toHaveTextContent("contact");
  });
});
