const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const secretPattern = /\b(?:re_|whsec_|sb_secret_|sb_publishable_)[A-Za-z0-9._-]+\b/g;
const bearerPattern = /\bBearer\s+[^\s,;]+/gi;

export function sanitizeOperationalError(reason: string, maxLength = 1000) {
  return reason
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(emailPattern, "[redacted-email]")
    .replace(secretPattern, "[redacted-secret]")
    .replace(bearerPattern, "Bearer [redacted-secret]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
