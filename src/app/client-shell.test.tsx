import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClientShell } from "./client-shell";

const idleState = vi.hoisted(() => ({ delayedReady: false }));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");

  return {
    ...actual,
    MotionConfig: ({
      children,
      reducedMotion,
    }: {
      children: ReactNode;
      reducedMotion?: "always" | "never" | "user";
    }) => (
      <div data-testid="motion-config" data-reduced-motion={reducedMotion}>
        {children}
      </div>
    ),
  };
});

vi.mock("@/hooks/use-idle-ready", () => ({
  useDelayedIdleReady: () => idleState.delayedReady,
  scheduleIdleWork: (callback: () => void) => {
    const handle = window.setTimeout(callback, 0);
    return () => window.clearTimeout(handle);
  },
}));

vi.mock("@/components/ScrollManager", () => ({ ScrollManager: () => null }));
vi.mock("@/components/ScrollToTopButton", () => ({ ScrollToTopButton: () => <div data-testid="scroll-to-top" /> }));
vi.mock("@/components/Modals", () => ({ Modals: () => <div data-testid="modals" /> }));
vi.mock("@/components/ChatWidget", () => ({ ChatWidget: () => <div data-testid="chat-widget" /> }));

describe("ClientShell", () => {
  beforeEach(() => {
    idleState.delayedReady = false;
  });

  it("renders children without a global Framer Motion provider", () => {
    render(
      <ClientShell initialSiteContentSource="supabase">
        <main>Page content</main>
      </ClientShell>,
    );

    expect(screen.queryByTestId("motion-config")).not.toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("defers noncritical floating UI until the browser is idle", async () => {
    const { rerender } = render(
      <ClientShell initialSiteContentSource="supabase">
        <main>Page content</main>
      </ClientShell>,
    );

    expect(screen.queryByTestId("chat-widget")).not.toBeInTheDocument();
    expect(screen.queryByTestId("modals")).not.toBeInTheDocument();

    idleState.delayedReady = true;
    rerender(
      <ClientShell initialSiteContentSource="supabase">
        <main>Page content</main>
      </ClientShell>,
    );

    expect(await screen.findByTestId("modals")).toBeInTheDocument();
    expect(await screen.findByTestId("chat-widget")).toBeInTheDocument();
  });
});
