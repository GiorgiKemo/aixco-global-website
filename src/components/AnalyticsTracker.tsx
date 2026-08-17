"use client";

import { BarChart3, ChevronDown, LockKeyhole, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_VERSION,
  ANALYTICS_OUTBOX_STORAGE_KEY,
  ANALYTICS_PREFERENCES_EVENT,
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_TRACK_EVENT,
  ANALYTICS_VISITOR_STORAGE_KEY,
} from "@/lib/analytics/constants";
import type {
  AnalyticsEventInput,
  AnalyticsSessionInput,
} from "@/lib/analytics/contracts";
import {
  analyticsCollectionAllowed,
  hasBrowserPrivacySignal,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsTrackDetail,
} from "@/lib/analytics/client";
import { isAnalyticsExcludedPath } from "@/lib/analytics/routes";

type StoredSession = {
  id: string;
  startedAt: string;
  lastSeenAt: string;
  landingPath: string;
  activeSeconds: number;
  linkToken?: string;
};

type StoredOutboxBatch = {
  id: string;
  eventIds: string[];
  payload: string;
};

const ANALYTICS_NAVIGATION_EVENT = "aixco:analytics-navigation";
const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60_000;
const OUTBOX_MAX_BATCHES = 4;
const OUTBOX_MAX_EVENTS = 120;
const OUTBOX_MAX_PAYLOAD_BYTES = 64 * 1024;
const OUTBOX_MAX_STORAGE_CHARACTERS = 280 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION_LINK_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

type Copy = {
  eyebrow: string;
  title: string;
  summary: string;
  body: string;
  privacyBody: string;
  expand: string;
  collapse: string;
  accept: string;
  necessary: string;
  close: string;
};

const copyByLanguage: Record<string, Copy> = {
  en: {
    eyebrow: "Privacy",
    title: "Cookies & analytics",
    summary: "Google Analytics and optional AIXCO analytics stay off until you choose. You can change this anytime.",
    body: "We use Google Analytics through Google Tag Manager, plus optional AIXCO analytics, to understand visits, navigation and performance. Google Analytics may use cookies or similar identifiers. These tools stay off until you choose “Accept analytics”. We never record form contents or passwords. Change your choice anytime in the footer.",
    privacyBody: "Your browser privacy signal is on, so Google Analytics and optional AIXCO analytics stay off.",
    expand: "Read more",
    collapse: "Show less",
    accept: "Accept analytics",
    necessary: "Necessary only",
    close: "Close preferences",
  },
  de: {
    eyebrow: "Datenschutz",
    title: "Cookies & Analysen",
    summary: "Google Analytics und optionale AIXCO-Analysen bleiben deaktiviert, bis Sie zustimmen. Sie können dies jederzeit ändern.",
    body: "Wir verwenden Google Analytics über Google Tag Manager sowie optionale AIXCO-Analysen, um Besuche, Navigation und Leistung zu verstehen. Google Analytics kann Cookies oder ähnliche Kennungen verwenden. Diese Tools bleiben deaktiviert, bis Sie „Analysen akzeptieren“ wählen. Formularinhalte und Passwörter werden niemals erfasst. Ihre Auswahl können Sie jederzeit in der Fußzeile ändern.",
    privacyBody: "Das Datenschutzsignal Ihres Browsers ist aktiv. Google Analytics und optionale AIXCO-Analysen bleiben deaktiviert.",
    expand: "Mehr erfahren",
    collapse: "Weniger anzeigen",
    accept: "Analysen akzeptieren",
    necessary: "Nur notwendige",
    close: "Einstellungen schließen",
  },
  pl: {
    eyebrow: "Prywatność",
    title: "Pliki cookie i analityka",
    summary: "Google Analytics i opcjonalna analityka AIXCO pozostają wyłączone, dopóki nie wyrazisz zgody. Możesz zmienić wybór w dowolnym momencie.",
    body: "Używamy Google Analytics przez Google Tag Manager oraz opcjonalnej analityki AIXCO, aby rozumieć wizyty, nawigację i wydajność. Google Analytics może używać plików cookie lub podobnych identyfikatorów. Narzędzia te pozostają wyłączone, dopóki nie wybierzesz „Akceptuj analitykę”. Nie rejestrujemy treści formularzy ani haseł. Wybór możesz zmienić w stopce.",
    privacyBody: "Sygnał prywatności przeglądarki jest aktywny, więc Google Analytics i opcjonalna analityka AIXCO pozostają wyłączone.",
    expand: "Dowiedz się więcej",
    collapse: "Pokaż mniej",
    accept: "Akceptuj analitykę",
    necessary: "Tylko niezbędne",
    close: "Zamknij ustawienia",
  },
  sl: {
    eyebrow: "Zasebnost",
    title: "Piškotki in analitika",
    summary: "Google Analytics in izbirna analitika AIXCO ostajata izklopljena, dokler ne izberete soglasja. Izbiro lahko kadar koli spremenite.",
    body: "Google Analytics prek Google Tag Manager in izbirno analitiko AIXCO uporabljamo za razumevanje obiskov, navigacije in delovanja. Google Analytics lahko uporablja piškotke ali podobne identifikatorje. Orodja ostanejo izklopljena, dokler ne izberete »Sprejmi analitiko«. Vsebine obrazcev in gesel ne beležimo. Izbiro lahko kadar koli spremenite v nogi strani.",
    privacyBody: "Signal zasebnosti brskalnika je aktiven, zato Google Analytics in izbirna analitika AIXCO ostajata izklopljena.",
    expand: "Preberite več",
    collapse: "Pokaži manj",
    accept: "Sprejmi analitiko",
    necessary: "Samo nujno",
    close: "Zapri nastavitve",
  },
  ru: {
    eyebrow: "Конфиденциальность",
    title: "Файлы cookie и аналитика",
    summary: "Google Analytics и необязательная аналитика AIXCO отключены, пока вы не дадите согласие. Вы можете изменить выбор в любое время.",
    body: "Мы используем Google Analytics через Google Tag Manager и необязательную аналитику AIXCO, чтобы понимать посещения, навигацию и производительность. Google Analytics может использовать файлы cookie и похожие идентификаторы. Эти инструменты отключены, пока вы не выберете «Принять аналитику». Мы не записываем содержимое форм или пароли. Вы можете изменить выбор в нижней части сайта.",
    privacyBody: "Сигнал конфиденциальности браузера активен, поэтому Google Analytics и необязательная аналитика AIXCO отключены.",
    expand: "Подробнее",
    collapse: "Скрыть подробности",
    accept: "Принять аналитику",
    necessary: "Только необходимые",
    close: "Закрыть настройки",
  },
};

function makeUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function currentPagePath() {
  const hash = /^#[a-z0-9][a-z0-9_-]{0,119}$/i.test(window.location.hash)
    ? window.location.hash
    : "";
  return `${window.location.pathname}${hash}`.slice(0, 800);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStoredOutboxBatch(value: unknown): value is StoredOutboxBatch {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value).sort();
  if (keys.join(",") !== "eventIds,id,payload") return false;
  if (typeof value.id !== "string" || !UUID_PATTERN.test(value.id)) return false;
  if (typeof value.payload !== "string" || value.payload.length === 0) return false;
  if (new Blob([value.payload]).size > OUTBOX_MAX_PAYLOAD_BYTES) return false;
  if (!Array.isArray(value.eventIds) || value.eventIds.length < 1 || value.eventIds.length > 30) {
    return false;
  }
  const eventIds = value.eventIds;
  if (!eventIds.every((id) => typeof id === "string" && UUID_PATTERN.test(id))) return false;
  if (new Set(eventIds).size !== eventIds.length) return false;

  try {
    const payload = JSON.parse(value.payload) as unknown;
    if (!isRecord(payload) || !isRecord(payload.consent) || !isRecord(payload.session)) return false;
    if (payload.consent.status !== "granted" || payload.consent.version !== ANALYTICS_CONSENT_VERSION) {
      return false;
    }
    if (typeof payload.session.id !== "string" || !UUID_PATTERN.test(payload.session.id)) return false;
    if (!Array.isArray(payload.events) || payload.events.length !== eventIds.length) return false;
    return payload.events.every((event, index) => (
      isRecord(event)
      && typeof event.id === "string"
      && event.id === eventIds[index]
      && UUID_PATTERN.test(event.id)
    ));
  } catch {
    return false;
  }
}

function readStoredOutbox(): StoredOutboxBatch[] {
  try {
    const raw = sessionStorage.getItem(ANALYTICS_OUTBOX_STORAGE_KEY);
    if (!raw) return [];
    if (raw.length > OUTBOX_MAX_STORAGE_CHARACTERS) {
      sessionStorage.removeItem(ANALYTICS_OUTBOX_STORAGE_KEY);
      return [];
    }
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value) || value.length > OUTBOX_MAX_BATCHES) throw new Error("invalid outbox");
    if (!value.every(isStoredOutboxBatch)) throw new Error("invalid outbox batch");
    const eventIds = value.flatMap((batch) => batch.eventIds);
    if (eventIds.length > OUTBOX_MAX_EVENTS || new Set(eventIds).size !== eventIds.length) {
      throw new Error("invalid outbox events");
    }
    return value;
  } catch {
    try {
      sessionStorage.removeItem(ANALYTICS_OUTBOX_STORAGE_KEY);
    } catch {
      // Optional analytics storage may be unavailable.
    }
    return [];
  }
}

