"use client";

import { useReportWebVitals } from "next/web-vitals";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const reportWebVitals: ReportWebVitalsCallback = (metric) => {
  const payload = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    pathname: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/web-vitals", new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch("/api/web-vitals", {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  });
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);
  return null;
}
