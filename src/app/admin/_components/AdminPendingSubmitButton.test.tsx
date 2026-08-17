/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminPendingSubmitButton } from "./AdminPendingSubmitButton";

describe("AdminPendingSubmitButton", () => {
  it("renders a disabled, accessible 44px submit action", () => {
    render(
      <form>
        <AdminPendingSubmitButton
          idleLabel="Send test email"
          pendingLabel="Sending test email…"
          icon="send"
          disabled
          className="min-h-11"
        />
      </form>,
    );

    const button = screen.getByRole("button", { name: "Send test email" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("min-h-11");
  });
});
