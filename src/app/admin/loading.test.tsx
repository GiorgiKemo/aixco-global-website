// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AdminLoading from "./loading";

describe("AdminLoading", () => {
  it("announces a neutral secure-workspace loading state", () => {
    const { container } = render(<AdminLoading />);

    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "true");
    expect(
      screen.getByRole("heading", { name: "Opening your workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Verifying access and loading the requested admin screen.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Admin navigation" }),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".admin-loading__grid")).toBeNull();
  });
});
