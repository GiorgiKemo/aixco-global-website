import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnalyticsCountryBreakdownItem } from "@/lib/admin/analytics";
import { CountryExplorer } from "./CountryExplorer";

const country: AnalyticsCountryBreakdownItem = {
  countryCode: "CH",
  countryName: "Switzerland",
  sessions: 2,
  visitors: 1,
  engagedSessions: 1,
  engagedVisitors: 1,
  briefSessions: 1,
  localOrQaSessions: 0,
};

const visitorId = "11111111-1111-4111-8111-111111111111";

describe("CountryExplorer", () => {
  it("loads a country visitor list and then the selected visitor timeline", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("visitor=")) {
        return Promise.resolve(new Response(JSON.stringify({
          kind: "activity",
          activity: {
            visitorId,
            countryCode: "CH",
            events: 1,
            truncated: false,
            sessions: [{
              id: "22222222-2222-4222-8222-222222222222",
              startedAt: "2026-08-18T10:00:00.000Z",
              lastSeenAt: "2026-08-18T10:02:00.000Z",
              endedAt: null,
              activeSeconds: 120,
              pageViews: 1,
              events: 1,
              landingPage: "/",
              exitPage: "/contact",
              countryCode: "CH",
              region: "Zurich",
              city: "Zurich",
              device: "desktop",
              browser: "Safari",
              operatingSystem: "macOS",
              eventsTimeline: [{
                id: "33333333-3333-4333-8333-333333333333",
                occurredAt: "2026-08-18T10:01:00.000Z",
                eventType: "page_view",
                name: "page_view",
                pagePath: "/contact",
                sectionId: null,
                targetLabel: null,
                value: null,
                durationMs: null,
                scrollDepth: null,
              }],
            }],
          },
        }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({
        kind: "visitors",
        countryCode: "CH",
        countryName: "Switzerland",
        visitors: [{
          visitorId,
          sessions: 2,
          engagedSessions: 1,
          pageViews: 1,
          events: 1,
          activeSeconds: 120,
          firstSeenAt: "2026-08-18T09:00:00.000Z",
          lastSeenAt: "2026-08-18T10:02:00.000Z",
          lastPath: "/contact",
        }],
        truncated: false,
      }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<CountryExplorer items={[country]} range="7d" />);
    fireEvent.click(screen.getAllByRole("button", { name: /View visitors in Switzerland/i })[0]);
    expect(await screen.findByRole("dialog", { name: /Switzerland/i })).toBeInTheDocument();
    expect(await screen.findByText("Visitor 01")).toBeInTheDocument();
    expect(screen.getByText(/Anonymous analytics visitor in Switzerland/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /View activity for visitor 1/i }));
    expect(await screen.findByRole("heading", { name: "Visitor activity" })).toBeInTheDocument();
    expect(screen.getByText("Viewed page")).toBeInTheDocument();
    expect(screen.getAllByText("/contact").length).toBeGreaterThan(0);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("shows a safe error when the country list cannot be loaded", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(JSON.stringify({ error: "Country visitor data is temporarily unavailable." }), { status: 503 }))));
    render(<CountryExplorer items={[country]} range="30d" />);
    fireEvent.click(screen.getAllByRole("button", { name: /View visitors in Switzerland/i })[0]);
    expect(await screen.findByRole("alert")).toHaveTextContent("Country visitor data is temporarily unavailable.");
  });

  it("paginates the visitor list inside the modal", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const pageTwo = url.includes("page=2");
      return Promise.resolve(new Response(JSON.stringify({
        kind: "visitors",
        countryCode: "CH",
        countryName: "Switzerland",
        visitors: [{
          visitorId: pageTwo ? "22222222-2222-4222-8222-222222222222" : visitorId,
          sessions: 1,
          engagedSessions: 1,
          pageViews: 2,
          events: 2,
          activeSeconds: 90,
          firstSeenAt: "2026-08-18T09:00:00.000Z",
          lastSeenAt: "2026-08-18T10:02:00.000Z",
          lastPath: "/contact",
        }],
        page: pageTwo ? 2 : 1,
        pageSize: 1,
        totalVisitors: 2,
        hasNextPage: !pageTwo,
        hasPreviousPage: pageTwo,
        truncated: false,
      }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<CountryExplorer items={[country]} range="7d" />);
    fireEvent.click(screen.getAllByRole("button", { name: /View visitors in Switzerland/i })[0]);
    expect(await screen.findByText("Visitor 01")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–1 of 2 visitors")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(await screen.findByText("Showing 2–2 of 2 visitors")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("page=2"), expect.anything());
  });

  it("restores focus and closes on Escape like a real modal", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(JSON.stringify({ visitors: [], totalVisitors: 0, page: 1, pageSize: 20 }), { status: 200 }))));
    render(<CountryExplorer items={[country]} range="7d" />);
    const countryButton = screen.getAllByRole("button", { name: /View visitors in Switzerland/i })[0];
    countryButton.focus();
    fireEvent.click(countryButton);
    expect(await screen.findByRole("dialog", { name: /Switzerland/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: /Close Switzerland visitors/i })).toHaveFocus());

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /Switzerland/i })).not.toBeInTheDocument());
    expect(countryButton).toHaveFocus();
  });
});
