import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { createContactMailtoHref } from "./contact-mailto";
import { Contact } from "./Contact";

function renderContact() {
  return render(
    <I18nProvider>
      <Contact />
    </I18nProvider>,
  );
}

describe("Contact", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("builds a mailto handoff with the validated contact details", () => {
    const href = createContactMailtoHref({
      name: "Audit User",
      email: "audit@example.com",
      interest: "Batumi apartments",
      message: "I want more details about availability.",
    });

    expect(href).toContain("mailto:info@aixco.global");
    expect(decodeURIComponent(href)).toContain("Name: Audit User");
    expect(decodeURIComponent(href)).toContain("Email: audit@example.com");
    expect(decodeURIComponent(href)).toContain("Interest: Batumi apartments");
    expect(decodeURIComponent(href)).toContain("I want more details about availability.");
  });

  it("does not claim a message was sent before the visitor opens their email draft", async () => {
    renderContact();

    fireEvent.change(screen.getByPlaceholderText("Name*"), { target: { value: "Audit User" } });
    fireEvent.change(screen.getByPlaceholderText("Email*"), { target: { value: "audit@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Participation interest"), { target: { value: "Batumi apartments" } });
    fireEvent.change(screen.getByPlaceholderText("Message*"), {
      target: { value: "I want more details about availability." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Contact AIXCO" }));

    await waitFor(() => {
      expect(screen.getByText("Your email draft is ready.")).toBeInTheDocument();
    });
    expect(screen.queryByText("Thank you, your message has been sent.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open email draft" })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:info@aixco.global"),
    );
  });
});
