/**
 * Keep compact German money metrics visually identical to the English cards.
 * Written-out prose such as "400 Millionen US-Dollar" is intentionally left
 * untouched; only compact metric notation is normalized here.
 */
export function normalizeGermanCompactMillions(value: string): string {
  return value
    .replace(
      /(\d[\d.,]*)(\+?)\s*Mio\.\s*USD\b/giu,
      (_match, amount: string, plus: string) => `$${amount}M${plus}`,
    )
    .replace(
      /\bUSD\s+(\d[\d.,]*)(\+?)m\b/giu,
      (_match, amount: string, plus: string) => `$${amount}M${plus}`,
    )
    .replace(/^Mio\.\s*USD$/iu, "M");
}

const compactUsdMillionSourcePattern = /\bUSD\s+\d[\d.,]*m(?:\+)?(?=\s|$)/iu;

/**
 * Scope normalization to content explicitly authored as a compact USD-million
 * metric. Regular German prose continues through the translation layer verbatim.
 */
export function normalizeGermanCompactMetricTranslation(source: string, value: string): string {
  if (source.trim() !== "m USD" && !compactUsdMillionSourcePattern.test(source)) {
    return value;
  }

  return normalizeGermanCompactMillions(value);
}
