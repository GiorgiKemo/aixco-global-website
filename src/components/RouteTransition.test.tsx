import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouteTransition } from "./RouteTransition";

vi.mock("next/navigation", () => ({
  usePathname: () => "/reverance-batumi",
}));

describe("RouteTransition", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/reverance-batumi");
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not leave the route veil active after a hash-only history change", () => {
    const { container } = render(<RouteTransition />);
    const veil = container.querySelector(".aixco-route-veil");
    expect(veil).not.toBeNull();

    veil?.classList.add("is-active");
    window.history.replaceState({}, "", "/reverance-batumi#opportunity");

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(veil).not.toHaveClass("is-active");
    expect(veil).not.toHaveClass("is-leaving");
  });
});
