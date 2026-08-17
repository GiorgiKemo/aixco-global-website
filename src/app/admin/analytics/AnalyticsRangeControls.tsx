"use client";

import Link, { useLinkStatus } from "next/link";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { AnalyticsRange } from "@/lib/admin/analytics";
import type { DashboardFocus } from "./AnalyticsDashboard";

type RangeOption = {
  label: string;
  value: AnalyticsRange;
};

function PendingRangeLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full bg-[#a97d12] transition-opacity ${pending ? "animate-pulse opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}

function PendingRefreshLabel() {
  const { pending } = useLinkStatus();

  return (
    <>
      <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} aria-hidden="true" />
      <span>{pending ? "Refreshing" : "Refresh"}</span>
    </>
  );
}

export function AnalyticsRangeControls({
  focus,
  range,
  options,
}: {
  focus: DashboardFocus;
  range: AnalyticsRange;
  options: readonly RangeOption[];
}) {
  const [selectedRange, setSelectedRange] = useState(range);

  useEffect(() => {
    setSelectedRange(range);
  }, [range]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap rounded-[9px] border border-[#161616]/10 bg-[#f8f6f1] p-1" aria-label="Select reporting window">
        {options.map((option) => {
          const active = option.value === range;
          const selected = option.value === selectedRange;
          return (
            <Link
              key={option.value}
              href={`/admin/analytics?range=${option.value}&focus=${focus}`}
              prefetch={false}
              data-selected={selected ? "true" : "false"}
              onClick={() => setSelectedRange(option.value)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 min-w-[3.25rem] items-center justify-center rounded-[6px] px-3 text-xs font-semibold transition-[background-color,color,box-shadow] duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] ${selected ? "bg-white text-[#161616] shadow-sm" : "text-[#6f6e6a] hover:bg-white/65 hover:text-[#161616] active:bg-white active:text-[#161616] active:shadow-sm"}`}
            >
              <PendingRangeLabel label={option.label} />
            </Link>
          );
        })}
      </div>
      <Link
        href={`/admin/analytics?range=${range}&focus=${focus}`}
        prefetch={false}
        className="inline-flex min-h-11 min-w-[6.25rem] items-center justify-center gap-2 rounded-[9px] border border-[#161616]/10 bg-white px-3 text-xs font-semibold text-[#161616] transition-[border-color,color,background-color] duration-75 hover:border-primary hover:text-primary active:bg-[#f8f6f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]"
      >
        <PendingRefreshLabel />
      </Link>
    </div>
  );
}
