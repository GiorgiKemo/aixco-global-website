import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrivateClientAdvisoryLandingPage } from "./PrivateClientAdvisoryLandingPage";

const testState = vi.hoisted(() => ({
  lang: "en" as "en" | "de",
  setLang: vi.fn(),
  openPrivacy: vi.fn(),
  openTerms: vi.fn(),
  openAnalyticsPreferences: vi.fn(),
  recordContactSubmission: vi.fn(),
}));

vi.mock("@/i18n/I18nProvider", () => ({
  LANGS: [
    { code: "en", label: "English", native: "EN" },
    { code: "de", label: "Deutsch", native: "DE" },
  ],
  useI18n: () => ({ lang: testState.lang, setLang: testState.setLang }),
}));

vi.mock("@/components/ui-state", () => ({
  useUI: () => ({ openPrivacy: testState.openPrivacy, openTerms: testState.openTerms }),
}));

vi.mock("@/lib/backend/lead-capture", () => ({
  recordContactSubmission: testState.recordContactSubmission,
}));

vi.mock("@/lib/contact-submit-error", () => ({
  getContactSubmitErrorMessage: () => "Please try again.",
}));

vi.mock("@/lib/analytics/client", () => ({
  openAnalyticsPreferences: testState.openAnalyticsPreferences,
}));

describe("PrivateClientAdvisoryLandingPage", () => {
  beforeEach(() => {
    testState.lang = "en";
    vi.clearAllMocks();
    testState.recordContactSubmission.mockResolvedValue({ ok: true, reference: "AIXCO-123" });
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders the editorial page and exercises navigation, language, and footer controls", async () => {
    render(<PrivateClientAdvisoryLandingPage />);

    expect(screen.getByRole("heading", { name: /Emerging Market Real Estate/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Batumi coastline and high-rise skyline at golden hour" })).toBeInTheDocument();
    expect(document.title).toContain("Emerging Market Real Estate Investment");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Request a brief" }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const languageButton = screen.getByRole("button", { name: /Change language: EN/i });
    fireEvent.click(languageButton);
    fireEvent.pointerDown(document.body);
    fireEvent.click(languageButton);
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(languageButton);
    fireEvent.click(screen.getByRole("button", { name: /DeutschDE/i }));
    expect(testState.setLang).toHaveBeenCalledWith("de");

    fireEvent.click(screen.getByRole("button", { name: "Privacy" }));
    fireEvent.click(screen.getByRole("button", { name: "Terms" }));
    fireEvent.click(screen.getByRole("button", { name: "Cookie preferences" }));
    expect(testState.openPrivacy).toHaveBeenCalledTimes(1);
    expect(testState.openTerms).toHaveBeenCalledTimes(1);
    expect(testState.openAnalyticsPreferences).toHaveBeenCalledTimes(1);
  });

  it("submits a valid briefing request and can start another request", async () => {
    render(<PrivateClientAdvisoryLandingPage />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Ada Lovelace" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Area of interest"), { target: { value: "AIXCO Global Bond" } });
    fireEvent.change(screen.getByLabelText("Your message"), { target: { value: "I would like an investment brief, please." } });
    fireEvent.click(screen.getByLabelText(/By sending this form/i));
    fireEvent.click(screen.getByRole("button", { name: "Request an investment brief" }));

    await waitFor(() => expect(screen.getByText("Your request is with us.")).toBeInTheDocument());
    expect(testState.recordContactSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ada Lovelace", email: "ada@example.com" }),
      expect.objectContaining({ locale: "en" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Send another request" }));
    expect(screen.getByRole("button", { name: "Request an investment brief" })).toBeInTheDocument();
  });

  it("shows a localized submission error when the contact request fails", async () => {
    testState.recordContactSubmission.mockResolvedValue({ ok: false, reason: "network" });
    render(<PrivateClientAdvisoryLandingPage />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Ada Lovelace" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Area of interest"), { target: { value: "Current projects" } });
    fireEvent.change(screen.getByLabelText("Your message"), { target: { value: "Please send current project details." } });
    fireEvent.click(screen.getByLabelText(/By sending this form/i));
    fireEvent.click(screen.getByRole("button", { name: "Request an investment brief" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not send this request.");
  });
});
