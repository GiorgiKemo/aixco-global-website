import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export type ContactEmailQueueStatus = "queued" | "processing" | "retrying" | "provider_accepted" | "failed";

export type ContactEmailDeliverySummary = {
  status: ContactEmailQueueStatus;
  internal: ContactEmailQueueStatus;
  confirmation: ContactEmailQueueStatus;
};

export type CaptureResult =
  | { ok: true; reference?: string; emailDelivery?: ContactEmailDeliverySummary }
  | { ok: false; skipped?: boolean; reason: string };

export const leadCaptureAntiAbuseSchema = z
  .object({
    website: z.string().max(200).optional().default(""),
    startedAt: z.number().int().positive().optional(),
  })
  .strict();

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
    requestType: z.enum(["call", "message"]).optional(),
    phone: z
      .string()
      .trim()
      .min(5)
      .max(40)
      .regex(/^[+()0-9\s.-]+$/, "Phone number contains unsupported characters.")
      .optional()
      .refine((value) => !value || isValidPhoneNumber(value), "Phone number is not valid for its country."),
    preferredCallAt: z.string().datetime({ offset: true }).optional(),
    preferredCallTimezone: z.string().trim().min(1).max(80).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.requestType !== "call") return;

    if (!value.phone) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Phone number is required." });
    }
    if (!value.preferredCallAt) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["preferredCallAt"], message: "Preferred call time is required." });
    } else if (new Date(value.preferredCallAt).getTime() < Date.now() - 60_000) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["preferredCallAt"], message: "Preferred call time must be in the future." });
    }
    if (!value.preferredCallTimezone) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["preferredCallTimezone"], message: "Call timezone is required." });
    }
  });

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
        analytics_session_id: z.string().uuid().nullable().optional(),
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
export type LeadCaptureAntiAbuseInput = z.infer<typeof leadCaptureAntiAbuseSchema>;
