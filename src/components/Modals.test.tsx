import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SiteContentContext } from "@/data/site-content-context";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
import {
  CONTACT_NUDGE_CONVERSION_SUPPRESSION_MS,
  getContactNudgePreferences,
  resetContactNudgePreferencesForTests,
} from "@/lib/contact-nudge-preferences";
import {
  hasDownloadAccess,
  resetDownloadAccessForTests,
} from "@/lib/download-access";
import { Modals } from "./Modals";
import { UIProvider, useUI } from "./ui-state";

vi.mock("@/lib/backend/lead-capture", () => ({
  recordContactSubmission: vi.fn(),
  recordPortalEvent: vi.fn(() => Promise.resolve({ ok: true })),
}));

function PrivacyTrigger() {
  const { openPrivacy } = useUI();

  return (
    <button type="button" onClick={openPrivacy}>
      Open privacy
    </button>
  );
}

function LoginTrigger() {
  const { openLogin } = useUI();

  return (
    <button type="button" onClick={openLogin}>
      Open login
    </button>
  );
}

function ContactTrigger() {
  const { openContact } = useUI();

  return (
    <button type="button" onClick={openContact}>
      Open contact
    </button>
  );
}

function BrochureTrigger() {
  const { openContact } = useUI();

  return (
    <button
      type="button"
      onClick={() =>
        openContact({
          kind: "download",
          downloadHref: "/aixco-global-op2/documents/reverance-brochure-en.pdf",
          downloadFileName: "Reverance-brochure-EN.pdf",
        })
      }
    >
      Open brochure form
    </button>
  );
}

