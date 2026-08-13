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

    expect(screen.getByRole("link", { name: "7d" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "7d" })).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("link", { name: "24 hours" })).toHaveAttribute(
      "href",
      "/admin/analytics?range=24h&focus=sessions",
    );
    expect(screen.getByRole("link", { name: "Refresh" })).toHaveAttribute(
      "href",
      "/admin/analytics?range=7d&focus=sessions",
    );
  });
});
