import { z } from "zod";
import { ANALYTICS_CONSENT_VERSION } from "./constants";

export {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  ANALYTICS_CONSENT_VERSION,
  ANALYTICS_OUTBOX_STORAGE_KEY,
  ANALYTICS_PREFERENCES_EVENT,
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_TRACK_EVENT,
  ANALYTICS_VISITOR_STORAGE_KEY,
} from "./constants";

export const analyticsEventTypeSchema = z.enum([
  "session_start",
  "session_end",
  "page_view",
  "section_view",
  "engagement",
  "scroll_depth",
  "click",
  "download",
  "outbound",
  "form_start",
  "form_submit",
  "form_error",
  "portal_handoff",
  "conversion",
  "language_change",
]);

export const analyticsEventNameSchema = z.enum([
  "session_started",
  "session_ended",
  "page_view",
  "section_view",
  "active_time",
  "scroll_depth",
  "button_click",
  "link_click",
  "social_click",
  "whatsapp_click",
  "phone_click",
  "email_click",
  "download_requested",
  "outbound_link",
  "form_started",
  "form_submit_attempted",
  "form_failed",
  "portal_handoff",
  "contact_request_acknowledged",
  "chat_message",
  "language_changed",
]);

const analyticsMetadataValueSchema = z.union([
  z.string().max(255),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const analyticsEventSchema = z.object({
  id: z.string().uuid(),
  type: analyticsEventTypeSchema,
  name: analyticsEventNameSchema,
  pagePath: z.string().trim().startsWith("/").max(800),
  occurredAt: z.string().datetime({ offset: true }),
  sectionId: z.string().trim().max(120).nullable().optional(),
  targetLabel: z.string().trim().max(120).nullable().optional(),
  value: z.number().finite().min(0).max(999_999_999).nullable().optional(),
  durationMs: z.number().int().min(0).max(86_400_000).nullable().optional(),
  scrollDepth: z.number().int().min(0).max(100).nullable().optional(),
  metadata: z.record(z.string().max(60), analyticsMetadataValueSchema).optional(),
}).strict();

export const analyticsSessionSchema = z.object({
  id: z.string().uuid(),
  visitorId: z.string().uuid(),
  startedAt: z.string().datetime({ offset: true }),
  lastSeenAt: z.string().datetime({ offset: true }),
  endedAt: z.string().datetime({ offset: true }).nullable().optional(),
  activeSeconds: z.number().int().min(0).max(604_800),
  landingPath: z.string().trim().startsWith("/").max(800),
  exitPath: z.string().trim().startsWith("/").max(800),
  referrer: z.string().trim().max(1_000).nullable().optional(),
  campaign: z.object({
    source: z.string().trim().max(120).nullable().optional(),
    medium: z.string().trim().max(120).nullable().optional(),
    campaign: z.string().trim().max(160).nullable().optional(),
    term: z.string().trim().max(160).nullable().optional(),
    content: z.string().trim().max(160).nullable().optional(),
  }).strict().optional(),
  locale: z.string().trim().min(1).max(35),
  timezone: z.string().trim().max(100).nullable().optional(),
  screenWidth: z.number().int().min(0).max(20_000).nullable().optional(),
  screenHeight: z.number().int().min(0).max(20_000).nullable().optional(),
  viewportWidth: z.number().int().min(0).max(20_000).nullable().optional(),
  viewportHeight: z.number().int().min(0).max(20_000).nullable().optional(),
  isReturning: z.boolean(),
}).strict();

export const analyticsBatchSchema = z.object({
  consent: z.object({
    status: z.literal("granted"),
    version: z.literal(ANALYTICS_CONSENT_VERSION),
  }).strict(),
  session: analyticsSessionSchema,
  events: z.array(analyticsEventSchema).min(1).max(30),
}).strict();

export type AnalyticsConsentStatus = "granted" | "denied" | "unset";
export type AnalyticsEventType = z.infer<typeof analyticsEventTypeSchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
export type AnalyticsSessionInput = z.infer<typeof analyticsSessionSchema>;
export type AnalyticsBatchInput = z.infer<typeof analyticsBatchSchema>;
