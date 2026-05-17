import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("keeps non-critical logo instances lazy by default", () => {
    const { container } = render(<Logo />);

    const image = container.querySelector("img");

    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("fetchpriority", "auto");
  });

  it("allows the first-viewport logo mark to be promoted explicitly", () => {
    const { container } = render(<Logo preloadMark />);

    const image = container.querySelector("img");

    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
  });
});
