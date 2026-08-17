import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_OUTBOX_STORAGE_KEY,
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_VISITOR_STORAGE_KEY,
} from "@/lib/analytics/contracts";
import {
  openAnalyticsPreferences,
  recordAnalyticsEvent,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from "@/lib/analytics/client";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

import { AnalyticsTracker } from "./AnalyticsTracker";

type AnalyticsPayload = {
  session: {
    id: string;
    startedAt: string;
    lastSeenAt: string;
    landingPath: string;
    exitPath: string;
  };
  events: Array<{
    id: string;
    name: string;
    type: string;
    pagePath: string;
    targetLabel?: string | null;
    scrollDepth?: number | null;
  }>;
};

type StoredOutbox = Array<{ id: string; eventIds: string[]; payload: string }>;

function disableBrowserPrivacySignals() {
  Object.defineProperty(navigator, "globalPrivacyControl", {
    configurable: true,
    value: false,
  });
  Object.defineProperty(navigator, "doNotTrack", {
    configurable: true,
    value: null,
  });
  Object.defineProperty(window, "doNotTrack", {
    configurable: true,
    value: null,
  });
}

function storedResponse(stored: boolean) {
  return new Response(JSON.stringify({ ok: true, stored }), {
    status: 202,
    headers: { "Content-Type": "application/json" },
  });
}

function payloadFromFetch(
  mock: ReturnType<typeof vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>>,
  index: number,
) {
  const body = mock.mock.calls[index]?.[1]?.body;
  if (typeof body !== "string") throw new Error(`Missing analytics payload at fetch call ${index}.`);
  return JSON.parse(body) as AnalyticsPayload;
}

function readBlob(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsText(blob);
  });
}

function readOutbox() {
  const raw = window.sessionStorage.getItem(ANALYTICS_OUTBOX_STORAGE_KEY);
  return raw ? JSON.parse(raw) as StoredOutbox : [];
}

