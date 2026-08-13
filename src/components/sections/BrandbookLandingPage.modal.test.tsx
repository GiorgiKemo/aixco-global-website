import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExpandedProjectImageModal } from "./BrandbookLandingPage";

const image = {
  src: "/project-lobby.webp",
  alt: "Project lobby",
  width: 4096,
  height: 2733,
};

describe("ExpandedProjectImageModal", () => {
  it("closes from any backdrop area outside the visible image", () => {
    const onClose = vi.fn();
    render(
      <ExpandedProjectImageModal
        image={image}
        dialogLabel="Expanded project image"
        closeLabel="Close expanded image"
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("dialog", { name: "Expanded project image" }), { clientX: -1, clientY: -1 });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the modal open when the visible image is clicked", () => {
    const onClose = vi.fn();
    render(
      <ExpandedProjectImageModal
        image={image}
        dialogLabel="Expanded project image"
        closeLabel="Close expanded image"
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByAltText("Project lobby"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps the explicit close control working", () => {
    const onClose = vi.fn();
    render(
      <ExpandedProjectImageModal
        image={image}
        dialogLabel="Expanded project image"
        closeLabel="Close expanded image"
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close expanded image" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
