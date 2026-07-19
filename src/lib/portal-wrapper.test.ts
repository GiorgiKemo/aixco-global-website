import { describe, expect, it } from "vitest";
import {
  createPortalWrapperHtml,
  getPortalRoleForHost,
  isPortalRole,
  PORTAL_CONFIG,
} from "./portal-wrapper";

describe("portal wrapper", () => {
  it.each(Object.keys(PORTAL_CONFIG))("renders the %s portal with a persistent AIXCO return link", (role) => {
    if (!isPortalRole(role)) throw new Error(`Unexpected portal role: ${role}`);

    const html = createPortalWrapperHtml(role);

    expect(html).toContain(`src="${PORTAL_CONFIG[role].source}"`);
    expect(html).toContain('href="https://www.aixco.global/"');
    expect(html).toContain('target="_top"');
    expect(html).toContain("Back to AIXCO Global");
    expect(html).toContain("min-height: 44px");
    expect(html).toContain("height: 100dvh");
    expect(html).toContain("padding-bottom: env(safe-area-inset-bottom)");
    expect(html).toContain("flex-wrap: wrap");
    expect(html).toContain("overflow-wrap: anywhere");
    expect(html).toContain("white-space: normal");
  });

  it("rejects unsupported portal roles", () => {
    expect(isPortalRole("admin")).toBe(false);
    expect(isPortalRole("customer")).toBe(true);
  });

  it("maps production host headers to portal roles", () => {
    expect(getPortalRoleForHost("customer.aixco.global")).toBe("customer");
    expect(getPortalRoleForHost("BROKER.AIXCO.GLOBAL:443")).toBe("broker");
    expect(getPortalRoleForHost("developer.aixco.global, proxy.internal")).toBe("developer");
    expect(getPortalRoleForHost("www.aixco.global")).toBeNull();
    expect(getPortalRoleForHost(null)).toBeNull();
  });
});
