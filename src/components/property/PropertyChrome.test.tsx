import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider, useUI } from "@/components/ui-state";
import { grantDownloadAccess } from "@/lib/download-access";
import {
  CurrentProjectBrochureLink,
  PropertyChrome,
  PropertyContactLink,
} from "./PropertyChrome";

function ModalProbe() {
  const { modal, modalData } = useUI();
  return (
    <>
      <output aria-label="active modal">{modal ?? "none"}</output>
      <output aria-label="active modal data">{modalData ? JSON.stringify(modalData) : "none"}</output>
    </>
  );
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
    expect(screen.getByRole("link", { name: "Origins" })).toHaveAttribute(
      "href",
      "/#philosophy-origins",
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(aboutButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Origins" })).not.toBeInTheDocument();
  });

  it("places Projects after Legacy and links to the Batumi section", () => {
    renderChrome();

    const desktopNav = screen.getByRole("navigation", { name: /story navigation/i });
    const triggers = within(desktopNav).getAllByRole("button").map((button) => button.textContent?.trim());
    expect(triggers.indexOf("Projects")).toBe(triggers.indexOf("Legacy") + 1);

    const projectsButton = within(desktopNav).getByRole("button", { name: "Projects" });
    fireEvent.click(projectsButton);
    expect(within(desktopNav).getByRole("link", { name: "Current project" })).toHaveAttribute(
      "href",
      "/#batumi",
    );
  });

  it("switches language and updates the document direction", async () => {
    renderChrome();

    const languageButton = screen.getAllByRole("button", { name: /change language/i })[0];
    fireEvent.click(languageButton);
    expect([...new Set([...document.querySelectorAll("[data-lang]")].map((option) => option.getAttribute("data-lang")))]).toEqual([
      "en",
      "de",
      "pl",
      "sl",
      "ru",
    ]);
    fireEvent.click(screen.getAllByRole("button", { name: /Slovenščina/i })[0]);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "sl");
      expect(document.documentElement).toHaveAttribute("dir", "ltr");
    });
    await waitFor(() => {
      const translatedTriggers = [...document.querySelectorAll("[data-language-trigger='true']")]
        .filter((trigger) => /jezik/i.test(trigger.getAttribute("aria-label") ?? ""));
      expect(translatedTriggers.length).toBeGreaterThan(0);
      expect(translatedTriggers[0]).toHaveTextContent("SL");
    });
  });

  it("closes the language menu from outside and restores its opener", async () => {
    renderChrome();

    const languageButton = screen.getAllByRole("button", { name: /change language/i })[0];
    languageButton.focus();
    fireEvent.click(languageButton);
    expect(languageButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(document.body);
    await waitFor(() => {
      expect(languageButton).toHaveAttribute("aria-expanded", "false");
      expect(languageButton).toHaveFocus();
    });
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
    expect(within(mobileMenu as HTMLElement).getByRole("link", { name: "Current project" })).toHaveAttribute(
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

  it.each([
    ["en", "Download brochure", "/aixco-global-op2/documents/reverance-brochure-en.pdf", "Reverance-brochure-EN.pdf"],
    ["de", "Broschüre herunterladen", "/aixco-global-op2/documents/reverance-brochure-de.pdf", "Reverance-brochure-DE.pdf"],
    ["sl", "Prenesite brošuro", "/aixco-global-op2/documents/reverance-brochure-en.pdf", "Reverance-brochure-EN.pdf"],
  ] as const)(
    "gates the %s current-project brochure behind the contact flow",
    async (lang, label, href, fileName) => {
      localStorage.setItem("aixco-lang", lang);
      render(
        <I18nProvider>
          <UIProvider>
            <CurrentProjectBrochureLink />
            <ModalProbe />
          </UIProvider>
        </I18nProvider>,
      );

      const link = await screen.findByRole("link", { name: label });
      expect(link).toHaveAttribute("href", "?modal=contact&intent=brochure");
      expect(link).not.toHaveAttribute("download");
      expect(link).toHaveAttribute("data-current-project-brochure", lang);

      fireEvent.click(link);
      expect(screen.getByLabelText("active modal")).toHaveTextContent("contact");
      expect(screen.getByLabelText("active modal data")).toHaveTextContent(href);
      expect(screen.getByLabelText("active modal data")).toHaveTextContent(fileName);
    },
  );

  it("links directly to the localized brochure after downloads have been unlocked", async () => {
    localStorage.setItem("aixco-lang", "de");
    grantDownloadAccess();

    render(
      <I18nProvider>
        <UIProvider>
          <CurrentProjectBrochureLink />
          <ModalProbe />
        </UIProvider>
      </I18nProvider>,
    );

    const link = await screen.findByRole("link", { name: "Broschüre herunterladen" });
    await waitFor(() => {
      expect(link).toHaveAttribute("href", "/aixco-global-op2/documents/reverance-brochure-de.pdf");
    });
    expect(link).toHaveAttribute("download", "Reverance-brochure-DE.pdf");
    expect(link).not.toHaveAttribute("aria-haspopup");
    expect(screen.getByLabelText("active modal")).toHaveTextContent("none");
  });

  it.each(["pl", "ru"])(
    "keeps the current-project brochure hidden for %s until a localized file exists",
    async (lang) => {
      localStorage.setItem("aixco-lang", lang);
      const { container } = render(
        <I18nProvider>
          <UIProvider>
            <CurrentProjectBrochureLink />
          </UIProvider>
        </I18nProvider>,
      );

      await waitFor(() => {
        expect(document.documentElement).toHaveAttribute("lang", lang);
      });
      expect(container.querySelector("[data-current-project-brochure]")).not.toBeInTheDocument();
    },
  );
});
