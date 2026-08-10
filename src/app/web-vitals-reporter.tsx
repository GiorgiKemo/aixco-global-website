"use client";

import { useReportWebVitals } from "next/web-vitals";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

export function WebVitalsReporter({ report }: { report: ReportWebVitalsCallback }) {
  useReportWebVitals(report);
  return null;
}
