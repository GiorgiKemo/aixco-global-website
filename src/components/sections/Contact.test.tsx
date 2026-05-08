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

  it("rejects unsafe mailto recipients from published content", () => {
    const href = createContactMailtoHref(
      {
        name: "Audit User",
        email: "audit@example.com",
        interest: "Batumi apartments",
        message: "I want more details about availability.",
      },
      "info@aixco.global\r\nbcc:attacker@example.com",
    );

    expect(href).toContain("mailto:info@aixco.global");
    expect(href).not.toContain("bcc:");
  });

  it("exposes durable labels for every contact form field", () => {
    renderContact();

    expect(screen.getByRole("textbox", { name: "Name*" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email*" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Participation interest" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Message*" })).toBeInTheDocument();
  });

  it("places the contact form before the decorative contact image in reading order", () => {
    const { container } = renderContact();

    const form = container.querySelector("form");
    const image = screen.getByAltText("Contact");

    expect(form).not.toBeNull();
    expect(form?.compareDocumentPosition(image)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("moves focus to the first invalid contact field and associates validation copy", async () => {
    renderContact();

    fireEvent.click(screen.getByRole("button", { name: "Contact AIXCO" }));

    const nameInput = await screen.findByRole("textbox", { name: "Name*" });
    await waitFor(() => expect(nameInput).toHaveFocus());
    expect(nameInput).toHaveAttribute("aria-describedby", "contact-name-error");
    expect(screen.getByText("Please enter your name")).toHaveAttribute("role", "alert");
  });

  it("does not claim a message was sent before the visitor opens their email draft", async () => {
    renderContact();

    fireEvent.change(screen.getByRole("textbox", { name: "Name*" }), { target: { value: "Audit User" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Email*" }), { target: { value: "audit@example.com" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Participation interest" }), { target: { value: "Batumi apartments" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Message*" }), {
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
