import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "@/components/ui-state";
import { Nav } from "./Nav";

class TestResizeObserver {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}

function renderNav(initialEntry = "/") {
  return render(
    <I18nProvider>
      <UIProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Nav />
        </MemoryRouter>
      </UIProvider>
    </I18nProvider>,
  );
}

describe("Nav", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: TestResizeObserver,
    });
  });

  it("uses shorter Georgian labels in the desktop navbar without changing the drawer labels", () => {
    localStorage.setItem("aixco-lang", "ka");

    renderNav();

    const primary = screen.getByLabelText("Primary");
    const mobile = screen.getByLabelText("Mobile");
    const participateLink = within(primary).getByRole("link", { name: "მონაწილეობის გზები" });
    const howLink = within(primary).getByRole("link", { name: "როგორ მუშაობს AIXCO" });

    expect(participateLink).toHaveTextContent("გზები");
    expect(howLink).toHaveTextContent("პროცესი");
    expect(within(mobile).getByRole("link", { name: "მონაწილეობის გზები" })).toHaveTextContent(
      "მონაწილეობის გზები",
    );
    expect(within(mobile).getByRole("link", { name: "როგორ მუშაობს AIXCO" })).toHaveTextContent(
      "როგორ მუშაობს AIXCO",
    );
  });

  it("marks the hash target active before scroll sync catches up", () => {
    renderNav("/#batumi");

    const primary = screen.getByLabelText("Primary");

    expect(within(primary).getByRole("link", { name: "Batumi" })).toHaveAttribute("aria-current", "page");
    expect(within(primary).getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("uses targeted transitions for desktop nav controls", () => {
    renderNav();

    const primary = screen.getByLabelText("Primary");
    const aboutLink = within(primary).getByRole("link", { name: "About AIXCO" });
    const moreButton = within(primary).getByRole("button", { name: /More/ });

    expect(aboutLink.className).toContain("transition-[background-color,color]");
    expect(aboutLink.className).not.toContain("transition-all");
    expect(moreButton.className).toContain("transition-[background-color,color]");
    expect(moreButton.className).not.toContain("transition-all");
  });
});