describe("Modals", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    resetContactNudgePreferencesForTests();
    resetDownloadAccessForTests();
    vi.mocked(recordContactSubmission).mockResolvedValue({ ok: true, reference: "AIX-2026-000018" });
  });

  afterEach(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.history.replaceState({}, "", "/");
    resetContactNudgePreferencesForTests();
    resetDownloadAccessForTests();
    vi.clearAllMocks();
  });

  it("gives legal dialogs an accessible name", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    expect(screen.getByRole("dialog", { name: "Privacy Policy" })).toBeInTheDocument();
  });

  it("opens the contact dialog from the progressive-enhancement URL contract", () => {
    window.history.replaceState({}, "", "/?modal=contact");

    render(
      <I18nProvider>
        <UIProvider>
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    expect(screen.getByRole("dialog", { name: "Contact AIXCO" })).toBeInTheDocument();
  });

  it("traps focus, isolates the page, and restores the opener when dismissed", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    const opener = screen.getByRole("button", { name: /open privacy/i });
    opener.focus();
    fireEvent.click(opener);

    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).toHaveFocus();
    expect(opener).toHaveAttribute("aria-hidden", "true");

    fireEvent.keyDown(window, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(opener).not.toHaveAttribute("aria-hidden");
  });

  it("uses a comfortable tap target for the modal close control", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("h-11", "w-11");
  });

  it("allows translated dialog copy to wrap inside narrow screens", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveClass("[overflow-wrap:anywhere]");
    expect(dialog).toHaveClass("bg-surface-elevated");
    expect(dialog.className).not.toContain("glass");
  });

  it("uses a dedicated smooth backdrop transition instead of the global page fade", () => {
    const { container } = render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    const modalShell = container.querySelector(".modal-shell");
    const modalBackdrop = container.querySelector(".modal-backdrop");
    const dialog = screen.getByRole("dialog");

    expect(modalShell).toBeInTheDocument();
    expect(modalShell?.className).not.toContain("animate-fade-in");
    expect(modalBackdrop).toBeInTheDocument();
    expect(modalBackdrop?.className).toContain("backdrop-blur-lg");
    expect(modalBackdrop?.className).toContain("bg-transparent");
    expect(modalBackdrop?.className).not.toContain("bg-background");
    expect(dialog).toHaveClass("modal-panel");
    expect(dialog.className).not.toContain("animate-scale-in");
  });

  it("fits the contact dialog to its form instead of leaving an empty side column", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <ContactTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open contact/i }));

    const dialog = screen.getByRole("dialog");
    const contactContent = dialog.querySelector(".contact-request-modal");

    expect(dialog).toHaveClass("max-w-4xl");
    expect(dialog).not.toHaveClass("max-w-5xl");
    expect(contactContent).toHaveClass("w-full");
    expect(contactContent).not.toHaveClass("max-w-3xl");
    expect(getContactNudgePreferences().openedThisSession).toBe(true);
  });

  it("restores the previous body overflow value after closing", () => {
    document.body.style.overflow = "clip";

    render(
      <I18nProvider>
        <UIProvider>
          <PrivacyTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open privacy/i }));

    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("clip");
  });

  it("does not render portal links outside the approved AIXCO role portals", () => {
    render(
      <I18nProvider>
        <SiteContentContext.Provider
          value={{
            ...siteContentDefaults,
            company: {
              ...siteContentDefaults.company,
              portals: {
                ...siteContentDefaults.company.portals,
                customerLogin: "https://customer.aixco.global.evil.example/",
              },
            },
          }}
        >
          <UIProvider>
            <LoginTrigger />
            <Modals />
          </UIProvider>
        </SiteContentContext.Provider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open login/i }));

    expect(screen.queryByRole("link", { name: "Customer Login" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Broker Login" })).toHaveAttribute(
      "href",
      "https://broker.aixco.global/",
    );
  });

  it("opens the contact request modal with call and email choices", () => {
    render(
      <I18nProvider>
        <UIProvider>
          <ContactTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open contact/i }));

    expect(screen.getByRole("dialog", { name: "Contact AIXCO" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Schedule a Call" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send an Email" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Message")).not.toBeInTheDocument();
  });

  it("collects contact details once, unlocks every download, and starts the requested file", async () => {
    const downloadClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(
      <I18nProvider>
        <UIProvider>
          <BrochureTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open brochure form" }));

    expect(screen.getByRole("dialog", { name: "Unlock downloads" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Schedule a Call" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Country code")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Name & Surname"), { target: { value: "Jane Client" } });
    fireEvent.change(screen.getByLabelText("Country code"), { target: { value: "GE" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "555 123 456" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "jane@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: "Unlock and download" }).closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByText("All downloads are now unlocked.")).toBeInTheDocument();
    });
    expect(recordContactSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        interest: "Download access",
        phone: "+995555123456",
        message: expect.stringContaining("Reverance-brochure-EN.pdf"),
      }),
      expect.objectContaining({ locale: "en" }),
    );
    expect(hasDownloadAccess()).toBe(true);
    const downloadLink = screen.getByRole("link", { name: "Download file" });
    expect(downloadLink).toHaveAttribute("href", "/aixco-global-op2/documents/reverance-brochure-en.pdf");
    expect(downloadLink).toHaveAttribute("download", "Reverance-brochure-EN.pdf");
    await waitFor(() => expect(downloadClick).toHaveBeenCalled());
    downloadClick.mockRestore();
  });

  it("does not unlock downloads when the contact submission fails", async () => {
    vi.mocked(recordContactSubmission).mockResolvedValueOnce({
      ok: false,
      reason: "Lead capture is unavailable.",
    });

    render(
      <I18nProvider>
        <UIProvider>
          <BrochureTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open brochure form" }));
    fireEvent.change(screen.getByLabelText("Name & Surname"), { target: { value: "Jane Client" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "555 123 456" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "jane@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: "Unlock and download" }).closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("The contact service is temporarily unavailable.");
    });
    expect(hasDownloadAccess()).toBe(false);
  });

  it("rejects an invalid phone number for the selected country before submission", async () => {
    render(
      <I18nProvider>
        <UIProvider>
          <ContactTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open contact/i }));
    fireEvent.click(screen.getByRole("button", { name: "Schedule a Call" }));
    fireEvent.change(screen.getByLabelText("Name & Surname"), { target: { value: "Test Client" } });
    fireEvent.change(screen.getByLabelText("Country code"), { target: { value: "SI" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "123123" } });
    fireEvent.change(screen.getByLabelText("Preferred Time for a Call"), {
      target: { value: "2099-06-25T10:37" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "client@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }).closest("form") as HTMLFormElement);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please enter a valid phone number for the selected country.",
    );
    expect(recordContactSubmission).not.toHaveBeenCalled();
  });

  it("submits the schedule-call request and shows confirmation", async () => {
    render(
      <I18nProvider>
        <UIProvider>
          <ContactTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open contact/i }));
    fireEvent.click(screen.getByRole("button", { name: "Schedule a Call" }));
    expect(screen.getByLabelText("Country code")).toBeInTheDocument();
    const preferredTimeField = screen.getByLabelText("Preferred Time for a Call");
    expect(preferredTimeField).toHaveAttribute("type", "datetime-local");
    expect(preferredTimeField).toHaveAttribute("step", "any");
    expect(preferredTimeField.getAttribute("min")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    fireEvent.change(screen.getByLabelText("Name & Surname"), { target: { value: "Jane Client" } });
    fireEvent.change(screen.getByLabelText("Country code"), { target: { value: "GE" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "555 010101" } });
    fireEvent.change(preferredTimeField, { target: { value: "2099-06-25T10:37" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "jane@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }).closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByText("Thank you. We will contact you shortly.")).toBeInTheDocument();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Request reference: AIX-2026-000018");
    expect(recordContactSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ interest: "Schedule a Call", phone: "+995555010101" }),
      expect.objectContaining({
        antiAbuse: {
          website: "",
          startedAt: expect.any(Number),
        },
        locale: "en",
      }),
    );
    const nudgePreferences = getContactNudgePreferences();
    expect(nudgePreferences.convertedUntil).toBeGreaterThanOrEqual(
      Date.now() + CONTACT_NUDGE_CONVERSION_SUPPRESSION_MS - 1_000,
    );
  });

  it("submits the email request and shows confirmation", async () => {
    render(
      <I18nProvider>
        <UIProvider>
          <ContactTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open contact/i }));
    fireEvent.click(screen.getByRole("button", { name: "Send an Email" }));
    fireEvent.change(screen.getByLabelText("Name & Surname"), { target: { value: "Alex Client" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "alex@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Please send me more information." } });
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }).closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByText("Thank you. We will contact you shortly.")).toBeInTheDocument();
    });
    expect(recordContactSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ interest: "Send an Email" }),
      expect.objectContaining({
        antiAbuse: {
          website: "",
          startedAt: expect.any(Number),
        },
        locale: "en",
      }),
    );
  });

  it("does not show a false confirmation when contact capture fails", async () => {
    vi.mocked(recordContactSubmission).mockResolvedValueOnce({
      ok: false,
      reason: "Supabase admin configuration is not available.",
    });

    render(
      <I18nProvider>
        <UIProvider>
          <ContactTrigger />
          <Modals />
        </UIProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open contact/i }));
    fireEvent.click(screen.getByRole("button", { name: "Schedule a Call" }));
    fireEvent.change(screen.getByLabelText("Name & Surname"), { target: { value: "Jane Client" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+995 555 010101" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "jane@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }).closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("The contact service is temporarily unavailable.");
    });
    expect(screen.queryByText("Thank you. We will contact you shortly.")).not.toBeInTheDocument();
  });
});
