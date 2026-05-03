import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
  it("uses Guru and Otium instead of Queens and Serenade", () => {
    renderBatumi();

    expect(screen.getByRole("button", { name: "Guru" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Otium" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Play video: Guru/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Otium/ })).not.toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: /Play video: Otium/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play video: Guru/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Otium/ })).toHaveAttribute("href", expect.stringContaining("otium.pdf"));
    expect(screen.getByLabelText("Selected Batumi project content")).toHaveTextContent("Project media: Otium");
  });
});
