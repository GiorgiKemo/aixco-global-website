"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Home,
  LogOut,
  MailCheck,
  Menu,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

export type AdminNavigationItemId =
  | "operations"
  | "leads"
  | "analytics"
  | "sessions"
  | "security"
  | "email"
  | "privacy";

export type AdminNavigationItem = {
  id: AdminNavigationItemId;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavigationItems: readonly AdminNavigationItem[] = [
  {
    id: "operations",
    label: "Operations",
    shortLabel: "Operations",
    description: "Open the operations workspace",
    href: "/admin",
    icon: Home,
  },
  {
    id: "leads",
    label: "Leads",
    shortLabel: "Leads",
    description: "Review contact requests and lead records",
    href: "/admin/leads",
    icon: UsersRound,
  },
  {
    id: "analytics",
    label: "Website analytics",
    shortLabel: "Analytics",
    description: "Review first-party website performance",
    href: "/admin/analytics?focus=overview",
    icon: BarChart3,
  },
  {
    id: "sessions",
    label: "Visitor sessions",
    shortLabel: "Sessions",
    description: "Inspect recent visitor journeys",
    href: "/admin/analytics?focus=sessions",
    icon: Monitor,
  },
  {
    id: "security",
    label: "Errors & security",
    shortLabel: "Security",
    description: "Monitor reliability and security events",
    href: "/admin/analytics?focus=reliability",
    icon: ShieldAlert,
  },
  {
    id: "email",
    label: "Email delivery",
    shortLabel: "Email",
    description: "Verify notification delivery",
    href: "/admin/email-test",
    icon: MailCheck,
  },
  {
    id: "privacy",
    label: "Privacy & admins",
    shortLabel: "Privacy",
    description: "Manage privacy requests and admin access",
    href: "/admin/privacy",
    icon: ShieldCheck,
  },
] as const;

export function getActiveAdminNavigationItem(
  pathname: string,
  focus: string | null,
): AdminNavigationItemId | null {
  if (pathname.startsWith("/admin/leads")) return "leads";
  if (pathname.startsWith("/admin/email-test")) return "email";
  if (pathname.startsWith("/admin/privacy") || pathname.startsWith("/admin/identity-migration")) return "privacy";

  if (pathname === "/admin" || pathname.startsWith("/admin/analytics")) {
    if (focus === "sessions") return "sessions";
    if (focus === "reliability") return "security";
    if (focus === "operations" || pathname === "/admin") return "operations";
    return "analytics";
  }

  return null;
}

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email?.split("@")[0]?.trim() || "Admin";
  const words = source.split(/[\s._-]+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "AD";
}

function NavigationLinks({
  activeItem,
  mobile = false,
  onNavigate,
}: {
  activeItem: AdminNavigationItemId | null;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      aria-label={mobile ? "Mobile admin navigation" : "Admin navigation"}
      className={mobile ? "admin-shell__drawer-nav" : "admin-shell__rail-nav"}
    >
      {adminNavigationItems.map((item) => {
        const Icon = item.icon;
        const active = activeItem === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={mobile ? undefined : item.label}
            title={mobile ? undefined : item.label}
            className={mobile ? "admin-shell__drawer-link" : "admin-shell__rail-link"}
            data-active={active ? "true" : "false"}
            onClick={onNavigate}
          >
            <Icon aria-hidden="true" />
            {mobile ? (
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            ) : (
              <span className="sr-only">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton({ mobile = false }: { mobile?: boolean }) {
  return (
    <form action="/admin/logout" method="post" className={mobile ? "admin-shell__drawer-signout" : "admin-shell__rail-signout"}>
      <button type="submit" aria-label="Sign out" title={mobile ? undefined : "Sign out"}>
        <LogOut aria-hidden="true" />
        {mobile ? <span>Sign out</span> : <span className="sr-only">Sign out</span>}
      </button>
    </form>
  );
}

export type AdminShellProps = {
  children: ReactNode;
  adminName?: string | null;
  adminEmail?: string | null;
};

export function AdminShell({ children, adminName, adminEmail }: AdminShellProps) {
  const pathname = usePathname() || "/admin";
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() ?? "";
  const focus = searchParams?.get("focus") ?? null;
  const activeItem = useMemo(() => getActiveAdminNavigationItem(pathname, focus), [pathname, focus]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const restoreMenuFocusRef = useRef(false);
  const initials = getInitials(adminName, adminEmail);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, searchKey]);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const firstLink = drawerRef.current?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen || !restoreMenuFocusRef.current) return;

    restoreMenuFocusRef.current = false;
    const animationFrame = requestAnimationFrame(() => menuButtonRef.current?.focus());
    return () => cancelAnimationFrame(animationFrame);
  }, [drawerOpen]);

  const closeDrawer = (restoreFocus = false) => {
    restoreMenuFocusRef.current = restoreFocus;
    setDrawerOpen(false);
  };

  const handleDrawerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer(true);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="admin-shell">
      <div
        className="admin-shell__background"
        aria-hidden={drawerOpen ? true : undefined}
        inert={drawerOpen ? true : undefined}
      >
        <a className="admin-shell__skip-link" href="#admin-main-content">
          Skip to admin content
        </a>
        <aside className="admin-shell__rail" aria-label="Admin workspace shortcuts">
          <Link href="/admin" className="admin-shell__rail-brand" aria-label="AIXCO admin operations">
            <span className="admin-shell__rail-brand-image" aria-hidden="true" />
          </Link>
          <NavigationLinks activeItem={activeItem} />
          <div className="admin-shell__rail-footer">
            <Link
              href="/admin/identity-migration"
              className="admin-shell__rail-avatar"
              aria-label="Open admin profile"
              title="Admin profile"
            >
              {initials}
            </Link>
            <SignOutButton />
          </div>
        </aside>

        <header className="admin-shell__topbar">
          <Link href="/admin" className="admin-shell__wordmark" aria-label="AIXCO admin operations">
            <span className="admin-shell__wordmark-image" aria-hidden="true" />
          </Link>

          <div className="admin-shell__topbar-profile" aria-label="Signed-in administrator">
            <span className="admin-shell__avatar" aria-hidden="true">{initials}</span>
            <span className="admin-shell__profile-copy">
              <strong>{adminName?.trim() || "Administrator"}</strong>
              {adminEmail ? <small>{adminEmail}</small> : null}
            </span>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="admin-shell__menu-button"
            aria-label={drawerOpen ? "Close admin navigation" : "Open admin navigation"}
            aria-expanded={drawerOpen}
            aria-controls="admin-mobile-drawer"
            onClick={() => drawerOpen ? closeDrawer(true) : setDrawerOpen(true)}
          >
            <Menu aria-hidden="true" />
          </button>
        </header>

        <div id="admin-main-content" className="admin-shell__content" tabIndex={-1}>
          {children}
        </div>
      </div>

      {drawerOpen ? (
        <>
          <button
            type="button"
            className="admin-shell__scrim"
            aria-label="Close admin navigation"
            onClick={() => closeDrawer(true)}
          />
          <aside
            ref={drawerRef}
            id="admin-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="admin-shell__drawer"
            onKeyDown={handleDrawerKeyDown}
          >
            <div className="admin-shell__drawer-header">
              <div>
                <p>AIXCO admin</p>
                <h2>Workspace</h2>
              </div>
              <button type="button" aria-label="Close admin navigation" onClick={() => closeDrawer(true)}>
                <X aria-hidden="true" />
              </button>
            </div>

            <NavigationLinks activeItem={activeItem} mobile onNavigate={() => closeDrawer()} />

            <div className="admin-shell__drawer-footer">
              <Link href="/admin/identity-migration" className="admin-shell__drawer-profile" onClick={() => closeDrawer()}>
                <span className="admin-shell__avatar" aria-hidden="true">{initials}</span>
                <span>
                  <strong>{adminName?.trim() || "Administrator"}</strong>
                  <small>{adminEmail || "Manage admin access"}</small>
                </span>
                <UserRoundCog aria-hidden="true" />
              </Link>
              <SignOutButton mobile />
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
