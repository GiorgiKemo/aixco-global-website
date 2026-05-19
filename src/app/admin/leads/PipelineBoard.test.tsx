import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PipelineBoard, type DashboardLead } from "./PipelineBoard";

const leads: DashboardLead[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    resource: "chat",
    status: "new",
    createdAt: "2026-05-19T07:27:00.000Z",
    title: "Broker partnership",
    contactLabel: "3 messages",
    interest: "Broker partnership",
    body: "Visitor wants details about broker partnership and portal access.",
    pagePath: "/#live-chat-test",
    meta: "Live chat transcript",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    resource: "contact",
    status: "contacted",
    createdAt: "2026-05-19T07:09:00.000Z",
    title: "Codex Contact Test",
    contactLabel: "codex@example.com",
    contactHref: "mailto:codex@example.com",
    interest: "Automated contact form verification",
    body: "Contact submission message.",
    pagePath: "/#contact",
    meta: "Contact form",
  },
];

describe("PipelineBoard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses responsive grid columns instead of a fixed-width horizontal board", () => {
    const { container } = render(<PipelineBoard leads={leads} />);

    const boardGrid = container.querySelector(".mt-5.grid.min-w-0");

    expect(boardGrid).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-4");
    expect(boardGrid).not.toHaveClass("min-w-[980px]", "overflow-x-auto");
  });

  it("moves a lead with pointer dragging from the card surface", async () => {
    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { configurable: true, value: setPointerCapture });
    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { configurable: true, value: releasePointerCapture });
    Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { configurable: true, value: () => true });

    render(<PipelineBoard leads={leads} />);

    const qualifiedStage = screen.getByTestId("pipeline-stage-qualified");
    const leadCard = screen.getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111");
    const originalElementFromPoint = document.elementFromPoint;
    const elementFromPoint = vi.fn(() => qualifiedStage);
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: elementFromPoint });

    fireEvent.pointerDown(leadCard, { button: 0, clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(leadCard, { clientX: 24, clientY: 10, pointerId: 1 });
    expect(screen.getByTestId("pipeline-drag-overlay")).toBeInTheDocument();
    fireEvent.pointerUp(leadCard, { clientX: 24, clientY: 10, pointerId: 1 });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/admin/leads/status",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            resource: "chat",
            id: "11111111-1111-4111-8111-111111111111",
            status: "qualified",
          }),
        }),
      );
    });

    expect(within(qualifiedStage).getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("fixed", "pointer-events-none");

    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: originalElementFromPoint });
  });

  it("moves a lead with mouse dragging from the card surface on desktop", async () => {
    render(<PipelineBoard leads={leads} />);

    const qualifiedStage = screen.getByTestId("pipeline-stage-qualified");
    const leadCard = screen.getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111");
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: vi.fn(() => qualifiedStage) });

    fireEvent.mouseDown(leadCard, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 28, clientY: 10 });
    expect(screen.getByTestId("pipeline-drag-overlay")).toBeInTheDocument();
    fireEvent.mouseUp(window, { clientX: 28, clientY: 10 });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/admin/leads/status",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            resource: "chat",
            id: "11111111-1111-4111-8111-111111111111",
            status: "qualified",
          }),
        }),
      );
    });

    expect(within(qualifiedStage).getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111")).toBeInTheDocument();

    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: originalElementFromPoint });
  });
});
