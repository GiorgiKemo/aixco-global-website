import { NextResponse } from "next/server";
import { z } from "zod";
import { chatMessageSchema } from "@/lib/backend/lead-capture-contracts";
import { fetchSiteContentForServer } from "@/lib/backend/site-content-server";
import { answerWebsiteChat } from "@/lib/chatbot/website-chatbot";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";
import { readBoundedJson } from "@/lib/security/request-body";

const CHATBOT_RATE_LIMIT = {
  limit: 40,
  windowMs: 60_000,
};

const chatbotRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1).max(50),
    locale: z.string().trim().max(35).nullable().optional(),
  })
  .strict();

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `chatbot:${getRateLimitClientId(request.headers)}`,
    ...CHATBOT_RATE_LIMIT,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        answer: "Too many chat requests. Please wait a moment and try again.",
        reason: "Rate limit exceeded.",
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const body = await readBoundedJson(request, 96 * 1024);
  if (!body.ok && body.error === "payload-too-large") {
    return NextResponse.json(
      { ok: false, answer: "Please send a shorter message so the AIXCO assistant can answer it.", reason: "Request body is too large." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = chatbotRequestSchema.safeParse(body.ok ? body.value : null);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        answer: "Please send a shorter message so the AIXCO assistant can answer it.",
        reason: "Invalid chatbot request.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const siteContent = await fetchSiteContentForServer(parsed.data.locale ?? "en");
  const result = answerWebsiteChat(parsed.data.messages, siteContent.content);

  return NextResponse.json(
    {
      ok: true,
      answer: result.answer,
      confidence: result.confidence,
      matchedTopics: result.matchedTopics,
      contentSource: siteContent.source,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
