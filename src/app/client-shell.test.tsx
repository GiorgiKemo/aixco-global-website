import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClientShell } from "./client-shell";

const idleState = vi.hoisted(() => ({ ready: false }));

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
  useIdleReady: () => idleState.ready,
  scheduleIdleWork: (callback: () => void) => {
    const handle = window.setTimeout(callback, 0);
    return () => window.clearTimeout(handle);
  },
}));

vi.mock("@/components/ScrollManager", () => ({ ScrollManager: () => null }));
vi.mock("@/components/ScrollToTopButton", () => ({ ScrollToTopButton: () => <div data-testid="scroll-to-top" /> }));
vi.mock("@/components/Modals", () => ({ Modals: () => <div data-testid="modals" /> }));
vi.mock("@/components/ChatWidget", () => ({ ChatWidget: () => <div data-testid="chat-widget" /> }));
vi.mock("@/components/ui/toaster", () => ({ Toaster: () => <div data-testid="toaster" /> }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => <div data-testid="sonner" /> }));

describe("ClientShell", () => {
  beforeEach(() => {
    idleState.ready = false;
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
    expect(screen.queryByTestId("toaster")).not.toBeInTheDocument();

    idleState.ready = true;
    rerender(
      <ClientShell initialSiteContentSource="supabase">
        <main>Page content</main>
      </ClientShell>,
    );

    expect(await screen.findByTestId("chat-widget")).toBeInTheDocument();
    expect(await screen.findByTestId("modals")).toBeInTheDocument();
    expect(await screen.findByTestId("toaster")).toBeInTheDocument();
  });
});
