import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "@/components/ui-state";
import { replaceLocationHash, syncLocationHashToActiveSection } from "@/lib/section-hash";
import { scrollToHash, scrollToPageTop } from "@/lib/smooth-scroll";
import { Nav } from "./Nav";

vi.mock("@/lib/section-hash", () => ({
  getActiveSectionHash: vi.fn(() => ""),
  replaceLocationHash: vi.fn(),
  syncLocationHashToActiveSection: vi.fn(() => ""),
}));

vi.mock("@/lib/smooth-scroll", () => ({
  scrollToHash: vi.fn(),
  scrollToPageTop: vi.fn(),
}));

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
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/");
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: TestResizeObserver,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("uses custom same-page hash scrolling so fixed nav does not hide the target section", () => {
    renderNav("/");

    const primary = screen.getByLabelText("Primary");
    fireEvent.click(within(primary).getByRole("link", { name: "Ways to Participate" }));

    expect(replaceLocationHash).toHaveBeenCalledWith("#participate");
    expect(scrollToHash).toHaveBeenCalledWith("#participate");
    expect(scrollToPageTop).not.toHaveBeenCalled();
  });

  it("returns home from a section hash with one logo click", () => {
    window.history.replaceState({}, "", "/#about");
    renderNav("/#about");

    fireEvent.click(screen.getByRole("link", { name: /aixco global home/i }));

    expect(replaceLocationHash).toHaveBeenCalledWith("");
    expect(scrollToPageTop).toHaveBeenCalledTimes(1);

    const primary = screen.getByLabelText("Primary");
    expect(within(primary).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(within(primary).getByRole("link", { name: "About AIXCO" })).not.toHaveAttribute("aria-current");
  });

  it("keeps hash syncing suppressed while the logo return-home scroll is moving through sections", () => {
    vi.mocked(syncLocationHashToActiveSection).mockReturnValue("#about");
    window.history.replaceState({}, "", "/#dubai");
    renderNav("/#dubai");

    fireEvent.click(screen.getByRole("link", { name: /aixco global home/i }));
    vi.clearAllMocks();

    window.dispatchEvent(new Event("scroll"));

    expect(syncLocationHashToActiveSection).not.toHaveBeenCalled();
    expect(replaceLocationHash).toHaveBeenCalledWith("");
  });

  it("closes the compact menu when the logo returns home", () => {
    window.history.replaceState({}, "", "/#about");
    renderNav("/");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /aixco global home/i }));

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("cancels pending section scroll timers when the logo returns home", () => {
    vi.useFakeTimers();
    renderNav("/");

    const primary = screen.getByLabelText("Primary");
    fireEvent.click(within(primary).getByRole("link", { name: "Ways to Participate" }));

    vi.clearAllMocks();
    fireEvent.click(screen.getByRole("link", { name: /aixco global home/i }));
    vi.advanceTimersByTime(1200);

    expect(replaceLocationHash).toHaveBeenCalledWith("");
    expect(replaceLocationHash).not.toHaveBeenCalledWith("#participate");
    expect(scrollToHash).not.toHaveBeenCalledWith("#participate", "auto");

    vi.useRealTimers();
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
