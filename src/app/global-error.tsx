"use client";

import { useEffect, useState } from "react";

type RecoveryLang = "en" | "de" | "pl" | "sl" | "ru";

const supportedRecoveryLanguages: readonly RecoveryLang[] = ["en", "de", "pl", "sl", "ru"];

const recoveryCopy: Record<RecoveryLang, { title: string; body: string; retry: string }> = {
  en: { title: "Something went wrong.", body: "Please try again. If the problem continues, contact info@aixco.global.", retry: "Try again" },
  de: { title: "Etwas ist schiefgelaufen.", body: "Bitte versuchen Sie es erneut. Wenn das Problem weiterhin besteht, kontaktieren Sie info@aixco.global.", retry: "Erneut versuchen" },
  ru: { title: "Произошла ошибка.", body: "Повторите попытку. Если проблема не исчезнет, напишите на info@aixco.global.", retry: "Повторить" },
  pl: { title: "Coś poszło nie tak.", body: "Spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z nami: info@aixco.global.", retry: "Spróbuj ponownie" },
  sl: { title: "Prišlo je do napake.", body: "Poskusite znova. Če se težava ponavlja, nam pišite na info@aixco.global.", retry: "Poskusi znova" },
};

function readRecoveryLang(): RecoveryLang {
  try {
    const value = window.localStorage.getItem("aixco-lang");
    return value && supportedRecoveryLanguages.includes(value as RecoveryLang) ? value as RecoveryLang : "en";
  } catch {
    return "en";
  }
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [lang, setLang] = useState<RecoveryLang>("en");

  useEffect(() => {
    const storedLang = readRecoveryLang();
    const safeDigest = error.digest && /^[a-zA-Z0-9._-]{1,128}$/.test(error.digest) ? error.digest : undefined;
    setLang(storedLang);
    document.documentElement.lang = storedLang;
    document.documentElement.dir = "ltr";
    console.error("AIXCO root render failed.", { digest: safeDigest });
    void fetch("/api/client-errors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "root-render", digest: safeDigest, locale: storedLang }),
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => undefined);
  }, [error]);

  const copy = recoveryCopy[lang];

  return (
    <html lang={lang} dir="ltr">
      <body style={{ margin: 0, background: "#F3EDE1", color: "#161616", fontFamily: "Arial, sans-serif" }}>
        <main style={{ boxSizing: "border-box", minHeight: "100dvh", display: "grid", placeItems: "center", paddingTop: "max(24px, env(safe-area-inset-top, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))", paddingBottom: "max(24px, env(safe-area-inset-bottom, 0px))", paddingLeft: "max(16px, env(safe-area-inset-left, 0px))" }}>
          <section style={{ width: "min(620px, 100%)", boxSizing: "border-box", border: "1px solid rgba(22,22,22,.16)", background: "#fff", padding: "clamp(28px, 8vw, 48px) clamp(18px, 6vw, 40px)", overflowWrap: "anywhere" }}>
            <p style={{ margin: 0, color: "#8b6a18", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>AIXCO.Global</p>
            <h1 style={{ margin: "22px 0 0", fontSize: "clamp(38px, 8vw, 64px)", lineHeight: 1, letterSpacing: -2 }}>{copy.title}</h1>
            <p style={{ margin: "22px 0 0", fontSize: 17, lineHeight: 1.65, color: "#55534f" }}>{copy.body}</p>
            <button type="button" onClick={reset} style={{ marginTop: 30, minHeight: 46, maxWidth: "100%", border: 0, background: "#161616", color: "#fff", padding: "10px 24px", fontSize: 15, fontWeight: 700, lineHeight: 1.35, overflowWrap: "anywhere", whiteSpace: "normal", cursor: "pointer" }}>
              {copy.retry}
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
