import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { UIProvider, useUI } from "@/components/ui-state";
import {
  grantDownloadAccess,
  resetDownloadAccessForTests,
} from "@/lib/download-access";
import { DownloadGateLink } from "./DownloadGateLink";

function ModalProbe() {
  const { modal, modalData } = useUI();
  return (
    <>
      <output aria-label="active modal">{modal ?? "none"}</output>
      <output aria-label="active modal data">{modalData ? JSON.stringify(modalData) : "none"}</output>
    </>
  );
}

function DownloadFixture() {
  return (
    <UIProvider>
      <DownloadGateLink
        href="/aixco-global-op2/images/fund/fund1.jpeg"
        fileName="eden-house.jpeg"
        ariaLabel="Download Eden House image"
        dataAttributes={{ "data-material-id": "eden-house-reference" }}
      >
        Download image
      </DownloadGateLink>
      <ModalProbe />
    </UIProvider>
  );
}

describe("DownloadGateLink", () => {
  beforeEach(() => {
    resetDownloadAccessForTests();
  });

  it("gates a material download behind the shared contact form", () => {
    render(<DownloadFixture />);

    const link = screen.getByRole("link", { name: "Download Eden House image" });
    expect(link).toHaveAttribute("href", "#materials");
    expect(link).not.toHaveAttribute("download");
    expect(link).toHaveAttribute("aria-haspopup", "dialog");

    fireEvent.click(link);

    expect(screen.getByLabelText("active modal")).toHaveTextContent("contact");
    expect(screen.getByLabelText("active modal data")).toHaveTextContent(
      "/aixco-global-op2/images/fund/fund1.jpeg",
    );
    expect(screen.getByLabelText("active modal data")).toHaveTextContent("eden-house.jpeg");
  });

  it("becomes a direct download after access was granted once", async () => {
    render(<DownloadFixture />);
    grantDownloadAccess();

    const link = screen.getByRole("link", { name: "Download Eden House image" });
    await waitFor(() => {
      expect(link).toHaveAttribute("href", "/aixco-global-op2/images/fund/fund1.jpeg");
    });
    expect(link).toHaveAttribute("download", "eden-house.jpeg");
    expect(link).not.toHaveAttribute("aria-haspopup");
    expect(screen.getByLabelText("active modal")).toHaveTextContent("none");
  });
});
