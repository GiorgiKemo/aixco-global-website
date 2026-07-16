"use client";

import { useReportWebVitals } from "next/web-vitals";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const configuredSampleRate = Number.parseFloat(
  process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE ?? "",
);
const sampleRate = Number.isFinite(configuredSampleRate)
  ? Math.min(1, Math.max(0, configuredSampleRate))
  : process.env.NODE_ENV === "production"
    ? 0.25
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
  if (!shouldReportSession()) return;

  const payload = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    pathname: window.location.pathname,
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
  useReportWebVitals(reportWebVitals);
  return null;
}
