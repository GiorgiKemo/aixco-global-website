# Admin identity and MFA rollout

The `/admin` area supports individual Supabase Auth identities and requires an
Authenticator Assurance Level of `aal2` (password plus TOTP) before any admin
page or mutation is authorized. Authorization uses `app_metadata`, which users
cannot edit, and never trusts `user_metadata` for roles.

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
2. Set `ADMIN_AUTH_MODE=migration` before deploying this code. Keep the current
   `ADMIN_DASHBOARD_PASSWORD` (at least 16 characters) and
   `ADMIN_SESSION_SECRET` (at least 32 random characters) during this step.
3. Add `https://www.aixco.global/admin/auth/complete` and
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

4. Open `/admin/identity-migration` while authenticated with temporary migration
   access and invite every administrator using their own email address. The
   server sends the Supabase invite and then assigns `app_metadata.role`; if
   role assignment fails, it attempts a compensating delete of the new user.
   Disable public signup unless the website needs it for another feature.
5. Each administrator accepts the invite, creates a unique password of at least
   12 characters, scans the one-time QR code in an authenticator app, and
   verifies the six-digit code. The admin area remains inaccessible until the
   session reaches AAL2.
6. Confirm every expected administrator can sign in and that the lead dashboard
   identifies them by email.
7. Set `ADMIN_AUTH_MODE=identity`, redeploy, and verify the shared-password form
   is gone.
8. Remove `ADMIN_DASHBOARD_PASSWORD` and `ADMIN_SESSION_SECRET` from the hosting
   environment. Revoke old sessions if a legacy password may have been shared
   outside the intended team.

## Operational notes

- Successful admin mutations and email-delivery tests emit structured
  `[aixco-admin-audit]` events containing the Supabase user ID, a truncated
  SHA-256 email hash, action, outcome, and non-PII target identifier. Raw email
  addresses, secrets, and lead message bodies are excluded.
- If an administrator replaces or loses their authenticator device, an owner of
  the Supabase project must follow the Supabase MFA recovery procedure. Do not
  switch the whole site back to migration mode for one user.
- Review Supabase Auth settings for password strength, leaked-password checks,
  short access-token expiry, and appropriate email delivery before completing
  the rollout.
