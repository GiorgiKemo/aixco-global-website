// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminError from "./error";

describe("AdminError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("offers safe recovery actions without exposing error details", async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error("sensitive database detail"), {
      digest: "private-digest",
    });

    render(<AdminError error={error} reset={reset} />);

    const heading = screen.getByRole("heading", {
      name: "This admin screen could not be loaded",
    });
    await waitFor(() => expect(heading).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Admin home" })).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(
      screen.getByRole("link", { name: "Public website" }),
    ).toHaveAttribute("href", "/");
    expect(screen.queryByText("sensitive database detail")).toBeNull();
    expect(screen.queryByText("private-digest")).toBeNull();
  });
});
