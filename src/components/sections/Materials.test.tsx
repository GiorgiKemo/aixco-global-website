import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Materials } from "./Materials";

function renderMaterials() {
  return render(
    <I18nProvider>
      <Materials />
    </I18nProvider>,
  );
}

describe("Materials", () => {
  it("renders a dedicated downloadable materials section", () => {
    renderMaterials();
    const retiredProjectName = ["Gu", "ru"].join("");

    const section = screen.getByRole("heading", { name: "Materials & downloads" }).closest("section");
    const downloads = screen.getAllByRole("link", { name: /^Download / });

    expect(section).toHaveAttribute("id", "materials");
    expect(screen.getByText("Client materials")).toBeInTheDocument();
    expect(screen.getByText(/Download brochures, catalog sheets/i)).toBeInTheDocument();
    expect(downloads).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Download AIXCO client brochure" })).toHaveAttribute(
      "href",
      "/aixco-global-op2/documents/aixco-client-brochure.pdf",
    );
    expect(screen.getByRole("link", { name: "Download Current project brochure" })).toHaveAttribute(
      "href",
      "/aixco-global-op2/documents/current-project.pdf",
    );
    expect(screen.getByRole("link", { name: "Download Current project catalog sheet" })).toHaveAttribute(
      "href",
      "/aixco-global-op2/documents/current-project-catalog.jpeg",
    );
    expect(screen.queryByRole("link", { name: new RegExp(`Download ${retiredProjectName}`, "i") })).not.toBeInTheDocument();
    expect(screen.queryByText(/On request/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/available on request/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/investor/i)).not.toBeInTheDocument();
  });
});
