# AIXCO Supabase Backend

This directory contains the local Supabase project configuration and migrations for the AIXCO website backend.

## Current Backend Surface

- `profiles`: future Supabase Auth profile records for customers, brokers, developer partners, and admins.
- `contact_submissions`: contact form leads from the website.
- `chat_transcripts`: live-chat transcripts captured when a visitor hands off the chat by email.
- `portal_click_events`: anonymous login/register portal handoff events.
- `site_content_entries`: published website content moved from frontend constants into Supabase.

## Security Model

- RLS is enabled and forced on every public table.
- Browser clients only use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Secret keys and database URLs stay in `.env.local`, which is git-ignored.
- Anonymous visitors can insert lead/event rows, but cannot select, update, or delete them.
- Anonymous visitors can read only published `site_content_entries` rows.
- Authenticated users can read/update only their own `profiles` row.

## Useful Commands

```powershell
npx supabase init
npx supabase migration new <name>
npx supabase db push --linked
```

Linking to the hosted project requires an authenticated Supabase CLI session:

```powershell
npx supabase login
npx supabase link --project-ref zrgcrfyxokxcjpdabaoi
```
