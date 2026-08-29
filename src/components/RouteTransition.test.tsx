import { act, fireEvent, render } from "@testing-library/react";
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

  it("does not activate the veil for modal-intent links", () => {
    const { container } = render(<RouteTransition />);
    const veil = container.querySelector(".aixco-route-veil");
    const link = document.createElement("a");
    link.href = "/?modal=contact";
    link.textContent = "Open contact modal";
    document.body.append(link);

    fireEvent.click(link);

    expect(veil).not.toHaveClass("is-active");
    expect(veil).not.toHaveClass("is-leaving");
    link.remove();
  });

  it("activates the veil for plain internal page links", () => {
    const { container } = render(<RouteTransition />);
    const veil = container.querySelector(".aixco-route-veil");
    const link = document.createElement("a");
    link.href = "/georgia-tax-residency";
    link.textContent = "Georgia tax residency";
    document.body.append(link);

    fireEvent.click(link);

    expect(veil).toHaveClass("is-active");
    link.remove();
  });
});