function writeStoredOutbox(value: StoredOutboxBatch[]) {
  const bounded: StoredOutboxBatch[] = [];
  let eventCount = 0;
  for (const batch of value) {
    if (bounded.length >= OUTBOX_MAX_BATCHES) break;
    if (!isStoredOutboxBatch(batch)) continue;
    if (eventCount + batch.eventIds.length > OUTBOX_MAX_EVENTS) break;
    bounded.push(batch);
    eventCount += batch.eventIds.length;
  }

  try {
    if (bounded.length === 0) {
      sessionStorage.removeItem(ANALYTICS_OUTBOX_STORAGE_KEY);
      return bounded;
    }
    let serialized = JSON.stringify(bounded);
    while (bounded.length > 0 && serialized.length > OUTBOX_MAX_STORAGE_CHARACTERS) {
      bounded.pop();
      serialized = JSON.stringify(bounded);
    }
    if (bounded.length === 0) sessionStorage.removeItem(ANALYTICS_OUTBOX_STORAGE_KEY);
    else sessionStorage.setItem(ANALYTICS_OUTBOX_STORAGE_KEY, serialized);
  } catch {
    // The in-memory bounded outbox remains usable until this document closes.
  }
  return bounded;
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredSession>;
    if (
      typeof value.id === "string"
      && typeof value.startedAt === "string"
      && typeof value.lastSeenAt === "string"
      && typeof value.landingPath === "string"
      && typeof value.activeSeconds === "number"
      && (value.linkToken === undefined
        || (typeof value.linkToken === "string" && SESSION_LINK_TOKEN_PATTERN.test(value.linkToken)))
    ) {
      const lastSeenAt = Date.parse(value.lastSeenAt);
      const age = Date.now() - lastSeenAt;
      if (Number.isFinite(lastSeenAt) && age >= -5 * 60_000 && age <= SESSION_INACTIVITY_TIMEOUT_MS) {
        return value as StoredSession;
      }
      sessionStorage.removeItem(ANALYTICS_SESSION_STORAGE_KEY);
    }
  } catch {
    // A fresh in-memory session is sufficient when storage is blocked.
  }
  return null;
}

function writeStoredSession(value: StoredSession) {
  try {
    value.lastSeenAt = new Date(Date.now()).toISOString();
    sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Analytics storage is optional.
  }
}

function getVisitor() {
  let visitorId: string | null = null;
  try {
    visitorId = localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY);
  } catch {
    // Fall back to a session-scoped identifier below.
  }
  const isReturning = Boolean(visitorId);
  visitorId ||= makeUuid();
  try {
    localStorage.setItem(ANALYTICS_VISITOR_STORAGE_KEY, visitorId);
  } catch {
    // Persistence is optional.
  }
  return { visitorId, isReturning };
}

function getCampaign() {
  const params = new URLSearchParams(window.location.search);
  const read = (key: string, maxLength: number) => params.get(key)?.trim().slice(0, maxLength) || null;
  return {
    source: read("utm_source", 120),
    medium: read("utm_medium", 120),
    campaign: read("utm_campaign", 160),
    term: read("utm_term", 160),
    content: read("utm_content", 160),
  };
}

function getSafeReferrer() {
  if (!document.referrer) return null;
  try {
    const referrer = new URL(document.referrer);
    if (referrer.protocol !== "https:" && referrer.protocol !== "http:") return null;
    return `${referrer.origin}${referrer.pathname}`.slice(0, 1_000);
  } catch {
    return null;
  }
}

function getTargetLabel(element: Element) {
  const explicit = element.getAttribute("data-analytics-label")
    || element.getAttribute("aria-label")
    || element.getAttribute("name")
    || element.id;
  if (explicit) return explicit.trim().slice(0, 120);
  if (element instanceof HTMLAnchorElement) {
    try {
      return new URL(element.href, window.location.href).pathname.slice(0, 120);
    } catch {
      return "link";
    }
  }
  return element.tagName.toLowerCase().slice(0, 120);
}

