/** @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrivacyControls } from "./PrivacyControls";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PrivacyControls", () => {
  it("requires a preview, the exact normalized email, and DELETE before erasure", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      subject: "subject@example.com",
      contactSubmissions: 1,
      chatTranscripts: 0,
      emailDeliveries: 1,
      emailEvents: 2,
      abuseAttempts: 0,
      total: 4,
      previewToken: `v1.1786968000000.1786968300000.${"a".repeat(64)}`,
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<PrivacyControls />);

    const eraseEmail = screen.getByLabelText("Verified email address");
    fireEvent.change(eraseEmail, { target: { value: "Subject@Example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview exact matches" }));

    await screen.findByText("subject@example.com");
    expect(fetchMock).toHaveBeenCalledWith("/admin/privacy/preview", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ email: "Subject@Example.com" }),
    }));
    expect(screen.getByText("4 records")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: "Permanently erase attributable data" });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Retype the exact email"), {
      target: { value: "different@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), {
      target: { value: "DELETE" },
    });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Retype the exact email"), {
      target: { value: "SUBJECT@example.com" },
    });
    await waitFor(() => expect(deleteButton).toBeEnabled());

    const deleteForm = deleteButton.closest("form");
    expect(deleteForm).toHaveAttribute("action", "/admin/privacy/delete");
    expect(deleteForm?.querySelector<HTMLInputElement>('input[name="previewed_email"]')?.value)
      .toBe("subject@example.com");
    expect(deleteForm?.querySelector<HTMLInputElement>('input[name="preview_token"]')?.value)
      .toMatch(/^v1\./);
    const exportButton = screen.getByRole("button", { name: "Download exact-match export" });
    expect(exportButton.closest("form")?.querySelector<HTMLInputElement>('input[name="preview_token"]')?.value)
      .toMatch(/^v1\./);
  });

  it("keeps deletion unavailable when the preview cannot be loaded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: "preview-failed" }),
      { status: 503, headers: { "content-type": "application/json" } },
    )));

    render(<PrivacyControls />);
    fireEvent.change(screen.getByLabelText("Verified email address"), {
      target: { value: "subject@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview exact matches" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No data was erased");
    expect(screen.queryByRole("button", { name: "Permanently erase attributable data" }))
      .not.toBeInTheDocument();
  });
});
