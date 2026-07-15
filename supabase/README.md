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

The contact email worker must call `/api/cron/contact-email-deliveries` at least
once per minute with `Authorization: Bearer $CRON_SECRET`. Verify production after
migrations and environment variables are deployed:

```powershell
Invoke-WebRequest https://www.aixco.global/api/health/contact-pipeline
```

Linking to the hosted project requires an authenticated Supabase CLI session:

```powershell
npx supabase login
npx supabase link --project-ref zrgcrfyxokxcjpdabaoi
```
