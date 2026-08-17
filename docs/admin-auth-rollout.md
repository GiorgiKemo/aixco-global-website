# Admin identity and MFA rollout

The `/admin` area supports individual Supabase Auth identities. Every named
administrator must reach Authenticator Assurance Level `aal2` (password plus
TOTP); a missing or false `ADMIN_REQUIRE_MFA` value does not weaken this rule.
`ADMIN_REQUIRE_MFA` is no longer a supported configuration switch and should be
removed from hosting environments. Authorization uses
`app_metadata`, which users cannot edit, and never trusts `user_metadata` for
roles.

## Rollout modes

- `ADMIN_AUTH_MODE=migration` enables individual identity sign-in when the
  public Supabase configuration is present and temporarily keeps the legacy
  shared-password form available. This mode is only for the migration window.
- `ADMIN_AUTH_MODE=identity` accepts only an authorized Supabase identity at
  AAL2. Shared-password cookies and credentials are ignored.
- Missing or invalid `ADMIN_AUTH_MODE` fails closed. It never silently enables
  shared-password access.

Set `ADMIN_AUTH_ROLE=admin` unless the Supabase project uses a different
server-managed role name. Admin users must have either
`app_metadata.role = "admin"` or an `app_metadata.roles` array containing
`"admin"`.

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
   allowlist. The default Supabase invite returns session credentials in a URL
   fragment. `/admin/auth/complete` consumes that fragment, synchronously
   removes it from browser history before any asynchronous work, validates the
   user, and redirects to the clean password-setup URL. Fragments are never
   sent in HTTP requests or Referer headers.

   Optionally, a custom **Invite user** email template can use the stricter
   server-only token-hash callback:

   ```html
   <a href="{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=invite">Accept AIXCO admin invitation</a>
   ```

5. Open `/admin/identity-migration` while authenticated with temporary migration
   access and invite every administrator using their own email address. The
   server sends the Supabase invite and then assigns `app_metadata.role`; if
   role assignment fails, it attempts a compensating delete of the new user.
   Disable public signup unless the website needs it for another feature.
6. Each administrator accepts the invite, creates a unique password of at least
   12 characters, scans the one-time QR code in an authenticator app, and
   verifies the six-digit code. Password-only named sessions cannot enter the
   dashboard.
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
- The complete admin dashboard and all sensitive tools are restricted to
  verified Supabase AAL2 identities. The legacy shared password can only open
  the identity-migration page and bootstrap the first named identity during
  migration mode. As soon as any named admin exists, the shared password can no
  longer send invitations; another invite requires a named AAL2 administrator.
- If the migration page reports that administrator identities are unavailable
  or incomplete, keep `ADMIN_AUTH_MODE=migration`. Invitations and the readiness
  signal remain disabled until every paginated user and MFA-factor lookup can be
  verified; a partial response is never treated as safe to end migration.
- If an administrator replaces or loses their authenticator device, an owner of
  the Supabase project must follow the Supabase MFA recovery procedure. Do not
  switch the whole site back to migration mode for one user.
- Review Supabase Auth settings for password strength, leaked-password checks,
  short access-token expiry, and appropriate email delivery before completing
  the rollout.
