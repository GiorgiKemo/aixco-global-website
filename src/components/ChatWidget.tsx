import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Mail, MessageCircleMore, Send, UserRound, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { company } from "@/data/site";
import { useI18n } from "@/i18n/I18nProvider";
import { useUI } from "./ui-state";
import { premiumPress } from "@/lib/motion";

type ChatRole = "aixco" | "visitor";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const STORAGE_KEY = "aixco-live-chat";

const quickReplies = [
  "AIXCO 6% Bond",
  "Batumi apartments",
  "Broker partnership",
  "Developer partnership",
];

function createMessage(role: ChatRole, text: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
  };
}

function initialMessages(): ChatMessage[] {
  return [
    createMessage(
      "aixco",
      "Welcome to AIXCO Live Chat. Tell us whether you are interested in the AIXCO 6% Bond, Batumi apartments, broker partnership, or developer partnership.",
    ),
  ];
}

function getAutoReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("bond") || normalized.includes("6%")) {
    return "Thanks. The AIXCO team can help with the bond route, onboarding, subscription steps, and the supporting documentation.";
  }

  if (normalized.includes("batumi") || normalized.includes("apartment") || normalized.includes("property")) {
    return "Thanks. The AIXCO team can help with Batumi apartments, available routes, tours, pricing, ownership, rental income, and next steps.";
  }

  if (normalized.includes("broker")) {
    return "Thanks. The AIXCO team can help brokers with portal access, customer tours, listings, and distribution support.";
  }

  if (normalized.includes("developer")) {
    return "Thanks. The AIXCO team can help developer partners with project visibility, distribution, and onboarding.";
  }

  return "Thanks. The AIXCO team has your note. Add any budget, role, timeline, or preferred project details and email the transcript when you are ready.";
}

function loadStoredMessages() {
  if (typeof window === "undefined") return initialMessages();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialMessages();
    const parsed = JSON.parse(stored) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMessages();
  } catch {
    return initialMessages();
  }
}

export function ChatWidget() {
  const { tx } = useI18n();
  const { openRegister } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadStoredMessages);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage can be disabled in private browsing or hardened browser settings.
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView?.({ block: "end" });
    }
  }, [isOpen, messages]);

  const transcriptHref = useMemo(() => {
    const transcript = messages.map((message) => `${message.role === "visitor" ? "Visitor" : "AIXCO"}: ${message.text}`).join("\n");
    const subject = encodeURIComponent("AIXCO live chat request");
    const body = encodeURIComponent(`${transcript}\n\nPlease contact me about my AIXCO request.`);
    return `mailto:${company.email}?subject=${subject}&body=${body}`;
  }, [messages]);

  const sendMessage = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    setMessages((current) => [
      ...current,
      createMessage("visitor", cleaned),
      createMessage("aixco", getAutoReply(cleaned)),
    ]);
    setDraft("");
  };

  const clearChat = () => {
    setMessages(initialMessages());
    setDraft("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-[95] flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3 md:bottom-6 md:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="AIXCO Live Chat"
            dir="ltr"
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="glass flex h-[min(640px,calc(100svh-6.5rem))] max-h-[calc(100svh-6.5rem)] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg shadow-elegant"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/60 bg-surface-elevated/70 p-4">
              <div>
                <p className="font-display text-xl">{tx("AIXCO Live Chat")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tx("Tell us what you need and send the transcript to AIXCO.")}</p>
              </div>
              <button
                type="button"
                aria-label={tx("Close live chat")}
                onClick={() => setIsOpen(false)}
                className="icon-button-glass h-10 w-10 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div data-chat-messages className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => {
                const visitor = message.role === "visitor";
                return (
                  <div key={message.id} className={`flex gap-3 ${visitor ? "justify-end" : "justify-start"}`}>
                    {!visitor && (
                      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Bot className="h-4 w-4" />
                      </span>
                    )}
                    <div
                      className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                        visitor
                          ? "bg-primary text-primary-foreground"
                          : "border border-border/60 bg-background/70 text-foreground/85"
                      }`}
                    >
                      {tx(message.text)}
                    </div>
                    {visitor && (
                      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                        <UserRound className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-border/60 p-4">
              <div data-chat-quick-replies className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    className="min-h-10 shrink-0 whitespace-nowrap rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition hover:border-primary/45 hover:bg-primary/15"
                  >
                    {tx(reply)}
                  </button>
                ))}
              </div>

              <form
                className="flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(draft);
                }}
              >
                <label className="sr-only" htmlFor="live-chat-message">
                  {tx("Message")}
                </label>
                <textarea
                  id="live-chat-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={2}
                  placeholder={tx("Type your message...")}
                  className="form-control min-h-[48px] resize-none py-3"
                />
                <motion.button
                  type="submit"
                  aria-label={tx("Send")}
                  className="btn-gold h-12 shrink-0 px-4"
                  whileTap={premiumPress}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">{tx("Send")}</span>
                </motion.button>
              </form>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <a href={transcriptHref} className="btn-ghost-gold !px-3 !py-2 text-xs">
                  <Mail className="h-4 w-4" />
                  {tx("Email transcript")}
                </a>
                <div className="flex gap-3">
                  <button type="button" onClick={openRegister} className="inline-flex min-h-10 items-center px-1 text-xs uppercase tracking-widest text-primary">
                    Register
                  </button>
                  <button type="button" onClick={clearChat} className="inline-flex min-h-10 items-center px-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {tx("Clear")}
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={tx(isOpen ? "Minimize live chat" : "Open live chat")}
        onClick={() => setIsOpen((open) => !open)}
        className="group relative flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-gold transition hover:brightness-105 md:h-14 md:w-14"
        whileHover={{ y: -2, scale: 1.03 }}
        whileTap={premiumPress}
      >
        <MessageCircleMore
          aria-hidden="true"
          data-chat-launcher-icon="message-circle-more"
          className="h-6 w-6 md:h-7 md:w-7"
          strokeWidth={1.9}
        />
        {!isOpen && (
          <span
            data-chat-online-indicator="true"
            className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-background bg-success"
            aria-hidden
          />
        )}
      </motion.button>
    </div>
  );
}
