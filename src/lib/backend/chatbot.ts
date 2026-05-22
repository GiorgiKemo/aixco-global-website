import type { ChatMessageInput } from "@/lib/backend/lead-capture-contracts";

export type ChatbotReplyResult =
  | {
      ok: true;
      answer: string;
      confidence: "high" | "medium" | "low";
      matchedTopics: string[];
    }
  | {
      ok: false;
      answer: string;
      reason: string;
    };

function fallbackReply(reason: string): ChatbotReplyResult {
  return {
    ok: false,
    reason,
    answer:
      "I could not reach the AIXCO website assistant right now. Please add your question here or email the transcript, and the AIXCO team can follow up.",
  };
}

function getBrowserLocale() {
  return typeof window === "undefined" ? "en" : window.navigator.language || "en";
}

async function readChatbotResponse(response: Response): Promise<ChatbotReplyResult> {
  try {
    const payload = (await response.json()) as Partial<{
      ok: boolean;
      answer: string;
      confidence: "high" | "medium" | "low";
      matchedTopics: string[];
      reason: string;
    }>;

    if (payload.ok === true && typeof payload.answer === "string") {
      return {
        ok: true,
        answer: payload.answer,
        confidence: payload.confidence ?? "medium",
        matchedTopics: Array.isArray(payload.matchedTopics) ? payload.matchedTopics : [],
      };
    }

    return fallbackReply(payload.reason ?? "Chatbot request failed.");
  } catch {
    return fallbackReply("Chatbot returned an unreadable response.");
  }
}

export async function requestWebsiteChatbotReply(messages: ChatMessageInput[]): Promise<ChatbotReplyResult> {
  if (typeof window === "undefined") {
    return fallbackReply("Chatbot API is not available during server rendering.");
  }

  try {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((message) => ({
          role: message.role,
          text: message.text,
        })),
        locale: getBrowserLocale(),
      }),
    });

    const result = await readChatbotResponse(response);

    if (!response.ok && result.ok) {
      return fallbackReply(`Chatbot request failed with status ${response.status}.`);
    }

    return result;
  } catch (error) {
    return fallbackReply(error instanceof Error ? error.message : "Unknown chatbot request error.");
  }
}