function classifyClick(element: Element): AnalyticsTrackDetail {
  if (!(element instanceof HTMLAnchorElement)) {
    return {
      type: "click",
      name: element.closest("button,[role='button']") ? "button_click" : "link_click",
      targetLabel: getTargetLabel(element),
      metadata: { elementRole: element.getAttribute("role") || element.tagName.toLowerCase() },
    };
  }

  const url = new URL(element.href, window.location.href);
  const protocol = url.protocol.toLowerCase();
  const label = getTargetLabel(element);
  const baseMetadata = {
    elementRole: "link",
    linkHost: url.hostname.slice(0, 255),
    linkPath: url.pathname.slice(0, 255),
  };
  if (protocol === "tel:") {
    return { type: "click", name: "phone_click", targetLabel: label, metadata: { elementRole: "link" } };
  }
  if (protocol === "mailto:") {
    return { type: "click", name: "email_click", targetLabel: label, metadata: { elementRole: "link" } };
  }
  if (/wa\.me$|whatsapp\.com$/i.test(url.hostname)) {
    return { type: "click", name: "whatsapp_click", targetLabel: label, metadata: baseMetadata };
  }
  const extension = url.pathname.split(".").pop()?.toLowerCase() ?? "";
  if (element.hasAttribute("download") || ["pdf", "doc", "docx", "jpeg", "jpg", "png", "zip"].includes(extension)) {
    return {
      type: "download",
      name: "download_requested",
      targetLabel: label,
      metadata: { ...baseMetadata, downloadExtension: extension.slice(0, 12) },
    };
  }
  if (/linkedin\.com$|instagram\.com$|facebook\.com$/i.test(url.hostname)) {
    return { type: "click", name: "social_click", targetLabel: label, metadata: baseMetadata };
  }
  if (url.origin !== window.location.origin) {
    return { type: "outbound", name: "outbound_link", targetLabel: label, metadata: baseMetadata };
  }
  return { type: "click", name: "link_click", targetLabel: label, metadata: baseMetadata };
}

