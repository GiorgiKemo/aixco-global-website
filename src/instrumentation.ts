import type { Instrumentation } from "next";

export async function register() {
  // Reserved for future runtime-specific instrumentation setup.
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  try {
    const digest = typeof error === "object"
      && error !== null
      && "digest" in error
      && typeof error.digest === "string"
      ? error.digest.slice(0, 255)
      : null;
    const { storeSiteTelemetryEvent } = await import("@/lib/backend/site-telemetry");
    await storeSiteTelemetryEvent({
      eventKind: "server_error",
      eventName: "request_error",
      eventId: digest,
      pagePath: request.path,
      metadata: {
        digest: digest ?? undefined,
        routeKind: context.routeType,
        component: context.routePath,
        source: "next_on_request_error",
      },
    });
  } catch (telemetryError) {
    console.error("Server error telemetry could not be persisted.", telemetryError);
  }
};