describe("AnalyticsTracker consent and session lifecycle", () => {
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    navigation.pathname = "/";
    document.documentElement.lang = "en";
    disableBrowserPrivacySignals();
    fetchMock.mockReset().mockImplementation(async () => storedResponse(true));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the initial privacy choice and starts analytics only after acceptance", async () => {
    render(<AnalyticsTracker />);

    expect(await screen.findByRole("dialog", { name: "Cookies & analytics" }))
      .toBeInTheDocument();
    expect(readAnalyticsConsent()).toBe("unset");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/Google Analytics and optional AIXCO analytics stay off until you choose/)).toBeVisible();

    fireEvent.click(screen.getByText("Read more"));
    expect(screen.getByText(/We use Google Analytics through Google Tag Manager/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(readAnalyticsConsent()).toBe("granted");
    expect(window.localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    const stored = JSON.parse(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)!);
    expect(stored).toMatchObject({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      landingPath: "/",
      activeSeconds: 0,
      lastSeenAt: expect.stringMatching(/^2026-|^20\d{2}-/),
    });
    expect(Date.parse(stored.lastSeenAt)).toBeGreaterThanOrEqual(Date.parse(stored.startedAt));
  });

  it("stores only a server-issued link proof for the matching analytics session", async () => {
    const linkToken = "a".repeat(64);
    fetchMock.mockImplementation(async (_input, init) => {
      const payload = JSON.parse(String(init?.body)) as AnalyticsPayload;
      return new Response(JSON.stringify({
        ok: true,
        stored: true,
        sessionId: payload.session.id,
        linkToken,
      }), { status: 202, headers: { "Content-Type": "application/json" } });
    });
    writeAnalyticsConsent("granted");

    render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await waitFor(() => {
      const stored = JSON.parse(
        window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY) ?? "{}",
      ) as { linkToken?: string };
      expect(stored.linkToken).toBe(linkToken);
    });
  });

  it("persists lifecycle beacon events without treating transport acceptance as storage", async () => {
    const sendBeacon = vi.fn<(url: string | URL, data?: BodyInit | null) => boolean>(() => true);
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: sendBeacon });
    writeAnalyticsConsent("granted");
    render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await act(async () => { await Promise.resolve(); });

    window.dispatchEvent(new Event("pagehide"));
    expect(sendBeacon).toHaveBeenCalledOnce();
    const beaconBody = sendBeacon.mock.calls[0]?.[1];
    if (!(beaconBody instanceof Blob)) throw new Error("Missing analytics beacon body.");
    const beaconPayload = JSON.parse(await readBlob(beaconBody)) as AnalyticsPayload;

    expect(beaconPayload.events.map((event) => event.name)).toEqual(["session_ended"]);
    expect(readOutbox()).toEqual([
      expect.objectContaining({
        eventIds: beaconPayload.events.map((event) => event.id),
        payload: expect.any(String),
      }),
    ]);
  });

  it("retains events for retry when a successful HTTP response reports stored false", async () => {
    fetchMock.mockImplementationOnce(async () => storedResponse(false));
    const sendBeacon = vi.fn<(url: string | URL, data?: BodyInit | null) => boolean>(() => true);
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: sendBeacon });
    writeAnalyticsConsent("granted");
    render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await act(async () => { await Promise.resolve(); });

    window.dispatchEvent(new Event("pagehide"));
    const beaconBody = sendBeacon.mock.calls[0]?.[1];
    if (!(beaconBody instanceof Blob)) throw new Error("Missing analytics beacon body.");
    const beaconPayload = JSON.parse(await readBlob(beaconBody)) as AnalyticsPayload;

    expect(beaconPayload.events.map((event) => event.name)).toEqual([
      "session_started",
      "page_view",
      "session_ended",
    ]);
    expect(readOutbox()[0]?.eventIds).toEqual(beaconPayload.events.map((event) => event.id));
  });

  it("replays a lifecycle outbox on the next mount and clears it only after stored true", async () => {
    const sendBeacon = vi.fn<(url: string | URL, data?: BodyInit | null) => boolean>(() => true);
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: sendBeacon });
    writeAnalyticsConsent("granted");
    const firstView = render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await act(async () => { await Promise.resolve(); });

    window.dispatchEvent(new Event("pagehide"));
    const persistedEventIds = readOutbox()[0]?.eventIds;
    expect(persistedEventIds).toHaveLength(1);
    firstView.unmount();
    fetchMock.mockClear();

    render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const replay = payloadFromFetch(fetchMock, 0);
    expect(replay.events.map((event) => event.name)).toEqual(["session_ended"]);
    expect(replay.events.map((event) => event.id)).toEqual(persistedEventIds);
    await waitFor(() => expect(readOutbox()).toHaveLength(0));
  });

  it("keeps a replayed outbox when the server reports stored false", async () => {
    const sendBeacon = vi.fn<(url: string | URL, data?: BodyInit | null) => boolean>(() => true);
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: sendBeacon });
    writeAnalyticsConsent("granted");
    const firstView = render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    window.dispatchEvent(new Event("pagehide"));
    const persisted = readOutbox();
    expect(persisted).toHaveLength(1);
    firstView.unmount();

    fetchMock.mockReset().mockImplementation(async () => storedResponse(false));
    render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await act(async () => { await Promise.resolve(); });

    expect(readOutbox()).toEqual(persisted);
  });

  it("bounds the lifecycle outbox to four batches and 120 unique idempotent events", async () => {
    const sendBeacon = vi.fn<(url: string | URL, data?: BodyInit | null) => boolean>(() => true);
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: sendBeacon });
    writeAnalyticsConsent("granted");
    render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    act(() => {
      for (let index = 0; index < 150; index += 1) {
        recordAnalyticsEvent({
          type: "click",
          name: "button_click",
          targetLabel: `bounded-event-${index}`,
        });
      }
    });
    window.dispatchEvent(new Event("pagehide"));

    const outbox = readOutbox();
    const eventIds = outbox.flatMap((batch) => batch.eventIds);
    expect(outbox).toHaveLength(4);
    expect(eventIds).toHaveLength(120);
    expect(new Set(eventIds).size).toBe(120);
    expect(outbox.every((batch) => batch.eventIds.length <= 30)).toBe(true);
    expect(sendBeacon).toHaveBeenCalledTimes(4);
  });

  it("rotates a session that exceeded the inactivity timeout", async () => {
    const staleId = "fd90fc90-b588-491f-8e1d-f1f69d738d4f";
    const staleLastSeen = new Date(Date.now() - 31 * 60_000).toISOString();
    window.sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, JSON.stringify({
      id: staleId,
      startedAt: "2026-08-07T10:00:00.000Z",
      lastSeenAt: staleLastSeen,
      landingPath: "/stale-landing",
      activeSeconds: 90,
    }));
    writeAnalyticsConsent("granted");

    render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const payload = payloadFromFetch(fetchMock, 0);

    expect(payload.session.id).not.toBe(staleId);
    expect(payload.session.landingPath).toBe("/");
    expect(payload.events.map((event) => event.name)).toContain("session_started");
    expect(JSON.parse(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)!).id)
      .toBe(payload.session.id);
  });

  it("rotates a live inactive session before assigning resumed events", async () => {
    writeAnalyticsConsent("granted");
    render(<AnalyticsTracker />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const firstPayload = payloadFromFetch(fetchMock, 0);
    const originalSessionId = firstPayload.session.id;
    const now = Date.now();
    const clock = vi.spyOn(Date, "now").mockReturnValue(now + 31 * 60_000);

    try {
      fireEvent.pointerDown(window);
      await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(3));
      const endedSession = payloadFromFetch(fetchMock, 1);
      const resumedSession = payloadFromFetch(fetchMock, 2);

      expect(endedSession.session.id).toBe(originalSessionId);
      expect(endedSession.events.map((event) => event.name)).toEqual(["session_ended"]);
      expect(resumedSession.session.id).not.toBe(originalSessionId);
      expect(resumedSession.events.map((event) => event.name)).toEqual([
        "session_started",
        "page_view",
      ]);
      expect(resumedSession.events.every((event) => event.pagePath === "/")).toBe(true);
      expect(JSON.parse(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)!).id)
        .toBe(resumedSession.session.id);
    } finally {
      clock.mockRestore();
    }
  });

  it("records SPA pathname changes and calls a form submit an attempt, not a conversion", async () => {
    writeAnalyticsConsent("granted");
    const view = render(
      <>
        <AnalyticsTracker />
        <form aria-label="Contact form" id="contact-form" />
      </>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await act(async () => { await Promise.resolve(); });

    navigation.pathname = "/aixco-global-op2/current-project";
    window.history.pushState({}, "", navigation.pathname);
    view.rerender(
      <>
        <AnalyticsTracker />
        <form aria-label="Contact form" id="contact-form" />
      </>,
    );
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 0)); });
    fireEvent.submit(screen.getByRole("form", { name: "Contact form" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const navigationPayload = payloadFromFetch(fetchMock, 1);
    expect(navigationPayload.events).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: "page_view",
        pagePath: "/aixco-global-op2/current-project",
        targetLabel: "/aixco-global-op2/current-project",
      }),
      expect.objectContaining({
        type: "form_submit",
        name: "form_submit_attempted",
        pagePath: "/aixco-global-op2/current-project",
      }),
    ]));
    expect(navigationPayload.events.map((event) => event.name)).not.toContain("contact_request_acknowledged");
  });

  it("resets and recomputes scroll milestones after SPA navigation", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 2_000 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 1_000 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
    writeAnalyticsConsent("granted");
    const view = render(
      <>
        <AnalyticsTracker />
        <form aria-label="Contact form" id="contact-form" />
      </>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    window.scrollY = 1_000;
    fireEvent.scroll(window);
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 20)); });
    window.scrollY = 0;
    navigation.pathname = "/aixco-global-op2/current-project";
    window.history.pushState({}, "", navigation.pathname);
    view.rerender(
      <>
        <AnalyticsTracker />
        <form aria-label="Contact form" id="contact-form" />
      </>,
    );
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 20)); });

    window.scrollY = 500;
    fireEvent.scroll(window);
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 20)); });
    fireEvent.submit(screen.getByRole("form", { name: "Contact form" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const navigationPayload = payloadFromFetch(fetchMock, 1);
    const routeScrollDepths = navigationPayload.events
      .filter((event) => event.type === "scroll_depth" && event.pagePath === navigation.pathname)
      .map((event) => event.scrollDepth);
    expect(routeScrollDepths).toEqual([25, 50]);
  });

  it("removes identifiers on denial and effect cleanup does not recreate them", async () => {
    writeAnalyticsConsent("granted");
    const view = render(<AnalyticsTracker />);

    await waitFor(() => {
      expect(window.localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY)).not.toBeNull();
      expect(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)).not.toBeNull();
    });
    window.dispatchEvent(new Event("pagehide"));
    expect(window.sessionStorage.getItem(ANALYTICS_OUTBOX_STORAGE_KEY)).not.toBeNull();

    act(() => openAnalyticsPreferences());
    expect(await screen.findByRole("dialog", { name: "Cookies & analytics" }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Necessary only" }));

    await waitFor(() => {
      expect(readAnalyticsConsent()).toBe("denied");
      expect(window.localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY)).toBeNull();
      expect(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)).toBeNull();
      expect(window.sessionStorage.getItem(ANALYTICS_OUTBOX_STORAGE_KEY)).toBeNull();
    });
    view.unmount();
    expect(window.localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("renders and collects nothing on admin routes even when consent was granted", async () => {
    writeAnalyticsConsent("granted");
    navigation.pathname = "/admin/analytics";
    window.history.replaceState({}, "", navigation.pathname);

    await act(async () => {
      render(<AnalyticsTracker />);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
