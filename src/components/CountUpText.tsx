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

export function CountUpText({ value, className }: CountUpTextProps) {
  const segments = parseCountUpSegments(value);

  return (
    <span className={className ? `count-up-text ${className}` : "count-up-text"} aria-label={value}>
      {segments.map((segment, index) => {
        if (segment.type === "text") return segment.text;

        return <span key={`${segment.raw}-${index}`}>{segment.text}</span>;
      })}
    </span>
  );
}
