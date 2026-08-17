import { createEvent, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
    reference: "AIX-2026-000001",
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

    const boardGrid = container.querySelector(".mt-4.grid.min-w-0");

    expect(boardGrid).toHaveClass("grid-cols-1", "md:grid-cols-2", "xl:grid-cols-4");
    expect(boardGrid).not.toHaveClass("min-w-[980px]", "overflow-x-auto");
    expect(screen.getByText("AIX-2026-000001")).toBeInTheDocument();
    const moveControl = screen.getByRole("combobox", { name: "Move Broker partnership to another stage" });
    expect(moveControl).toHaveClass("h-11");
    expect(within(moveControl).getByRole("option", { name: "Move to Qualified" })).toHaveValue("qualified");
    expect(within(moveControl).getByRole("option", { name: "Move to Archived" })).toHaveValue("archived");
    expect(screen.getByRole("button", { name: "Drag Broker partnership" })).toHaveClass("h-11", "w-11");
    expect(screen.getByRole("link", { name: "codex@example.com" })).toHaveClass("min-h-11");
  });

  it("moves a lead with pointer dragging from its explicit handle", async () => {
    let pointerCaptured = false;
    const setPointerCapture = vi.fn(() => { pointerCaptured = true; });
    const releasePointerCapture = vi.fn(() => { pointerCaptured = false; });
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { configurable: true, value: setPointerCapture });
    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { configurable: true, value: releasePointerCapture });
    Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { configurable: true, value: () => pointerCaptured });

    render(<PipelineBoard leads={leads} />);

    const qualifiedStage = screen.getByTestId("pipeline-stage-qualified");
    const leadCard = screen.getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111");
    const dragHandle = screen.getByRole("button", { name: "Drag Broker partnership" });
    const originalElementFromPoint = document.elementFromPoint;
    const elementFromPoint = vi.fn(() => qualifiedStage);
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: elementFromPoint });

    const pointerDown = createEvent.pointerDown(dragHandle, { button: 0, clientX: 10, clientY: 10, pointerId: 1, pointerType: "touch" });
    fireEvent(dragHandle, pointerDown);
    expect(pointerDown.defaultPrevented).toBe(false);
    expect(setPointerCapture).not.toHaveBeenCalled();
    const horizontalMove = createEvent.pointerMove(dragHandle, { clientX: 24, clientY: 10, pointerId: 1, pointerType: "touch" });
    fireEvent(dragHandle, horizontalMove);
    expect(horizontalMove.defaultPrevented).toBe(true);
    expect(setPointerCapture).toHaveBeenCalledWith(1);
    expect(screen.getByTestId("pipeline-drag-overlay")).toBeInTheDocument();
    fireEvent.pointerUp(dragHandle, { clientX: 24, clientY: 10, pointerId: 1, pointerType: "touch" });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/admin/leads/status",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            resource: "chat",
            id: "11111111-1111-4111-8111-111111111111",
            status: "qualified",
            returnTo: "/admin/leads?tab=pipeline",
          }),
        }),
      );
    });

    expect(within(qualifiedStage).getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("fixed", "pointer-events-none");

    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: originalElementFromPoint });
  });

  it("leaves vertical touch gestures to native page scrolling", () => {
    const setPointerCapture = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { configurable: true, value: setPointerCapture });
    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { configurable: true, value: vi.fn() });
    Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { configurable: true, value: () => false });

    render(<PipelineBoard leads={leads} />);

    const leadCard = screen.getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111");
    const dragHandle = screen.getByRole("button", { name: "Drag Broker partnership" });
    const pointerDown = createEvent.pointerDown(dragHandle, { button: 0, clientX: 20, clientY: 20, pointerId: 2, pointerType: "touch" });
    const verticalMove = createEvent.pointerMove(dragHandle, { clientX: 22, clientY: 42, pointerId: 2, pointerType: "touch" });
    fireEvent(dragHandle, pointerDown);
    fireEvent(dragHandle, verticalMove);
    fireEvent.pointerUp(dragHandle, { clientX: 22, clientY: 42, pointerId: 2, pointerType: "touch" });

    expect(pointerDown.defaultPrevented).toBe(false);
    expect(verticalMove.defaultPrevented).toBe(false);
    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(screen.queryByTestId("pipeline-drag-overlay")).not.toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(leadCard).toHaveClass("select-text");
    expect(leadCard).not.toHaveClass("select-none", "cursor-grab");
    expect(dragHandle).toHaveClass("[touch-action:pan-y_pinch-zoom]");
  });

  it("does not start dragging from selectable card content", () => {
    render(<PipelineBoard leads={leads} />);

    const leadCard = screen.getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111");
    fireEvent.mouseDown(within(leadCard).getByText(/Visitor wants details/), { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 40, clientY: 10 });
    fireEvent.mouseUp(window, { clientX: 40, clientY: 10 });

    expect(screen.queryByTestId("pipeline-drag-overlay")).not.toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(leadCard).toHaveClass("select-text");
  });

  it("moves a lead with mouse dragging from the explicit handle on desktop", async () => {
    render(<PipelineBoard leads={leads} />);

    const qualifiedStage = screen.getByTestId("pipeline-stage-qualified");
    const dragHandle = screen.getByRole("button", { name: "Drag Broker partnership" });
    const originalElementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: vi.fn(() => qualifiedStage) });

    fireEvent.mouseDown(dragHandle, { button: 0, clientX: 10, clientY: 10 });
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
            returnTo: "/admin/leads?tab=pipeline",
          }),
        }),
      );
    });

    expect(within(qualifiedStage).getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111")).toBeInTheDocument();

    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: originalElementFromPoint });
  });

  it("moves New directly to Qualified with the 44px keyboard and mobile control", async () => {
    render(<PipelineBoard leads={leads} returnTo="/admin/leads?tab=pipeline" />);

    const qualifiedStage = screen.getByTestId("pipeline-stage-qualified");
    const moveControl = screen.getByRole("combobox", { name: "Move Broker partnership to another stage" });
    fireEvent.change(moveControl, { target: { value: "qualified" } });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/admin/leads/status",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            resource: "chat",
            id: "11111111-1111-4111-8111-111111111111",
            status: "qualified",
            returnTo: "/admin/leads?tab=pipeline",
          }),
        }),
      );
    });

    expect(within(qualifiedStage).getByTestId("pipeline-card-chat:11111111-1111-4111-8111-111111111111")).toBeInTheDocument();
  });

  it("supports arbitrary backward and archive stage moves from the same control", async () => {
    render(<PipelineBoard leads={leads} />);

    const moveContact = screen.getByRole("combobox", { name: "Move Codex Contact Test to another stage" });
    fireEvent.change(moveContact, { target: { value: "new" } });

    const movedCard = within(screen.getByTestId("pipeline-stage-new")).getByTestId(
      "pipeline-card-contact:22222222-2222-4222-8222-222222222222",
    );
    expect(movedCard).toBeInTheDocument();
    const movedControl = within(movedCard).getByRole("combobox", {
      name: "Move Codex Contact Test to another stage",
    });
    await waitFor(() => expect(movedControl).not.toBeDisabled());

    fireEvent.change(movedControl, { target: { value: "archived" } });
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "/admin/leads/status",
      expect.objectContaining({
        body: JSON.stringify({
          resource: "contact",
          id: "22222222-2222-4222-8222-222222222222",
          status: "archived",
          returnTo: "/admin/leads?tab=pipeline",
        }),
      }),
    );
    expect(within(screen.getByTestId("pipeline-stage-archived")).getByTestId(
      "pipeline-card-contact:22222222-2222-4222-8222-222222222222",
    )).toBeInTheDocument();
  });
});
