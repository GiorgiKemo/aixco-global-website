import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHydratedReducedMotion } from "./use-hydrated-reduced-motion";

function ReducedMotionProbe() {
  const shouldReduceMotion = useHydratedReducedMotion();

  return <div data-testid="reduced-motion-probe" data-reduced-motion={String(shouldReduceMotion)} />;
}

describe("useHydratedReducedMotion", () => {
  it("does not call Motion's reduced-motion warning path outside production", () => {
    const matchMedia = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: matchMedia,
    });

    render(<ReducedMotionProbe />);

    expect(screen.getByTestId("reduced-motion-probe")).toHaveAttribute("data-reduced-motion", "false");
    expect(matchMedia).not.toHaveBeenCalled();
  });
});
