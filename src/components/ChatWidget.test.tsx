import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "./ui-state";
import { ChatWidget } from "./ChatWidget";

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
});
