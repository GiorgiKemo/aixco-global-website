import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Mail, MessageCircleMore, Send, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "@/lib/framer-motion";
import { useSiteContent } from "@/data/site-content-context";
import { useI18n } from "@/i18n/I18nProvider";
import { requestWebsiteChatbotReply } from "@/lib/backend/chatbot";
import { recordChatTranscript } from "@/lib/backend/lead-capture";
import { useUI } from "./ui-state";
import { premiumPress } from "@/lib/motion";

type ChatRole = "aixco" | "visitor";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const STORAGE_KEY = "aixco-live-chat";
const SESSION_STORAGE_KEY = "aixco-live-chat-session";

const quickReplies = [
  "Emerging market opportunities",
  "Download Materials",
  "Property administration",
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

function createChatSessionId() {
  const randomId =
    typeof window !== "undefined" && window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `chat_${randomId.replace(/[^A-Za-z0-9_-]/g, "_")}`;
}

function loadChatSessionId() {
  if (typeof window === "undefined") return "";

  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) return stored;

    const sessionId = createChatSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    return createChatSessionId();
  }
}

function initialMessages(): ChatMessage[] {
  return [
    createMessage(
      "aixco",
      "Welcome to the AIXCO assistant. Ask about emerging market opportunities, download materials, Dubai legacy projects, property administration, broker partnership, developer partnership, partners, team, or FAQs.",
    ),
  ];
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
  const { dir, tx } = useI18n();
  const { openRegister } = useUI();
  const { company } = useSiteContent();
  const [hasMounted, setHasMounted] = useState(false);
  const [hasLoadedStoredMessages, setHasLoadedStoredMessages] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isAnswering, setIsAnswering] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const replyRequestIdRef = useRef(0);
  const showQuickReplies = messages.every((message) => message.role !== "visitor");

  useEffect(() => {
    setMessages(loadStoredMessages());
    setSessionId(loadChatSessionId());
    setHasLoadedStoredMessages(true);
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredMessages) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage can be disabled in private browsing or hardened browser settings.
    }
  }, [hasLoadedStoredMessages, messages]);

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
  }, [company.email, messages]);

  const saveTranscript = useCallback(
    async (nextMessages: ChatMessage[], reason: "auto_sync" | "email_transcript") => {
      const activeSessionId = sessionId || loadChatSessionId();
      if (!sessionId) setSessionId(activeSessionId);

      setSyncState("saving");
      const result = await recordChatTranscript(nextMessages, {
        reason,
        sessionId: activeSessionId,
      });
      setSyncState(result.ok ? "saved" : "error");
    },
    [sessionId],
  );

  const resolveChatbotReply = useCallback(
    async (nextMessages: ChatMessage[]) => {
      const requestId = replyRequestIdRef.current + 1;
      replyRequestIdRef.current = requestId;
      setIsAnswering(true);

      const reply = await requestWebsiteChatbotReply(nextMessages);
      if (replyRequestIdRef.current !== requestId) return;

      const replyMessage = createMessage("aixco", reply.answer);
      setMessages((current) => {
        const latestVisitorMessage = nextMessages[nextMessages.length - 1];
        const hasLatestVisitorMessage = current.some((message) => message.id === latestVisitorMessage?.id);
        const baseMessages = hasLatestVisitorMessage ? current : nextMessages;
        const updatedMessages = [...baseMessages, replyMessage];

        void saveTranscript(updatedMessages, "auto_sync");
        return updatedMessages;
      });
      setIsAnswering(false);
    },
    [saveTranscript],
  );

  const sendMessage = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned || isAnswering) return;

    setMessages((current) => {
      const nextMessages = [...current, createMessage("visitor", cleaned)];

      void resolveChatbotReply(nextMessages);
      return nextMessages;
    });
    setDraft("");
  };

  const clearChat = () => {
    replyRequestIdRef.current += 1;
    setMessages(initialMessages());
    setDraft("");
    setIsAnswering(false);
    setSyncState("idle");
  };

  if (!hasMounted) return null;

  return (
    <div
      data-chat-floating-container="true"
      className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] right-[max(1.25rem,env(safe-area-inset-right,0px))] z-[95] flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3 md:bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:right-[max(1.5rem,env(safe-area-inset-right,0px))]"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label={tx("AIXCO Live Chat")}
            dir={dir}
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="glass pointer-events-auto flex h-[min(640px,calc(100svh-6.5rem))] max-h-[calc(100svh-6.5rem)] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg bg-surface-elevated/95 shadow-elegant backdrop-blur-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/60 bg-surface-elevated/95 p-4">
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

            <div data-chat-messages className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-surface/80 p-4">
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
              {showQuickReplies && (
                <div className="flex justify-start" data-chat-quick-replies>
                  <div className="ml-11 flex max-w-[78%] flex-wrap gap-1.5 rounded-lg border border-border/50 bg-background/55 p-2">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply}
                        type="button"
                        disabled={isAnswering}
                        onClick={() => sendMessage(reply)}
                        className="min-h-8 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] font-medium leading-none text-primary transition hover:border-primary/40 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {tx(reply)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {isAnswering && (
                <div className="flex gap-3 justify-start" aria-live="polite">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="max-w-[78%] rounded-lg border border-border/60 bg-background/70 px-4 py-3 text-sm leading-relaxed text-foreground/85">
                    {tx("Checking the AIXCO website content...")}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-border/60 bg-surface-elevated/95 p-4">
              <p aria-live="polite" className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {isAnswering
                  ? tx("Answering from website content...")
                  : syncState === "saving"
                  ? tx("Saving chat...")
                  : syncState === "saved"
                    ? tx("Chat saved to AIXCO")
                      : syncState === "error"
                        ? tx("Chat could not be saved")
                        : tx("Live chat")}
              </p>

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
                  disabled={isAnswering || !draft.trim()}
                  className="btn-gold h-12 shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-60"
                  whileTap={premiumPress}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">{tx("Send")}</span>
                </motion.button>
              </form>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={transcriptHref}
                  onClick={() => {
                    void saveTranscript(messages, "email_transcript");
                  }}
                  className="btn-ghost-gold !px-3 !py-2 text-xs"
                >
                  <Mail className="h-4 w-4" />
                  {tx("Email transcript")}
                </a>
                <div className="flex gap-3">
                  <button type="button" onClick={openRegister} className="inline-flex min-h-10 items-center px-1 text-xs uppercase tracking-widest text-primary">
                    {tx("Register")}
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
        className="pointer-events-auto group relative flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-gold transition hover:brightness-105 md:h-14 md:w-14"
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
