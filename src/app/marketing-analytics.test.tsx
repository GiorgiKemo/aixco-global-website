import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { writeAnalyticsConsent } from "@/lib/analytics/client";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("next/script", () => ({
  default: ({ id }: { id: string }) => <script data-testid={id} />,
}));

vi.mock("./web-vitals", () => ({
  WebVitals: () => <div data-testid="web-vitals" />,
}));

import { MarketingAnalytics } from "./marketing-analytics";

describe("route-aware marketing analytics", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    window.localStorage.clear();
    window.sessionStorage.clear();
    delete (window as Window & { dataLayer?: unknown[] }).dataLayer;
  });

  it("holds GTM until analytics consent is granted on public routes", async () => {
    const { getByTestId } = render(<MarketingAnalytics />);

    expect(document.querySelector("#google-tag-manager")).not.toBeInTheDocument();
    expect(getByTestId("web-vitals")).toBeInTheDocument();

    act(() => writeAnalyticsConsent("granted"));
    await waitFor(() => expect(getByTestId("google-tag-manager")).toBeInTheDocument());
  });

  it.each(["/admin", "/admin/login", "/admin/analytics?focus=traffic"])(
    "renders no marketing instrumentation on %s",
    (pathname) => {
      navigation.pathname = pathname;
      const { container } = render(<MarketingAnalytics />);

      expect(container).toBeEmptyDOMElement();
    },
  );
});
