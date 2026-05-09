import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scheduleIdleWork } from "@/hooks/use-idle-ready";
import { fetchSiteContent, siteContentDefaults, type SiteContent } from "@/lib/backend/site-content";
import { I18nProvider, useI18n } from "@/i18n/I18nProvider";
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

function LanguageButton() {
  const { setLang } = useI18n();
  return <button onClick={() => setLang("de")}>Switch to German</button>;
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

function renderWithI18n(children: React.ReactNode) {
  return render(<I18nProvider>{children}</I18nProvider>);
}

describe("SiteContentProvider", () => {
  beforeEach(() => {
    localStorage.clear();
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
    renderWithI18n(
      <SiteContentProvider initialContent={createServerContent()} initialSource="supabase">
        <ContentEmail />
      </SiteContentProvider>,
    );

    expect(screen.getByText("server-content@aixco.global")).toBeInTheDocument();
  });

  it("does not schedule a browser refetch when Supabase content arrived from the server", () => {
    renderWithI18n(
      <SiteContentProvider initialContent={createServerContent()} initialSource="supabase">
        <ContentEmail />
      </SiteContentProvider>,
    );

    expect(scheduleIdleWork).not.toHaveBeenCalled();
    expect(fetchSiteContent).not.toHaveBeenCalled();
  });

  it("fetches localized Supabase content when the active language changes", async () => {
    const germanContent: SiteContent = {
      ...siteContentDefaults,
      company: {
        ...siteContentDefaults.company,
        email: "de-content@aixco.global",
      },
    };
    vi.mocked(fetchSiteContent).mockResolvedValue({
      ok: true,
      source: "supabase",
      content: germanContent,
    });

    renderWithI18n(
      <SiteContentProvider initialContent={createServerContent()} initialSource="supabase">
        <LanguageButton />
        <ContentEmail />
      </SiteContentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to German" }));

    expect(await screen.findByText("de-content@aixco.global")).toBeInTheDocument();
    expect(fetchSiteContent).toHaveBeenCalledWith("de");
  });
});
