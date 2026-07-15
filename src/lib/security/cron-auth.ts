import { timingSafeEqual } from "node:crypto";

export function isAuthorizedCronRequest(
  request: Request,
  env: Record<string, string | undefined> = process.env,
) {
  const secret = env.CRON_SECRET?.trim() ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (secret.length < 32 || provided.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
}
import "server-only";
