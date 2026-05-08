import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scheduleIdleWork } from "@/hooks/use-idle-ready";
import { fetchSiteContent, siteContentDefaults, type SiteContent } from "@/lib/backend/site-content";
import { SiteContentProvider } from "./SiteContentProvider";
import { useSiteContent } from "./site-content-context";

vi.mock("@/hooks/use-idle-ready", () => ({
  scheduleIdleWork: vi.fn((callback: () => void) => {
    callback();
    return vi.fn();
  }),
}));

vi.mock("@/lib/backend/site-content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/backend/site-content")>();
  return {
    ...actual,
    fetchSiteContent: vi.fn(),
  };
});

function ContentEmail() {
  const { company } = useSiteContent();
  return <span>{company.email}</span>;
}

function createServerContent(): SiteContent {
  return {
    ...siteContentDefaults,
    company: {
      ...siteContentDefaults.company,
      email: "server-content@aixco.global",
    },
  };
}

describe("SiteContentProvider", () => {
  beforeEach(() => {
    vi.mocked(scheduleIdleWork).mockClear();
    vi.mocked(fetchSiteContent).mockReset();
    vi.mocked(fetchSiteContent).mockResolvedValue({
      ok: false,
      source: "fallback",
      content: siteContentDefaults,
      reason: "test fallback",
    });
  });

  it("hydrates consumers with server-provided site content", () => {
    render(
      <SiteContentProvider initialContent={createServerContent()} initialSource="supabase">
        <ContentEmail />
      </SiteContentProvider>,
    );

    expect(screen.getByText("server-content@aixco.global")).toBeInTheDocument();
  });

  it("does not schedule a browser refetch when Supabase content arrived from the server", () => {
    render(
      <SiteContentProvider initialContent={createServerContent()} initialSource="supabase">
        <ContentEmail />
      </SiteContentProvider>,
    );

    expect(scheduleIdleWork).not.toHaveBeenCalled();
    expect(fetchSiteContent).not.toHaveBeenCalled();
  });
});
