export const PORTAL_CONFIG = {
  customer: {
    label: "Customer Portal",
    source: "https://workw.com/realestate/aixco/customer-login",
  },
  broker: {
    label: "Broker Portal",
    source: "https://workw.com/realestate/aixco/broker-login",
  },
  developer: {
    label: "Developer Portal",
    source: "https://workw.com/realestate/aixco/developer-login",
  },
} as const;

export type PortalRole = keyof typeof PORTAL_CONFIG;

const PORTAL_HOSTS: Record<string, PortalRole> = {
  "customer.aixco.global": "customer",
  "broker.aixco.global": "broker",
  "developer.aixco.global": "developer",
};

export function isPortalRole(value: string): value is PortalRole {
  return Object.prototype.hasOwnProperty.call(PORTAL_CONFIG, value);
}

export function getPortalRoleForHost(value: string | null) {
  if (!value) return null;

  const hostname = value.split(",", 1)[0]?.trim().toLowerCase().replace(/\.$/, "").split(":", 1)[0];
  return hostname ? (PORTAL_HOSTS[hostname] ?? null) : null;
}

export function createPortalWrapperHtml(role: PortalRole) {
  const portal = PORTAL_CONFIG[role];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light" />
    <meta name="robots" content="noindex, nofollow" />
    <title>AIXCO Global — ${portal.label}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f4f1eb;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
      }

      body {
        background: #f4f1eb;
      }

      .portal-shell {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        width: 100%;
        height: 100vh;
        height: 100dvh;
      }

      .portal-toolbar {
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        min-height: 60px;
        padding: max(8px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) 8px max(14px, env(safe-area-inset-left));
        color: #fff;
        background: #11100e;
        border-bottom: 1px solid rgba(192, 161, 102, 0.45);
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        min-height: 44px;
        padding: 0.65rem 1rem;
        color: #fff;
        font-size: 0.875rem;
        font-weight: 700;
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid #c0a166;
        border-radius: 999px;
        transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
        -webkit-tap-highlight-color: transparent;
      }

      .back-link:hover {
        color: #11100e;
        background: #d6bb86;
      }

      .back-link:active {
        transform: translateY(1px);
      }

      .back-link:focus-visible {
        outline: 3px solid #fff;
        outline-offset: 3px;
      }

      .back-link svg {
        width: 18px;
        height: 18px;
        flex: none;
      }

      .portal-context {
        min-width: 0;
        color: #d6bb86;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        line-height: 1.2;
        text-align: right;
        text-transform: uppercase;
      }

      .portal-frame {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 0;
        border: 0;
        background: #fff;
      }

      @media (max-width: 420px) {
        .portal-toolbar {
          min-height: 58px;
          padding-right: max(10px, env(safe-area-inset-right));
          padding-left: max(10px, env(safe-area-inset-left));
        }

        .back-link {
          padding-right: 0.9rem;
          padding-left: 0.9rem;
          font-size: 0.8125rem;
        }

        .portal-context {
          font-size: 0.6875rem;
          letter-spacing: 0.09em;
        }
      }

      @media (max-width: 340px) {
        .portal-context {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .back-link {
          transition: none;
        }
      }
    </style>
  </head>
  <body>
    <main class="portal-shell">
      <header class="portal-toolbar">
        <a class="back-link" href="https://www.aixco.global/" target="_top" aria-label="Back to AIXCO Global website">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
          <span>Back to AIXCO Global</span>
        </a>
        <span class="portal-context">${portal.label}</span>
      </header>
      <iframe
        class="portal-frame"
        src="${portal.source}"
        title="${portal.label}"
        loading="eager"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </main>
  </body>
</html>`;
}
