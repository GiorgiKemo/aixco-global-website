import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { requestWebsiteChatbotReply } from "@/lib/backend/chatbot";
import { recordChatTranscript } from "@/lib/backend/lead-capture";
import { UIProvider } from "./ui-state";
import { ChatWidget } from "./ChatWidget";

vi.mock("@/lib/backend/chatbot", () => ({
  requestWebsiteChatbotReply: vi.fn(async () => ({
    ok: true,
    answer: "AIXCO can answer this from the website content.",
    confidence: "high",
    matchedTopics: ["AIXCO website assistant"],
  })),
}));

vi.mock("@/lib/backend/lead-capture", () => ({
  recordChatTranscript: vi.fn(async () => ({ ok: true })),
}));

function setPageScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
}

function renderWidget() {
  return render(
    <I18nProvider>
      <UIProvider>
        <ChatWidget />
      </UIProvider>
    </I18nProvider>,
  );
}

describe("ChatWidget", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(requestWebsiteChatbotReply).mockClear();
    vi.mocked(recordChatTranscript).mockClear();
    setPageScrollY(0);
  });

  it("opens a live chat panel, sends a visitor message, and prepares an email transcript", async () => {
    vi.mocked(requestWebsiteChatbotReply).mockResolvedValueOnce({
      ok: true,
      answer: "Emerging market opportunities start from the website's selected property route, with ownership, tours, rental income, and next steps covered by AIXCO.",
      confidence: "high",
      matchedTopics: ["Emerging market opportunities"],
    });
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "I want to explore emerging market opportunities." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    expect(screen.getByText("I want to explore emerging market opportunities.")).toBeInTheDocument();
    expect(await screen.findByText(/Emerging market opportunities start from the website's selected property route/i)).toBeInTheDocument();
    expect(requestWebsiteChatbotReply).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "visitor", text: "I want to explore emerging market opportunities." }),
      ]),
    );

    const emailTranscript = screen.getByRole("link", { name: /email transcript/i });
    expect(emailTranscript).toHaveAttribute("href", expect.stringContaining("mailto:info@aixco.global"));
    expect(emailTranscript).toHaveAttribute("href", expect.stringContaining("emerging%20market%20opportunities"));
  });

  it("automatically saves visitor chats to the backend with a stable live session id", async () => {
    vi.mocked(requestWebsiteChatbotReply).mockResolvedValueOnce({
      ok: true,
      answer: "Brokers can apply, complete due diligence, access materials, introduce clients, and track pipeline through the AIXCO flow.",
      confidence: "high",
      matchedTopics: ["Broker journey"],
    });
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Please contact me about broker partnership." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await waitFor(() => {
      expect(recordChatTranscript).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: "visitor", text: "Please contact me about broker partnership." }),
          expect.objectContaining({ role: "aixco", text: expect.stringContaining("Brokers can apply") }),
        ]),
        expect.objectContaining({
          reason: "auto_sync",
          sessionId: expect.stringMatching(/^chat_/),
        }),
      );
    });
  });

  it("uses the website chatbot service for quick-reply answers", async () => {
    vi.mocked(requestWebsiteChatbotReply).mockResolvedValueOnce({
      ok: true,
      answer: "Developers can submit a project, evaluate fit, structure the opportunity, prepare launch materials, distribute through AIXCO, and provide ongoing reporting.",
      confidence: "high",
      matchedTopics: ["Developer journey"],
    });
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));
    fireEvent.click(screen.getByRole("button", { name: "Developer partnership" }));

    expect(await screen.findByText(/Developers can submit a project/i)).toBeInTheDocument();
    expect(requestWebsiteChatbotReply).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "visitor", text: "Developer partnership" }),
      ]),
    );
  });

  it("uses the message circle icon for the launcher", () => {
    const { container } = renderWidget();

    expect(container.querySelector('[data-chat-launcher-icon="message-circle-more"]')).toBeInTheDocument();
    expect(container.querySelector("[data-chat-support-lottie]")).not.toBeInTheDocument();
  });

  it("keeps the online indicator inset inside the launcher", () => {
    const { container } = renderWidget();
    const indicator = container.querySelector('[data-chat-online-indicator="true"]');

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass("right-1", "top-1");
  });

  it("bounds the open chat panel to short mobile viewports", () => {
    const { container } = renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).toHaveClass(
      "flex",
      "bg-surface-elevated/95",
      "h-[min(640px,calc(100svh-6.5rem))]",
      "max-h-[calc(100svh-6.5rem)]",
    );
    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).not.toHaveClass("sm:mr-16", "md:mr-20");
    expect(container.querySelector("[data-chat-messages]")).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(container.querySelector("[data-chat-messages] [data-chat-quick-replies]")).toBeInTheDocument();
    expect(container.querySelector("[data-chat-quick-replies]")).toHaveClass("flex", "justify-start");
    expect(container.querySelector("[data-chat-quick-replies]")).not.toHaveClass("grid", "overflow-x-auto");
  });

  it("keeps chat controls large enough for touch interaction", () => {
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    const dialog = screen.getByRole("dialog", { name: /aixco live chat/i });
    expect(within(dialog).getByRole("button", { name: /close live chat/i })).toHaveClass("h-10", "w-10");
    expect(screen.getByRole("button", { name: /minimize live chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Property administration" })).toHaveClass("min-h-8", "text-[11px]");
    expect(screen.getByRole("link", { name: /email transcript/i })).toHaveClass("btn-ghost-gold");
    expect(screen.getByRole("button", { name: "Register" })).toHaveClass("min-h-10");
    expect(screen.getByRole("button", { name: "Clear" })).toHaveClass("min-h-10");
  });

  it("removes compact suggested topics after the visitor sends a message", async () => {
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    expect(screen.getByRole("button", { name: "Property administration" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Property administration" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Property administration" })).not.toBeInTheDocument();
    });
  });

  it("keeps the open chat panel active when clicking outside so visitors can browse", () => {
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /minimize live chat/i })).toBeInTheDocument();
  });

  it("opens the chat panel directly above the launcher without blocking other floating controls", () => {
    const { container } = renderWidget();

    setPageScrollY(720);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("button", { name: /open live chat/i }));

    const floatingContainer = container.querySelector("[data-chat-floating-container]");
    expect(floatingContainer).toHaveClass("pointer-events-none", "gap-3");
    expect(floatingContainer).not.toHaveClass("gap-24", "md:gap-28");
    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).toHaveClass("pointer-events-auto");
    expect(screen.getByRole("dialog", { name: /aixco live chat/i })).not.toHaveClass("sm:mr-16", "md:mr-20");
    expect(screen.getByRole("button", { name: /minimize live chat/i })).toHaveClass("pointer-events-auto");
  });
});
