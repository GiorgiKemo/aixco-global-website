import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { scrollToPageTop } from "@/lib/smooth-scroll";
import { ScrollToTopButton } from "./ScrollToTopButton";

vi.mock("@/lib/smooth-scroll", () => ({
  scrollToPageTop: vi.fn(),
}));

function setPageScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
}

function renderScrollToTopButton() {
  return render(
    <I18nProvider>
      <ScrollToTopButton />
    </I18nProvider>,
  );
}

describe("ScrollToTopButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    delete document.documentElement.dataset.homeExperience;
    setPageScrollY(0);
  });

  it("appears after scrolling down and returns the page to the top", () => {
    renderScrollToTopButton();

    expect(screen.queryByRole("button", { name: /scroll to top/i })).not.toBeInTheDocument();

    setPageScrollY(720);
    fireEvent.scroll(window);

    const button = screen.getByRole("button", { name: /scroll to top/i });
    expect(button).toHaveAttribute("data-scroll-to-top-button", "true");
    expect(button).toHaveClass("fixed", "z-[94]", "icon-button-glass");
    expect(button.className).toContain("safe-area-inset-bottom");
    expect(button.className).toContain("safe-area-inset-left");
    expect(button).not.toHaveClass("bg-primary", "text-primary-foreground");

    fireEvent.click(button);

    expect(scrollToPageTop).toHaveBeenCalledTimes(1);
  });

  it("uses the same scroll-to-top control on the main story page", () => {
    document.documentElement.dataset.homeExperience = "story";
    setPageScrollY(720);

    renderScrollToTopButton();

    expect(screen.getByRole("button", { name: /scroll to top/i })).toHaveAttribute(
      "data-scroll-to-top-button",
      "true",
    );
  });
});
