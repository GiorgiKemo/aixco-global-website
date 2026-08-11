import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
  });

  it("keeps GTM and first-party web vitals on public routes", () => {
    const { getByTestId } = render(<MarketingAnalytics />);

    expect(getByTestId("google-tag-manager")).toBeInTheDocument();
    expect(getByTestId("web-vitals")).toBeInTheDocument();
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
