import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ClientShell } from "./client-shell";

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

vi.mock("@/components/ScrollManager", () => ({ ScrollManager: () => null }));
vi.mock("@/components/Modals", () => ({ Modals: () => null }));
vi.mock("@/components/ChatWidget", () => ({ ChatWidget: () => null }));

describe("ClientShell", () => {
  it("disables Motion's reduced-motion override in local/test environments", () => {
    render(
      <ClientShell initialSiteContentSource="supabase">
        <main>Page content</main>
      </ClientShell>,
    );

    expect(screen.getByTestId("motion-config")).toHaveAttribute("data-reduced-motion", "never");
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});
