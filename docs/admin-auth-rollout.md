# Admin identity and optional MFA rollout

The `/admin` area supports individual Supabase Auth identities. Every named
administrator must have a valid Supabase password session and the server-managed
admin role. Authenticator Assurance Level `aal2` (password plus TOTP) is an
optional stronger session state, not a prerequisite for dashboard access.
`ADMIN_REQUIRE_MFA` is no longer a supported configuration switch and should be
removed from hosting environments. Authorization uses
`app_metadata`, which users cannot edit, and never trusts `user_metadata` for
roles.

## Rollout modes

- `ADMIN_AUTH_MODE=migration` enables individual identity sign-in when the
  public Supabase configuration is present and temporarily keeps the legacy
  shared-password form available. This mode is only for the migration window.
- `ADMIN_AUTH_MODE=identity` accepts an authorized Supabase identity at AAL1 or
  AAL2. Shared-password cookies and credentials are ignored.
- Missing or invalid `ADMIN_AUTH_MODE` fails closed. It never silently enables
  shared-password access.

Set `ADMIN_AUTH_ROLE=admin` unless the Supabase project uses a different
server-managed role name. Admin users must have either
`app_metadata.role = "admin"` or an `app_metadata.roles` array containing
`"admin"`.

## Trusted devices

To make repeated sign-ins less disruptive for administrators who choose MFA, set the
server-only `ADMIN_TRUSTED_DEVICE_SECRET` to at least 32 random characters.
After a successful TOTP verification, an administrator may opt in to “Trust this
device for 30 days.” The browser receives an HttpOnly, signed, identity-bound
cookie. Future sign-ins still require that administrator's password; only the
repeat TOTP prompt is skipped. The cookie is never accepted without a matching
Supabase identity session, and it cannot renew itself. Administrators who do not
enable MFA can enter with their password session alone.

If the secret is absent, sign-in continues normally and the device option is
unavailable. Rotate the secret to revoke all trusted devices. Do not expose the
secret in a `NEXT_PUBLIC_` variable.

## Production rollout

1. Configure `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the AIXCO Supabase project. Never
   place the secret/service-role key in a `NEXT_PUBLIC_` variable.
2. Before deploying the application code, apply these migrations to the AIXCO
   Supabase project in order:
   `20260817114531_harden_admin_privacy_and_chat_quality.sql`, then
   `20260817123000_admin_identity_bootstrap_claim.sql`. The first keeps privacy
   operations and chat writes schema-compatible; the second provides the
   service-role-only atomic claim that allows temporary migration access to
   bootstrap exactly one named administrator. The application intentionally
   fails closed if either database contract is missing. Keep privacy operations
   unavailable during the brief database-first/application-second window.
3. Set `ADMIN_AUTH_MODE=migration` before deploying this code. Keep the current
   `ADMIN_DASHBOARD_PASSWORD` (at least 16 characters) and
   `ADMIN_SESSION_SECRET` (at least 32 random characters) during this step.
4. Add `https://www.aixco.global/admin/auth/complete` and
   `https://www.aixco.global/admin/auth/callback` to the Supabase Auth redirect
   allowlist. The AIXCO invitation email uses a server-only token-hash callback:
   the first GET stages the hash and redirects to `/admin/auth/accept`; only the
   recipient's explicit Continue action verifies it. This prevents email
   security scanners from consuming the single-use token. The default Supabase
   invite flow remains supported at `/admin/auth/complete` for older messages.

5. Open `/admin/identity-migration` while authenticated with temporary migration
   access and invite every administrator using their own email address. The
   server generates the Supabase token, assigns `app_metadata.role`, and sends
   one branded AIXCO email through Resend; if role assignment or email delivery
   fails, it attempts a compensating delete of the new user. Configure
   `RESEND_API_KEY` and `ADMIN_INVITE_FROM` (or `LEAD_NOTIFICATION_FROM`).
   Disable public signup unless the website needs it for another feature.
6. Each administrator accepts the invite and creates a unique password of at
   least 12 characters. MFA enrollment is optional; administrators who enable it
   can scan the one-time QR code and verify the six-digit code.
7. Confirm every expected administrator can sign in and that the lead dashboard
   identifies them by email.
8. Set `ADMIN_AUTH_MODE=identity`, redeploy, and verify the shared-password form
   is gone.
9. Remove `ADMIN_DASHBOARD_PASSWORD` and `ADMIN_SESSION_SECRET` from the hosting
   environment. Revoke old sessions if a legacy password may have been shared
   outside the intended team.

## Operational notes

- Successful admin mutations and email-delivery tests write structured,
  service-role-only audit records containing the Supabase user ID, an HMAC
  email pseudonym, action, outcome, and bounded non-PII context. Raw email
  addresses, secrets, and lead message bodies are excluded. Security-sensitive
  mutations require the pre-action audit record to persist before proceeding.
- The complete admin dashboard and sensitive tools are restricted to an
  authorized Supabase identity. AAL2 is recorded when present but is not
  required. The legacy shared password can only open the identity-migration page
  and bootstrap the first named identity during migration mode. As soon as any
  named admin exists, the shared password can no longer send invitations;
  another invite requires a named administrator identity.
- If the migration page reports that administrator identities are unavailable
  or incomplete, keep `ADMIN_AUTH_MODE=migration`. Invitations and the readiness
  signal remain disabled until the paginated user lookup can be verified; MFA
  factor status is informational because MFA is optional. A partial user
  response is never treated as safe to end migration.
- If an administrator replaces or loses their authenticator device, they can
  continue using their password session because MFA is optional. An owner of the
  Supabase project can still follow the Supabase MFA recovery procedure if that
  administrator wants to re-enable MFA.
- Review Supabase Auth settings for password strength, leaked-password checks,
  short access-token expiry, and appropriate email delivery before completing
  the rollout.
