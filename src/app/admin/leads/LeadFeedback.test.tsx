import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeadFeedback } from "./LeadFeedback";

describe("lead workflow feedback", () => {
  it("renders status and requeue success after a POST redirect", () => {
    const view = render(<LeadFeedback updated="1" />);
    expect(screen.getByRole("status")).toHaveTextContent("Lead status updated.");

    view.rerender(<LeadFeedback requeued="2" />);
    expect(screen.getByRole("status")).toHaveTextContent("2 failed email delivery attempt(s) requeued.");
  });

  it("renders known errors and ignores forged feedback values", () => {
    const view = render(<LeadFeedback error="lead-not-found" />);
    expect(screen.getByRole("alert")).toHaveTextContent("That lead no longer exists.");

    view.rerender(<LeadFeedback requeued="not-a-count" error="unknown" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
