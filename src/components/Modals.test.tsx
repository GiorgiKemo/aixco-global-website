import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SiteContentContext } from "@/data/site-content-context";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
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

describe("Modals", () => {
  beforeEach(() => {
    vi.mocked(recordContactSubmission).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    document.body.style.overflow = "";
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

    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("h-10", "w-10");
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

  it("does not render portal links that are outside the approved Workwise portal", () => {
    render(
      <I18nProvider>
        <SiteContentContext.Provider
          value={{
            ...siteContentDefaults,
            company: {
              ...siteContentDefaults.company,
              portals: {
                ...siteContentDefaults.company.portals,
                customerLogin: "https://workw.com.evil.example/realestate/customer/login",
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
      "https://workw.com/realestate/broker/login",
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
    const preferredTimeField = screen.getByLabelText("Preferred Time for a Call");
    expect(preferredTimeField).toHaveAttribute("type", "datetime-local");
    expect(preferredTimeField).toHaveAttribute("step", "900");
    expect(preferredTimeField.getAttribute("min")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    fireEvent.change(screen.getByLabelText("Name & Surname"), { target: { value: "Jane Client" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+995 555 010101" } });
    fireEvent.change(preferredTimeField, { target: { value: "2099-06-25T10:30" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "jane@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }).closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByText("Thank you. We will contact you shortly.")).toBeInTheDocument();
    });
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
      expect(screen.getByRole("alert")).toHaveTextContent("We could not send your request.");
    });
    expect(screen.queryByText("Thank you. We will contact you shortly.")).not.toBeInTheDocument();
  });
});
