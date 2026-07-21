"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RecoveryLang = "en" | "de" | "pl" | "sl" | "ru";

const supportedRecoveryLanguages: readonly RecoveryLang[] = ["en", "de", "pl", "sl", "ru"];

const recoveryCopy: Record<RecoveryLang, { title: string; body: string; retry: string; home: string }> = {
  en: { title: "This page could not be loaded.", body: "Please try again. If the problem continues, contact info@aixco.global.", retry: "Try again", home: "Return to Home" },
  de: { title: "Diese Seite konnte nicht geladen werden.", body: "Bitte versuchen Sie es erneut. Wenn das Problem weiterhin besteht, kontaktieren Sie info@aixco.global.", retry: "Erneut versuchen", home: "Zur Startseite" },
  ru: { title: "Не удалось загрузить эту страницу.", body: "Повторите попытку. Если проблема не исчезнет, напишите на info@aixco.global.", retry: "Повторить", home: "Вернуться на главную" },
  pl: { title: "Nie udało się wczytać tej strony.", body: "Spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z nami: info@aixco.global.", retry: "Spróbuj ponownie", home: "Wróć na stronę główną" },
  sl: { title: "Te strani ni bilo mogoče naložiti.", body: "Poskusite znova. Če se težava ponavlja, nam pišite na info@aixco.global.", retry: "Poskusi znova", home: "Nazaj na domačo stran" },
};

function readRecoveryLang(): RecoveryLang {
  try {
    const value = window.localStorage.getItem("aixco-lang");
    return value && supportedRecoveryLanguages.includes(value as RecoveryLang) ? value as RecoveryLang : "en";
  } catch {
    return "en";
  }
}

function reportClientError(kind: string, digest: string | undefined, locale: RecoveryLang) {
  const safeDigest = digest && /^[a-zA-Z0-9._-]{1,128}$/.test(digest) ? digest : undefined;
  void fetch("/api/client-errors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, digest: safeDigest, locale }),
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined);
}

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [lang, setLang] = useState<RecoveryLang>("en");

  useEffect(() => {
    const storedLang = readRecoveryLang();
    setLang(storedLang);
    document.documentElement.lang = storedLang;
    document.documentElement.dir = "ltr";
    console.error("AIXCO route render failed.", { digest: error.digest });
    reportClientError("route-render", error.digest, storedLang);
  }, [error]);

  const copy = recoveryCopy[lang];

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-[#F3EDE1] pb-[max(4rem,env(safe-area-inset-bottom,0px))] pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] pt-[max(4rem,env(safe-area-inset-top,0px))] text-[#161616]">
      <section className="w-full max-w-2xl break-words border border-[#161616]/15 bg-white px-7 py-10 [overflow-wrap:anywhere] sm:px-12 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8b6a18]">AIXCO.Global</p>
        <h1 className="mt-5 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-none">{copy.title}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#55534f]">{copy.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal bg-[#161616] px-4 text-center text-sm font-bold text-white sm:px-6">
            {copy.retry}
          </button>
          <Link href="/" className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal border border-[#161616] px-4 text-center text-sm font-bold text-[#161616] sm:px-6">
            {copy.home}
          </Link>
        </div>
      </section>
    </main>
  );
}
