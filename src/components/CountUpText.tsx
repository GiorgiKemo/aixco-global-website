import { useEffect, useMemo, useRef, useState } from "react";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

export type CountUpTextSegment =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "number";
      text: string;
      raw: string;
      value: number;
      decimals: number;
      grouped: boolean;
    };

type CountUpNumberSegment = Extract<CountUpTextSegment, { type: "number" }>;

type CountUpTextProps = {
  value: string;
  className?: string;
  delay?: number;
  duration?: number;
};

const NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?/g;

function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - value, 4);
}

export function parseCountUpSegments(value: string): CountUpTextSegment[] {
  const segments: CountUpTextSegment[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(NUMBER_PATTERN)) {
    const raw = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      segments.push({ type: "text", text: value.slice(lastIndex, index) });
    }

    const decimalPart = raw.split(".")[1] ?? "";
    segments.push({
      type: "number",
      text: raw,
      raw,
      value: Number(raw.replace(/,/g, "")),
      decimals: decimalPart.length,
      grouped: raw.includes(","),
    });

    lastIndex = index + raw.length;
  }

  if (lastIndex < value.length) {
    segments.push({ type: "text", text: value.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: "text", text: value }];
}

export function formatCountValue(value: number, segment: CountUpNumberSegment): string {
  const fixed = value.toFixed(segment.decimals);
  const [integer, decimal] = fixed.split(".");
  const formattedInteger = segment.grouped ? Number(integer).toLocaleString("en-US") : integer;

  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
}

export function getCountStartValue(segment: CountUpNumberSegment): number {
  const looksLikeYear =
    segment.decimals === 0 &&
    !segment.grouped &&
    segment.value >= 1900 &&
    segment.value <= 2100;

  return looksLikeYear ? segment.value - 16 : 0;
}

export function CountUpText({ value, className, delay = 0.12, duration = 1.1 }: CountUpTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const segments = useMemo(() => parseCountUpSegments(value), [value]);
  const shouldReduceMotion = useHydratedReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }

    const target = ref.current;
    if (!target || typeof window === "undefined" || typeof window.IntersectionObserver !== "function") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.28 },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setProgress(1);
      return;
    }

    if (!isVisible || typeof window === "undefined") return;

    let frame = 0;
    let startTime: number | undefined;
    const delayMs = Math.max(delay, 0) * 1000;
    const durationMs = Math.max(duration, 0.01) * 1000;

    setProgress(0);

    const tick = (time: number) => {
      startTime ??= time;
      const elapsed = time - startTime - delayMs;

      if (elapsed <= 0) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      const nextProgress = Math.min(elapsed / durationMs, 1);
      setProgress(easeOutQuart(nextProgress));

      if (nextProgress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [delay, duration, isVisible, shouldReduceMotion, value]);

  return (
    <span ref={ref} className={className ? `count-up-text ${className}` : "count-up-text"} aria-label={value}>
      {segments.map((segment, index) => {
        if (segment.type === "text") return segment.text;

        const start = getCountStartValue(segment);
        const animatedValue = start + (segment.value - start) * progress;

        return <span key={`${segment.raw}-${index}`}>{formatCountValue(animatedValue, segment)}</span>;
      })}
    </span>
  );
}