function useAnalyticsCollection(enabled: boolean) {
  useEffect(() => {
    if (!enabled || window.location.pathname.startsWith("/admin")) return undefined;

    const existingSession = readStoredSession();
    let session: StoredSession = existingSession ?? {
      id: makeUuid(),
      startedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      landingPath: currentPagePath(),
      activeSeconds: 0,
    };
    const visitor = getVisitor();
    let campaign = getCampaign();
    const queue: AnalyticsEventInput[] = [];
    let outbox = readStoredOutbox();
    let seenForms = new WeakSet<HTMLFormElement>();
    const scrollMilestones = new Set<number>();
    let scrollFrame = 0;
    let lastActivityAt = Date.now();
    let lastActiveTick = Date.now();
    let engagementSinceEventMs = 0;
    let currentSection = "";
    let lastPage = "";
    let lastLanguage = document.documentElement.lang || navigator.language || "en";
    let endedAt: string | null = null;
    let flushInFlight = false;
    let disposed = false;
    let collectionEnabled = true;
    let failedFlushes = 0;
    let nextFlushAt = 0;

    const enqueue = (detail: AnalyticsTrackDetail, overrides: Partial<AnalyticsEventInput> = {}) => {
      if (!collectionEnabled || queue.length >= 120) return;
      queue.push({
        id: makeUuid(),
        type: detail.type,
        name: detail.name,
        pagePath: currentPagePath(),
        occurredAt: new Date().toISOString(),
        sectionId: detail.sectionId ?? null,
        targetLabel: detail.targetLabel ?? null,
        value: detail.value ?? null,
        durationMs: detail.durationMs ?? null,
        scrollDepth: detail.scrollDepth ?? null,
        metadata: detail.metadata ?? {},
        ...overrides,
      });
    };

    const sessionPayload = (seenAt = new Date(Date.now())): AnalyticsSessionInput => {
      session.lastSeenAt = seenAt.toISOString();
      return {
        id: session.id,
        visitorId: visitor.visitorId,
        startedAt: session.startedAt,
        lastSeenAt: session.lastSeenAt,
        endedAt,
        activeSeconds: session.activeSeconds,
        landingPath: session.landingPath,
        exitPath: currentPagePath(),
        referrer: getSafeReferrer(),
        campaign,
        locale: document.documentElement.lang || navigator.language || "en",
        timezone: (() => {
          try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
          } catch {
            return null;
          }
        })(),
        screenWidth: window.screen?.width ?? null,
        screenHeight: window.screen?.height ?? null,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        isReturning: visitor.isReturning,
      };
    };

    const makePayload = (snapshot: AnalyticsSessionInput, events: AnalyticsEventInput[]) => JSON.stringify({
      consent: { status: "granted", version: ANALYTICS_CONSENT_VERSION },
      session: snapshot,
      events,
    });

    const persistEventsToOutbox = (
      snapshot: AnalyticsSessionInput,
      candidates: AnalyticsEventInput[],
    ) => {
      const persistedIds = new Set(outbox.flatMap((batch) => batch.eventIds));
      const availableEvents = Math.max(0, OUTBOX_MAX_EVENTS - persistedIds.size);
      const freshEvents = candidates
        .filter((event) => !persistedIds.has(event.id))
        .slice(0, availableEvents);
      let cursor = 0;

      while (cursor < freshEvents.length && outbox.length < OUTBOX_MAX_BATCHES) {
        const events: AnalyticsEventInput[] = [];
        let payload = "";
        while (cursor < freshEvents.length && events.length < 30) {
          const candidate = freshEvents[cursor];
          const nextEvents = [...events, candidate];
          const nextPayload = makePayload(snapshot, nextEvents);
          if (new Blob([nextPayload]).size > OUTBOX_MAX_PAYLOAD_BYTES) {
            // A single oversized event cannot be retried through the bounded API.
            if (events.length === 0) cursor += 1;
            break;
          }
          events.push(candidate);
          payload = nextPayload;
          cursor += 1;
        }
        if (events.length === 0) continue;
        outbox.push({
          id: makeUuid(),
          eventIds: events.map((event) => event.id),
          payload,
        });
      }
      outbox = writeStoredOutbox(outbox);
    };

    const acknowledgeIds = (ids: string[]) => {
      const acceptedIds = new Set(ids);
      for (let index = queue.length - 1; index >= 0; index -= 1) {
        if (acceptedIds.has(queue[index].id)) queue.splice(index, 1);
      }
      outbox = writeStoredOutbox(outbox.flatMap((batch) => {
        const remainingIds = batch.eventIds.filter((id) => !acceptedIds.has(id));
        // Responses acknowledge an entire submitted payload. A partially
        // overlapping batch is retained intact rather than rewritten unsafely.
        return remainingIds.length === 0 ? [] : [batch];
      }));
    };

    const flush = async (useBeacon = false) => {
      if (disposed || !collectionEnabled || (queue.length === 0 && outbox.length === 0)) return;
      if (!useBeacon && flushInFlight) return;
      if (!useBeacon && Date.now() < nextFlushAt) return;
      const ownsFlushLock = !useBeacon;
      if (ownsFlushLock) flushInFlight = true;

      if (useBeacon && queue.length > 0) {
        const snapshot = sessionPayload();
        writeStoredSession(session);
        persistEventsToOutbox(snapshot, queue);
      }

      const persistedBatch = outbox[0] ?? null;
      const events = persistedBatch ? [] : queue.slice(0, 30);
      const eventIds = persistedBatch
        ? persistedBatch.eventIds
        : events.map((event) => event.id);
      const payload = persistedBatch
        ? persistedBatch.payload
        : makePayload(sessionPayload(), events);
      if (!persistedBatch) writeStoredSession(session);

      if (useBeacon && navigator.sendBeacon) {
        const beaconPayloads = outbox.length > 0
          ? outbox.map((batch) => batch.payload)
          : [payload];
        let accepted = false;
        for (const beaconPayload of beaconPayloads) {
          const queued = navigator.sendBeacon(
            "/api/analytics/events",
            new Blob([beaconPayload], { type: "application/json" }),
          );
          if (!queued) break;
          accepted = true;
        }
        // Transport acceptance is not a storage acknowledgement. The bounded
        // outbox remains until a later fetch receives `{ stored: true }`.
        if (accepted) return;
      }

      let stored = false;
      try {
        const response = await fetch("/api/analytics/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
          credentials: "same-origin",
        });
        const result = await response.json().catch(() => null) as {
          stored?: unknown;
          sessionId?: unknown;
          linkToken?: unknown;
        } | null;
        if (response.ok && result?.stored === true) {
          if (
            typeof result.sessionId === "string"
            && result.sessionId.toLowerCase() === session.id.toLowerCase()
            && typeof result.linkToken === "string"
            && SESSION_LINK_TOKEN_PATTERN.test(result.linkToken)
          ) {
            session.linkToken = result.linkToken;
            writeStoredSession(session);
          }
          acknowledgeIds(eventIds);
          failedFlushes = 0;
          nextFlushAt = 0;
          stored = true;
        } else {
          failedFlushes += 1;
          nextFlushAt = Date.now() + Math.min(120_000, 5_000 * (2 ** Math.min(5, failedFlushes - 1)));
        }
      } catch {
        // The same idempotent event IDs remain queued for the next flush.
        failedFlushes += 1;
        nextFlushAt = Date.now() + Math.min(120_000, 5_000 * (2 ** Math.min(5, failedFlushes - 1)));
      } finally {
        if (ownsFlushLock) flushInFlight = false;
        if (stored && !disposed && (outbox.length > 0 || queue.length > 0)) {
          window.setTimeout(() => void flush(), 0);
        }
      }
    };

    const measureScroll = () => {
      scrollFrame = 0;
      if (scrollMilestones.size === 5) return;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const depth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      for (const milestone of [25, 50, 75, 90, 100]) {
        if (depth >= milestone && !scrollMilestones.has(milestone)) {
          scrollMilestones.add(milestone);
          enqueue({ type: "scroll_depth", name: "scroll_depth", scrollDepth: milestone, value: milestone });
        }
      }
    };
    const scheduleScrollMeasurement = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(measureScroll);
    };
    const recordPageView = () => {
      const pagePath = currentPagePath();
      if (pagePath === lastPage) return;
      lastPage = pagePath;
      currentSection = "";
      scrollMilestones.clear();
      enqueue({ type: "page_view", name: "page_view", targetLabel: pagePath });
      scheduleScrollMeasurement();
    };
    const rotateSessionIfInactive = (now = Date.now()) => {
      if (now - lastActivityAt <= SESSION_INACTIVITY_TIMEOUT_MS) return false;
      const rotatedAt = new Date(now);
      endedAt = rotatedAt.toISOString();
      if (queue.length >= OUTBOX_MAX_EVENTS) queue.pop();
      enqueue({
        type: "session_end",
        name: "session_ended",
        value: session.activeSeconds,
      }, { occurredAt: endedAt });
      const previousSession = sessionPayload(rotatedAt);
      persistEventsToOutbox(previousSession, queue);
      queue.splice(0, queue.length);

      session = {
        id: makeUuid(),
        startedAt: rotatedAt.toISOString(),
        lastSeenAt: rotatedAt.toISOString(),
        landingPath: currentPagePath(),
        activeSeconds: 0,
      };
      visitor.isReturning = true;
      campaign = getCampaign();
      endedAt = null;
      lastActivityAt = now;
      lastActiveTick = now;
      engagementSinceEventMs = 0;
      currentSection = "";
      lastPage = "";
      seenForms = new WeakSet<HTMLFormElement>();
      enqueue({ type: "session_start", name: "session_started" }, { occurredAt: rotatedAt.toISOString() });
      recordPageView();
      writeStoredSession(session);
      void flush();
      return true;
    };
    const markActivity = () => {
      const now = Date.now();
      rotateSessionIfInactive(now);
      lastActivityAt = now;
    };
    const onTrack = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsTrackDetail>).detail;
      if (detail?.type && detail?.name) {
        markActivity();
        enqueue(detail);
      }
    };
    const onConsentChange = () => {
      collectionEnabled = analyticsCollectionAllowed();
      if (!collectionEnabled) {
        queue.splice(0, queue.length);
        outbox = [];
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest("a,button,[role='button'],summary")
        : null;
      if (!target || target.closest("[data-analytics-ignore='true']")) return;
      markActivity();
      enqueue(classifyClick(target));
    };
    const onFocus = (event: FocusEvent) => {
      const form = event.target instanceof Element ? event.target.closest("form") : null;
      if (!(form instanceof HTMLFormElement)) return;
      markActivity();
      if (seenForms.has(form)) return;
      seenForms.add(form);
      enqueue({
        type: "form_start",
        name: "form_started",
        targetLabel: form.getAttribute("data-analytics-label") || form.id || "form",
        metadata: { formId: (form.id || "form").slice(0, 120) },
      });
    };
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) return;
      markActivity();
      enqueue({
        type: "form_submit",
        name: "form_submit_attempted",
        targetLabel: form.getAttribute("data-analytics-label") || form.id || "form",
        metadata: { formId: (form.id || "form").slice(0, 120) },
      });
      void flush();
    };
    const onNavigation = () => window.setTimeout(() => {
      markActivity();
      observeSections();
      recordPageView();
    }, 0);
    const onVisibility = () => {
      lastActiveTick = Date.now();
      if (document.visibilityState === "hidden") {
        void flush(true);
      } else {
        markActivity();
        void flush();
      }
    };
    const onPageHide = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        endedAt = new Date().toISOString();
        if (queue.length >= OUTBOX_MAX_EVENTS) queue.pop();
        enqueue({
          type: "session_end",
          name: "session_ended",
          value: session.activeSeconds,
        }, { occurredAt: endedAt });
      }
      void flush(true);
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        endedAt = null;
        lastActiveTick = Date.now();
        markActivity();
        void flush();
      }
    };
    const onScroll = () => {
      markActivity();
      scheduleScrollMeasurement();
    };

    const sectionNames = new WeakMap<Element, string>();
    const observedSections = new WeakSet<Element>();
    const sectionObserver = new IntersectionObserver((entries) => {
      const candidate = entries
        .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!candidate) return;
      rotateSessionIfInactive();
      const sectionId = sectionNames.get(candidate.target) ?? "section";
      if (sectionId === currentSection) return;
      currentSection = sectionId;
      enqueue({ type: "section_view", name: "section_view", sectionId, targetLabel: sectionId });
    }, { threshold: [0.5, 0.75] });
    const observeSections = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>(
        "[data-story-section],[data-analytics-section],section[id],main > section",
      ));
      sections.forEach((section, index) => {
        if (observedSections.has(section)) return;
        observedSections.add(section);
        sectionNames.set(
          section,
          (section.dataset.analyticsSection
            || section.dataset.storySection
            || section.id
            || section.getAttribute("aria-label")
            || `section-${String(index + 1).padStart(2, "0")}`)
            .trim()
            .slice(0, 120),
        );
        sectionObserver.observe(section);
      });
    };
    observeSections();
    let sectionDiscoveryFrame = 0;
    const contentObserver = new MutationObserver(() => {
      if (sectionDiscoveryFrame) return;
      sectionDiscoveryFrame = window.requestAnimationFrame(() => {
        sectionDiscoveryFrame = 0;
        observeSections();
      });
    });
    contentObserver.observe(document.body, { childList: true, subtree: true });
    const contentObserverTimeout = window.setTimeout(() => contentObserver.disconnect(), 5_000);

    const languageObserver = new MutationObserver(() => {
      const nextLanguage = document.documentElement.lang || "en";
      if (nextLanguage === lastLanguage) return;
      rotateSessionIfInactive();
      enqueue({
        type: "language_change",
        name: "language_changed",
        targetLabel: nextLanguage,
        metadata: { language: nextLanguage, previousLanguage: lastLanguage },
      });
      lastLanguage = nextLanguage;
    });
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    if (!existingSession) enqueue({ type: "session_start", name: "session_started" });
    recordPageView();
    window.addEventListener(ANALYTICS_TRACK_EVENT, onTrack);
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsentChange);
    window.addEventListener("click", onClick, { capture: true, passive: true });
    window.addEventListener("focusin", onFocus, { capture: true });
    window.addEventListener("submit", onSubmit, { capture: true });
    window.addEventListener("hashchange", onNavigation);
    window.addEventListener("popstate", onNavigation);
    window.addEventListener(ANALYTICS_NAVIGATION_EVENT, onNavigation);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", markActivity, { passive: true });
    window.addEventListener("keydown", markActivity);
    window.addEventListener("touchstart", markActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    const activityTimer = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.min(15_000, Math.max(0, now - lastActiveTick));
      lastActiveTick = now;
      if (document.visibilityState !== "visible" || now - lastActivityAt > 60_000) return;
      session.activeSeconds += Math.round(elapsed / 1_000);
      engagementSinceEventMs += elapsed;
      if (engagementSinceEventMs >= 30_000) {
        enqueue({
          type: "engagement",
          name: "active_time",
          durationMs: engagementSinceEventMs,
          value: Math.round(engagementSinceEventMs / 1_000),
          sectionId: currentSection || null,
        });
        engagementSinceEventMs = 0;
      }
    }, 10_000);
    const flushTimer = window.setInterval(() => void flush(), 12_000);
    void flush();

    return () => {
      disposed = true;
      collectionEnabled = false;
      sectionObserver.disconnect();
      contentObserver.disconnect();
      if (sectionDiscoveryFrame) window.cancelAnimationFrame(sectionDiscoveryFrame);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      window.clearTimeout(contentObserverTimeout);
      languageObserver.disconnect();
      window.clearInterval(activityTimer);
      window.clearInterval(flushTimer);
      window.removeEventListener(ANALYTICS_TRACK_EVENT, onTrack);
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, onConsentChange);
      window.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("focusin", onFocus, { capture: true });
      window.removeEventListener("submit", onSubmit, { capture: true });
      window.removeEventListener("hashchange", onNavigation);
      window.removeEventListener("popstate", onNavigation);
      window.removeEventListener(ANALYTICS_NAVIGATION_EVENT, onNavigation);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", markActivity);
      window.removeEventListener("keydown", markActivity);
      window.removeEventListener("touchstart", markActivity);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      queue.splice(0, queue.length);
    };
  }, [enabled]);
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"granted" | "denied" | "unset">("unset");
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const privacySignal = ready && hasBrowserPrivacySignal();
  const excludedRoute = isAnalyticsExcludedPath(pathname);
  const enabled = ready && consent === "granted" && !privacySignal && !excludedRoute;
  useAnalyticsCollection(enabled);

  useEffect(() => {
    setConsent(readAnalyticsConsent());
    setLanguage(document.documentElement.lang || "en");
    setReady(true);
    const onConsent = () => setConsent(readAnalyticsConsent());
    const onPreferences = () => setPreferencesOpen(true);
    const languageObserver = new MutationObserver(() => {
      setLanguage(document.documentElement.lang || "en");
    });
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, onPreferences);
    return () => {
      languageObserver.disconnect();
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
      window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, onPreferences);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.dispatchEvent(new Event(ANALYTICS_NAVIGATION_EVENT));
  }, [pathname, ready]);

  if (!ready || excludedRoute) return null;
  if (consent !== "unset" && !preferencesOpen) return null;

  const copy = copyByLanguage[language] ?? copyByLanguage.en;
  const showClose = preferencesOpen && consent !== "unset";

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="analytics-consent-title"
      data-analytics-ignore="true"
      className="analytics-consent fixed inset-x-3 z-[120] mx-auto w-auto max-w-[23rem] overflow-hidden border border-primary/30 bg-surface-elevated/95 text-foreground shadow-[0_24px_70px_-30px_rgb(17_16_14/0.58)] backdrop-blur-xl sm:inset-x-auto sm:start-1/2 sm:w-[min(23rem,calc(100vw-2rem))] sm:-translate-x-1/2"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Champagne edge accent */}
      <div
        aria-hidden
        className="h-px w-full"
        style={{ background: "var(--gradient-gold)" }}
      />

      <div className="relative p-4">
        {showClose && (
          <button
            type="button"
            onClick={() => {
              setPreferencesOpen(false);
              setDetailsOpen(false);
            }}
            aria-label={copy.close}
            className="icon-button-glass absolute end-3 top-3 h-9 w-9 shrink-0"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}

        <div className={`flex items-start gap-3 ${showClose ? "pe-10" : ""}`}>
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
            {privacySignal ? (
              <LockKeyhole className="h-4 w-4" aria-hidden />
            ) : (
              <BarChart3 className="h-4 w-4" aria-hidden />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
              {copy.eyebrow}
            </p>
            <h2
              id="analytics-consent-title"
              className="mt-1 font-display text-lg font-semibold leading-tight tracking-[-0.02em]"
            >
              {copy.title}
            </h2>
          </div>
        </div>

        {privacySignal ? (
          <p className="mt-3 text-sm leading-relaxed text-foreground/70">{copy.privacyBody}</p>
        ) : (
          <details
            className="group mt-3"
            open={detailsOpen}
            onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
          >
            <summary className="cursor-pointer list-none text-sm leading-snug text-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [&::-webkit-details-marker]:hidden">
              {copy.summary}{" "}
              <span className="inline-flex items-center gap-1 whitespace-nowrap align-baseline text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-primary">
                {detailsOpen ? copy.collapse : copy.expand}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${detailsOpen ? "rotate-180" : ""}`} aria-hidden />
              </span>
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-foreground/62">{copy.body}</p>
          </details>
        )}

        <div
          className={
            privacySignal
              ? "mt-4 grid grid-cols-1 gap-2.5"
              : "mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          }
        >
          <button
            type="button"
            onClick={() => {
              writeAnalyticsConsent("denied");
              setPreferencesOpen(false);
              setDetailsOpen(false);
            }}
            className="btn-ghost-gold !min-h-10 whitespace-nowrap !px-4 !py-2 !text-[0.7rem]"
          >
            {copy.necessary}
          </button>
          {!privacySignal && (
            <button
              type="button"
              onClick={() => {
                writeAnalyticsConsent("granted");
                setPreferencesOpen(false);
                setDetailsOpen(false);
              }}
              className="btn-gold !min-h-10 whitespace-nowrap !px-4 !py-2 !text-[0.7rem]"
            >
              {copy.accept}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
