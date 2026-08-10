import { describe, expect, it } from "vitest";
import {
  ANALYTICS_CONSENT_VERSION,
  analyticsBatchSchema,
  analyticsEventSchema,
} from "./contracts";

const sessionId = "fd90fc90-b588-491f-8e1d-f1f69d738d4f";
const visitorId = "5f7b5d5a-902b-4383-99df-b44f78f85212";
const eventId = "b2945578-a1fa-4d7f-9ee7-4210d9ca7a5b";

function validBatch() {
  return {
    consent: { status: "granted", version: ANALYTICS_CONSENT_VERSION },
    session: {
      id: sessionId,
      visitorId,
      startedAt: "2026-08-07T10:00:00.000Z",
      lastSeenAt: "2026-08-07T10:01:00.000Z",
      activeSeconds: 60,
      landingPath: "/",
      exitPath: "/#contact",
      locale: "en-US",
      isReturning: false,
    },
    events: [{
      id: eventId,
      type: "page_view",
      name: "page_view",
      pagePath: "/#contact",
      occurredAt: "2026-08-07T10:00:01.000Z",
      metadata: { routeKind: "single-page", value: 1, visible: true },
    }],
  };
}

describe("analytics contracts", () => {
  it("accepts a consented, bounded first-party analytics batch", () => {
    expect(analyticsBatchSchema.parse(validBatch())).toMatchObject({
      consent: { status: "granted", version: ANALYTICS_CONSENT_VERSION },
      session: { id: sessionId, visitorId },
      events: [{ id: eventId, type: "page_view", name: "page_view" }],
    });
  });

  it("rejects denied or stale consent and unknown top-level fields", () => {
    expect(analyticsBatchSchema.safeParse({
      ...validBatch(),
      consent: { status: "denied", version: ANALYTICS_CONSENT_VERSION },
    }).success).toBe(false);
    expect(analyticsBatchSchema.safeParse({
      ...validBatch(),
      consent: { status: "granted", version: "stale-version" },
    }).success).toBe(false);
    expect(analyticsBatchSchema.safeParse({ ...validBatch(), rawFormValues: {} }).success).toBe(false);
  });

  it("enforces event counts, known names, paths, durations, and metadata bounds", () => {
    const batch = validBatch();
    expect(analyticsBatchSchema.safeParse({
      ...batch,
      events: Array.from({ length: 31 }, (_, index) => ({
        ...batch.events[0],
        id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      })),
    }).success).toBe(false);

    expect(analyticsEventSchema.safeParse({
      ...batch.events[0],
      name: "password_entered",
    }).success).toBe(false);
    expect(analyticsEventSchema.safeParse({
      ...batch.events[0],
      pagePath: "https://external.example/private?token=secret",
    }).success).toBe(false);
    expect(analyticsEventSchema.safeParse({
      ...batch.events[0],
      durationMs: 86_400_001,
    }).success).toBe(false);
    expect(analyticsEventSchema.safeParse({
      ...batch.events[0],
      metadata: { message: "x".repeat(256) },
    }).success).toBe(false);
  });

  it("distinguishes a form attempt from a server-acknowledged contact response", () => {
    const base = validBatch().events[0];
    expect(analyticsEventSchema.safeParse({
      ...base,
      type: "form_submit",
      name: "form_submit_attempted",
    }).success).toBe(true);
    expect(analyticsEventSchema.safeParse({
      ...base,
      type: "form_submit",
      name: "contact_request_acknowledged",
    }).success).toBe(true);
    expect(analyticsEventSchema.safeParse({
      ...base,
      type: "conversion",
      name: "contact_request",
    }).success).toBe(false);
    expect(analyticsEventSchema.safeParse({
      ...base,
      type: "form_submit",
      name: "form_submitted",
    }).success).toBe(false);
  });
});
