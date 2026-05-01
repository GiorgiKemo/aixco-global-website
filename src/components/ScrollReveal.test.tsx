import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScrollReveal } from "./ScrollReveal";

const originalIntersectionObserver = window.IntersectionObserver;

describe("ScrollReveal", () => {
  const observers: Array<{ observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = [];

  afterEach(() => {
    observers.length = 0;
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: originalIntersectionObserver,
    });
  });

  it("arms targets and reveals them when IntersectionObserver is unavailable", async () => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const { container } = render(
      <ScrollReveal>
        <section>
          <h2 className="scroll-reveal" data-testid="heading">
            Batumi projects
          </h2>
          <article data-reveal="true" data-testid="card">
            <img alt="Batumi skyline" src="/batumi.jpg" />
          </article>
        </section>
      </ScrollReveal>,
    );

    const root = container.querySelector('[data-motion-reveal-root]');
    const heading = container.querySelector('[data-testid="heading"]');
    const card = container.querySelector('[data-testid="card"]');
    const image = container.querySelector('img[alt="Batumi skyline"]');

    expect(root).toBeInTheDocument();

    await waitFor(() => {
      expect(heading).toHaveAttribute("data-motion-reveal", "visible");
      expect(card).toHaveAttribute("data-motion-reveal", "visible");
    });

    expect(image).toHaveAttribute("data-motion-reveal-media", "true");
  });

  it("observes reveal targets instead of the display-contents wrapper", () => {
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();

      constructor() {
        observers.push(this);
      }
    }

    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver,
    });

    const { container } = render(
      <ScrollReveal>
        <section>
          <h2 className="scroll-reveal" data-testid="heading">
            About
          </h2>
          <article className="scroll-reveal" data-testid="card">
            Details
          </article>
        </section>
      </ScrollReveal>,
    );

    const root = container.querySelector('[data-motion-reveal-root]');
    const heading = container.querySelector('[data-testid="heading"]');
    const card = container.querySelector('[data-testid="card"]');

    expect(observers[0].observe).toHaveBeenCalledWith(heading);
    expect(observers[0].observe).toHaveBeenCalledWith(card);
    expect(observers[0].observe).not.toHaveBeenCalledWith(root);
  });
});
