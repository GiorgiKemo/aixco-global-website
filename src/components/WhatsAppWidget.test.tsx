import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { WhatsAppWidget } from "./WhatsAppWidget";

function renderWidget() {
  return render(
    <I18nProvider>
      <WhatsAppWidget />
    </I18nProvider>,
  );
}

describe("WhatsAppWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the updated Swiss WhatsApp contact for Switzerland", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ country: "CH" }), { status: 200 }));

    const { container } = renderWidget();
    const link = await screen.findByRole("link", { name: "WhatsApp" });

    expect(link).toHaveAttribute("href", "https://wa.me/41798320581");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveClass("h-12", "w-12", "md:h-14", "md:w-14");
    expect(container.querySelector('[data-whatsapp-floating-container="true"]')).toBeInTheDocument();
    expect(container.querySelector('img[src*="AIXCO_icons-06.svg"]')).toBeInTheDocument();
  });

  it.each(["DE", "AT"])("opens the German/Austrian contact for %s", async (country) => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ country }), { status: 200 }));

    renderWidget();

    expect(await screen.findByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/436642554285",
    );
  });

  it("does not reserve an empty floating slot for markets without a configured number", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ country: "GE" }), { status: 200 }));

    const { container } = renderWidget();

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    await act(async () => undefined);
    expect(screen.queryByRole("link", { name: "WhatsApp" })).not.toBeInTheDocument();
    expect(container.querySelector("[data-whatsapp-floating-container]")).not.toBeInTheDocument();
  });

  it("fails closed when country detection is unavailable", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("country unavailable"));

    const { container } = renderWidget();

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    await act(async () => undefined);
    expect(container.querySelector("[data-whatsapp-floating-container]")).not.toBeInTheDocument();
  });
});
