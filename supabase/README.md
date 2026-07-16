# AIXCO Supabase Backend

This directory contains the local Supabase project configuration and migrations for the AIXCO website backend.

## Current Backend Surface

- `profiles`: future Supabase Auth profile records for customers, brokers, developer partners, and admins.
- `contact_submissions`: contact form leads from the website.
- `contact_email_deliveries`: durable, retryable email outbox linked to contact requests.
- `lead_capture_attempts`: HMAC-only identities for distributed public-form abuse controls.
- `chat_transcripts`: live-chat transcripts captured when a visitor hands off the chat by email.
- `portal_click_events`: anonymous login/register portal handoff events.
- `site_content_entries`: published website content moved from frontend constants into Supabase.
- `site_telemetry_events`: bounded, sampled performance/error telemetry; service-role only.

## Security Model

- RLS is enabled and forced on every public table.
- Browser clients only use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Secret keys and database URLs stay in `.env.local`, which is git-ignored.
- Anonymous visitors cannot access lead, outbox, abuse-control, chat, or portal-event rows directly.
- The server-only secret client atomically stores contact requests and their two email jobs.
- Authenticated profile owners can edit contact fields, but cannot change role or onboarding state.
- Anonymous visitors can read only published `site_content_entries` rows.
- Authenticated users can read/update only their own `profiles` row.

## Useful Commands

```powershell
npx supabase init
npx supabase migration new <name>
npx supabase db push --linked
```

The primary contact-email worker is a five-minute Supabase `pg_cron`/`pg_net`
job installed by the latest migration. It resolves its URL and bearer secret
from Supabase Vault on every run; the secret is never embedded in migration SQL.
Create these two Vault entries in the production project before enabling the
release:

- `aixco_contact_worker_url` = `https://www.aixco.global/api/cron/contact-email-deliveries`
- `aixco_cron_secret` = the same strong value as Vercel `CRON_SECRET`

`.github/workflows/contact-email-worker.yml` is an hourly recovery worker, not
a five-minute SLA; it drains up to six queue batches per run and fails visibly
if permanent delivery failures are returned.

Daily data retention is invoked by Vercel Cron at 02:17 UTC, with a delayed
GitHub recovery job. The GitHub secret `CONTACT_EMAIL_CRON_SECRET` and the
Vercel environment variable `CRON_SECRET` must contain the same value.

## Resend delivery webhook

Provider acceptance is not proof of inbox delivery. In the Resend dashboard,
create a signed webhook pointing to:

`https://www.aixco.global/api/webhooks/resend`

Subscribe only to the event types handled by the application: `email.sent`,
`email.delivered`, `email.delivery_delayed`, `email.bounced`,
`email.complained`, `email.failed`, and `email.suppressed`. Store the webhook
signing secret as Vercel
`RESEND_WEBHOOK_SECRET`, then redeploy the application. Do not confuse this
signing secret with `RESEND_API_KEY`.

After setup, send a controlled contact request and confirm that its two delivery
rows move beyond `provider_accepted`, and that deduplicated event rows appear in
`contact_email_events`. A signed Resend test event may also be used; an HTTP 2xx
response alone is insufficient unless the database event and delivery state are
both present.

For signing-secret rotation:

1. Create the replacement Resend webhook and keep the existing webhook active.
2. Set its signing secret as Vercel `RESEND_WEBHOOK_SECRET` and deploy.
3. Send a test event and verify the database transition. Duplicate events are
   safe because provider event IDs are deduplicated.
4. Disable the old webhook only after the new secret is verified in production.

Never delete the old secret first; doing so creates an unobservable delivery
status gap during rollout.

Before promoting an application release that includes migrations:

```powershell
node scripts/verify-migration-history.mjs
npx supabase migration list --linked
npx supabase db push --linked --dry-run
npx supabase db push --linked
npx supabase migration list --linked
```

The local and remote columns must match after `db push`. Then verify the live
pipeline and make one authenticated worker invocation:

```powershell
$headers = @{ Authorization = "Bearer $env:CRON_SECRET" }
Invoke-WebRequest `
  -Method POST `
  -Uri https://www.aixco.global/api/cron/contact-email-deliveries `
  -Headers $headers
Invoke-WebRequest `
  -Uri https://www.aixco.global/api/health/contact-pipeline `
  -Headers $headers
```

The health endpoint is intentionally private. Production monitors must inject
`CRON_SECRET` from their secret store; never place it in a URL or command log.

Never place the database password, service-role key, Resend key, or cron secret
in repository files or workflow logs.

Linking to the hosted project requires an authenticated Supabase CLI session:

```powershell
npx supabase login
npx supabase link --project-ref zrgcrfyxokxcjpdabaoi
```
