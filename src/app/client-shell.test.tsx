import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClientShell } from "./client-shell";

vi.mock("@/components/ScrollManager", () => ({ ScrollManager: () => null }));
vi.mock("@/components/Modals", () => ({ Modals: () => null }));
vi.mock("@/components/ChatWidget", () => ({ ChatWidget: () => null }));

describe("ClientShell", () => {
  it("renders the app shell without a top-level animation provider", () => {
    render(
      <ClientShell initialSiteContentSource="supabase">
        <main>Page content</main>
      </ClientShell>,
    );

    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});
