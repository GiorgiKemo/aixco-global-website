create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text,
  role text not null default 'customer',
  company_name text,
  phone text,
  onboarding_status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  constraint profiles_full_name_length check (full_name is null or length(trim(full_name)) between 2 and 120),
  constraint profiles_role_check check (role in ('customer', 'broker', 'developer_partner', 'admin')),
  constraint profiles_onboarding_status_check check (onboarding_status in ('new', 'in_review', 'approved', 'rejected', 'archived')),
  constraint profiles_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table public.contact_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'contact_form',
  name text not null,
  email text not null,
  email_normalized text generated always as (lower(email)) stored,
  interest text,
  message text not null,
  locale text,
  page_path text,
  user_agent text,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  constraint contact_submissions_source_check check (source in ('contact_form')),
  constraint contact_submissions_name_length check (length(trim(name)) between 2 and 100),
  constraint contact_submissions_email_length check (length(email) <= 255),
  constraint contact_submissions_email_format check (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
  constraint contact_submissions_interest_length check (interest is null or length(interest) <= 255),
  constraint contact_submissions_message_length check (length(trim(message)) between 10 and 1500),
  constraint contact_submissions_status_check check (status in ('new', 'contacted', 'qualified', 'archived')),
  constraint contact_submissions_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table public.chat_transcripts (
  id uuid primary key default extensions.gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'live_chat',
  interest text,
  transcript text not null,
  messages jsonb not null,
  message_count integer not null,
  locale text,
  page_path text,
  user_agent text,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  constraint chat_transcripts_source_check check (source in ('live_chat')),
  constraint chat_transcripts_interest_length check (interest is null or length(interest) <= 255),
  constraint chat_transcripts_transcript_length check (length(trim(transcript)) between 1 and 10000),
  constraint chat_transcripts_messages_array_check check (jsonb_typeof(messages) = 'array'),
  constraint chat_transcripts_message_count_check check (message_count >= 1),
  constraint chat_transcripts_status_check check (status in ('new', 'contacted', 'qualified', 'archived')),
  constraint chat_transcripts_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table public.portal_click_events (
  id uuid primary key default extensions.gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'access_modal',
  mode text not null,
  role_title text not null,
  action text not null,
  portal_url text not null,
  locale text,
  page_path text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  constraint portal_click_events_source_check check (source in ('access_modal', 'chat_widget')),
  constraint portal_click_events_mode_check check (mode in ('login', 'register')),
  constraint portal_click_events_role_title_length check (length(trim(role_title)) between 2 and 120),
  constraint portal_click_events_action_length check (length(trim(action)) between 2 and 120),
  constraint portal_click_events_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger contact_submissions_set_updated_at
before update on public.contact_submissions
for each row execute function private.set_updated_at();

create trigger chat_transcripts_set_updated_at
before update on public.chat_transcripts
for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.contact_submissions enable row level security;
alter table public.contact_submissions force row level security;
alter table public.chat_transcripts enable row level security;
alter table public.chat_transcripts force row level security;
alter table public.portal_click_events enable row level security;
alter table public.portal_click_events force row level security;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy contact_submissions_insert_public
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

create policy chat_transcripts_insert_public
on public.chat_transcripts
for insert
to anon, authenticated
with check (true);

create policy portal_click_events_insert_public
on public.portal_click_events
for insert
to anon, authenticated
with check (true);

revoke all on public.profiles from anon, authenticated;
revoke all on public.contact_submissions from anon, authenticated;
revoke all on public.chat_transcripts from anon, authenticated;
revoke all on public.portal_click_events from anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant insert on public.contact_submissions to anon, authenticated;
grant insert on public.chat_transcripts to anon, authenticated;
grant insert on public.portal_click_events to anon, authenticated;

grant all on public.profiles to service_role;
grant all on public.contact_submissions to service_role;
grant all on public.chat_transcripts to service_role;
grant all on public.portal_click_events to service_role;

create index profiles_role_status_idx on public.profiles (role, onboarding_status);
create index profiles_updated_at_idx on public.profiles (updated_at desc);

create index contact_submissions_created_at_idx on public.contact_submissions (created_at desc);
create index contact_submissions_email_normalized_idx on public.contact_submissions (email_normalized);
create index contact_submissions_status_created_at_idx on public.contact_submissions (status, created_at desc);

create index chat_transcripts_created_at_idx on public.chat_transcripts (created_at desc);
create index chat_transcripts_status_created_at_idx on public.chat_transcripts (status, created_at desc);

create index portal_click_events_created_at_idx on public.portal_click_events (created_at desc);
create index portal_click_events_mode_created_at_idx on public.portal_click_events (mode, created_at desc);

comment on table public.profiles is 'Future Supabase Auth profile records for AIXCO customers, brokers, developers, and admins.';
comment on table public.contact_submissions is 'Contact form leads submitted from the AIXCO website.';
comment on table public.chat_transcripts is 'Visitor live-chat transcripts captured when a visitor emails or hands off the chat.';
comment on table public.portal_click_events is 'Anonymous analytics for login and registration portal handoffs.';
