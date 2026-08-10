"use client";

import type { useReportWebVitals } from "next/web-vitals";
import { lazy, Suspense } from "react";
import { analyticsCollectionAllowed } from "@/lib/analytics/client";
import { ANALYTICS_SESSION_STORAGE_KEY } from "@/lib/analytics/constants";

const AnalyticsTracker = lazy(async () => {
  const analyticsModule = await import("@/components/AnalyticsTracker");
  return { default: analyticsModule.AnalyticsTracker };
});

const WebVitalsReporter = lazy(async () => {
  const reporterModule = await import("./web-vitals-reporter");
  return { default: reporterModule.WebVitalsReporter };
});

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const configuredSampleRate = Number.parseFloat(
  process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE ?? "",
);
const sampleRate = Number.isFinite(configuredSampleRate)
  ? Math.min(1, Math.max(0, configuredSampleRate))
  : 1;
let sampledSession: boolean | undefined;

function shouldReportSession() {
  if (sampledSession !== undefined) return sampledSession;

  try {
    const stored = window.sessionStorage.getItem("aixco-web-vitals-sampled");
    if (stored === "1" || stored === "0") {
      sampledSession = stored === "1";
      return sampledSession;
    }

    sampledSession = Math.random() < sampleRate;
    window.sessionStorage.setItem("aixco-web-vitals-sampled", sampledSession ? "1" : "0");
  } catch {
    sampledSession = Math.random() < sampleRate;
  }

  return sampledSession;
}

export const reportWebVitals: ReportWebVitalsCallback = (metric) => {
  if (!analyticsCollectionAllowed() || !shouldReportSession()) return;

  let sessionId: string | null = null;
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY) ?? "null") as {
      id?: unknown;
    } | null;
    sessionId = typeof stored?.id === "string" ? stored.id : null;
  } catch {
    sessionId = null;
  }

  const payload = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    pathname: window.location.pathname,
    sessionId,
  });

  if (navigator.sendBeacon?.(
    "/api/web-vitals",
    new Blob([payload], { type: "application/json" }),
  )) {
    return;
  }

  void fetch("/api/web-vitals", {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  }).catch(() => undefined);
};

export function WebVitals() {
  return (
    <Suspense fallback={null}>
      <WebVitalsReporter report={reportWebVitals} />
      <AnalyticsTracker />
    </Suspense>
  );
}
