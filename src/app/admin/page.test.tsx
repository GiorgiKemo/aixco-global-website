import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminLaunchpadData } from "./launchpad-data";

const authDecision = vi.hoisted(() => vi.fn());
const authConfig = vi.hoisted(() => vi.fn(() => ({ role: "admin" })));
const loadLaunchpad = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn((href: string) => {
  throw new Error(`redirect:${href}`);
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/admin/auth", () => ({
  getAdminAuthDecision: authDecision,
  getAdminAuthConfig: authConfig,
}));
vi.mock("./launchpad-data", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./launchpad-data")>();
  return { ...actual, loadAdminLaunchpadData: loadLaunchpad };
});

import AdminPage, { buildLaunchpadModules } from "./page";

const launchpadData: AdminLaunchpadData = {
  generatedAt: "2026-08-11T12:00:00.000Z",
  leads: { active: 8, new: 2, qualified: 3 },
  analytics: {
    sessions: 4_782,
    visitors: 2_104,
    recentSessions: 24,
    engagedSessions: 1_809,
    errorEvents: 0,
    latestEventAt: "2026-08-11T11:59:00.000Z",
  },
  email: {
    ready: true,
    queued: 0,
    failed: 0,
    deliveryIssues: 0,
    workerLastSucceededAt: "2026-08-11T11:58:00.000Z",
  },
  admins: { total: 2, verified: 2 },
  recentActivity: [
    {
      id: "activity-1",
      label: "Administrator signed in",
      occurredAt: "2026-08-11T11:57:00.000Z",
      tone: "healthy",
    },
  ],
  unavailableSources: [],
};

describe("admin operations launchpad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authDecision.mockResolvedValue({
      ok: true,
      principal: {
        id: "admin-id",
        email: "admin@example.com",
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    });
    loadLaunchpad.mockResolvedValue(launchpadData);
  });

  it("routes unauthenticated visitors to login before loading operational data", async () => {
    authDecision.mockResolvedValue({ ok: false, reason: "not-authenticated" });

    await expect(AdminPage()).rejects.toThrow("redirect:/admin/login?error=not-authenticated");
    expect(loadLaunchpad).not.toHaveBeenCalled();
  });

  it("keeps legacy migration access inside identity migration", async () => {
    authDecision.mockResolvedValue({
      ok: true,
      principal: {
        id: "legacy-shared-password",
        email: null,
        authentication: "legacy-shared-password",
        aal: null,
      },
    });

    await expect(AdminPage()).rejects.toThrow("redirect:/admin/identity-migration");
    expect(loadLaunchpad).not.toHaveBeenCalled();
  });

  it("renders six focused production workspaces for a verified identity", async () => {
    render(await AdminPage());

    expect(screen.getByRole("heading", { level: 1, name: "Operations" })).toBeInTheDocument();
    expect(screen.getByText("4,782")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open lead center" })).toHaveAttribute("href", "/admin/leads");
    expect(screen.getByRole("link", { name: "Open website analytics" })).toHaveAttribute(
      "href",
      "/admin/analytics?focus=traffic&range=7d",
    );
    expect(screen.getByRole("link", { name: "Open visitor sessions" })).toHaveAttribute(
      "href",
      "/admin/analytics?focus=sessions&range=7d",
    );
    expect(screen.getByRole("link", { name: "Open errors and security" })).toHaveAttribute(
      "href",
      "/admin/analytics?focus=reliability&range=7d",
    );
    expect(screen.getByRole("link", { name: "Open email delivery" })).toHaveAttribute("href", "/admin/email-test");
    expect(screen.getByRole("link", { name: "Open privacy requests" })).toHaveAttribute("href", "/admin/privacy");
    expect(screen.getByText("2 MFA-enrolled administrators")).toBeInTheDocument();
    expect(screen.getByText("Administrator signed in")).toBeInTheDocument();
    expect(loadLaunchpad).toHaveBeenCalledWith("admin");
  });

  it("renders explicit unavailable states instead of placeholder numbers", () => {
    const modules = buildLaunchpadModules({
      ...launchpadData,
      leads: null,
      analytics: null,
      email: null,
      admins: null,
      unavailableSources: ["leads", "analytics", "email", "admins"],
    });

    expect(modules).toHaveLength(6);
    expect(modules.every((module) => module.value === "—")).toBe(true);
    expect(modules.every((module) => module.status === "Production source unavailable")).toBe(true);
  });

  it("describes a password-only identity as configured admin access", () => {
    const modules = buildLaunchpadModules({
      ...launchpadData,
      admins: { total: 1, verified: 0 },
    });

    expect(modules.find((module) => module.id === "privacy")).toMatchObject({
      status: "Password access active",
      tone: "healthy",
    });
  });
});
