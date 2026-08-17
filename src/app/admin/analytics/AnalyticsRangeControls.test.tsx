// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { AnalyticsRangeControls } from "./AnalyticsRangeControls";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
  useLinkStatus: () => ({ pending: false }),
}));

describe("AnalyticsRangeControls", () => {
  it("prefetches every range and preserves the focused dashboard", () => {
    render(
      <AnalyticsRangeControls
        focus="sessions"
        range="7d"
        options={[
          { label: "24 hours", value: "24h" },
          { label: "7d", value: "7d" },
          { label: "30d", value: "30d" },
          { label: "90d", value: "90d" },
        ]}
      />,
    );

    const selectedRange = screen.getByRole("link", { name: "7d" });
    expect(selectedRange).toHaveAttribute("aria-current", "page");
    expect(selectedRange).toHaveAttribute("data-selected", "true");
    expect(selectedRange).toHaveClass("min-h-11", "focus-visible:ring-[#7c5d17]");
    expect(selectedRange).not.toHaveClass("min-h-10", "focus-visible:ring-primary/50");
    expect(screen.getByRole("link", { name: "24 hours" })).toHaveAttribute(
      "href",
      "/admin/analytics?range=24h&focus=sessions",
    );
    const refresh = screen.getByRole("link", { name: "Refresh" });
    expect(refresh).toHaveAttribute(
      "href",
      "/admin/analytics?range=7d&focus=sessions",
    );
    expect(refresh).toHaveClass("min-h-11", "focus-visible:ring-[#7c5d17]");
  });
});
