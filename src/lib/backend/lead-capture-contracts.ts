import { z } from "zod";

export type CaptureResult =
  | { ok: true }
  | { ok: false; skipped?: boolean; reason: string };

const optionalTextSchema = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined);

export const contactSubmissionSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    interest: optionalTextSchema(255),
    message: z.string().trim().min(10).max(1500),
  })
  .strict();

export const chatMessageSchema = z
  .object({
    role: z.enum(["aixco", "visitor"]),
    text: z.string().trim().min(1).max(1500),
  })
  .strict();

export const chatTranscriptSchema = z
  .object({
    sessionId: z.string().trim().min(8).max(120).regex(/^[A-Za-z0-9:_-]+$/).optional(),
    reason: z.enum(["auto_sync", "email_transcript"]).optional(),
    messages: z.array(chatMessageSchema).min(1).max(200),
  })
  .strict();

export const portalEventSchema = z
  .object({
    mode: z.enum(["login", "register"]),
    roleTitle: z.string().trim().min(2).max(120),
    action: z.string().trim().min(2).max(120),
    portalUrl: z.string().trim().url().max(2048),
    source: z.enum(["access_modal", "chat_widget"]).optional(),
  })
  .strict();

export const browserContextSchema = z
  .object({
    locale: z.string().trim().max(35).nullable().optional(),
    page_path: z.string().trim().max(800).nullable().optional(),
    metadata: z
      .object({
        referrer: z.string().trim().max(2048).nullable().optional(),
        viewport_width: z.number().int().min(0).max(10000).nullable().optional(),
        viewport_height: z.number().int().min(0).max(10000).nullable().optional(),
        timezone: z.string().trim().max(80).nullable().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ChatTranscriptInput = z.infer<typeof chatTranscriptSchema>;
export type PortalEventInput = z.infer<typeof portalEventSchema>;
export type BrowserContextInput = z.infer<typeof browserContextSchema>;
