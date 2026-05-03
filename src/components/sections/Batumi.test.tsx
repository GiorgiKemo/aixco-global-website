import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Batumi } from "./Batumi";

function renderBatumi() {
  return render(
    <I18nProvider>
      <Batumi />
    </I18nProvider>,
  );
}

describe("Batumi", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses Guru and Otium instead of Queens and Serenade", () => {
    const { container } = renderBatumi();

    expect(screen.getByRole("button", { name: "Guru" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Otium" })).toBeInTheDocument();
    const guruImage = screen.getByRole("img", { name: "Guru" });
    expect(guruImage).toHaveAttribute("src", expect.stringContaining("guru.png"));
    expect(guruImage.closest(".mac-card")?.className).toContain("aspect-[9/16]");
    expect(screen.getByRole("button", { name: /Play video: Guru/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Otium/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Batumi benefit highlights")).toHaveAttribute(
      "data-layout",
      "batumi-benefits-left-column",
    );
    expect(screen.getByLabelText("Batumi market overview")).toHaveAttribute(
      "data-layout",
      "batumi-intro-balanced-height",
    );
    expect(screen.getByLabelText("Batumi market overview")).toHaveAttribute(
      "data-viewport-fit",
      "first-view",
    );
    expect(screen.getByLabelText("Batumi market overview")).toHaveAttribute("id", "batumi");
    expect(container.querySelector('section[id="batumi"]')).not.toBeInTheDocument();
    expect(screen.getByLabelText("Batumi market copy and benefits")).toHaveAttribute(
      "data-stretch",
      "matches-overview-media",
    );
    expect(screen.getByLabelText("Batumi overview media")).toHaveAttribute(
      "data-media-frame",
      "viewport-fit-uncropped",
    );
    expect(screen.getByLabelText("Batumi").closest("[data-video-state]")?.className).toContain("lg:aspect-[9/16]");
    expect(screen.getByLabelText("Batumi")).toHaveClass("object-contain");
    expect(screen.getByLabelText("Batumi")).toHaveAttribute(
      "poster",
      expect.stringContaining("batumi-gallery/batumi2-poster.webp"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Play video: Batumi" }));
    expect(screen.getByLabelText("Batumi")).toHaveAttribute("src", expect.stringContaining("batumi-gallery/batumi2.mp4"));
    expect(screen.getByRole("link", { name: /Guru/ })).toHaveAttribute("href", expect.stringContaining("guru.pdf"));
    expect(screen.getByLabelText("Batumi video gallery")).toHaveAttribute("data-layout", "portrait-video-gallery");
    expect(screen.getAllByRole("button", { name: /Play video: Batumi gallery/ })).toHaveLength(6);

    expect(screen.queryByText("Queens")).not.toBeInTheDocument();
    expect(screen.queryByText("Serenade")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Queens/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Serenade/ })).not.toBeInTheDocument();
  });

  it("switches the project video, document link, and content when selecting Otium", () => {
    renderBatumi();

    expect(screen.getByLabelText("Selected Batumi project content")).toHaveTextContent("Project media: Guru");
    expect(screen.getByRole("button", { name: /Play video: Guru/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Otium/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Otium" }));

    const otiumImage = screen.getByRole("img", { name: "Otium" });

    expect(otiumImage).toHaveAttribute("src", expect.stringContaining("otium-reverance.png"));
    expect(otiumImage.closest(".mac-card")?.className).toContain("aspect-[9/16]");
    expect(screen.getByRole("button", { name: /Play video: Otium/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Guru/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Otium/ })).toHaveAttribute("href", expect.stringContaining("otium.pdf"));
    expect(screen.getByLabelText("Selected Batumi project content")).toHaveTextContent("Project media: Otium");
  });
});
