import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import {
  CONTACT_NUDGE_REMINDER_DELAY_MS,
  CONTACT_NUDGE_SECOND_DISMISSAL_MS,
  resetContactNudgePreferencesForTests,
} from "@/lib/contact-nudge-preferences";
import { ContactNudge } from "./ContactNudge";
import { UIProvider, useUI } from "./ui-state";

function ModalProbe() {
  const { modal, modalData } = useUI();
  return <output data-testid="modal-state">{JSON.stringify({ modal, modalData })}</output>;
}

function setPageScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
}

describe("ContactNudge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetContactNudgePreferencesForTests();
    setPageScrollY(0);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ country: "GE" }),
      }),
    );
  });

  afterEach(() => {
    resetContactNudgePreferencesForTests();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("waits for a real scroll and 20 seconds, then opens a localized call form with the detected code", async () => {
    render(
      <I18nProvider>
        <UIProvider>
          <ContactNudge />
          <ModalProbe />
        </UIProvider>
      </I18nProvider>,
    );

    await act(async () => Promise.resolve());
    expect(screen.queryByText("Would you like us to contact you?")).not.toBeInTheDocument();

    setPageScrollY(500);
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(19_999));
    expect(screen.queryByText("Would you like us to contact you?")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("Would you like us to contact you?")).toBeInTheDocument();
    expect(screen.queryByText("Georgia +995")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Contact me" }));
    expect(screen.getByTestId("modal-state")).toHaveTextContent('"modal":"contact"');
    expect(screen.getByTestId("modal-state")).toHaveTextContent('"phoneCountry":"GE"');
    expect(screen.queryByText("Would you like us to contact you?")).not.toBeInTheDocument();
  });

  it("shows one reminder four minutes after the first dismissal, then suppresses repeated prompts", async () => {
    const view = render(
      <I18nProvider>
        <UIProvider>
          <ContactNudge />
        </UIProvider>
      </I18nProvider>,
    );

    await act(async () => Promise.resolve());
    setPageScrollY(500);
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(20_000));

    fireEvent.click(screen.getByRole("button", { name: "Dismiss contact prompt" }));
    act(() => vi.advanceTimersByTime(CONTACT_NUDGE_REMINDER_DELAY_MS - 1));
    expect(screen.queryByText("Would you like us to contact you?")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("Would you like us to contact you?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss contact prompt" }));
    act(() => vi.advanceTimersByTime(CONTACT_NUDGE_SECOND_DISMISSAL_MS - 1));
    expect(screen.queryByText("Would you like us to contact you?")).not.toBeInTheDocument();

    view.unmount();
    act(() => vi.advanceTimersByTime(1));
    render(
      <I18nProvider>
        <UIProvider>
          <ContactNudge />
        </UIProvider>
      </I18nProvider>,
    );
    act(() => vi.advanceTimersByTime(19_999));
    expect(screen.queryByText("Would you like us to contact you?")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("Would you like us to contact you?")).toBeInTheDocument();
  });

  it("does not prompt again in the same session after the contact form is opened", async () => {
    const view = render(
      <I18nProvider>
        <UIProvider>
          <ContactNudge />
          <ModalProbe />
        </UIProvider>
      </I18nProvider>,
    );

    await act(async () => Promise.resolve());
    setPageScrollY(500);
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(20_000));
    fireEvent.click(screen.getByRole("button", { name: "Contact me" }));
    expect(screen.getByTestId("modal-state")).toHaveTextContent('"modal":"contact"');

    view.unmount();
    render(
      <I18nProvider>
        <UIProvider>
          <ContactNudge />
        </UIProvider>
      </I18nProvider>,
    );
    act(() => vi.advanceTimersByTime(CONTACT_NUDGE_SECOND_DISMISSAL_MS));
    expect(screen.queryByText("Would you like us to contact you?")).not.toBeInTheDocument();
  });
});
