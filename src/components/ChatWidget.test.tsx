import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "./ui-state";
import { ChatWidget } from "./ChatWidget";

function setPageScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
}

function renderWidget() {
  return render(
    <I18nProvider>
      <UIProvider>
        <ChatWidget />
      </UIProvider>
    </I18nProvider>,
  );
}

describe("ChatWidget", () => {
  beforeEach(() => {
    localStorage.clear();
    setPageScrollY(0);
  });

  it("opens a live chat panel, sends a visitor message, and prepares an email transcript", () => {
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "I want to invest in Batumi apartments." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    expect(screen.getByText("I want to invest in Batumi apartments.")).toBeInTheDocument();
    expect(screen.getByText(/AIXCO team can help with Batumi apartments/i)).toBeInTheDocument();

    const emailTranscript = screen.getByRole("link", { name: /email transcript/i });
    expect(emailTranscript).toHaveAttribute("href", expect.stringContaining("mailto:info@aixco.global"));
    expect(emailTranscript).toHaveAttribute("href", expect.stringContaining("Batumi%20apartments"));
  });

  it("uses the message circle icon for the launcher", () => {
    const { container } = renderWidget();

    expect(container.querySelector('[data-chat-launcher-icon="message-circle-more"]')).toBeInTheDocument();
    expect(container.querySelector("[data-chat-support-lottie]")).not.toBeInTheDocument();
  });

  it("keeps the online indicator inset inside the launcher", () => {
    const { container } = renderWidget();
    const indicator = container.querySelector('[data-chat-online-indicator="true"]');

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass("right-1", "top-1");
  });

  it("bounds the open chat panel to short mobile viewports", () => {
    const { container } = renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).toHaveClass(
      "flex",
      "bg-surface-elevated/95",
      "sm:mr-16",
      "md:mr-20",
      "h-[min(640px,calc(100svh-6.5rem))]",
      "max-h-[calc(100svh-6.5rem)]",
    );
    expect(container.querySelector("[data-chat-messages]")).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(container.querySelector("[data-chat-quick-replies]")).toHaveClass("grid", "grid-cols-2");
    expect(container.querySelector("[data-chat-quick-replies]")).not.toHaveClass("overflow-x-auto");
  });

  it("keeps chat controls large enough for touch interaction", () => {
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    const dialog = screen.getByRole("dialog", { name: /aixco live chat/i });
    expect(within(dialog).getByRole("button", { name: /close live chat/i })).toHaveClass("h-10", "w-10");
    expect(screen.getByRole("button", { name: /minimize live chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AIXCO 6% Bond" })).toHaveClass("min-h-10", "whitespace-normal");
    expect(screen.getByRole("link", { name: /email transcript/i })).toHaveClass("btn-ghost-gold");
    expect(screen.getByRole("button", { name: "Register" })).toHaveClass("min-h-10");
    expect(screen.getByRole("button", { name: "Clear" })).toHaveClass("min-h-10");
  });

  it("opens the chat panel above the right-side scroll button after the page is scrolled", () => {
    const { container } = renderWidget();

    setPageScrollY(720);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    const floatingContainer = container.querySelector("[data-chat-floating-container]");
    expect(floatingContainer).toHaveAttribute("data-page-scrolled", "true");
    expect(floatingContainer).toHaveClass("gap-24", "md:gap-28");
  });
});
