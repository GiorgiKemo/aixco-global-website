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

function renderNav() {
  return render(
    <I18nProvider>
      <UIProvider>
        <MemoryRouter>
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
});
