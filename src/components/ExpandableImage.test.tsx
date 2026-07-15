import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpandableImage } from "./ExpandableImage";

describe("ExpandableImage", () => {
  it("opens and closes an expanded image dialog", () => {
    render(
      <ExpandableImage src="/asset.jpg" title="Dubai asset">
        <img src="/asset.jpg" alt="Dubai asset" />
      </ExpandableImage>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand image: Dubai asset" }));

    const dialog = screen.getByRole("dialog", { name: "Expanded image: Dubai asset" });
    const expandedImage = screen.getAllByAltText("Dubai asset").find((image) => image.closest("[role='dialog']"));
    const modalShell = dialog.parentElement;
    const backdrop = screen.getAllByRole("button", { name: "Close image: Dubai asset" }).find((control) =>
      control.className.includes("backdrop-blur-xl"),
    );

    expect(dialog).toBeInTheDocument();
    expect(modalShell?.className).not.toContain("animate-fade-in");
    expect(backdrop).toBeInTheDocument();
    expect(backdrop?.className).toContain("backdrop-blur-xl");
    expect(backdrop?.className).toContain("bg-black/40");
    expect(backdrop?.className).not.toContain("animate");
    expect(dialog.className).not.toContain("bg-black");
    expect(dialog.className).not.toContain("border");
    expect(dialog.className).not.toContain("bg-white");
    expect(dialog.className).not.toContain("backdrop-blur");
    expect(expandedImage).toHaveAttribute("src", "/asset.jpg");
    expect(expandedImage?.className).toContain("max-h-[min(70svh,42rem)]");
    expect(expandedImage?.className).toContain("rounded-md");
    expect(expandedImage?.className).toContain("shadow-[0_0_48px_rgb(0_0_0/0.2)]");
    const closeControls = screen.getAllByRole("button", { name: "Close image: Dubai asset" });
    expect(
      closeControls.some(
        (control) =>
          control.className.includes("absolute end-1 top-1") &&
          control.className.includes("md:end-0 md:top-0") &&
          control.className.includes("md:-translate-y-1/2") &&
          control.className.includes("ltr:md:translate-x-1/2") &&
          control.className.includes("rtl:md:-translate-x-1/2"),
      ),
    ).toBe(true);
    expect(closeControls.every((control) => !control.className.includes("fixed right-4 top-4"))).toBe(true);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Expanded image: Dubai asset" })).not.toBeInTheDocument();
  });

  it("does not open from the click generated after a drag", () => {
    render(
      <ExpandableImage src="/asset.jpg" title="Dubai asset">
        <img src="/asset.jpg" alt="Dubai asset" />
      </ExpandableImage>,
    );

    const trigger = screen.getByRole("button", { name: "Expand image: Dubai asset" });

    fireEvent.mouseDown(trigger, { button: 0, clientX: 120, clientY: 20 });
    fireEvent.mouseMove(window, { clientX: 92, clientY: 20 });
    fireEvent.mouseUp(window, { clientX: 92, clientY: 20 });
    fireEvent.click(trigger);

    expect(screen.queryByRole("dialog", { name: "Expanded image: Dubai asset" })).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByRole("dialog", { name: "Expanded image: Dubai asset" })).toBeInTheDocument();
  });
});
