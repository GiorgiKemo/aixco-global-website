export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; error: "invalid-json" | "payload-too-large" };

export async function readBoundedJson(request: Request, maxBytes: number): Promise<BoundedJsonResult> {
  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, error: "payload-too-large" };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, error: "invalid-json" };

  const decoder = new TextDecoder();
  let byteLength = 0;
  let rawBody = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel();
        return { ok: false, error: "payload-too-large" };
      }
      rawBody += decoder.decode(value, { stream: true });
    }
    rawBody += decoder.decode();
  } catch {
    return { ok: false, error: "invalid-json" };
  }

  try {
    return { ok: true, value: JSON.parse(rawBody) };
  } catch {
    return { ok: false, error: "invalid-json" };
  }
}
