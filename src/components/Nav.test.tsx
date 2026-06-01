import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useLayoutEffect } from "react";
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

vi.mock("./nav/use-nav-responsive-mode", () => ({
  useNavResponsiveMode: ({
    setCompactNav,
    setDesktopActionsAvailable,
  }: {
    setCompactNav: (value: boolean) => void;
    setDesktopActionsAvailable: (value: boolean) => void;
  }) => {
    useLayoutEffect(() => {
      const width = window.innerWidth;
      if (width < 1180) {
        setCompactNav(true);
        setDesktopActionsAvailable(false);
        return;
      }

      setCompactNav(false);
      setDesktopActionsAvailable(width >= 1536);
    }, [setCompactNav, setDesktopActionsAvailable]);
  },
}));

class TestResizeObserver {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}

function renderNav(initialEntry = "/") {
  window.history.replaceState({}, "", initialEntry);

  return render(
    <I18nProvider>
      <UIProvider>
        <Nav />
      </UIProvider>
    </I18nProvider>,
  );
}

function desktopNavIsActive(container: HTMLElement) {
  const primary = container.querySelector('nav[aria-label="Primary"]');
  return primary?.className.includes("min-[1180px]:flex") ?? false;
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

  it("uses shorter Georgian labels in the desktop navbar without changing the drawer labels", async () => {
    localStorage.setItem("aixco-lang", "ka");

    renderNav();

    const primary = screen.getByLabelText("Primary");
    await waitFor(() => {
      expect(within(primary).getByRole("link", { name: "მონაწილეობის გზები" })).toBeInTheDocument();
    });

    const mobile = (() => {
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      return screen.getByLabelText("Mobile");
    })();
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

  it("marks the closed compact drawer inert until the menu is opened", () => {
    const { container } = renderNav();

    const drawer = container.querySelector("[data-mobile-drawer]");
    expect(drawer).toHaveAttribute("inert");
    expect(drawer).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(drawer).not.toHaveAttribute("inert");
    expect(drawer).not.toHaveAttribute("aria-hidden");
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
    fireEvent.click(within(primary).getByRole("link", { name: "How to work with AIXCO" }));

    expect(replaceLocationHash).toHaveBeenCalledWith("#participate");
    expect(scrollToHash).toHaveBeenCalledWith("#participate");
    expect(scrollToPageTop).not.toHaveBeenCalled();
  });

  it("returns home from a section hash with one logo click", () => {
    window.history.replaceState({}, "", "/#about");
    renderNav("/#about");

    fireEvent.click(screen.getByRole("link", { name: /aixco\.global home/i }));

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

    fireEvent.click(screen.getByRole("link", { name: /aixco\.global home/i }));
    vi.clearAllMocks();

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(syncLocationHashToActiveSection).not.toHaveBeenCalled();
    expect(replaceLocationHash).toHaveBeenCalledWith("");
  });

  it("closes the compact menu when the logo returns home", () => {
    window.history.replaceState({}, "", "/#about");
    renderNav("/");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /aixco\.global home/i }));

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("cancels pending section scroll timers when the logo returns home", () => {
    vi.useFakeTimers();
    renderNav("/");

    const primary = screen.getByLabelText("Primary");
    fireEvent.click(within(primary).getByRole("link", { name: "How to work with AIXCO" }));

    vi.clearAllMocks();
    fireEvent.click(screen.getByRole("link", { name: /aixco\.global home/i }));
    vi.advanceTimersByTime(1200);

    expect(replaceLocationHash).toHaveBeenCalledWith("");
    expect(replaceLocationHash).not.toHaveBeenCalledWith("#participate");
    expect(scrollToHash).not.toHaveBeenCalledWith("#participate", "auto");

    vi.useRealTimers();
  });

  it("cancels pending section scroll timers when the user starts scrolling", () => {
    vi.useFakeTimers();
    renderNav("/");

    const primary = screen.getByLabelText("Primary");
    fireEvent.click(within(primary).getByRole("link", { name: "About AIXCO" }));

    vi.clearAllMocks();
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 160 }));
    vi.advanceTimersByTime(1200);

    expect(replaceLocationHash).not.toHaveBeenCalledWith("#about");
    expect(scrollToHash).not.toHaveBeenCalledWith("#about", "auto");

    vi.useRealTimers();
  });

  it("clears pending section scroll timers when the nav unmounts", () => {
    vi.useFakeTimers();
    const { unmount } = renderNav("/");

    const primary = screen.getByLabelText("Primary");
    fireEvent.click(within(primary).getByRole("link", { name: "How to work with AIXCO" }));

    vi.clearAllMocks();
    unmount();
    vi.advanceTimersByTime(1200);

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

  it("keeps desktop navigation targets large enough for reliable clicking", () => {
    renderNav();

    const primary = screen.getByLabelText("Primary");
    const aboutLink = within(primary).getByRole("link", { name: "About AIXCO" });
    const moreButton = within(primary).getByRole("button", { name: /More/ });

    expect(aboutLink.className).toContain("min-h-10");
    expect(moreButton.className).toContain("min-h-10");
  });

  it("keeps language menu options large enough for touch interaction", () => {
    renderNav();

    fireEvent.click(screen.getByRole("button", { name: /Change language/ }));

    expect(screen.getByRole("option", { name: /Deutsch/i })).toHaveClass("min-h-10");
    expect(screen.getByRole("option", { name: /ქართული/i })).toHaveClass("min-h-10");
    expect(screen.getByRole("option", { name: /العربية/i })).toHaveClass("min-h-10");
  });

  it("shows inline Login and Register whenever desktop nav is active (no 2xl gate)", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1920,
    });

    const { container } = renderNav();

    expect(desktopNavIsActive(container)).toBe(true);

    const inlineLogin = screen.getByRole("button", { name: "Login" });
    const inlineRegister = screen.getByRole("button", { name: "Register" });

    expect(inlineLogin.className).toContain("inline-flex");
    expect(inlineLogin.className).not.toContain("hidden");
    expect(inlineLogin.className).not.toContain("2xl:inline-flex");
    expect(inlineRegister.className).toContain("inline-flex");
    expect(inlineRegister.className).not.toContain("hidden");
  });

  it("keeps Login and Register reachable in the compact drawer below desktop nav width", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1100,
    });

    const { container } = renderNav();

    expect(desktopNavIsActive(container)).toBe(false);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" }).className).toContain("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const drawerLogin = screen.getAllByRole("button", { name: "Login" }).at(-1);
    const drawerRegister = screen.getAllByRole("button", { name: "Register" }).at(-1);
    expect(drawerLogin?.className).toContain("btn-ghost-gold");
    expect(drawerRegister?.className).toContain("btn-gold");
  });

  it("never leaves a dead zone: active desktop nav implies inline Login or hamburger menu", () => {
    const widths = [1280, 1366, 1440, 1536, 1920];

    for (const width of widths) {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        writable: true,
        value: width,
      });

      const { container, unmount } = renderNav();
      const desktopNavActive = desktopNavIsActive(container);
      const inlineLogin = screen.queryByRole("button", { name: "Login" });
      const menuButton = screen.queryByRole("button", { name: "Open menu" });

      if (desktopNavActive) {
        const inlineAuthVisible = inlineLogin != null && inlineLogin.className.includes("inline-flex");
        expect(inlineAuthVisible || menuButton != null).toBe(true);
        expect(inlineLogin?.className.includes("2xl:inline-flex")).not.toBe(true);
      } else {
        expect(menuButton).toBeInTheDocument();
      }

      unmount();
    }
  });
});
