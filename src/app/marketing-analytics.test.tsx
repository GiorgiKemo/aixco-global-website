import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { writeAnalyticsConsent } from "@/lib/analytics/client";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  __aixcoGoogleConsentDefaulted?: boolean;
};

function googleCommands() {
  return ((window as AnalyticsWindow).dataLayer ?? []).map((entry) =>
    Array.from(entry as ArrayLike<unknown>));
}

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("next/script", () => ({
  default: ({ id }: { id: string }) => <script data-testid={id} />,
}));

vi.mock("./web-vitals", () => ({
  WebVitals: () => <div data-testid="web-vitals" />,
}));

import { analyticsCookieDomains, MarketingAnalytics } from "./marketing-analytics";

describe("route-aware marketing analytics", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
    window.sessionStorage.clear();
    delete (window as AnalyticsWindow).dataLayer;
    delete (window as AnalyticsWindow).__aixcoGoogleConsentDefaulted;
  });

  it("includes the parent domain when clearing analytics cookies from a subdomain", () => {
    expect(analyticsCookieDomains("www.aixco.global")).toEqual([
      "www.aixco.global",
      ".www.aixco.global",
      ".aixco.global",
    ]);
    expect(analyticsCookieDomains("127.0.0.1")).toEqual(["127.0.0.1", ".127.0.0.1"]);
  });

  it("holds GTM until analytics consent is granted on public routes", async () => {
    const { getByTestId } = render(<MarketingAnalytics />);

    expect(document.querySelector("#google-tag-manager")).not.toBeInTheDocument();
    expect(getByTestId("web-vitals")).toBeInTheDocument();

    act(() => writeAnalyticsConsent("granted"));
    await waitFor(() => expect(getByTestId("google-tag-manager")).toBeInTheDocument());
  });

  it("queues denied defaults before consent updates", async () => {
    render(<MarketingAnalytics />);

    await waitFor(() => expect((window as AnalyticsWindow).dataLayer).toHaveLength(2));
    expect(googleCommands()).toEqual([
      ["consent", "default", expect.objectContaining({ analytics_storage: "denied", ad_storage: "denied" })],
      ["consent", "update", expect.objectContaining({ analytics_storage: "denied", ad_storage: "denied" })],
    ]);

    act(() => writeAnalyticsConsent("granted"));
    await waitFor(() => expect(googleCommands().at(-1)).toEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied" }),
    ]));
  });

  it("denies Google Analytics and clears its cookies after a public-to-admin transition", async () => {
    writeAnalyticsConsent("granted");
    document.cookie = "_ga=test-value; path=/";
    const view = render(<MarketingAnalytics />);
    await waitFor(() => expect(view.getByTestId("google-tag-manager")).toBeInTheDocument());

    navigation.pathname = "/admin/analytics";
    window.history.replaceState({}, "", navigation.pathname);
    view.rerender(<MarketingAnalytics />);

    await waitFor(() => expect(view.container).toBeEmptyDOMElement());
    expect(googleCommands().at(-1)).toEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "denied" }),
    ]);
    expect(document.cookie).not.toContain("_ga=");
  });

  it.each(["/admin", "/admin/login", "/admin/analytics?focus=traffic", "/api/private", "/portal/broker"])(
    "renders no marketing instrumentation on %s",
    async (pathname) => {
      navigation.pathname = pathname;
      window.history.replaceState({}, "", pathname);
      const { container } = render(<MarketingAnalytics />);

      expect(container).toBeEmptyDOMElement();
      await waitFor(() => expect(googleCommands().at(-1)).toEqual([
        "consent",
        "update",
        expect.objectContaining({ analytics_storage: "denied" }),
      ]));
    },
  );
});
